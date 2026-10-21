import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const R = K.P.retirement, T = K.P.life.rows as Array<[number, number, number]>;
const [rb, rf, re] = T;
const defer = 0.07, maxDefer = 0.35;
const rows = T.map(([ra, p], k) => [['Basic Retirement Sum', 'Full Retirement Sum', 'Enhanced Retirement Sum'][k] ?? K.sgd(ra), K.sgd(ra), K.sgd(p), K.sgd2(Math.round((p / ra) * 10000 * 100) / 100), K.sgd(p * (1 + maxDefer))]);
// Worked cases of this page: S$165,000 and S$300,000 in the Retirement Account at 55, read on our straight line.
const m1 = 165000, m2 = 300000;
const l1 = K.life(m1), l2 = K.life(m2);
const yearsFrs = rf[0] / (rf[1] * 12);
// Deferral at the FRS estimate, at the CPF Board's ceiling of 7 % a year (our arithmetic, no interest, no prices).
const deferRows = [65, 66, 67, 68, 69, 70].map((age) => { const up = rf[1] * (1 + defer * (age - 65)); return [String(age), K.sgd(up), K.sgd((up - rf[1]) * 12)]; });
const monthsMissed = 60, extraAt70 = rf[1] * maxDefer;
const catchUpYears = (monthsMissed * rf[1]) / extraAt70 / 12;

export default defineGuide({
  id: 'cpf-life-payout',
  group: 'cpf',
  order: 50,
  slug: 'cpf-life-payout',
  nav: 'CPF LIFE payouts',
  card: 'Monthly payouts from 65 for the BRS, FRS and ERS of 2026',
  title: 'CPF LIFE Payout 2026: Monthly Estimates by Retirement Sum',
  description: `CPF LIFE payout estimates for members turning 55 in 2026: about ${K.sgd(rb[1])}, ${K.sgd(rf[1])} and ${K.sgd(re[1])} a month from 65 for the BRS, FRS and ERS. Read yours from your RA.`,
  h1: 'CPF LIFE payouts: what a Retirement Account pays each month from 65',
  intro: `Enter the sum you expect in your Retirement Account at 55. The calculator reads the monthly payout from 65 on a straight line between the three estimates published by the CPF Board.`,
  resume: `For members turning 55 in ${R.year}, the CPF Board estimates CPF LIFE payouts from age 65 at about ${K.sgd(rb[1])} a month for a Retirement Account (RA) of ${K.sgd(rb[0])}, the Basic Retirement Sum, ${K.sgd(rf[1])} for ${K.sgd(rf[0])}, the Full Retirement Sum, and ${K.sgd(re[1])} for ${K.sgd(re[0])}, the Enhanced Retirement Sum. Those estimates assume the Standard plan and a CPF interest rate of 4 %. CPF LIFE (Lifelong Income For the Elderly) is a national annuity that pays for as long as the member lives. Between the three published points we draw a straight line, which is our own reading and not a CPF figure: ${K.sgd(m1)} at 55 gives about ${l1 ? K.sgd(l1.low) : 'n/a'} a month, ${K.sgd(m2)} about ${l2 ? K.sgd(l2.low) : 'n/a'}. A member can defer payouts up to age 70, and each year of deferral raises them by up to ${K.pct(defer, 0)}, up to ${K.pct(maxDefer, 0)} in all. Your own estimate, based on your actual balances, is in your CPF account.`,
  faqs: [
    { q: 'How much does CPF LIFE pay at the Full Retirement Sum?', a: `For a member turning 55 in ${R.year} who sets aside the FRS of ${K.sgd(rf[0])}, the CPF Board estimates about ${K.sgd(rf[1])} a month from 65, on the Standard plan at 4 % interest. A member who tops up to the ERS of ${K.sgd(re[0])} would receive about ${K.sgd(re[1])}. These are cohort estimates; your own figure depends on your balance when payouts start.` },
    { q: 'What happens to CPF LIFE savings when a member dies?', a: 'Payouts stop, and any CPF LIFE premium balance that has not been paid out, together with the member’s remaining CPF savings, goes to the member’s beneficiaries. The CPF Board notes that, since nobody knows how long they will live, the expected bequest is not a useful basis for choosing a plan. A CPF nomination decides who receives the savings.' },
    { q: 'Can CPF LIFE payouts start later than 65?', a: `Yes, up to age 70. Each year of deferral raises the monthly payout by up to ${K.pct(defer, 0)}, so waiting the full five years raises it by up to ${K.pct(maxDefer, 0)}. A member who has already started payouts and does not need them yet can also hold them back until 70. The later payouts then come at the higher level.` },
    { q: 'Which CPF LIFE plan pays the same amount every month?', a: 'The Standard plan, which the CPF Board describes as a steady monthly payout that does not grow with prices. The Escalating plan starts lower and rises by 2 % a year for life. The Basic plan starts low and pays less once CPF balances fall below S$60,000. All three pay for life; the Board’s published estimates use the Standard plan.' },
  ],
  body: (h) => `
<h2>Three published points</h2>
${h.table(['Retirement sum', 'RA at 55', 'Monthly payout from 65', 'Per S$10,000 of RA', 'Up to, deferred to 70'], rows, `CPF Board estimates for members turning 55 in ${R.year}, Standard plan, 4 % interest. Last column: our arithmetic on the CPF Board's "up to ${K.pct(maxDefer, 0)}" for deferring to 70.`, ['l', 'r', 'r', 'r', 'r'])}
<p>The CPF Board publishes these three estimates on its retirement sum page, without in-between values. Each S$10,000 in the RA buys a slightly smaller payout as the balance grows, as the fourth column shows. The last column applies the CPF Board's statement that deferring to 70 raises payouts by up to ${K.pct(maxDefer, 0)}; it is a ceiling, not a promise for your case.</p>

<h2>Between the points: our straight line</h2>
<p>For any RA between the BRS and the ERS, the calculator draws a straight line between the two nearest published points. ${K.sgd(m1)} sits between the BRS and FRS and reads about ${l1 ? K.sgd(l1.low) : 'n/a'} a month; ${K.sgd(m2)} sits between the FRS and ERS and reads about ${l2 ? K.sgd(l2.low) : 'n/a'}. The CPF Board does not publish these in-between values, so read them as our interpolation, close to the real estimate but not identical. Below the BRS or above the ERS, the calculator shows nothing rather than stretch the line.</p>
${h.mini('cpflife', { t: 'Payout for another balance', p: ['ra'], d: { ra: 300000 } })}

<h2>What moves the real payout</h2>
<p>The estimate depends on four things the table holds fixed. The first is what happens to the RA after 55: top-ups to the ERS raise the payout, and withdrawals made by pledging a property lower it. The second is the interest rate, set at 4 % in the estimates; CPF LIFE savings earn the RA rate plus extra interest, and the CPF Board mentions rates of up to 6 % a year on retirement savings. The third is the plan. The fourth is the start date: a later start means fewer years of payouts and a higher monthly sum.</p>
<p>A rough check on scale: at the FRS, the RA at 55 equals about ${K.dec(yearsFrs, 1)} years of the estimated payout. Payouts run for life, which can be much longer, and the gap is covered by interest and by risk pooling across members, which the CPF Board describes as the way CPF LIFE pays for life.</p>

<h2>Deferring in dollars</h2>
<p>The CPF Board gives the deferral gain as a ceiling, up to ${K.pct(defer, 0)} for each year. Applied to the FRS estimate of ${K.sgd(rf[1])}, that ceiling gives the figures below. They are our arithmetic on the published rule, not a CPF quote, and they ignore what the money could earn or how prices move.</p>
${h.table(['Payouts start at', 'Monthly payout, up to', 'Extra a year, up to'], deferRows, `FRS estimate for members turning 55 in ${R.year} (${K.sgd(rf[1])} a month from 65), raised by at most ${K.pct(defer, 0)} for each year of deferral.`, ['l', 'r', 'r'])}
<p>Waiting has a cost too. A member who starts at 70 instead of 65 gives up ${monthsMissed} monthly payments, about ${K.sgd(monthsMissed * rf[1])} at the FRS estimate, in exchange for up to ${K.sgd(extraAt70)} more each month afterwards. At that ceiling, the larger payouts make up for the missed ones after roughly ${K.dec(catchUpYears, 0)} years, that is around age ${K.dec(70 + catchUpYears, 0)}. Whether that suits a member depends on health, other income and family, none of which a calculator knows.</p>

<h2>Three plans, three payout shapes</h2>
<p>The Standard plan pays a level amount for life, and the published estimates use it. The Escalating plan starts lower and grows by 2 % each year, a design the CPF Board presents as a way to keep up with rising prices. The Basic plan starts low and falls once the member's CPF balances drop below ${K.sgd(60000)}. The CPF Board illustrates the price effect this way: payouts of S$1,000 today may need to be about S$1,500 in twenty years to buy the same things. Members enrolled in the older Plus, Balanced, Basic or Income plans are invited by the CPF Board to consider switching to the Standard or Escalating plan.</p>
${h.mini('cpflife', { t: 'Payout just above the Basic Retirement Sum', p: ['ra'], d: { ra: 130000 } })}

<h2>Who is in CPF LIFE, and who is not</h2>
<p>Inclusion is automatic for members born in 1958 or later who have at least ${K.sgd(60000)} in retirement savings when payouts start; the CPF Board informs them before they turn 65. Others receive monthly payouts until their savings run out, and citizens or permanent residents among them can still join, from 65 up to one month before turning 80. A member with a pension or private annuity that pays at least as much can apply to be exempted. These rules come from ${h.src('cpf_life', 'the CPF Board page on CPF LIFE')}, the estimates from ${h.src('cpf_rs', 'its retirement sum guide')}. ${h.a('cpf-retirement-sum', 'The retirement sum page')} explains how the RA is filled at 55.</p>`,
  tool: 'cpflife',
  toolArg: { ra: m1 },
  related: ['cpf-retirement-sum', 'cpf-calculator', 'cpf-sa-top-up', 'cpf-extra-interest', 'cpf-interest-rate'],
  sources: ['cpf_rs', 'cpf_life', 'cpf_55'],
});
