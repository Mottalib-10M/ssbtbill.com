import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const TB = K.P.tbill;
const b6 = K.bill('6M'), b1 = K.bill('1Y');
const B6 = K.bills('6M'), B1 = K.bills('1Y');
const last12 = B6.slice(-12).reverse();
const bidMed = b6.median;
const lowCut = Math.min(...last12.map((x) => x.cutoff));
const tMed = K.tool('tbid', { tm: '6M', bid: bidMed }), tLow = K.tool('tbid', { tm: '6M', bid: lowCut });
const pro6 = B6.filter((x) => x.ncPct < 100), pro1 = B1.filter((x) => x.ncPct < 100);
const lastPro = pro6[pro6.length - 1];
const minPro = [...pro6].sort((a, c) => a.ncPct - c.ncPct)[0];
const share = (x: (typeof B6)[number]) => x.ncAllotted / x.offered;
const maxShare = [...B6].sort((a, c) => share(c) - share(a))[0];
const mean = (xs: number[]) => xs.reduce((a, c) => a + c, 0) / Math.max(1, xs.length);
const cMean = mean(last12.map((x) => x.cPct));
const cLow = [...last12].sort((a, c) => a.cPct - c.cPct)[0];
const amt = 20000;
const wonMed = Number(String(tMed.value).split(' ')[0]), wonLow = Number(String(tLow.value).split(' ')[0]);
const atCut = K.buy(amt, b6.cutoff, b6.days);

export default defineGuide({
  id: 't-bill-competitive-bid',
  group: 'tbill',
  order: 70,
  slug: 't-bill-competitive-bid',
  nav: 'Competitive bids',
  card: 'Bid a yield or take the cut-off: what each kind of bid gets',
  title: 'T-Bill Competitive Bid 2026: Yield Bids and Allotment Odds',
  description: `T-bill competitive bid in 2026: a bid at ${K.pc(bidMed)} would have been allotted in ${tMed.value} recent 6-month auctions. Non-competitive bids, the 40 % cap, pro-rating.`,
  h1: 'Competitive or non-competitive: how a T-bill bid is filled',
  intro: `Pick the bill and type the lowest yield you would accept. The calculator sets that bid against the cut-off of each of the last twelve auctions and counts how often it would have been filled.`,
  resume: `A competitive T-bill bid names the lowest yield you will accept, to two decimals; a non-competitive bid names only an amount and takes whatever the auction sets. Both earn the same yield if allotted, the cut-off, because MAS runs a uniform-price auction. The difference is the risk. A non-competitive bid is filled first, up to 40 % of the issue, and pro-rated only when those bids exceed that share: of ${B6.length} 6-month auctions in our data, ${pro6.length} pro-rated them${lastPro ? `, most recently on ${K.day(lastPro.auction)}` : ''}, and of ${B1.length} 1-year auctions, ${pro1.length === 0 ? 'none' : pro1.length}. A competitive bid is filled in full below the cut-off, in part at the cut-off, and not at all above it. A bid at ${K.pc(bidMed)}, the median yield of the latest 6-month auction, would have been allotted in ${wonMed} of the last twelve. At the cut-off itself, the share of bids filled averaged ${K.pct(cMean / 100, 0)} over those twelve auctions. Individuals can bid up to ${K.sgd(TB.ncLimit)} non-competitively per auction, and up to 15 % of the issue in all.`,
  faqs: [
    { q: 'What yield do I earn if my competitive bid is below the cut-off?', a: `The cut-off, not your bid. In a uniform-price auction, every successful bid is allotted at the highest yield MAS accepted. A bid of ${K.pc(bidMed)} at the auction of ${K.day(b6.auction)} would have earned ${K.pc(b6.cutoff)}, the cut-off, like every other successful bid. Bidding low does not lower your return; it only makes the bid more likely to be filled.` },
    { q: 'When are non-competitive T-bill bids cut back?', a: `When their total exceeds 40 % of the amount on offer. MAS then allots them on a pro-rated basis. In our data, that happened in ${pro6.length} of ${B6.length} 6-month auctions${minPro ? `; the deepest cut was on ${K.day(minPro.auction)}, when ${K.dec(minPro.ncPct, 2)} % of each non-competitive application was filled` : ''}. In ${pro1.length === 0 ? 'none' : pro1.length} of the ${B1.length} 1-year auctions were they cut back.` },
    { q: 'How many competitive bids can I submit at one auction?', a: `MAS allows more than one competitive bid, each with its own yield, up to two decimal places. Spreading an amount over several yields means part of it can be filled even if the cut-off comes in low. All bids by one person, competitive and non-competitive together, count towards an overall limit of 15 % of the issue size.` },
    { q: 'What happens to my money if my bid is not allotted?', a: 'The bank debits the full amount when you apply, and refunds the unallotted part to the account used, one to two business days after the auction, according to MAS. A competitive bid above the cut-off gets nothing, so the whole amount comes back; a bid at the cut-off may be filled in part, with the rest refunded.' },
  ],
  body: (h) => `
<h2>Two ways to bid, one yield for everyone</h2>
<p>MAS describes the method in a few lines on its page on how auctions are conducted (${h.ext('https://www.mas.gov.sg/bonds-and-bills/investing-in-singapore-government-securities/how-sgs-auctions-are-conducted', 'MAS, how SGS auctions are conducted')}). Non-competitive bids, which state only an amount, are allotted first, up to 40 % of the issue. The rest of the issue goes to competitive bids, from the lowest yield to the highest, until the issue is used up. The yield of the last bid accepted is the cut-off. Every allotted bid, competitive or not, is then priced at that single yield. In the latest 6-month auction, ${b6.code}, the cut-off was ${K.pc(b6.cutoff)}: on ${K.sgd(amt)} of face value, every successful bidder paid ${K.sgd2(atCut.cost)}.</p>
<p>So the choice is not about the return, which is the same for all winners: nobody is paid the yield they bid, and nobody who bid a lower yield receives less than the cut-off. It is about certainty of allotment. A non-competitive bid is almost always filled in full. A competitive bid is filled in full only if its yield is below the cut-off, in part if exactly at it, and not at all if above. A bid at a very low yield behaves much like a non-competitive one, except that it sits in the competitive pool and so escapes the 40 % cap.</p>
${h.mini('tbid', { t: 'The same test for the 1-year bill', p: ['bid'], d: { tm: '1Y', bid: b1.median } })}

<h2>Testing a yield against the last twelve auctions</h2>
<p>The calculator at the top takes one yield and checks it against each recent cut-off. Two examples show the range. A bid at ${K.pc(bidMed)}, the median yield of the latest auction, would have been allotted in ${wonMed} of the last twelve 6-month auctions. A bid at ${K.pc(lowCut)}, the lowest cut-off of those twelve, would have been allotted in ${wonLow} of them, in part where it matched the cut-off exactly. The lower the yield you bid, the more often it is filled, and the return when filled does not change.</p>
${h.table(['Auction', 'Cut-off', 'Offered', 'Non-competitive allotted', 'Share of issue', 'Non-competitive filled', 'Bids at cut-off filled'], last12.map((x) => [K.day(x.auction), K.pc(x.cutoff), K.mn(x.offered), K.mn(x.ncAllotted), K.pct(share(x), 0), `${K.dec(x.ncPct, 2)} %`, `${K.dec(x.cPct, 2)} %`]), `Latest twelve 6-month auctions. Source: MAS statistics API, read ${K.day(K.BILLS_READ)}.`, ['l', 'r', 'r', 'r', 'r', 'r', 'r'])}
<p>The last column matters for anyone who bids exactly at what turns out to be the cut-off. In the twelve auctions above, the share of such bids filled averaged ${K.pct(cMean / 100, 0)} and was lowest, ${K.dec(cLow.cPct, 2)} %, on ${K.day(cLow.auction)}. A bid one hundredth of a point lower would have been filled in full in each case.</p>

<h2>When the 40 % cap bites</h2>
<p>Non-competitive demand is what decides whether the simple route works. When non-competitive bids add up to more than 40 % of the issue, MAS scales each of them down. The highest non-competitive share in our 6-month data was ${K.pct(share(maxShare), 1)} of the issue, on ${K.day(maxShare.auction)}${share(maxShare) > 0.395 ? ', which is the cap at work' : ''}. In ${pro6.length} 6-month auctions, non-competitive applications were filled at less than 100 %${minPro ? `, down to ${K.dec(minPro.ncPct, 2)} % on ${K.day(minPro.auction)}` : ''}. In those auctions, a competitive bid below the cut-off received its full amount while every non-competitive bid was scaled down.</p>
${h.mini('tbid', { t: 'A low bid on the 6-month bill', p: ['tm'], d: { tm: '6M', bid: lowCut } })}
<p>The 1-year bill tells a calmer story: in ${pro1.length === 0 ? 'none' : pro1.length} of its ${B1.length} auctions in our data were non-competitive bids pro-rated. Its latest auction, ${b1.code}, filled ${K.dec(b1.ncPct, 2)} % of non-competitive applications and ${K.dec(b1.cPct, 2)} % of the bids at its cut-off of ${K.pc(b1.cutoff)}.</p>

<h2>Limits, decimals and refunds</h2>
<p>A competitive bid is stated in yield terms, up to two decimal places, and MAS allows several bids at different yields. Individuals can place up to ${K.sgd(TB.ncLimit)} in non-competitive bids at each T-bill auction, and all of one person's bids together are capped at 15 % of the issue size. Bids start at ${K.sgd(TB.min)}, in multiples of ${K.sgd(TB.lot)} (${h.src('mas_tbill', 'MAS, T-bills for individuals')}). Whatever the type of bid, the bank debits the amount when you apply and refunds any unallotted part one to two business days after the auction (${h.src('mas_auction', 'MAS, buying at auction')}). The bank's own closing time, usually one to two business days before the auction, applies to both kinds, and a competitive bid placed after it simply misses the auction, so the yield has to be chosen a day or two before the result is known. The ${h.a('next-t-bill-auction', 'next auction page')} gives the dates and a naive estimate of the cut-off, and the ${h.a('t-bill-yield', 'yield page')} turns any yield into a price.</p>`,
  tool: 'tbid',
  toolArg: { tm: '6M', bid: bidMed },
  related: ['t-bill-singapore', 'next-t-bill-auction', '6-month-t-bill', 't-bill-yield', '1-year-t-bill'],
  sources: ['mas_auction', 'mas_tbill', 'mas_api_bills'],
});
