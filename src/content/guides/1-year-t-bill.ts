import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const b = K.bill('1Y'), b6 = K.bill('6M');
const B = K.bills('1Y'), S6 = K.bills('6M');
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
// For each 1-year auction, the last 6-month auction held on or before the same day.
const pair = (x: (typeof B)[number]) => [...S6].reverse().find((y) => y.auction <= x.auction);
const paired = B.map((x) => ({ x, y: pair(x) })).filter((p) => p.y);
const above = paired.filter((p) => p.x.cutoff > p.y!.cutoff + 1e-9).length;
const last12 = B.slice(-12).reverse();
const amt = 50000;
const one = K.buy(amt, b.cutoff, b.days);
const two6 = K.rollover(amt, b6.cutoff, 1, 0, b6.days);
const e1 = K.estimate('1Y'), e6 = K.estimate('6M');
const months = [...new Set(B.slice(-4).map((x) => Number(x.auction.slice(5, 7))))].sort((a, c) => a - c).map((m) => MONTHS[m - 1]);
const monthList = months.length > 1 ? `${months.slice(0, -1).join(', ')} and ${months[months.length - 1]}` : months.join('');
const days = [...new Set(B.map((x) => x.days))].sort();
const hiY = [...B].sort((a, c) => c.cutoff - a.cutoff)[0];
const perYear = K.yearBills('1Y', Number(b.auction.slice(0, 4)) - 1).length;
const next1 = K.CAL.bills.find((x) => x.term === '1Y');
const p = pair(b);
const sp12 = last12.map((x) => ({ x, sp: x.cutoff - (pair(x)?.cutoff ?? x.cutoff) }));
const flips = sp12.slice(1).filter((z, k) => Math.sign(z.sp) !== Math.sign(sp12[k].sp) && Math.abs(z.sp) > 1e-9 && Math.abs(sp12[k].sp) > 1e-9).length;
const pos12 = sp12.filter((z) => z.sp > 1e-9).length;
const minSp = [...sp12].sort((a, c) => a.sp - c.sp)[0], maxSp = [...sp12].sort((a, c) => c.sp - a.sp)[0];

export default defineGuide({
  id: '1-year-t-bill',
  group: 'tbill',
  order: 40,
  slug: '1-year-t-bill',
  nav: '1-year T-bill',
  card: 'The quarterly bill: cut-offs against the 6-month bill',
  title: '1-Year T-Bill 2026: Quarterly Auctions and Latest Cut-Off',
  description: `1-year T-bill 2026: ${b.code} cut off at ${K.pc(b.cutoff)} for ${b.days} days, price ${b.price}. Four auctions a year; every cut-off set against the 6-month bill of the same week.`,
  h1: 'The 1-year T-bill: four auctions a year, one yield for twelve months',
  intro: `Enter the face value you would apply for; the latest 1-year cut-off is filled in. Change the yield to test a different auction result on the same sum.`,
  resume: `The 1-year Singapore T-bill is auctioned only four times a year, and the latest, ${b.code}, cut off at ${K.pc(b.cutoff)} on ${K.day(b.auction)}, at a price of ${b.price} per S$100 for ${b.days} days, maturing on ${K.day(b.maturity)}. On ${K.sgd(amt)} of face value, that is ${K.sgd2(one.cost)} paid now and ${K.sgd(amt)} received at maturity, ${K.sgd2(one.interest)} of interest fixed for the whole year. ${p ? `The 6-month auction just before it, on ${K.day(p.auction)}, cut off at ${K.pc(p.cutoff)}, so the 1-year bill paid ${b.cutoff > p.cutoff + 1e-9 ? 'more' : b.cutoff < p.cutoff - 1e-9 ? 'less' : 'the same'}${Math.abs(b.cutoff - p.cutoff) > 1e-9 ? `, by ${K.dec(Math.abs(b.cutoff - p.cutoff), 2)} point` : ''}.` : ''} Across the ${paired.length} 1-year auctions that can be matched with a 6-month one, the 1-year cut-off was higher ${above} times. Recent auctions fell in ${monthList}. The appeal of the 1-year bill is certainty: one bid, one yield, no second auction to face in six months. Its cost is the wait, with no early redemption, and fewer chances to bid. The bill takes cash, SRS money or CPF savings, from ${K.sgd(K.P.tbill.min)}.`,
  faqs: [
    { q: 'How many 1-year T-bill auctions are there each year?', a: `Four, one per quarter, according to the MAS issuance calendar; there were ${perYear} in ${Number(b.auction.slice(0, 4)) - 1}. The recent ones were held in ${monthList}. With so few dates, someone who misses an auction waits about three months for the next one, while the 6-month bill comes back every two weeks.` },
    { q: 'Does the 1-year T-bill usually pay more than the 6-month one?', a: `Not reliably. Comparing each 1-year auction with the last 6-month auction held before it, the 1-year cut-off was higher in ${above} of ${paired.length} cases in our data. The gap depends on what the market expects short rates to do over the coming year, and it is often negative.` },
    { q: 'Can SRS money be used for a 1-year T-bill?', a: 'Yes. MAS lists cash, Supplementary Retirement Scheme money and CPF Investment Scheme savings as ways to pay at T-bill auctions. An SRS application goes through the SRS operator, DBS/POSB, OCBC or UOB, and the face value at maturity returns to the SRS account. The same per-auction limits apply whatever the source of the money.' },
    { q: 'Why does the 1-year T-bill last 364 days rather than 365?', a: `The term depends on the issue and maturity dates of each bill, which MAS sets around business days. In our data, 1-year bills ran ${days.join(', ')} days. The price formula uses the actual count, so the same yield gives a very slightly different price for a 363-day and a 366-day bill, while the yearly rate is identical.` },
  ],
  body: (h) => `
<h2>Three years of 1-year auctions</h2>
<p>Twelve auctions cover three years of this bill. For each one, the table gives the cut-off, the last 6-month cut-off before it and the difference between the two, which is the extra yield the market asked for to lend for a year instead of six months. A positive spread means the 1-year bill paid more. The bid-to-cover column shows how many times over the issue was bid.</p>
${h.table(['Auction', 'Code', 'Days', '1-year cut-off', '6-month cut-off before', 'Spread', 'Bid-to-cover', 'Offered'], last12.map((x) => { const y = pair(x); return [K.day(x.auction), x.code, String(x.days), K.pc(x.cutoff), y ? K.pc(y.cutoff) : 'n/a', y ? `${x.cutoff - y.cutoff >= 0 ? '+' : ''}${K.dec(x.cutoff - y.cutoff, 2)}` : 'n/a', K.dec(x.cover, 2), K.mn(x.offered)]; }), `Latest twelve 1-year T-bill auctions. Source: MAS statistics API, read ${K.day(K.BILLS_READ)}.`, ['l', 'l', 'r', 'r', 'r', 'r', 'r', 'r'])}
<p>The spread is the most telling figure on this page. A 1-year bill paying less than a 6-month one is usually read as the market expecting yields to fall, in which case someone rolling two 6-month bills would earn less on the second. A 1-year bill paying more is read the other way. In the twelve auctions above, the spread was positive ${pos12} time${pos12 === 1 ? '' : 's'} out of twelve. It ranged from ${K.dec(minSp.sp, 2)} point, on ${K.day(minSp.x.auction)}, to ${K.dec(maxSp.sp, 2)} point, on ${K.day(maxSp.x.auction)}, and changed sign ${flips} time${flips === 1 ? '' : 's'} over the three years. ${pos12 < 9 ? 'A reader who expects the 1-year bill to carry a premium simply because it is longer will find that these twelve results do not support it.' : 'The 1-year bill carried a premium in most of these twelve results, though not in every quarter.'} The highest 1-year cut-off in our data was ${K.pc(hiY.cutoff)}, on ${K.day(hiY.auction)}.</p>
${h.mini('thist', { t: 'Every 1-year auction of a past year', p: ['yr'], d: { tm: '1Y', yr: '2023' } })}

<h2>One 1-year bill or two 6-month bills</h2>
<p>A saver with a twelve-month horizon has two routes. The 1-year bill locks today's yield for the whole year: at ${K.pc(b.cutoff)}, ${K.sgd(amt)} of face value earns ${K.sgd2(one.interest)}, known on the day of the auction. Two 6-month bills at the latest 6-month cut-off of ${K.pc(b6.cutoff)} would earn about ${K.sgd(two6.gain)}, but only the first half is known; the second depends on an auction six months away. When the 6-month yield is higher than the 1-year one, the rolling route looks better on paper, and the 1-year bill is the price of not having to guess.</p>
<p>The naive estimate used on the ${h.a('next-t-bill-auction', 'next auction page')} puts numbers on that uncertainty. Carrying the last cut-off forward to the next auction has missed by ${K.dec(e6.mae, 2)} point on average for 6-month bills, over the last ${e6.count} auctions. For 1-year bills, auctions are three months apart instead of two weeks, and the same rule missed by ${K.dec(e1.mae, 2)} point on average over the last ${e1.count}. Long gaps between auctions leave more room for yields to move.</p>
${h.mini('tbill', { t: 'A larger sum in the 1-year bill', p: ['amt'], d: { amt: 100000, tm: '1Y' } })}

<h2>Applying for a quarterly bill</h2>
<p>The process is the one for every T-bill. MAS announces the bill five business days before its auction; individuals apply through DBS/POSB, OCBC or UOB, whose ATM and online channels usually close one to two business days before the auction; bids reach MAS through primary dealers by noon on auction day; the bill is issued three business days later. ${next1 ? `The next 1-year auction in the calendar we read is ${next1.code} on ${K.day(next1.auction)}.` : 'The calendar we read does not yet list the next 1-year auction; it appears there when MAS publishes it.'} Bids start at ${K.sgd(K.P.tbill.min)}, in multiples of ${K.sgd(K.P.tbill.lot)}, and non-competitive bids are capped at ${K.sgd(K.P.tbill.ncLimit)} per person per auction.</p>
<p>Because the 1-year bill comes round only once a quarter, missing a bank's closing time costs months rather than days. The non-competitive route needs no yield at all, only an amount; across all ${B.length} 1-year auctions in our data, non-competitive applications were ${B.every((x) => x.ncPct >= 100) ? 'filled in full every time' : 'not always filled in full'}. The ${h.a('t-bill-competitive-bid', 'competitive bid page')} covers bidding with a yield.</p>

<h2>Holding to maturity</h2>
<p>There is no early redemption, so a 1-year bill is money set aside for a year: ${b.code}, issued on ${K.day(b.issue)}, repays its face value on ${K.day(b.maturity)}, and nothing comes in before that date. A sale before maturity is possible at the main branches of the three banks, at a market price that can be above or below cost. At maturity, the face value is paid out, to the bank account linked to CDP for cash holders. Interest is tax-exempt for individuals, and MAS publishes no bank fee for T-bills. The ${h.a('6-month-t-bill', '6-month bill page')} follows the fortnightly auctions, and the ${h.a('ssb-vs-t-bill', 'Savings Bond comparison')} sets a year in the bill against a year in the latest Savings Bond. Rules: ${h.src('mas_tbill', 'MAS, T-bills for individuals')} and ${h.src('mas_compare', 'MAS, comparing government securities')}.</p>`,
  tool: 'tbill',
  toolArg: { amt, tm: '1Y' },
  related: ['6-month-t-bill', 't-bill-singapore', 't-bill-yield', 'next-t-bill-auction', 'ssb-vs-t-bill'],
  sources: ['mas_tbill', 'mas_api_bills', 'mas_compare', 'mas_auction'],
});
