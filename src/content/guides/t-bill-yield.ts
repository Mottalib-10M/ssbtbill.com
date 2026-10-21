import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const b6 = K.bill('6M'), b1 = K.bill('1Y');
const B6 = K.bills('6M'), B1 = K.bills('1Y'), all = [...B6, ...B1];
const hi = (xs: typeof B6) => [...xs].sort((a, b) => b.cutoff - a.cutoff)[0];
const lo = (xs: typeof B6) => [...xs].sort((a, b) => a.cutoff - b.cutoff)[0];
const gap = (y: number, d: number) => K.roc(K.price(y, d), d) * 100 - y;
const row = (label: string, y: number, d: number) => { const p = K.price(y, d); return [label, K.pc(y), String(d), String(p), K.dec(100 - p, 3), K.pct(K.roc(p, d), 3), `${K.dec(gap(y, d), 3)} point`]; };
const match = all.filter((b) => Math.abs(K.price(b.cutoff, b.days) - b.price) < 0.0005).length;
const medOk = all.filter((b) => b.median <= b.cutoff + 1e-9).length, avgOk = all.filter((b) => b.average <= b.median + 1e-9).length;
const days6 = [...new Set(B6.map((b) => b.days))].sort(), days1 = [...new Set(B1.map((b) => b.days))].sort();
// Same yield, one 1-year bill against two 6-month bills on S$10,000.
const face = 10000;
const oneYear = K.buy(face, b1.cutoff, 364).interest, twoHalves = K.rollover(face, b1.cutoff, 1, 0, 182).gain;
const g6 = gap(b6.cutoff, b6.days), g1 = gap(b1.cutoff, b1.days);
const p363 = K.price(b1.cutoff, Math.min(...days1)), p366 = K.price(b1.cutoff, Math.max(...days1));

export default defineGuide({
  id: 't-bill-yield',
  group: 'tbill',
  order: 20,
  slug: 't-bill-yield',
  nav: 'Yield and price',
  card: 'From cut-off yield to price, and the return on the cash you pay',
  title: 'T-Bill Yield 2026: Price Formula and Return on Cash Paid',
  description: `T-bill yield in 2026: price = 100 × (1 − yield × days ÷ 365). At the last 1-year cut-off of ${K.pc(b1.cutoff)}, S$100 costs ${b1.price}, a return of ${K.pct(K.roc(b1.price, b1.days))} on the cash paid.`,
  h1: 'T-bill yield: how the cut-off turns into a price and a return',
  intro: `Enter a yield and the number of days to maturity. The calculator gives the price per S$100 of face value, the discount and the yearly return on the cash you actually pay.`,
  resume: `A T-bill yield is a discount rate on face value, and one formula turns it into the price MAS publishes: price per S$100 = 100 × (1 − yield × days ÷ 365), rounded to three decimals. The latest 1-year bill, ${b1.code}, cut off at ${K.pc(b1.cutoff)} for ${b1.days} days, which gives ${b1.price}; the latest 6-month bill, ${b6.code}, cut off at ${K.pc(b6.cutoff)} for ${b6.days} days, which gives ${b6.price}. Because you pay less than S$100 and the yield is measured on S$100, the return on the cash you actually hand over is a little higher: ${K.pct(K.roc(b1.price, b1.days), 3)} a year for the 1-year bill, ${K.dec(g1, 3)} point above its quoted yield, and ${K.pct(K.roc(b6.price, b6.days), 3)} for the 6-month bill, ${K.dec(g6, 3)} point above. The higher the yield and the longer the bill, the wider that gap. We checked the formula against all ${all.length} auction results in our data, and it reproduces the published price in ${match} of them. The yield is simple, not compounded, and counts actual days on a 365-day year.`,
  faqs: [
    { q: 'Why is the return on cash higher than the cut-off yield?', a: `Because the yield is applied to the face value, while you pay the lower price. At ${K.pc(b1.cutoff)} for ${b1.days} days, S$100 of face value costs ${b1.price}, and a discount of ${K.dec(100 - b1.price, 3)} earned on that smaller sum works out to ${K.pct(K.roc(b1.price, b1.days), 3)} a year. The gap grows with the yield and with the length of the bill.` },
    { q: 'Does a T-bill yield include compounding?', a: `No. It is a simple yield over the life of the bill, on a 365-day year. Rolling two 6-month bills adds little compounding either, because bills are bought in multiples of S$1,000 and a small sum's interest cannot buy another lot: on ${K.sgd(face)} at ${K.pc(b1.cutoff)}, two 6-month bills earn ${K.sgd2(twoHalves)} and one 1-year bill ${K.sgd2(oneYear)}.` },
    { q: 'What is the difference between cut-off, median and average yield?', a: `The cut-off is the highest yield MAS accepted, and every successful bidder is allotted at it. The median and average are statistics MAS publishes alongside. In ${medOk} of the ${all.length} results in our data, the median sat at or below the cut-off, and in ${avgOk} the average sat at or below the median. Only the cut-off sets the price you pay.` },
    { q: 'Why does the number of days change the price at the same yield?', a: `The formula multiplies the yield by days ÷ 365, so a longer bill takes a deeper discount. At ${K.pc(b1.cutoff)}, a ${Math.min(...days1)}-day bill is priced at ${p363} and a ${Math.max(...days1)}-day bill at ${p366}. One-year bills in our data ran from ${Math.min(...days1)} to ${Math.max(...days1)} days, depending on how the issue and maturity dates fell.` },
  ],
  body: (h) => `
<h2>One formula, checked against every result</h2>
<p>MAS states that a T-bill's discount rate is the cut-off yield of its auction, and that the interest is the difference between the price paid and the face value (${h.ext('https://www.mas.gov.sg/bonds-and-bills/investing-in-singapore-government-securities/how-sgs-auctions-are-conducted', 'MAS, how SGS auctions are conducted')}). The arithmetic that links the two is simple: the yield is applied to the face value, pro rata for the actual number of days, on a 365-day year. Written out, price per S$100 = 100 × (1 − y × d ÷ 365), with y the yield as a decimal and d the days from issue to maturity, rounded to three decimals.</p>
<p>Take ${b1.code}. The yield is ${K.dec(b1.cutoff / 100, 4)}, the term ${b1.days} days. One minus ${K.dec(b1.cutoff / 100, 4)} × ${b1.days} ÷ 365 is ${K.dec(1 - (b1.cutoff / 100) * b1.days / 365, 6)}, so the price is ${b1.price} per S$100, the figure MAS published. We applied the same calculation to every 6-month and 1-year result in the data, ${all.length} in all, and it lands on the published price ${match} times. That check is what lets the calculators on this site quote prices for any yield with confidence.</p>
${h.mini('tcalc', { t: 'Price at the highest 6-month cut-off on record', p: ['yl'], d: { yl: hi(B6).cutoff, dy: 182 } })}

<h2>Yield on face value against return on cash</h2>
<p>The quoted yield understates what your money earns, by a small and predictable amount. The interest is a share of face value, but the money you part with is the price, which is lower. Divide the discount by the price instead of by 100, scale it to a year, and you get the return on cash: (100 − P) ÷ P × 365 ÷ d. The table applies both measures to real cut-offs, the latest ones and the highest and lowest in the data.</p>
${h.table(['Auction', 'Cut-off', 'Days', 'Price per S$100', 'Discount', 'Return on cash', 'Gap'], [row(`Latest 6-month (${b6.code})`, b6.cutoff, b6.days), row(`Latest 1-year (${b1.code})`, b1.cutoff, b1.days), row(`Highest 6-month, ${K.monthShort(hi(B6).auction)}`, hi(B6).cutoff, hi(B6).days), row(`Highest 1-year, ${K.monthShort(hi(B1).auction)}`, hi(B1).cutoff, hi(B1).days), row(`Lowest 6-month, ${K.monthShort(lo(B6).auction)}`, lo(B6).cutoff, lo(B6).days), row(`Lowest 1-year, ${K.monthShort(lo(B1).auction)}`, lo(B1).cutoff, lo(B1).days)], `Prices and returns from the formula above, applied to cut-offs published by MAS. Read ${K.day(K.BILLS_READ)}.`, ['l', 'r', 'r', 'r', 'r', 'r', 'r'])}
<p>At low yields the two measures are almost identical; at the peak of ${K.pc(hi(B1).cutoff)} on a 1-year bill, the gap reached ${K.dec(gap(hi(B1).cutoff, hi(B1).days), 3)} point. When a bill is compared with a fixed deposit or a savings account, which quote interest on the money deposited, the return on cash is the fairer figure. When comparing two bills with each other, the cut-off yield is enough, since both carry the same bias.</p>

<h2>Cut-off, median and average</h2>
<p>Each auction result lists three yields. The cut-off is the highest yield accepted; in a uniform-price auction it is the only one that matters to a successful bidder, because everyone allotted receives it. The median and average are published as statistics of the bidding. In our data, the median was at or below the cut-off in ${medOk} of ${all.length} results, and the average at or below the median in ${avgOk}. A wide spread between the average and the cut-off means much of the bidding came in at yields well below the final one. For the latest 6-month bill, the median was ${K.pc(b6.median)} and the average ${K.pc(b6.average)}, against a cut-off of ${K.pc(b6.cutoff)}.</p>

<h2>Days, compounding and comparisons</h2>
<p>The day count is not always the same. Six-month bills in our data ran ${days6.join(', ')} days, and one-year bills ${days1.join(', ')} days, depending on where issue and maturity dates fell around weekends and holidays. At an identical yield, a longer bill is priced lower and pays a little more interest in dollars, but the yearly rate is unchanged. At ${K.pc(b1.cutoff)}, the price moves from ${p363} at ${Math.min(...days1)} days to ${p366} at ${Math.max(...days1)} days.</p>
<p>Nothing compounds inside a bill, and rolling bills compounds only in whole lots. Bills are sold in multiples of S$1,000, so the interest of a first 6-month bill can buy a second, larger one only when it reaches another S$1,000 of face value; on a modest sum it sits in cash. On ${K.sgd(face)} at ${K.pc(b1.cutoff)}, two 6-month bills in a row earn ${K.sgd2(twoHalves)}, one 1-year bill ${K.sgd2(oneYear)}. The real difference between the two routes is that the second 6-month yield is unknown when the first is bought. The ${h.a('t-bill-yield-history', 'yield history')} shows how far it can move in six months, and the ${h.a('1-year-t-bill', '1-year bill page')} sets each 1-year cut-off against the 6-month auctions of the same weeks.</p>
${h.mini('tcalc', { t: 'Same yield, half the days', p: ['dy'], d: { yl: b1.cutoff, dy: 182 } })}
<p>Bank fees, if any, sit outside the formula: MAS publishes none for T-bills, and the calculations count none. The auction mechanics behind the cut-off are on the ${h.a('t-bill-singapore', 'T-bill guide')}, and the results themselves come from the ${h.src('mas_api_bills', 'MAS statistics API')}.</p>`,
  tool: 'tcalc',
  toolArg: { yl: b1.cutoff, dy: b1.days },
  related: ['t-bill-singapore', '1-year-t-bill', '6-month-t-bill', 't-bill-yield-history', 't-bill-vs-fixed-deposit'],
  sources: ['mas_auction', 'mas_api_bills', 'mas_tbill'],
});
