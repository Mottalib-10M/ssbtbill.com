import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const S = K.LATEST, SB = K.P.ssb, SR = K.P.srs;
// The SRS cap is not a multiple of the S$500 Savings Bond lot: what a full year's contribution can buy.
const lotOf = (x: number) => Math.floor(x / SB.lot) * SB.lot;
const cit = lotOf(SR.capCitizen), forn = lotOf(SR.capForeigner);
const rows = K.yby(S.code, cit, 10);
const ten = rows[9].cumulative;
const out = K.redeem(S.code, cit, 30);
// Interest is tax-exempt, but inside SRS it joins the balance of which half is taxed on withdrawal.
const halfTaxed = ten * SR.taxableShare;
const b6 = K.bill('6M');
const billSrs = K.buy(cit, b6.cutoff, b6.days);
const table = rows.filter((r) => [1, 2, 3, 5, 10].includes(r.year)).map((r) => [String(r.year), K.pct(r.coupon), K.sgd2(r.interest), K.sgd2(r.cumulative)]);

export default defineGuide({
  id: 'ssb-with-srs',
  group: 'ssb',
  order: 100,
  slug: 'ssb-with-srs',
  nav: 'Savings Bonds with SRS money',
  card: 'Applying through the SRS operator, coupons paid back into SRS',
  title: 'SSB with SRS 2026: Buying Savings Bonds With SRS Funds',
  description: `SSB with SRS funds in 2026: apply through your SRS operator, coupons go back into SRS. The latest issue pays ${K.pc(S.coupon[0])} in year 1 and ${K.pc(S.avg[9])} over ten years.`,
  h1: 'Savings Bonds bought with SRS money: how it works, where the interest goes',
  intro: `Enter the SRS money you would put into the bond and how many years you would keep it. The calculator returns the coupons the issue pays into your SRS account each year.`,
  resume: `SRS money can buy Singapore Savings Bonds: you apply through the internet banking of your Supplementary Retirement Scheme (SRS) operator, DBS/POSB, OCBC or UOB, the operator holds the bond for you, and every coupon, redemption and maturity payment goes back into your SRS account rather than to your bank account. The ${K.month(S.issue)} issue, ${S.code}, pays ${K.pc(S.coupon[0])} in year 1, rising to ${K.pc(S.coupon[9])} in year 10, ${K.pc(S.avg[9])} a year on average if held to maturity. A full citizen contribution of ${K.sgd(SR.capCitizen)} buys ${K.sgd(cit)} of bonds, since applications go in ${K.sgd(SB.lot)} lots; over ten years that earns ${K.sgd2(ten)} of coupons inside SRS. The bond's interest is tax-exempt, but once in SRS it becomes part of the balance of which half is taxed when you withdraw from retirement age. Each application costs ${K.sgd(SB.fee)}, and redeeming is done online through the operator only, in any month, with your money back by the second business day of the next month.`,
  faqs: [
    { q: 'How do I apply for a Savings Bond with SRS money?', a: `Through the internet banking portal of your SRS operator, or the DBS mobile app for DBS/POSB accounts, during the application window of the issue. The SRS funds are earmarked when you apply. Each application costs a non-refundable ${K.sgd(SB.fee)}, and once submitted it cannot be amended or cancelled. Applications at bank counters are not accepted.` },
    { q: 'Where do Savings Bond coupons go when the bond was bought with SRS funds?', a: 'Into your SRS account, every six months, starting six months after the issue date. Redemption proceeds and the final repayment at maturity are also credited to the SRS account. The money therefore stays inside the scheme, where it can be reinvested or left as cash, and it follows SRS rules when you take it out.' },
    { q: 'Can I redeem an SRS-funded Savings Bond at an ATM?', a: `No. MAS states that redemption requests for Savings Bonds bought with SRS funds can only be made online through the SRS operator. The window is the same as for cash bonds: it opens at 6pm on the first business day of the month and closes at 9pm on the fourth last business day. Each request costs ${K.sgd(SB.redemptionFee)}.` },
    { q: 'Is Savings Bond interest earned inside SRS taxed?', a: `Not when it is paid: interest on Singapore Government Securities is tax-exempt for individuals. But SRS withdrawals are taxed, and they include investment returns. From the statutory retirement age, ${K.pct(SR.taxableShare, 0)} of each withdrawal is taxable, so coupons that build up inside SRS end up half taxed when you take them out.` },
  ],
  body: (h) => `
<h2>The SRS route, step by step</h2>
<p>MAS announced on 17 December 2018 that Savings Bonds would be opened to SRS funds, and doubled the individual limit to ${K.sgd(SB.maxHolding)} in the same release. The route uses the same monthly calendar as cash applications: the window opens at 6pm on the first business day of the month before issue and closes at 9pm on the fourth last business day. The difference is the channel. Cash goes through bank ATMs and apps with a CDP account; SRS money goes through the internet banking of your SRS operator, or the DBS mobile app for DBS/POSB SRS accounts. Your SRS funds are locked, or earmarked, the moment you apply.</p>
<p>MAS allots the issue on the third last business day of the month, and your SRS operator, which acts as custodian of the bonds, notifies you by mail. If the issue is oversubscribed and you receive less than you asked for, the excess comes back by the end of the second last business day. The bond is issued on the first business day of the next month.</p>

<h2>What a year's SRS contribution buys</h2>
<p>Savings Bonds are sold in ${K.sgd(SB.lot)} lots, and the SRS caps are not multiples of that. The citizen cap of ${K.sgd(SR.capCitizen)} buys ${K.sgd(cit)} of bonds, leaving ${K.sgd(SR.capCitizen - cit)} in cash; the foreigner cap of ${K.sgd(SR.capForeigner)} buys ${K.sgd(forn)}. Applied to the ${K.month(S.issue)} issue, ${K.sgd(cit)} pays the coupons below into the SRS account.</p>
${h.table(['Year', 'Coupon', 'Paid into SRS that year', 'Total so far'], table, `${K.sgd(cit)} in ${S.code}, issued ${K.day(S.issue)}, coupons from the MAS statistics API, read ${K.day(K.SSB_READ)}. Paid in two halves each year.`, ['l', 'r', 'r', 'r'])}
${h.mini('ssb', { t: 'A foreigner’s full SRS contribution in the bond', p: ['amt', 'yrs'], d: { amt: forn, yrs: 7 } })}

<h2>Coupons that stay in the scheme</h2>
<p>With cash, Savings Bond coupons land in the bank account linked to your CDP account and are yours to spend. With SRS, they land in the SRS account. Nothing reinvests them automatically: they wait as SRS cash until you buy something else with them, such as another bond issue or a T-bill. The 6-month T-bill of ${K.day(b6.auction)}, at ${K.pc(b6.cutoff)}, would have returned ${K.sgd2(billSrs.interest)} on ${K.sgd(cit)} of face value; T-bills can also be bought with SRS money, through the operator at auction.</p>
<p>The tax treatment changes with the wrapper. Interest on government securities is exempt for individuals, but every dollar that comes out of SRS is treated as a withdrawal. From the statutory retirement age, half of each withdrawal is taxable. In the example above, ten years of coupons, ${K.sgd2(ten)}, would add ${K.sgd2(halfTaxed)} to the taxable part of your withdrawals, on top of the contributions themselves. In return, the contribution earned relief in the year of assessment after it was made.</p>
${h.mini('srs', { t: 'Relief and tax at the bond’s ten-year average', p: ['yl'], d: { amt: SR.capCitizen, mr: 11.5, yl: S.avg[9], yrs: 10 } })}

<h2>Contribution first, application second</h2>
<p>The order matters because the money has to be in the SRS account before it can be earmarked for a bond. A contribution counts for the next year's tax relief if it reaches the account by 31 December or the operator's earlier cut-off, while a bond application can only use money that is already there when you apply. Someone who contributes in early December can still apply for the bond issued in January, since that issue's application window runs during December. Someone who contributes on the last days of the year will usually have missed it and can apply in January for the February issue. In the meantime, the contribution sits as SRS cash. ${K.CAL.ssb.length ? `The next windows already announced close on ${K.CAL.ssb.map((x) => K.day(x.lastDay)).join(' and ')}.` : ''}</p>

<h2>Leaving the bond early inside SRS</h2>
<p>Redemption works as for cash bonds, in any month and without penalty, but only online through the SRS operator, not at ATMs. You can redeem in multiples of ${K.sgd(SB.lot)}, each request costs ${K.sgd(SB.redemptionFee)}, and MAS pays the principal plus accrued interest into the SRS account by the second business day of the next month. Redeemed after 30 months, ${K.sgd(cit)} in the ${K.month(S.issue)} issue would have paid ${K.sgd2(out.interest)} of interest, or ${K.sgd2(out.net)} after the fee, all of it inside SRS. At maturity no request and no fee are needed. ${h.a('ssb-early-redemption', 'The early redemption page')} runs the same sum for any month.</p>

<h2>One limit for all your bonds</h2>
<p>MAS describes the limit as ${K.sgd(SB.maxHolding)} overall per individual, and its ${h.src('mas_ssb_invest', 'guide to Savings Bonds')} gives it as the maximum individual holding. The My Savings Bonds portal on the MAS site keeps track of all your Savings Bonds holdings, and your SRS operator's internet banking shows the bonds held in your SRS account. The rules here come from ${h.src('mas_ssb_buy', 'MAS on buying Savings Bonds')}, ${h.src('mas_ssb_redeem', 'MAS on redeeming them')} and ${h.src('iras_srs', 'IRAS on SRS')}, and ${h.a('srs', 'the SRS page')} covers the scheme's caps and withdrawal rules.</p>`,
  tool: 'ssb',
  toolArg: { amt: cit, yrs: 10 },
  related: ['srs', 'singapore-savings-bonds', 'how-to-buy-ssb', 'ssb-early-redemption', 'ssb-interest-rate'],
  sources: ['mas_ssb_buy', 'mas_ssb_redeem', 'mas_ssb_invest', 'iras_srs'],
});
