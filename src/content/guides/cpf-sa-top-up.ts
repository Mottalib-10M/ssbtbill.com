import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const C = K.P.cpf, R = K.P.retirement, S = K.LATEST;
const cap = C.topupReliefCap, famCap = C.topupReliefFamilyCap;
// Worked case of this page: S$8,000 topped up in cash, a 15 % marginal tax rate, against the latest Savings Bond.
const amt = 8000, mr = 15;
const run = (yrs: number, a = amt, m = mr) => { const r = K.tool('topup', { amt: a, yrs, mr: m }); return { cpf: Number(r.rows[0][2]), relief: Number(r.rows[1][2]), ssb: Number(r.rows[2][2]) }; };
const ten = run(10), one = run(1);
const table = [1, 3, 5, 10].map((y) => { const r = run(y); return [`${y} year${y > 1 ? 's' : ''}`, K.sgd(r.cpf), K.sgd(r.relief), K.sgd(r.cpf + r.relief), K.sgd(r.ssb)]; });
const lowRate = run(10, amt, 2);

export default defineGuide({
  id: 'cpf-sa-top-up',
  group: 'cpf',
  order: 60,
  slug: 'cpf-sa-top-up',
  nav: 'CPF cash top-up',
  card: 'A cash top-up with its tax relief, against a Savings Bond',
  title: 'CPF SA Top-Up 2026: Tax Relief, Interest vs a Savings Bond',
  description: `CPF SA top-up in 2026: up to ${K.sgd(cap)} of tax relief for your own account and ${K.sgd(famCap)} more for family, ${K.pct(C.rates.sa, 1)} interest, no way back. Compare a Savings Bond.`,
  h1: 'Topping up the Special Account in cash: relief, interest and what you give up',
  intro: `Enter the cash you would top up, the number of years to compare and your marginal income tax rate from your IRAS assessment. The calculator sets CPF interest plus tax relief against the interest of the latest Savings Bond.`,
  resume: `A cash top-up to your CPF Special Account (SA), or to the Retirement Account (RA) from 55, earns ${K.pct(C.rates.sa, 1)} a year at this quarter's rate, plus extra interest, and can reduce your income tax: relief of up to ${K.sgd(cap)} a year for top-ups to your own account and up to another ${K.sgd(famCap)} for top-ups to loved ones. The money cannot be taken back. On ${K.sgd(amt)}, ten years of CPF interest at ${K.pct(C.rates.sa, 1)} compounded come to about ${K.sgd(ten.cpf)}, and relief at a ${mr} % marginal rate is worth ${K.sgd(ten.relief)} once. The ${K.month(S.issue)} Savings Bond would pay about ${K.sgd(ten.ssb)} on the same sum over ten years, and it can be redeemed in any month. ${ten.cpf + ten.relief >= ten.ssb ? 'So the top-up pays more on paper' : 'So the bond pays more here'}, and the top-up money stays in CPF under CPF rules. Top-ups that receive a Matched Retirement Savings Scheme grant earn no tax relief, CPF transfers from the OA earn none either, and all personal reliefs together are capped at ${K.sgd(K.P.srs.reliefCap)} a year.`,
  faqs: [
    { q: 'Can a CPF cash top-up be taken back?', a: 'No. The CPF Board states that top-ups, both cash top-ups and CPF transfers, are irreversible because they are a long-term commitment to retirement savings, and that they cannot be withdrawn for any other purpose. The money follows the rules of the account it lands in: it grows with interest and comes out only as CPF withdrawal rules allow.' },
    { q: 'Who counts as a loved one for CPF top-up tax relief?', a: `IRAS lists parents, grandparents and their in-law, step and adoptive equivalents, plus a spouse and siblings. For a spouse or sibling without a disability, the relief applies only if that person's annual income in the year before the top-up was no more than ${K.sgd(8000)}. The giver claims up to ${K.sgd(famCap)} a year across all such recipients, in the year of assessment after the top-up.` },
    { q: 'Does a top-up that receives a matching grant earn tax relief?', a: `No. Under the Matched Retirement Savings Scheme, the Government matches cash top-ups of eligible members dollar for dollar, up to ${K.sgd(2000)} a year and ${K.sgd(20000)} over a lifetime. The part of a top-up that attracts the grant does not qualify for tax relief, since the grant is itself the benefit. Top-ups that do not attract the grant keep the usual relief.` },
    { q: 'Does the month of a top-up change the interest it earns?', a: 'Yes. The CPF Board points out that a top-up made in January rather than December can earn up to 20 % more interest over ten years on that money. Tax relief, by contrast, follows the calendar year of the top-up, whatever the month.' },
  ],
  body: (h) => `
<h2>What a cash top-up is</h2>
<p>Any member can add cash to his or her own SA, or to the RA once aged 55 or above, and to the SA or RA of family members. Under 55, the money joins the SA and earns ${K.pct(C.rates.sa, 1)} at this quarter's rate. From 55, the SA is closed and top-ups go to the RA, which pays the same rate; the RA can then be topped up up to the current Enhanced Retirement Sum, ${K.sgd(R.ers)} in ${R.year}. Members can also move their own OA savings to the SA under 55, or to the RA from 55; such transfers earn the same rates but no tax relief.</p>
<p>How much you can top up depends on your age and balances; the CPF Board shows the limit for each member in the Retirement dashboard. The CPF Board's guide on retirement sums links the relief to top-ups made up to the current Full Retirement Sum. IRAS gives the relief only to Singapore Citizens and permanent residents, for cash top-ups under the CPF Retirement Sum Topping-Up Scheme, in the year of assessment after the top-up.</p>

<h2>The tax relief, in dollars</h2>
<p>Relief reduces taxable income, so what it saves depends on your marginal rate, the rate of tax on your last dollar of income. At ${mr} %, relief on ${K.sgd(amt)} saves ${K.sgd(one.relief)} of tax; at 2 %, it would save ${K.sgd(lowRate.relief)}. A member with little or no taxable income gains nothing from it, and a member who already claims ${K.sgd(K.P.srs.reliefCap)} of reliefs in total gains nothing more, as IRAS caps all personal reliefs at that sum. The calculator takes your rate as an input rather than working it out, since only your IRAS assessment says what it is.</p>
${h.mini('topup', { t: 'Relief at your marginal rate', p: ['mr'], d: { amt: 8000, yrs: 10, mr: 7 } })}

<h2>A top-up against a Savings Bond, year by year</h2>
${h.table(['Horizon', 'CPF interest', 'Tax relief', 'CPF total', 'Savings Bond interest'], table, `${K.sgd(amt)} at ${K.pct(C.rates.sa, 1)} compounded yearly, before extra interest, relief at a ${mr} % marginal rate; ${K.month(S.issue)} Savings Bond (${S.code}), coupons not reinvested. Rates held constant.`, ['l', 'r', 'r', 'r', 'r'])}
<p>The CPF line assumes ${K.pct(C.rates.sa, 1)} every year. The floor that holds the rate there runs to ${K.day(C.floors.smraFloorUntil)}, and nothing has been announced beyond it, so the later years of the CPF column are an assumption. The Savings Bond line uses coupons that are fixed for ten years from the day of issue. The two also differ in what you can do with the money: the bond returns its principal whenever you redeem it, with interest earned to that month, while the top-up stays in CPF and follows CPF withdrawal rules.</p>
${h.mini('topup', { t: 'A smaller top-up over five years', p: ['amt', 'yrs'], d: { amt: 3000, yrs: 5, mr: 11.5 } })}

<h2>MediSave top-ups follow their own grant</h2>
<p>Cash can also go into MediSave, and the CPF Board lists eligible cash top-ups to a member's own SA, RA or MediSave Account among those that keep the ${K.sgd(cap)} relief. Since January 2026, the Matched MediSave Scheme adds a Government grant of up to ${K.sgd(1000)} a year on cash top-ups to the MediSave Accounts of eligible members aged 55 to 70 with lower MediSave savings, for five years. As with the retirement grant, IRAS gives no relief on the part of a MediSave top-up that attracts the grant, from the year of assessment 2027.</p>

<h2>The part that cannot be undone</h2>
<p>The CPF Board is explicit: top-ups are irreversible and cannot be withdrawn for other purposes. Money added to the SA at 40 is not available for a home, a child's education or an emergency, and IRAS adds that accepted top-up money is not refunded. That is the price of a higher rate and tax relief, and it is why the CPF Board suggests considering your financial situation and goals first, for example whether you plan to finance a house with OA savings or with cash.</p>
<p>Once in CPF, the money also counts for extra interest, which this comparison leaves out. For a member under 55 whose combined balances are below ${K.sgd(C.extra.under55.on)}, a top-up earns an extra ${K.pct(C.extra.under55.rate, 0)} on top; ${h.a('cpf-extra-interest', 'the extra interest page')} shows how the cap works.</p>

<h2>Topping up a parent or a spouse</h2>
<p>A top-up to a loved one's account earns the giver relief of up to ${K.sgd(famCap)} a year, separate from the ${K.sgd(cap)} for top-ups to his or her own account, so ${K.sgd(cap + famCap)} in all. The money then belongs to the recipient's CPF and follows the recipient's rules: it earns interest in the recipient's SA or RA and raises his or her retirement payouts. If the recipient is eligible for a matching grant, the matched part earns no relief. The rules on this page come from ${h.src('iras_topup', 'IRAS on CPF cash top-up relief')} and the CPF Board's pages, including ${h.src('cpf_rs', 'its retirement sum guide')}.</p>`,
  tool: 'topup',
  toolArg: { amt, yrs: 10, mr },
  related: ['cpf-interest-rate', 'cpf-extra-interest', 'cpf-retirement-sum', 'singapore-savings-bonds', 'srs'],
  sources: ['iras_topup', 'cpf_rs', 'cpf_pr_2026_09_22', 'mas_ssb_invest'],
});
