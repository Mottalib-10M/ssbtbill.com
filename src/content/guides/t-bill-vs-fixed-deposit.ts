import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const D = K.dep(), Q = K.DEPOSITS.quarters;
const b6 = K.bill('6M'), b1 = K.bill('1Y'), TB = K.P.tbill;
// Worked case of this page: S$25,000 for six months and for a year, bill against deposit at the MAS average.
const amt = 25000;
const bill6 = K.buy(amt, b6.cutoff, b6.days), bill1 = K.buy(amt, b1.cutoff, b1.days);
const fd6 = K.fd(amt, D.fd6 / 100, 6, false), fd12 = K.fd(amt, D.fd12 / 100, 12, false);
const est = K.estimate('6M');
const d6 = Math.round((bill6.interest - fd6.interest) * 100) / 100, d12 = Math.round((bill1.interest - fd12.interest) * 100) / 100;
const lead = (x: number) => (x >= 0 ? `${K.sgd2(x)} more in the bill` : `${K.sgd2(-x)} more in the deposit`);
// Quarter by quarter: MAS average 6-month deposit rate against the mean 6-month T-bill cut-off of the same quarter.
const qOf = (iso: string) => `${iso.slice(0, 4)} Q${Math.floor((Number(iso.slice(5, 7)) - 1) / 3) + 1}`;
const quarters = Q.slice(-8).reverse().map((q) => {
  const xs = K.bills('6M').filter((b) => qOf(b.auction) === q.q);
  const mean = xs.length ? xs.reduce((s, b) => s + b.cutoff, 0) / xs.length : NaN;
  return [q.q, K.pc(q.fd6), xs.length ? K.pc(mean) : 'no auction', xs.length ? `${K.dec(mean - q.fd6, 2)} point` : 'n/a'];
});

export default defineGuide({
  id: 't-bill-vs-fixed-deposit',
  group: 'tbill',
  order: 110,
  slug: 't-bill-vs-fixed-deposit',
  nav: 'T-bill or fixed deposit',
  card: 'Price, liquidity, insurance and yield, side by side',
  title: 'T-Bill vs Fixed Deposit 2026: Yield, Liquidity, Insurance',
  description: `T-bill vs fixed deposit in 2026: the last 6-month bill cut off at ${K.pc(b6.cutoff)} and the average 6-month deposit paid ${K.pc(D.fd6)}. Your interest, and what else differs.`,
  h1: 'T-bill or fixed deposit: the same months, two very different products',
  intro: `Enter your sum and two deposit offers with their tenors. The calculator puts each offer on twelve months and sets them against two 6-month T-bills bought in a row at the last cut-off.`,
  resume: `Over six months, the latest 6-month T-bill paid ${d6 >= 0 ? 'more' : 'less'} than the average fixed deposit: at its cut-off of ${K.pc(b6.cutoff)} on ${K.day(b6.auction)}, ${K.sgd(amt)} of face value cost ${K.sgd2(bill6.cost)} and returns ${K.sgd(amt)} at maturity, ${K.sgd2(bill6.interest)} of interest, while a 6-month deposit at the MAS average of ${K.pc(D.fd6)} for ${D.q} earns ${K.sgd2(fd6.interest)}. Over a year, the 1-year bill at ${K.pc(b1.cutoff)} returns ${K.sgd2(bill1.interest)}, against ${K.sgd2(fd12.interest)} for a 12-month deposit at ${K.pc(D.fd12)}. Those averages describe deposits already on banks' books; an offer you are given today can be higher. The two products differ beyond the rate. A T-bill is a Singapore Government security bought at auction, its yield known only afterwards, with no early repayment: before maturity it can only be sold at a market price. A deposit has its rate fixed upfront, is insured up to ${K.sgd(K.P.sdic.limit)} per depositor per bank, and can be broken on the bank's terms. Interest on both is not taxed for individuals.`,
  faqs: [
    { q: 'What if I need the cash before the T-bill or the deposit ends?', a: 'A T-bill has no early redemption. It can be sold before maturity at the main branches of DBS, OCBC or UOB, at a market price that may be above or below what you paid. A fixed deposit can usually be withdrawn early, on terms set by each bank, which can reduce the interest. Neither is designed for money you may need at short notice.' },
    { q: 'Is a T-bill cut-off yield directly comparable with a fixed deposit rate?', a: `Almost, with one twist. The cut-off yield is worked out on the face value, while you pay less than face value. Measured on the cash you actually pay, the return is a little higher: ${K.pct(bill6.yearly)} a year for the last 6-month bill against its ${K.pc(b6.cutoff)} cut-off. A deposit rate is already a rate on the sum you place, so the cash-based figure is the fairer one to set against it.` },
    { q: 'What protects a T-bill, and what protects a fixed deposit?', a: `A T-bill is a direct obligation of the Singapore Government, which MAS lists with a AAA sovereign rating, and it is held in your name at the Central Depository. A fixed deposit is a claim on a bank, insured by the Deposit Insurance Scheme up to ${K.sgd(K.P.sdic.limit)} per depositor per member bank. Above that limit, a deposit depends on the bank alone.` },
    { q: 'Can I know the T-bill yield before I apply?', a: `No. The yield is set by the auction: MAS publishes the cut-off about an hour after the auction closes, and everyone allotted gets that same yield. A non-competitive bid, up to ${K.sgd(TB.ncLimit)} per auction, accepts whatever the cut-off turns out to be. A deposit, by contrast, tells you its rate before you place the money.` },
  ],
  body: (h) => `
<h2>Six months and a year, on the same sum</h2>
${h.table(['Placement', 'Rate', 'You pay', 'You get back', 'Interest'], [[`6-month T-bill, ${K.day(b6.auction)}`, K.pc(b6.cutoff), K.sgd2(bill6.cost), K.sgd(amt), K.sgd2(bill6.interest)], [`6-month deposit, MAS average ${D.q}`, K.pc(D.fd6), K.sgd(amt), K.sgd2(amt + fd6.interest), K.sgd2(fd6.interest)], [`1-year T-bill, ${K.day(b1.auction)}`, K.pc(b1.cutoff), K.sgd2(bill1.cost), K.sgd(amt), K.sgd2(bill1.interest)], [`12-month deposit, MAS average ${D.q}`, K.pc(D.fd12), K.sgd(amt), K.sgd2(amt + fd12.interest), K.sgd2(fd12.interest)]], `${K.sgd(amt)}; bills at their cut-off price, no bank fee counted; deposits at the MAS table III.3A averages, simple interest at maturity.`, ['l', 'r', 'r', 'r', 'r'])}
<p>On these figures the six-month comparison leaves ${lead(d6)}, the one-year comparison ${lead(d12)}. The mechanics differ: the bill is bought below its face value and repaid in full at maturity, so the interest is the discount, while the deposit takes your full sum and adds interest at the end. The bill's figure is fixed once the auction is over; the deposit's figure is fixed the day you place it.</p>
${h.mini('fdcompare', { t: 'Your offers against two 6-month bills', p: ['amt'], d: { amt: 80000, r1: D.fd6, m1: 6, r2: D.fd12, m2: 12 } })}

<h2>Two years of the gap, quarter by quarter</h2>
${h.table(['Quarter', 'MAS average, 6-month deposit', 'Mean 6-month T-bill cut-off', 'Bill minus deposit'], quarters, `Deposit rates: MAS table III.3A, weighted average of outstanding deposits. T-bills: mean cut-off of the 6-month auctions held in the quarter, MAS statistics API.`, ['l', 'r', 'r', 'r'])}
<p>The table sets the two series side by side over the last eight quarters published by MAS. They do not measure the same thing: the bill column is what new money earned at each auction, the deposit column what all outstanding deposits were paying on average, including old ones. When rates move, the deposit average lags. A gap in the table is therefore partly timing, and the right test for your own decision is the offer in front of you against the next auction.</p>

<h2>Yield on face value, return on cash</h2>
<p>MAS quotes the T-bill cut-off as a yield on the face value: the price per S$100 is worked out as 100 minus the yield times the days to maturity over 365. You pay that price and receive S$100. Measured on the cash paid, the yearly return is a little above the cut-off, ${K.pct(bill6.yearly)} for the last 6-month bill and ${K.pct(bill1.yearly)} for the last 1-year bill. A deposit rate is quoted on the sum placed, so the cash-based figure is the one to compare. The difference is small at these yields, a few hundredths of a point, but it always runs in the bill's favour.</p>
${h.mini('tbill', { t: 'Price and interest of a bill at another yield', p: ['yl'], d: { amt: 25000, tm: '6M', yl: b6.cutoff } })}

<h2>Getting in and getting out</h2>
<p>A deposit is placed at the bank on any day, for the tenor you pick, at the rate on offer. A T-bill is bought at an auction on a set date: applications go through the ATMs, internet banking or apps of DBS/POSB, OCBC and UOB, in multiples of ${K.sgd(TB.lot)}, and banks close their channels a day or two early. The bill is issued three business days after the auction and lasts six months or a year, nothing in between.</p>
<p>Getting out early is where the two part ways most. The deposit can be broken on the bank's terms. The T-bill cannot be returned to the Government before maturity; it can only be sold at a bank's main branch at the market price of the day, which MAS warns may be above or below what you paid. For money that may be needed suddenly, a savings account gives faster access than either, and a ${h.a('singapore-savings-bonds', 'Savings Bond')}, redeemable in any month at face value, sits in between.</p>

<h2>Rolling over: the second half of the year</h2>
<p>Many savers do not stop after one placement. With a deposit, the bank may renew it at the rate it sets on the day; with T-bills, you apply again at the next auction and take its cut-off. Neither renewal rate is known in advance. The cut-offs MAS publishes help to frame the risk on the bill side: over the last ${est.count} six-month auctions, the cut-off moved by ${K.dec(est.mae, 2)} point on average from one auction to the next, and by ${K.dec(est.p80, 2)} point or less eight times in ten. The calculator shows the twelve-month result if each offer, and the bill, renewed at its current rate; ${h.a('next-t-bill-auction', 'the next auction page')} shows what is known about the coming cut-off.</p>

<h2>Safety, insurance and tax</h2>
<p>The bill is a security of the Singapore Government, held for you at the Central Depository, which is why it falls outside deposit insurance; the deposit is covered by ${h.src('sdic', 'SDIC')} up to ${K.sgd(K.P.sdic.limit)} per depositor at each member bank, counted with your other deposits there. Interest on Singapore Government Securities is tax-exempt for individuals (${h.src('mas_tax', 'MAS on tax')}), and interest on deposits with approved banks is not taxable either, so the figures compare as they stand, with no tax to take off either. The product rules come from ${h.src('mas_tbill', 'the MAS T-bill page')} and ${h.src('mas_compare', 'its comparison of government securities')}, the deposit averages from ${h.src('mas_msb_iii3a', 'table III.3A')}.</p>`,
  tool: 'fdcompare',
  toolArg: { amt, r1: D.fd6, m1: 6, r2: D.fd12, m2: 12 },
  related: ['t-bill-singapore', 'fixed-deposit-rates-singapore', 'best-fixed-deposit-singapore', 'sdic-deposit-insurance', 'ssb-vs-fixed-deposit', '6-month-t-bill'],
  sources: ['mas_tbill', 'mas_msb_iii3a', 'sdic', 'mas_compare', 'mas_tax'],
});
