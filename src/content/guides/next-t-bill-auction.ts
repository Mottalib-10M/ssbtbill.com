import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const CAL = K.CAL.bills;
const next = CAL[0];
const e6 = K.estimate('6M'), e1 = K.estimate('1Y');
const n1 = CAL.find((x) => x.term === '1Y');
const amt = 40000;
const atEst = K.buy(amt, e6.estimate, next ? next.days : e6.from.days);
const lo = Math.max(0, e6.estimate - e6.p80), hi = e6.estimate + e6.p80;
const atLo = K.buy(amt, lo, next ? next.days : e6.from.days), atHi = K.buy(amt, hi, next ? next.days : e6.from.days);
// How the naive rule did over the last ten 6-month auctions.
const B6 = K.bills('6M');
const last11 = B6.slice(-11);
const track = last11.slice(1).map((x, k) => ({ x, prev: last11[k].cutoff, miss: x.cutoff - last11[k].cutoff })).reverse();
const exact = track.filter((t) => Math.abs(t.miss) < 1e-9).length;
const worst = [...track].sort((a, b) => Math.abs(b.miss) - Math.abs(a.miss))[0];
const daysTo = next ? Math.round((Date.parse(next.auction) - Date.parse(K.BILLS_READ)) / 86400000) : 0;
const jumps = B6.slice(1).map((x, k) => ({ x, d: x.cutoff - B6[k].cutoff }));
const jump = [...jumps].sort((a, b) => Math.abs(b.d) - Math.abs(a.d))[0];
const term = (t: string) => (t === '6M' ? '6-month' : '1-year');

export default defineGuide({
  id: 'next-t-bill-auction',
  group: 'tbill',
  order: 50,
  slug: 'next-t-bill-auction',
  nav: 'Next auction',
  card: 'Dates already announced, and a naive estimate with its past error',
  title: 'Next T-Bill Auction 2026: Date, Bill Code and Yield Estimate',
  description: `Next T-bill auction 2026: dates set by MAS, and a naive estimate of ${K.pc(e6.estimate)} for the 6-month cut-off, which missed by ${K.dec(e6.mae, 2)} point on average. Method shown.`,
  h1: 'The next T-bill auction: date, deadlines and a plain estimate',
  intro: `Pick the 6-month or 1-year bill and the face value you plan to bid for. The calculator shows the naive estimate for the next cut-off, its likely range and the interest at that yield.`,
  resume: `${next ? `The next T-bill auction on the MAS calendar is the ${term(next.term)} bill ${next.code}, on ${K.day(next.auction)}, for issue on ${K.day(next.issue)} and a term of ${next.days} days.` : 'The MAS calendar we read lists no upcoming T-bill auction yet.'} Nobody knows its cut-off before MAS publishes the result, and this site does not forecast it. What we publish is a naive estimate: the last cut-off, ${K.pc(e6.estimate)} on ${K.day(e6.from.auction)}, carried forward. Over the last ${e6.count} auctions of 6-month bills, that rule missed the real cut-off by ${K.dec(e6.mae, 2)} point on average; eight times in ten it missed by ${K.dec(e6.p80, 2)} point or less, and ${e6.within10} times it was within 0.10 point. That gives a working range of ${K.pc(lo)} to ${K.pc(hi)}. On ${K.sgd(amt)} of face value, the estimate means about ${K.sgd2(atEst.interest)} of interest, and the range ${K.sgd2(atLo.interest)} to ${K.sgd2(atHi.interest)}. For 1-year bills, auctioned once a quarter, the same rule has missed by ${K.dec(e1.mae, 2)} point on average. Bank channels close one to two business days before the auction.`,
  faqs: [
    { q: 'When do bank applications close for the next T-bill auction?', a: `Earlier than the auction itself. MAS states that ATM and internet banking applications typically close one to two business days before auction day, at a time each bank sets, because primary dealers must submit all bids to MAS by noon on the day. ${next ? `For the auction of ${K.day(next.auction)}, the safe assumption is that channels close a day or two before that date.` : ''}` },
    { q: 'How accurate is the estimate for the next cut-off?', a: `For 6-month bills, the rule of carrying the last cut-off forward missed by ${K.dec(e6.mae, 2)} point on average over the last ${e6.count} auctions, and by ${K.dec(e6.p80, 2)} point or less in eight cases out of ten. It was within 0.10 point ${e6.within10} times. That is the whole method: no model, no market data, and no view on where yields are heading.` },
    { q: 'Why is the estimate less reliable for the 1-year bill?', a: `Because the 1-year bill is auctioned once a quarter, so the last cut-off is about three months old by the next auction, against two weeks for the 6-month bill. Over the last ${e1.count} auctions of 1-year bills, the naive rule missed by ${K.dec(e1.mae, 2)} point on average, and by ${K.dec(e1.p80, 2)} point or less eight times in ten.` },
    { q: 'When will the result of the next auction be known?', a: `On auction day itself. MAS releases results about two hours after the auction closes, on its issuance calendar page, and our data picks them up on the next update, run every business day. ${next ? `For ${next.code}, that is ${K.day(next.auction)}; the bill is issued three business days later, on ${K.day(next.issue)}.` : 'The bill is issued three business days after the auction.'}` },
  ],
  body: (h) => `
<h2>The auctions already on the calendar</h2>
<p>MAS publishes the dates of every T-bill auction in its annual issuance calendar, and each bill is formally announced, with the amount on offer, five business days before its auction. The table lists what the calendar we read contains, as of ${K.day(K.CAL.meta.read)}. ${next ? `The first auction listed is ${daysTo} day${daysTo === 1 ? '' : 's'} after that date.` : ''} ${n1 ? `The next 1-year auction is ${n1.code} on ${K.day(n1.auction)}.` : 'No 1-year auction is listed yet; it will appear when MAS announces the next quarterly bill.'}</p>
${CAL.length ? h.table(['Bill', 'Term', 'Announced', 'Auction', 'Issued', 'Days'], CAL.map((x) => [x.code, term(x.term), K.day(x.announced), K.day(x.auction), K.day(x.issue), String(x.days)]), 'Upcoming T-bill auctions. Source: MAS statistics API (issuance calendar).', ['l', 'l', 'l', 'l', 'l', 'r']) : ''}
<p>Each line is a separate bill with its own maturity. A saver whose bill matures on a given date can find, in this table, the first auction whose issue date falls on or after it, and work back from that date to the bank's closing time.</p>

<h2>What the estimate is, and what it is not</h2>
<p>The estimate is deliberately plain. It takes the last published cut-off for the same bill and assumes the next auction will repeat it. It does not read bond markets, central bank decisions or interbank rates, and it does not come from MAS. It is useful for one reason only: its past errors are known exactly, so the range around it is honest. Over the last ${e6.count} auctions of 6-month bills, the average miss was ${K.dec(e6.mae, 2)} point and eight misses in ten were ${K.dec(e6.p80, 2)} point or smaller. Applied to the latest cut-off, that gives a range of ${K.pc(lo)} to ${K.pc(hi)} for the next 6-month auction.</p>
<p>In dollars, the range is narrow. On ${K.sgd(amt)} of face value, the estimate means about ${K.sgd2(atEst.interest)} of interest; the low end ${K.sgd2(atLo.interest)}, the high end ${K.sgd2(atHi.interest)}. The range is a description of past misses, not a promise: the largest single move between two 6-month auctions in our data was ${K.dec(Math.abs(jump.d), 2)} point, at the auction of ${K.day(jump.x.auction)}.</p>
<p>The 1-year bill gets the same treatment with a wider band. Its last cut-off, ${K.pc(e1.estimate)} on ${K.day(e1.from.auction)}, carried forward with eight-in-ten misses of ${K.dec(e1.p80, 2)} point or less, gives a range of ${K.pc(Math.max(0, e1.estimate - e1.p80))} to ${K.pc(e1.estimate + e1.p80)}. Over the last ${e1.count} quarterly auctions, the rule landed within 0.10 point only ${e1.within10} time${e1.within10 === 1 ? '' : 's'}, against ${e6.within10} for the 6-month bill. Three months between auctions is simply more time for yields to travel.</p>
${h.mini('tnext', { t: 'The same estimate for the quarterly bill', p: ['amt'], d: { tm: '1Y', amt: 15000 } })}

<h2>The rule against the last ten results</h2>
<p>The table shows the rule at work on the latest ten 6-month auctions: the estimate it would have given, the cut-off MAS published and the miss. ${exact === 0 ? 'None of the ten was hit exactly' : exact === 1 ? 'One of the ten was hit exactly' : `${exact} of the ten were hit exactly`}; the largest miss was ${K.dec(Math.abs(worst.miss), 2)} point, at the auction of ${K.day(worst.x.auction)}.</p>
${h.table(['Auction', 'Code', 'Estimate (previous cut-off)', 'Actual cut-off', 'Miss'], track.map((t) => [K.day(t.x.auction), t.x.code, K.pc(t.prev), K.pc(t.x.cutoff), `${t.miss >= 0 ? '+' : ''}${K.dec(t.miss, 2)}`]), `Naive estimate against actual results, 6-month bills. Source: MAS statistics API, read ${K.day(K.BILLS_READ)}.`, ['l', 'l', 'r', 'r', 'r'])}
<p>A string of misses in the same direction means yields were moving steadily; a mix of signs means they were bouncing around a level. Neither pattern says anything certain about the next result, which is why the page stops at an estimate. For the full record of cut-offs year by year, see the ${h.a('t-bill-yield-history', 'yield history')}.</p>

<h2>Deadlines that come before the auction</h2>
<p>The auction date is not the date that matters to an individual. Banks collect applications through ATMs, internet banking and mobile apps, and MAS states those channels typically close one to two business days before the auction; the exact time is the bank's. Primary dealers must submit all bids by noon on auction day. The amount is debited from your account when you apply. Results come out about two hours after the auction, and an unsuccessful bid is refunded one to two business days later. The bill is issued three business days after the auction (${h.src('mas_auction', 'MAS, buying at auction')}).</p>
${h.mini('tnext', { t: 'A small bid at the next 6-month auction', p: ['tm'], d: { tm: '6M', amt: 8000 } })}
<p>Two kinds of bid are possible. A non-competitive bid accepts the cut-off, whatever it turns out to be, so the estimate only tells you roughly what you will earn. A competitive bid states a minimum yield, and here the estimate and its range matter more, since a bid above the cut-off gets nothing. The ${h.a('t-bill-competitive-bid', 'competitive bid page')} tests a yield against recent auctions, and the ${h.a('t-bill-singapore', 'T-bill guide')} explains the auction in full. Results come from the ${h.src('mas_api_bills', 'MAS statistics API')}.</p>`,
  tool: 'tnext',
  toolArg: { tm: '6M', amt },
  related: ['t-bill-singapore', '6-month-t-bill', 't-bill-yield-history', 't-bill-competitive-bid', '1-year-t-bill'],
  sources: ['mas_api_bills', 'mas_auction', 'mas_tbill'],
});
