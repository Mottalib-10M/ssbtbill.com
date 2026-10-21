import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const C = K.P.cpf, X = C.extra, peg = C.smraPeg;
const until = K.day(C.floors.smraFloorUntil);
const qLabel = `Q${Math.floor((Number(K.P.valid_from.slice(5, 7)) - 1) / 3) + 1} ${K.P.valid_from.slice(0, 4)}`;
const ten = 10000, gapTen = Math.round(ten * (C.rates.sa - C.rates.oa));
// Worked cases of this page: a member under 55 with S$45,000 / S$38,000 / S$32,000 in OA, SA and MA,
// and a member over 55 with S$15,000 in the OA, S$230,000 in the RA and S$52,000 in MediSave.
const young = { age55: false, oa: 45000, sa: 38000, ma: 32000, ra: 0 };
const older = { age55: true, oa: 15000, sa: 0, ma: 52000, ra: 230000 };
const y = K.cpf(young), o = K.cpf(older);
const yBal = young.oa + young.sa + young.ma, oBal = older.oa + older.ma + older.ra;
const b6 = K.bill('6M');
const rates = [
  ['Ordinary Account (OA)', K.pct(C.rates.oa, 1), K.pct(C.floors.oa, 1), '3-month average of major local banks’ interest rates'],
  ['Special Account (SA)', K.pct(C.rates.sa, 1), `${K.pct(C.floors.smra, 1)} to ${until}`, '12-month average yield of 10-year SGS plus 1 %'],
  ['MediSave Account (MA)', K.pct(C.rates.ma, 1), `${K.pct(C.floors.smra, 1)} to ${until}`, 'Same peg as the SA'],
  ['Retirement Account (RA)', K.pct(C.rates.ra, 1), `${K.pct(C.floors.smra, 1)} to ${until}`, 'Same peg as the SA'],
];

export default defineGuide({
  id: 'cpf-interest-rate',
  group: 'cpf',
  order: 10,
  slug: 'cpf-interest-rate',
  nav: 'CPF interest rates',
  card: 'OA, SA, MA and RA rates this quarter, and interest on your balances',
  title: 'CPF Interest Rate 2026: OA, SA, MA and RA This Quarter',
  description: `CPF interest rates for ${qLabel}: ${K.pct(C.rates.oa, 1)} on the Ordinary Account, ${K.pct(C.rates.sa, 1)} on the Special, MediSave and Retirement Accounts, plus extra interest on your balances.`,
  h1: 'CPF interest rates this quarter, and what they pay on your balances',
  intro: `Choose your age group and enter the balances shown on your CPF statement. The calculator applies this quarter's rates to each account, adds the extra interest and gives a year's total.`,
  resume: `From ${C.quarterLabel}, the CPF Ordinary Account (OA) earns ${K.pct(C.rates.oa, 1)} a year and the Special (SA), MediSave (MA) and Retirement (RA) Accounts earn ${K.pct(C.rates.sa, 1)}, according to the CPF Board's news release of 22 September 2026. Both rates sit at their floors: ${K.pct(C.floors.oa, 1)} is the legislated minimum for the OA, and the ${K.pct(C.floors.smra, 1)} floor on SA, MA and RA savings has been extended to ${until}. On top, members under 55 earn an extra ${K.pct(X.under55.rate, 0)} on the first ${K.sgd(X.under55.on)} of combined balances, with the OA counted up to ${K.sgd(X.oaCap)}; members aged 55 and above earn an extra ${K.pct(X.over55.first.rate, 0)} on the first ${K.sgd(X.over55.first.on)} and ${K.pct(X.over55.next.rate, 0)} on the next ${K.sgd(X.over55.next.on)}. A member under 55 with ${K.sgd(yBal)} spread as in our example earns about ${K.sgd(y.total)} in a year, of which ${K.sgd(y.extra)} is extra interest. The rates are reviewed every quarter, and the CPF Board announces each new set by news release before the quarter starts.`,
  faqs: [
    { q: 'How is the CPF Ordinary Account interest rate set?', a: `The CPF Board reviews it every quarter. It is computed from the 3-month average of major local banks' interest rates, with a legislated minimum of ${K.pct(C.floors.oa, 1)} a year. For ${C.quarterLabel}, the pegged rate stayed below that minimum, so the OA pays the floor of ${K.pct(C.rates.oa, 1)}. The HDB concessionary loan rate is pegged ${K.pct(C.hdbRate - C.rates.oa, 1)} above it.` },
    { q: 'Will the 4 % floor on Special, MediSave and Retirement Account savings continue?', a: `The Government extended it in September 2026 for one more year, to ${until}. The CPF Board described the extension as giving members certainty on their returns amid uncertain interest rates. Nothing has been announced for the period after that date; the release of 22 September 2026 covers the floor up to ${until} only.` },
    { q: 'What is the HDB concessionary interest rate this quarter?', a: `${K.pct(C.hdbRate, 1)} a year from ${C.quarterLabel}, unchanged. It is pegged at ${K.pct(C.hdbRate - C.rates.oa, 1)} above the Ordinary Account rate, so it moves when the OA rate moves. With the OA at its ${K.pct(C.floors.oa, 1)} floor, the HDB rate sits at ${K.pct(C.hdbRate, 1)}.` },
    { q: 'How does the CPF Board invest members’ savings?', a: 'In Special Singapore Government Securities, bonds issued by the Government only to the CPF Board and not traded on any market. The CPF Board explains that this keeps members’ savings safe whatever happens in financial markets and lets it pay the published interest rates. Members earn the CPF rates set each quarter, with the floors described on this page.' },
  ],
  body: (h) => `
<h2>Four accounts, two rates</h2>
<p>Every CPF member's savings sit in up to four accounts. The Ordinary Account pays for housing, approved investments and education; the Special Account holds retirement savings until 55; MediSave pays for healthcare; the Retirement Account, opened at 55, funds the monthly payouts. Since the Special Account of members aged 55 and above was closed in January 2025, the Retirement Account takes its place from that age. Interest follows two rates only: one for the OA, one for the other three accounts.</p>
${h.table(['Account', `Rate, ${C.quarterLabel}`, 'Floor', 'How the rate is pegged'], rates, 'Per annum. Extra interest is paid on top. Sources: CPF Board news release of 22 September 2026 and CPF Board page on interest rates.', ['l', 'r', 'r', 'l'])}

<p>The gap between the two rates is ${K.pct(C.rates.sa - C.rates.oa, 1)} a year: on ${K.sgd(ten)} left for a year, the OA pays ${K.sgd(ten * C.rates.oa)} and the SA ${K.sgd(ten * C.rates.sa)}, ${K.sgd(gapTen)} more. Members under 55 can move OA savings to their SA to earn the higher rate, and from 55 to their RA. The CPF Board states that such transfers, like cash top-ups, cannot be reversed: money moved for retirement can no longer pay for a home or an investment through the OA.</p>

<h2>How each rate is pegged, and why both sit at the floor</h2>
<p>The OA rate follows the 3-month average of the interest rates of major local banks. The SA, MA and RA rate follows the 12-month average yield of the 10-year Singapore Government Securities bond, plus 1 point. Each quarter the CPF Board computes both pegs and pays the higher of the peg and the floor. For this quarter, the Board's footnote to the SA peg gives ${K.pct(peg.average10y)} for ${peg.period}, and its release states that both pegged rates remain below their floors. So the OA pays ${K.pct(C.rates.oa, 1)} and the other accounts ${K.pct(C.rates.sa, 1)}.</p>
<p>The floors differ in nature. The ${K.pct(C.floors.oa, 1)} OA minimum is written into law. The ${K.pct(C.floors.smra, 1)} floor on SA, MA and RA savings is a Government decision, most recently extended for one year, to ${until}. A projection beyond that date can keep the ${K.pct(C.floors.smra, 1)} only as an assumption.</p>

<h2>Interest on two sets of balances</h2>
<p>Take a member under 55 with ${K.sgd(young.oa)} in the OA, ${K.sgd(young.sa)} in the SA and ${K.sgd(young.ma)} in MediSave. At this quarter's rates held for a year, base interest is ${K.sgd(y.base)} and extra interest ${K.sgd(y.extra)}, ${K.sgd(y.total)} in all. A member over 55 with ${K.sgd(older.oa)} in the OA, ${K.sgd(older.ra)} in the RA and ${K.sgd(older.ma)} in MediSave earns ${K.sgd(o.base)} of base interest and ${K.sgd(o.extra)} of extra interest, ${K.sgd(o.total)} in total. The calculator treats balances that stay put for the year, which is the cleanest way to read a rate in dollars.</p>
${h.mini('cpfint', { t: 'Interest from 55, with a Retirement Account', p: ['age', 'ra'], d: { age: 'o55', oa: 15000, ra: 230000, ma: 52000 } })}
<p>For comparison only, the last 6-month T-bill cut off at ${K.pc(b6.cutoff)} on ${K.day(b6.auction)}. CPF savings are not cash you can move freely, so a higher CPF rate is not an offer you can take up with any sum; ${h.a('cpf-sa-top-up', 'the top-up page')} sets out what moving cash into CPF involves.</p>

<h2>Extra interest, the part that varies by age</h2>
<p>The Government pays extra interest on the first slices of combined balances, with the OA counted only up to ${K.sgd(X.oaCap)}. Under 55, that is ${K.pct(X.under55.rate, 0)} on the first ${K.sgd(X.under55.on)}. From 55, it is ${K.pct(X.over55.first.rate, 0)} on the first ${K.sgd(X.over55.first.on)} and ${K.pct(X.over55.next.rate, 0)} on the next ${K.sgd(X.over55.next.on)}. Extra interest earned on OA money is paid into the SA or RA, not the OA. ${h.a('cpf-extra-interest', 'The extra interest page')} works through the order and the caps on different balances.</p>
${h.mini('cpfint', { t: 'A member with most savings in the OA', p: ['oa'], d: { age: 'u55', oa: 120000, sa: 15000, ma: 20000 } })}

<h2>Where CPF money is invested</h2>
<p>CPF savings are invested in Special Singapore Government Securities, bonds issued only to the CPF Board and not traded on any market. The CPF Board states that this keeps savings safe regardless of market conditions and ensures it can pay the announced rates. What a member earns is the CPF rate of each account, set by the pegs and floors above.</p>

<h2>When the next rates are known</h2>
<p>The current rates apply to ${K.day(K.P.valid_to)}. The CPF Board announces the rates of each quarter in a news release published before that quarter starts, as it did on 22 September 2026 for this one and on 15 December 2025 for the first quarter of 2026. Our figures come from ${h.src('cpf_pr_2026_09_22', 'the September release')} and ${h.src('cpf_interest', 'the CPF Board page on interest')}, and change on this site when the next release is out.</p>`,
  tool: 'cpfint',
  toolArg: { age: 'u55', oa: young.oa, sa: young.sa, ma: young.ma },
  related: ['cpf-extra-interest', 'cpf-calculator', 'cpf-retirement-sum', 'cpf-sa-top-up', 't-bill-with-cpf'],
  sources: ['cpf_pr_2026_09_22', 'cpf_interest', 'cpf_bhs_2026'],
});
