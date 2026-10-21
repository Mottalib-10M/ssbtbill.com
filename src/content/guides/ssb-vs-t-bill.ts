import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const S = K.LATEST, SB = K.P.ssb, TB = K.P.tbill;
const b6 = K.bill('6M'), b1 = K.bill('1Y');
const dep = K.dep();
// Worked case of this page: S$40,000 placed for one to ten years.
const amt = 40000;
const at = (y: number) => {
  const c = K.compare(amt, y, dep.fd12 / 100, false);
  const ssb = c.find((p) => p.key === 'ssb')!.interest, bill6 = c.find((p) => p.key === 'tbill')!.interest;
  const bill1 = K.rollover(amt, b1.cutoff, y, 0, b1.days).gain;
  return { y, ssb, bill6, bill1 };
};
const H = [1, 2, 3, 5, 7, 10].map(at);
const one = H[0], three = H[2], five = H[3];
// Cut-off a 6-month bill would need, renewed at the same yield, to match the bond over y years.
const needed = (y: number) => {
  const target = at(y).ssb;
  let lo = 0, hi = 10;
  for (let k = 0; k < 40; k++) { const mid = (lo + hi) / 2; if (K.rollover(amt, mid, y, 0, b6.days).gain < target) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
};
const n3 = needed(3), n5 = needed(5);
const lead = (a: number, b: number, x: string, y: string) => (a > b ? `${x}, by ${K.sgd(a - b)}` : a < b ? `${y}, by ${K.sgd(b - a)}` : 'neither');
const bill1y = K.buy(amt, b1.cutoff, b1.days);

export default defineGuide({
  id: 'ssb-vs-t-bill',
  group: 'ssb',
  order: 80,
  slug: 'ssb-vs-t-bill',
  nav: 'SSB vs T-bill',
  card: 'Bond and bill on the same sum and the same number of years',
  title: 'SSB vs T-Bill 2026: Interest Compared Over Your Own Horizon',
  description: `SSB vs T-bill in 2026: ${S.code} pays ${K.pc(S.coupon[0])} in year 1 against a 6-month cut-off of ${K.pc(b6.cutoff)} and ${K.pc(b1.cutoff)} for 1 year. Both compared on S$40,000 for 1 to 10 years.`,
  h1: 'Savings Bond or T-bill: the same money over the same years',
  intro: `Type a sum and a number of years. The calculator runs the latest Savings Bond and the latest 6-month T-bill side by side, along with a fixed deposit and CPF for reference.`,
  resume: `Over one year, on ${K.sgd(amt)}, the latest numbers favour ${lead(one.bill6, one.ssb, 'the 6-month T-bill renewed once at its last cut-off of ' + K.pc(b6.cutoff), `the ${K.month(S.issue)} Savings Bond`)}: ${K.sgd(one.bill6)} against ${K.sgd(one.ssb)} after the bond's ${K.sgd(SB.fee)} fee. The 1-year bill at ${K.pc(b1.cutoff)} earns ${K.sgd(one.bill1)}. Over three years the comparison turns on the bond's step-up: ${S.code} earns ${K.sgd(three.ssb)}, while renewing the 6-month bill at today's yield earns ${K.sgd(three.bill6)}. To match the bond over three years, the 6-month cut-off would have to average about ${K.pc(n3)} at every auction; over five years, ${K.pc(n5)}. That is the real question: not which rate is higher today, but whether bill yields will stay at that level. The two products also differ in how you leave. A Savings Bond can be redeemed in any month at full value; a T-bill pays only at maturity, and selling before means a market price. Both are issued by the Singapore Government, both pay interest free of tax for individuals, and neither is a bank deposit.`,
  faqs: [
    { q: 'Over one year, does a T-bill or the latest Savings Bond earn more?', a: `On the data of this build and ${K.sgd(amt)}, the winner is ${lead(one.bill6, one.ssb, 'two 6-month bills at the last cut-off', 'the Savings Bond')}. The 6-month route earns ${K.sgd(one.bill6)}, the 1-year bill ${K.sgd(one.bill1)} and the bond ${K.sgd(one.ssb)} after its fee. The second bill's yield is not known yet, so the 6-month figure assumes the next auction cuts off where the last one did.` },
    { q: 'What 6-month cut-off would match the Savings Bond over three years?', a: `About ${K.pc(n3)}, held at every auction for three years, on ${K.sgd(amt)} with the interest reinvested at each roll. The last 6-month auction cut off at ${K.pc(b6.cutoff)}, which is ${b6.cutoff >= n3 ? 'above' : 'below'} that level. Over five years, the level needed is about ${K.pc(n5)}. These are break-even yields, not estimates of what auctions will deliver.` },
    { q: 'Which is easier to get out of early, a T-bill or a Savings Bond?', a: 'The Savings Bond. It can be redeemed in any month with no penalty: you receive the full face value plus accrued interest by the second business day of the next month, less a S$2 fee. A T-bill has no early redemption. It can be sold at the main branches of the three local banks, but at a market price that may be above or below what you paid.' },
    { q: 'Can CPF savings go into a T-bill or a Savings Bond?', a: 'Into a T-bill, yes: MAS lists CPF Investment Scheme funds among the ways to pay at an auction, subject to CPF rules. Into a Savings Bond, no: MAS states that CPF funds are not eligible. SRS money can be used for both. MAS also notes that prevailing CPF interest rates may be higher than the yield on government securities.' },
  ],
  body: (h) => `
<h2>Two products, one horizon at a time</h2>
<p>A Savings Bond and a T-bill are both Singapore Government Securities, so the credit question is the same. What differs is the shape of the return. The bond locks a ten-year staircase of coupons on the day it is issued and lets you step off in any month. The bill locks one yield for six months or a year and then hands the money back, so anyone who wants to stay invested has to bid again, at whatever the next auction sets. Comparing them only makes sense on the same sum and the same span, which is what the table does for ${K.sgd(amt)}.</p>
${h.table(['Years', `Savings Bond ${S.code}`, `6-month bill at ${K.pc(b6.cutoff)}, renewed`, `1-year bill at ${K.pc(b1.cutoff)}, renewed`], H.map((r) => [String(r.y), K.sgd(r.ssb), K.sgd(r.bill6), K.sgd(r.bill1)]), `Interest on ${K.sgd(amt)}. Bond coupons as published, less the S$2 fee; bills renewed at their last cut-off, interest reinvested in whole S$1,000 lots, no bank fee counted. Read ${K.day(K.BILLS_READ)}.`, ['r', 'r', 'r', 'r'])}
<p>The bill columns carry a strong assumption: every future auction cuts off exactly where the last one did. Real cut-offs move from one auction to the next. The bond column carries no such assumption, apart from staying the course: its coupons are already fixed. Read the table as what each choice earns if bill yields stay put. ${H[5].ssb > H[5].bill6 ? `At ten years the bond leads by ${K.sgd(H[5].ssb - H[5].bill6)}, almost all of it from its later coupons, which the bills could only match if yields rose.` : `At ten years the bills stay ahead by ${K.sgd(H[5].bill6 - H[5].ssb)}, but only if every auction for a decade repeated the last cut-off.`}</p>
${h.mini('compare', { t: 'Bond against bill over five years', p: ['yrs'], d: { amt, yrs: 5 } })}

<h2>The yield a bill would have to hold</h2>
<p>Flip the question and it becomes more useful. Instead of assuming the next auctions, ask what average 6-month cut-off would make rolling bills earn the same as the Savings Bond. Over three years, the answer is about ${K.pc(n3)}; over five, about ${K.pc(n5)}. The last auction, on ${K.day(b6.auction)}, cut off at ${K.pc(b6.cutoff)}. Someone choosing the bill over a multi-year span is implicitly expecting future cut-offs to stay at or above those break-even levels, and the ${h.a('t-bill-yield-history', 'yield history')} shows how far cut-offs have travelled in a few quarters before.</p>
<p>For one year, there is less to guess. The 1-year bill fixes its yield for the whole twelve months: at ${K.pc(b1.cutoff)}, ${K.sgd(amt)} of face value costs ${K.sgd2(bill1y.cost)} and returns ${K.sgd(amt)} after ${b1.days} days, ${K.sgd2(bill1y.interest)} of interest. The bond's first year pays ${K.sgd2(K.yby(S.code, amt, 1)[0].interest)} in two coupons, before the fee. Over that one year, each figure is known in advance.</p>
${h.mini('tbill', { t: 'One year in a 1-year bill', p: ['amt'], d: { amt: 35000, tm: '1Y' } })}

<h2>Leaving early, limits and paying</h2>
<p>Liquidity is where the two really part ways. A Savings Bond is redeemed by MAS at face value in any month, with accrued interest, for a ${K.sgd(SB.redemptionFee)} fee, so an emergency never forces a loss of principal. A T-bill has no early redemption; it can be sold at the main branches of DBS, OCBC or UOB at a market price, which can be above or below the purchase price (${h.src('mas_compare', 'MAS, comparing government securities')}).</p>
<p>The limits differ too. A person can hold at most ${K.sgd(SB.maxHolding)} of Savings Bonds across all issues, starting at ${K.sgd(SB.min)}. T-bills start at ${K.sgd(TB.min)} and have no holding limit, though non-competitive bids are capped at ${K.sgd(TB.ncLimit)} per person at each auction. A large sum may simply not fit in Savings Bonds, and in an oversubscribed month the bond may not fill a smaller one either, as the ${h.a('ssb-allotment', 'allotment page')} shows. On payment, both accept cash and SRS money, but only the bill accepts CPF savings.</p>
<p>Interest arrives differently as well. The bond pays a coupon every six months into your bank account. The bill pays nothing until maturity: you pay less than face value at the start and receive face value at the end, the discount being your interest. Tax treats them alike: interest on government securities is exempt for individuals (${h.src('mas_tax', 'MAS, tax')}).</p>

<h2>What this comparison does not settle</h2>
<p>It does not say which is right for a given saver. A person who might need the money within months gains from the bond's monthly exit; one who will reinvest at every maturity and watch each auction may prefer the bill's current yield; someone with more than ${K.sgd(SB.maxHolding)} to place cannot use the bond for all of it. The calculator puts numbers on each path, using the ${h.src('mas_api_bills', 'MAS auction results')} and the ${h.src('mas_api_ssbi', 'MAS Savings Bond rates')}. The ${h.a('t-bill-singapore', 'T-bill guide')} explains auctions and prices, and the ${h.a('ssb-interest-rate', 'Savings Bond rate page')} the ten coupons.</p>`,
  tool: 'compare',
  toolArg: { amt, yrs: 2 },
  related: ['t-bill-singapore', 'ssb-interest-rate', 'ssb-vs-fixed-deposit', 't-bill-yield-history', '6-month-t-bill', 'singapore-savings-bonds'],
  sources: ['mas_compare', 'mas_tbill', 'mas_ssb', 'mas_api_bills', 'mas_api_ssbi', 'mas_tax'],
});
