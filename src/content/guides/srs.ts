import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const SR = K.P.srs, S = K.LATEST, b1 = K.bill('1Y'), b6 = K.bill('6M');
// Worked case of this page: a citizen putting in the full S$15,300 at a 15 % marginal rate, invested at the latest 1-year T-bill cut-off for 20 years.
const mr = 15, yrs = 20;
const r = K.tool('srs', { amt: SR.capCitizen, mr, yl: b1.cutoff, yrs });
const relief = Number(r.rows[1][2]), end = Number(r.rows[2][2]);
const taxed = end * SR.taxableShare;
// Early withdrawal before the prescribed retirement age: all of it taxable, plus a 5 % penalty (IRAS).
const early = 10000, penalty = early * 0.05;
const reliefForeigner = Math.round(SR.capForeigner * mr / 100);

export default defineGuide({
  id: 'srs',
  group: 'cpf',
  order: 70,
  slug: 'srs',
  nav: 'SRS (Supplementary Retirement Scheme)',
  card: 'Contribution caps, tax relief and what is taxed on the way out',
  title: 'SRS 2026: Supplementary Retirement Scheme Caps and Tax',
  description: `SRS in 2026: contribute up to ${K.sgd(SR.capCitizen)} as a citizen or PR, ${K.sgd(SR.capForeigner)} as a foreigner, cut your tax now and pay tax on only ${K.pct(SR.taxableShare, 0)} of withdrawals at retirement.`,
  h1: 'SRS: the tax relief going in, the tax coming out',
  intro: `Enter what you would put into SRS this year, your marginal tax rate from your IRAS assessment, the yield you expect inside the account and the years until you withdraw. The calculator shows the tax saved now and what is taxed later.`,
  resume: `The Supplementary Retirement Scheme (SRS) is a voluntary retirement account, separate from CPF, run by three bank operators. Each year, Singapore Citizens and permanent residents can contribute up to ${K.sgd(SR.capCitizen)} and foreigners up to ${K.sgd(SR.capForeigner)}, and the contribution is deducted from taxable income in the following year of assessment, within the overall cap of ${K.sgd(SR.reliefCap)} on all personal reliefs. Investment returns inside SRS are not taxed, and from the statutory retirement age that applied at your first contribution only ${K.pct(SR.taxableShare, 0)} of each withdrawal is taxable. A citizen who puts in ${K.sgd(SR.capCitizen)} at a ${mr} % marginal rate saves about ${K.sgd(relief)} of tax in the next assessment. Invested at the last 1-year T-bill cut-off of ${K.pc(b1.cutoff)} for ${yrs} years, the sum would grow to about ${K.sgd(end)}, of which ${K.sgd(taxed)} would be taxable on withdrawal. Taking money out before that age makes the whole withdrawal taxable and adds a 5 % penalty. SRS money can buy Savings Bonds and T-bills through the operator.`,
  faqs: [
    { q: 'How much can I put into SRS each year?', a: `Up to ${K.sgd(SR.capCitizen)} a year for Singapore Citizens and permanent residents, and ${K.sgd(SR.capForeigner)} for foreigners, who must declare their status to the operator every year. Contributions are made in cash, at any time and as often as you like within the cap. To count for the next year's relief, they must reach the account by 31 December or the operator's own cut-off date.` },
    { q: 'How much of an SRS withdrawal is taxed?', a: `From the statutory retirement age that applied at your first contribution, ${K.pct(SR.taxableShare, 0)} of each withdrawal is added to your other income for that year and taxed at your rate. Penalty-free withdrawals can be spread over ten years from the first one. Whatever is still in the account at the end of those ten years is treated as withdrawn, and half of it is taxed.` },
    { q: 'What is the penalty for withdrawing SRS money before retirement age?', a: `A withdrawal before the prescribed retirement age is taxable in full and carries a 5 % penalty, unless it falls under an exception such as death, medical grounds, bankruptcy or a full withdrawal by a foreigner who has held the account for at least ten years. On ${K.sgd(early)} taken out early, the penalty alone is ${K.sgd(penalty)}, before income tax on the whole sum.` },
    { q: 'Can foreigners open an SRS account?', a: `Yes. IRAS lists Singapore Citizens, permanent residents and foreigners aged at least 18 who are not undischarged bankrupts and do not already hold an SRS account. Foreigners have the higher cap of ${K.sgd(SR.capForeigner)} a year. A foreigner who has held the account for at least ten years can withdraw it all in one lump sum, with half taxed and no penalty.` },
    { q: 'Is cash in an SRS account covered by deposit insurance?', a: `Yes, when it sits as cash with a member bank. SDIC lists money placed under the Supplementary Retirement Scheme among insured deposits, added to your other Singapore dollar deposits at the same bank within the ${K.sgd(K.P.sdic.limit)} limit. Investments bought with SRS money, such as shares or government securities, are not deposits and are not covered.` },
  ],
  body: (h) => `
<h2>How the scheme works</h2>
<p>SRS is a voluntary account for retirement savings, over and above CPF. Each person can have only one SRS account, with one of three operators, DBS, OCBC or UOB; holding accounts with two operators is an offence. Money goes in as cash, from you or from your employer on your behalf, and an employer's contribution counts as part of your pay. Inside the account, the money can stay in cash or be invested, and the returns are not taxed while they stay there. The tax comes at the end, on withdrawal, on half of each sum taken out from retirement age.</p>
<p>The deal is therefore a swap of tax rates: relief at your marginal rate today, against tax on half the withdrawals later, at your rate in the years you withdraw. For someone whose income falls in retirement, the second rate can be lower than the first. For someone with little taxable income now, the relief is worth little, and IRAS points out that contributions are not refunded, so it asks savers to check whether they would benefit before contributing.</p>

<h2>Caps and the year of the relief</h2>
<p>The yearly cap is ${K.sgd(SR.capCitizen)} for citizens and permanent residents and ${K.sgd(SR.capForeigner)} for foreigners. A contribution made by 31 December counts for the relief of the next year of assessment, provided you are tax resident that year. Relief is refused if the account is suspended at year end, or for any sum withdrawn in the same year it was put in. On top of that, IRAS applies an overall cap of ${K.sgd(SR.reliefCap)} on all personal reliefs claimed in a year of assessment, SRS included.</p>
<p>At a ${mr} % marginal rate, the citizen cap saves ${K.sgd(relief)} of tax; a foreigner contributing the full ${K.sgd(SR.capForeigner)} at the same rate would save ${K.sgd(reliefForeigner)}. The calculator takes your rate as an input: it is on your IRAS assessment, and working it out from a salary is outside what this site does.</p>
${h.mini('srs', { t: 'Relief at your own marginal rate', p: ['mr'], d: { amt: SR.capCitizen, mr: 7, yl: b6.cutoff, yrs: 25 } })}

<h2>The way out: ten years, half taxed</h2>
<p>Withdrawals are penalty-free from the statutory retirement age that applied when you made your first contribution; IRAS gives it as 64 from 1 July 2026, and a later change does not affect someone who has already contributed. From the first penalty-free withdrawal, you have ten years to take the money out, and half of each withdrawal is added to your income for that year. At the end of the ten years, whatever remains is treated as withdrawn and half of it is taxed. Life annuities bought with SRS money are the exception: the ten-year window does not apply and half of each annuity payment is taxed.</p>
<p>In the worked case, ${K.sgd(SR.capCitizen)} grown at ${K.pc(b1.cutoff)} for ${yrs} years becomes ${K.sgd(end)}, so ${K.sgd(taxed)} would be taxable over the withdrawal years. Spread across ten years, that is about ${K.sgd(taxed / 10)} of taxable income a year, which for a retiree with little other income may attract little tax.</p>
${h.mini('srs', { t: 'A foreigner at the higher cap', p: ['amt', 'yrs'], d: { amt: SR.capForeigner, mr: 15, yl: b1.cutoff, yrs: 12 } })}

<h2>Leaving early, and the exceptions</h2>
<p>Before the prescribed retirement age, a withdrawal is taxable in full and IRAS adds a 5 % penalty: ${K.sgd(penalty)} on ${K.sgd(early)}, plus income tax on all of it. The exceptions are death, medical grounds, bankruptcy and a full withdrawal by a foreigner who has held the account for at least ten years. On medical grounds or for that foreigner's lump sum, half is taxed and there is no penalty; in bankruptcy the whole sum is taxed, without penalty. Foreigners and permanent residents pay withholding tax on withdrawals, which is not the final tax.</p>

<h2>What SRS money can hold</h2>
<p>Cash in the account is a deposit with the operator bank, insured by ${h.src('sdic', 'SDIC')} within the ${K.sgd(K.P.sdic.limit)} limit per bank. SRS money can also buy Singapore Government Securities: ${h.a('ssb-with-srs', 'Savings Bonds')} through the operator's internet banking, and T-bills and government bonds at auction, as MAS describes on ${h.src('mas_compare', 'its product comparison')}. The ${K.month(S.issue)} Savings Bond pays ${K.pc(S.avg[9])} a year on average over ten years; the last 6-month T-bill cut off at ${K.pc(b6.cutoff)}. Interest on those securities is tax-exempt for individuals, but once inside SRS it becomes part of the balance that is half taxed on withdrawal. The rules on this page come from ${h.src('iras_srs', 'IRAS on SRS relief')} and ${h.ext('https://www.iras.gov.sg/', 'IRAS website, Individual Income Tax section: tax on SRS withdrawals')}.</p>`,
  tool: 'srs',
  toolArg: { amt: SR.capCitizen, mr, yl: b1.cutoff, yrs },
  related: ['ssb-with-srs', 'cpf-sa-top-up', 'sdic-deposit-insurance', 't-bill-singapore', 'singapore-savings-bonds'],
  sources: ['iras_srs', 'mas_compare', 'sdic', 'mas_ssb_buy'],
});
