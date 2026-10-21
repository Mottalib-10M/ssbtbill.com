import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const b = K.bill('6M');
const B = K.bills('6M');
const last12 = B.slice(-12);
const mean = (xs: number[]) => xs.reduce((a, c) => a + c, 0) / Math.max(1, xs.length);
const m12 = mean(last12.map((x) => x.cutoff)), cov12 = mean(last12.map((x) => x.cover));
const hi12 = [...last12].sort((a, c) => c.cutoff - a.cutoff)[0], lo12 = [...last12].sort((a, c) => a.cutoff - c.cutoff)[0];
const six = B[B.length - 7];
const dir = b.cutoff - six.cutoff;
const fullYear = String(Number(b.auction.slice(0, 4)) - 1);
const perYear = K.yearBills('6M', Number(fullYear)).length;
const sizeLo = Math.min(...last12.map((x) => x.offered)), sizeHi = Math.max(...last12.map((x) => x.offered));
const upcoming6 = K.CAL.bills.filter((x) => x.term === '6M');
const amt = 30000;
const issues = new Set([...B.map((x) => x.issue), ...K.upcoming().map((x) => x.issue)]);
const aligned = B.filter((x) => issues.has(x.maturity)).length;
const allCovered = last12.every((x) => x.cover > 1);
const ytd = K.yearBills('6M', Number(b.auction.slice(0, 4))), prevY = K.yearBills('6M', Number(fullYear));
const mYtd = mean(ytd.map((x) => x.cutoff)), mPrev = mean(prevY.map((x) => x.cutoff));
const last26 = B.slice(-27), ups = last26.slice(1).filter((x, k) => x.cutoff > last26[k].cutoff + 1e-9).length, downs = last26.slice(1).filter((x, k) => x.cutoff < last26[k].cutoff - 1e-9).length;
const buy = K.buy(amt, b.cutoff, b.days);
const roll = K.rollover(amt, b.cutoff, 1, 0, b.days);
const days = [...new Set(B.map((x) => x.days))].sort();
const prorated = B.filter((x) => x.ncPct < 100);
const lastPro = prorated[prorated.length - 1];

export default defineGuide({
  id: '6-month-t-bill',
  group: 'tbill',
  order: 30,
  slug: '6-month-t-bill',
  nav: '6-month T-bill',
  card: 'The fortnightly bill: latest cut-offs and the next auctions',
  title: '6-Month T-Bill 2026: Latest Cut-Off and Fortnightly Auctions',
  description: `6-month T-bill 2026: ${b.code} cut off at ${K.pc(b.cutoff)}, ${b.price} per S$100 for ${b.days} days. The last 12 auctions averaged ${K.pc(m12)}. Next dates and interest on your sum.`,
  h1: 'The 6-month T-bill: every two weeks, one new yield',
  intro: `Enter the face value you would bid for; the latest 6-month cut-off is filled in. Change the yield to see what a different auction result would pay on the same amount.`,
  resume: `The 6-month Singapore T-bill is auctioned every two weeks, and the latest one, ${b.code}, cut off at ${K.pc(b.cutoff)} on ${K.day(b.auction)}, for a price of ${b.price} per S$100 and a term of ${b.days} days, from ${K.day(b.issue)} to ${K.day(b.maturity)}. On ${K.sgd(amt)} of face value, that means paying ${K.sgd2(buy.cost)} and receiving ${K.sgd(amt)} at maturity, ${K.sgd2(buy.interest)} of interest, or ${K.pct(buy.yearly)} a year on the cash paid. Over the last twelve auctions, the cut-off averaged ${K.pc(m12)}, ranging from ${K.pc(lo12.cutoff)} to ${K.pc(hi12.cutoff)}, and is ${Math.abs(dir) < 0.005 ? 'unchanged' : `${dir > 0 ? 'up' : 'down'} ${K.dec(Math.abs(dir), 2)} point`} on the auction twelve weeks earlier. Each auction offered between ${K.mn(sizeLo)} and ${K.mn(sizeHi)}, and bids averaged ${K.dec(cov12, 2)} times the amount on offer. In ${fullYear}, MAS held ${perYear} auctions of this bill. Renewing ${K.sgd(amt)} for a year at an unchanged yield would earn about ${K.sgd(roll.gain)}, though the second auction sets its own yield.${upcoming6.length ? ` The next auction is ${upcoming6[0].code} on ${K.day(upcoming6[0].auction)}.` : ''}`,
  faqs: [
    { q: 'How often is the 6-month T-bill auctioned?', a: `Every two weeks, according to the MAS issuance calendar, which gives ${perYear} auctions in ${fullYear}. Each auction has its own bill code, starting with BS, its own issue date and its own maturity about six months later. A saver who wants to keep money in 6-month bills therefore needs a new bid every half-year, at whatever yield that auction sets.` },
    { q: 'What does the bid-to-cover ratio say about a 6-month auction?', a: `It divides the money bid by the money offered. For ${b.code}, bids came to ${K.dec(b.cover, 2)} times the ${K.mn(b.offered)} on offer. A higher ratio means more competition for the same paper, which tends to push the cut-off down, since MAS fills competitive bids from the lowest yield up. It describes demand; it does not predict the next yield.` },
    { q: 'How many days does a 6-month T-bill last?', a: `Usually ${b.days} days. In our data, 6-month bills ran ${days.join(', ')} days, depending on where the issue and maturity dates fell. The price formula uses the actual number of days, so a shorter bill at the same yield costs slightly more per S$100 and pays slightly less interest in dollars, with the same yearly rate.` },
    { q: 'Have non-competitive bids for the 6-month bill ever been cut back?', a: `Yes. Non-competitive bids are filled first, up to 40 % of the issue, and pro-rated above that. In our data, ${prorated.length} 6-month auctions allotted less than 100 % of non-competitive applications${lastPro ? `, the most recent on ${K.day(lastPro.auction)}, at ${K.dec(lastPro.ncPct, 2)} %` : ''}. In every other auction, every non-competitive bid was filled in full.` },
  ],
  body: (h) => `
<h2>Twelve auctions, six months of results</h2>
<p>The 6-month bill is the one that comes back most often, every fortnight. Each line below is one auction: its date, its bill code, the cut-off yield that set the price, the median yield, the bid-to-cover ratio, the amount MAS offered and the share of competitive bids at the cut-off that were allotted. That last column is the one bidders at the margin watch, because a bid placed exactly at the cut-off receives only that share.</p>
${h.table(['Auction', 'Code', 'Cut-off', 'Median', 'Bid-to-cover', 'Offered', 'Bids at cut-off filled'], last12.slice().reverse().map((x) => [K.day(x.auction), x.code, K.pc(x.cutoff), K.pc(x.median), K.dec(x.cover, 2), K.mn(x.offered), `${K.dec(x.cPct, 2)} %`]), `Latest twelve 6-month T-bill auctions. Source: MAS statistics API, read ${K.day(K.BILLS_READ)}.`, ['l', 'l', 'r', 'r', 'r', 'r', 'r'])}
<p>Over those twelve auctions, the highest cut-off was ${K.pc(hi12.cutoff)} on ${K.day(hi12.auction)} and the lowest ${K.pc(lo12.cutoff)} on ${K.day(lo12.auction)}. Half a year of results is a reasonable window for someone deciding whether to roll a maturing bill or place the money elsewhere: it shows the direction and the size of the moves, without pretending to know the next one.</p>
${h.mini('tbill', { t: 'Interest at the twelve-auction average', p: ['yl'], d: { amt: 12000, tm: '6M', yl: Math.round(m12 * 100) / 100 } })}

<h2>The fortnightly rhythm and what it means for planning</h2>
<p>MAS publishes the year's auction calendar around October or November of the year before. A bill is announced five business days before its auction, and is issued three business days after it. Bank channels usually close one to two business days before auction day, each bank at its own time, so the practical deadline is earlier than the auction date. Because 182 days is thirteen fortnights, the calendar often lines up: of the ${B.length} 6-month bills in our data, ${aligned} matured on the very day another 6-month bill was issued, so the money could go straight into the next bill, provided the bid was placed before that auction.</p>
${upcoming6.length ? h.table(['Bill', 'Announced', 'Auction', 'Issued', 'Days'], upcoming6.map((x) => [x.code, K.day(x.announced), K.day(x.auction), K.day(x.issue), String(x.days)]), 'Next 6-month auctions in the MAS issuance calendar.', ['l', 'l', 'l', 'l', 'r']) : ''}
<p>Renewing at every maturity turns the bill into a rolling deposit whose rate resets twice a year. At the latest cut-off, ${K.sgd(amt)} rolled for a year would earn about ${K.sgd(roll.gain)}. That figure assumes the second auction repeats the first, which is the one thing that rarely happens; the ${h.a('next-t-bill-auction', 'next auction page')} publishes how far that naive assumption has missed in the past.</p>

<h2>A year of moves, auction to auction</h2>
<p>Over the last 26 auctions, about a year of fortnights, the cut-off rose from one auction to the next ${ups} times, fell ${downs} times and was unchanged ${26 - ups - downs} times. The ${ytd.length} auctions held so far in ${b.auction.slice(0, 4)} averaged ${K.pc(mYtd)}, against ${K.pc(mPrev)} for the ${prevY.length} auctions of ${fullYear}. A run of small moves in one direction is common, and so are reversals, which is why a cut-off is best read as a level that holds for six months, not as a trend. The full record since ${B[0].auction.slice(0, 4)}, year by year, is on the ${h.a('t-bill-yield-history', 'yield history page')}.</p>

<h2>Size, demand and the non-competitive share</h2>
<p>Recent auctions offered between ${K.mn(sizeLo)} and ${K.mn(sizeHi)} each. ${allCovered ? 'Bids exceeded the amount on offer in each of the last twelve auctions' : 'Bids did not always cover the amount on offer'}, with an average bid-to-cover of ${K.dec(cov12, 2)}. A non-competitive bid gives an amount and accepts the cut-off; those bids are filled first, up to 40 % of the issue. In the latest auction, non-competitive allotments came to ${K.mn(b.ncAllotted)}, or ${K.pct(b.ncAllotted / b.offered, 0)} of the amount offered, and ${b.ncPct >= 100 ? 'every non-competitive application was filled in full' : `only ${K.dec(b.ncPct, 2)} % of non-competitive applications were filled`}.</p>
<p>The cap has bitten before. In ${prorated.length} of the ${B.length} 6-month auctions in our data, non-competitive bids exceeded the 40 % limit and were pro-rated${lastPro ? `, most recently on ${K.day(lastPro.auction)}` : ''}. The ${h.a('t-bill-competitive-bid', 'competitive bid page')} explains when a bid with a yield can do better than one without.</p>
${h.mini('tnext', { t: 'Estimate for the next 6-month auction', p: ['amt'], d: { tm: '6M', amt: 18000 } })}

<h2>Paying, holding and getting the money back</h2>
<p>The minimum bid is ${K.sgd(K.P.tbill.min)}, in multiples of ${K.sgd(K.P.tbill.lot)}, with cash, SRS money or CPF Investment Scheme savings, through DBS/POSB, OCBC or UOB. The full amount is debited when you apply, and a failed bid is refunded one to two business days after the auction. At maturity, cash holders receive the face value in the bank account linked to CDP. There is no early redemption; a sale before maturity goes through the main branches of the three banks at a market price. MAS publishes no bank fee for T-bills, and none is counted here. For the formula behind the price, see the ${h.a('t-bill-yield', 'yield page')}; for the 1-year bill, the ${h.a('1-year-t-bill', 'quarterly auctions')}; for the rules in full, ${h.src('mas_tbill', 'MAS, T-bills for individuals')} and ${h.src('mas_auction', 'MAS, buying at auction')}.</p>`,
  tool: 'tbill',
  toolArg: { amt, tm: '6M' },
  related: ['t-bill-singapore', '1-year-t-bill', 'next-t-bill-auction', 't-bill-yield-history', 't-bill-with-cpf'],
  sources: ['mas_tbill', 'mas_api_bills', 'mas_auction'],
});
