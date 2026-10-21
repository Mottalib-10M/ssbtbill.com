import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const B6 = K.bills('6M'), B1 = K.bills('1Y');
const mean = (xs: number[]) => xs.reduce((a, c) => a + c, 0) / Math.max(1, xs.length);
const years = [...new Set([...B1, ...B6].map((x) => x.auction.slice(0, 4)))].sort();
const stat = (t: '6M' | '1Y', y: string) => { const xs = K.yearBills(t, Number(y)); const c = xs.map((x) => x.cutoff); return xs.length ? { n: xs.length, lo: Math.min(...c), hi: Math.max(...c), avg: mean(c), cover: mean(xs.map((x) => x.cover)) } : null; };
const rows = years.map((y) => ({ y, s6: stat('6M', y), s1: stat('1Y', y) }));
const top = (xs: typeof B6) => [...xs].sort((a, c) => c.cutoff - a.cutoff)[0];
const bot = (xs: typeof B6) => [...xs].sort((a, c) => a.cutoff - c.cutoff)[0];
const hi6 = top(B6), lo6 = bot(B6), hi1 = top(B1), lo1 = bot(B1);
const r6 = rows.filter((r) => r.s6), r1 = rows.filter((r) => r.s1);
const best6 = [...r6].sort((a, c) => c.s6!.avg - a.s6!.avg)[0], worst6 = [...r6].sort((a, c) => a.s6!.avg - c.s6!.avg)[0];
const best1 = [...r1].sort((a, c) => c.s1!.avg - a.s1!.avg)[0], worst1 = [...r1].sort((a, c) => a.s1!.avg - c.s1!.avg)[0];
const over3 = B6.filter((x) => x.cutoff >= 3).length, under1 = B6.filter((x) => x.cutoff < 1).length;
const start6 = B6[0], start1 = B1[0];
const thisYear = years[years.length - 1];
const cur6 = stat('6M', thisYear);
// Interest on S$10,000 of 6-month bills at the extremes.
const at = (y: number) => K.buy(10000, y, 182).interest;
const mdiff = (a: string, b: string) => Math.abs((Number(b.slice(0, 4)) - Number(a.slice(0, 4))) * 12 + Number(b.slice(5, 7)) - Number(a.slice(5, 7)));
const gapM = mdiff(hi6.auction, hi1.auction), climb = mdiff(lo6.auction, hi6.auction);
// S$10,000 through each full year: the first 6-month bill of January, then the one thirteen auctions later, against the year's first 1-year bill.
const rollYears = years.filter((y) => K.yearBills('6M', Number(y)).length >= 26 && K.yearBills('1Y', Number(y)).length).map((y) => { const xs = K.yearBills('6M', Number(y)), ys = K.yearBills('1Y', Number(y)); const two = K.buy(10000, xs[0].cutoff, xs[0].days).interest + K.buy(10000, xs[13].cutoff, xs[13].days).interest; const one = K.buy(10000, ys[0].cutoff, ys[0].days).interest; return { y, a: xs[0], b: xs[13], c: ys[0], two, one }; });
const twoWins = rollYears.filter((r) => r.two > r.one).length;
const both = rows.filter((r) => r.s6 && r.s1), oneAbove = both.filter((r) => r.s1!.avg > r.s6!.avg).length;
const widest = [...r6].sort((a, c) => (c.s6!.hi - c.s6!.lo) - (a.s6!.hi - a.s6!.lo))[0];

export default defineGuide({
  id: 't-bill-yield-history',
  group: 'tbill',
  order: 60,
  slug: 't-bill-yield-history',
  nav: 'Yield history',
  card: 'Every cut-off by year, with the averages worked out',
  title: 'T-Bill Yield History 2026: Every Cut-Off Since 2015 by Year',
  description: `T-bill yield history to 2026: 6-month cut-offs from ${K.pc(lo6.cutoff)} to ${K.pc(hi6.cutoff)}, 1-year from ${K.pc(lo1.cutoff)} to ${K.pc(hi1.cutoff)}. Yearly averages and extremes from every auction result.`,
  h1: 'T-bill yield history: every cut-off, year by year',
  intro: `Choose a bill and a year. The calculator lists every auction of that year with its cut-off, median and bid-to-cover, and works out the average, the highest and the lowest.`,
  resume: `Singapore T-bill yields have swung widely in a decade. The 1-year bill, recorded in our data since its auction of ${K.day(start1.auction)}, cut off as low as ${K.pc(lo1.cutoff)} (${K.day(lo1.auction)}) and as high as ${K.pc(hi1.cutoff)} (${K.day(hi1.auction)}). The 6-month bill, whose series in our data starts on ${K.day(start6.auction)}, ranged from ${K.pc(lo6.cutoff)} (${K.day(lo6.auction)}) to ${K.pc(hi6.cutoff)} (${K.day(hi6.auction)}). By calendar year, the 6-month average was lowest in ${worst6.y}, at ${K.pc(worst6.s6!.avg)}, and highest in ${best6.y}, at ${K.pc(best6.s6!.avg)}; for the 1-year bill, lowest in ${worst1.y} (${K.pc(worst1.s1!.avg)}) and highest in ${best1.y} (${K.pc(best1.s1!.avg)}). In money, ${K.sgd(10000)} in a 6-month bill earned ${K.sgd2(at(lo6.cutoff))} at the bottom and ${K.sgd2(at(hi6.cutoff))} at the top. ${over3} 6-month auctions cut off at 3 % or more, ${under1} below 1 %. So far in ${thisYear}, ${cur6 ? `${cur6.n} 6-month auctions have averaged ${K.pc(cur6.avg)}` : 'no 6-month auction has been held'}. The yearly figures here are simple averages of auction cut-offs, worked out from the MAS results.`,
  faqs: [
    { q: 'What was the highest 6-month T-bill cut-off in the data?', a: `${K.pc(hi6.cutoff)}, at the auction of ${K.day(hi6.auction)}, for bill ${hi6.code}. At that yield, ${K.sgd(10000)} of face value cost ${K.sgd2(K.buy(10000, hi6.cutoff, hi6.days).cost)} and returned ${K.sgd(10000)} six months later. The highest 1-year cut-off was ${K.pc(hi1.cutoff)}, on ${K.day(hi1.auction)}. The two peaks came ${gapM} month${gapM === 1 ? '' : 's'} apart.` },
    { q: 'In which year were T-bill yields lowest?', a: `For the 6-month bill, ${worst6.y}, when its ${worst6.s6!.n} auctions averaged ${K.pc(worst6.s6!.avg)} and the lowest cut-off was ${K.pc(worst6.s6!.lo)}. For the 1-year bill, ${worst1.y}, at an average of ${K.pc(worst1.s1!.avg)} over ${worst1.s1!.n} auctions. At the 6-month average of that year, ${K.sgd(10000)} earned about ${K.sgd2(at(worst6.s6!.avg))} over six months.` },
    { q: 'Are past T-bill yields a guide to future ones?', a: 'Only to the range of what can happen. Each cut-off is set by the bids at one auction, which follow market rates of the moment, not the pattern of earlier years. The history shows that yields can move by several points within two years and stay low or high for long stretches. It cannot say which of those the next auctions will bring.' },
    { q: 'How is the yearly average cut-off calculated here?', a: 'It is the simple mean of the cut-off yields of every auction of that bill held in the calendar year, each auction counting once, whatever its size. MAS does not publish a yearly average; we work it out from the auction results in the MAS statistics API. A weighted average, by amount allotted, would differ slightly in years when issue sizes changed.' },
  ],
  body: (h) => `
<h2>Year by year, both bills</h2>
<p>The table puts the two bills side by side for each calendar year: the number of auctions, the lowest, highest and average cut-off of the 6-month bill, and the average of the 1-year bill. A dash means the bill is not in our data for that year: the 6-month series we read from the MAS statistics API begins in ${start6.auction.slice(0, 4)}, while the 1-year series goes back to ${start1.auction.slice(0, 4)}.</p>
${h.table(['Year', '6-month auctions', '6-month low', '6-month high', '6-month average', '1-year auctions', '1-year average'], rows.slice().reverse().map((r) => [r.y, r.s6 ? String(r.s6.n) : '-', r.s6 ? K.pc(r.s6.lo) : '-', r.s6 ? K.pc(r.s6.hi) : '-', r.s6 ? K.pc(r.s6.avg) : '-', r.s1 ? String(r.s1.n) : '-', r.s1 ? K.pc(r.s1.avg) : '-']), `Cut-off yields from the MAS statistics API, read ${K.day(K.BILLS_READ)}; averages are simple means of each year's auctions.`, ['l', 'r', 'r', 'r', 'r', 'r', 'r'])}
<p>The year with the widest gap between the highest and the lowest 6-month cut-off was ${widest.y}, from ${K.pc(widest.s6!.lo)} to ${K.pc(widest.s6!.hi)}. A saver who rolled 6-month bills through such a year saw the yield on the same money change several times over; a saver who bought one 1-year bill locked a single figure for the twelve months.</p>
${h.mini('thist', { t: 'The 6-month bill in a low-yield year', p: ['tm'], d: { tm: '6M', yr: '2020' } })}

<h2>The extremes, and what they paid</h2>
<p>Extremes are easier to remember than averages. The lowest 6-month cut-off, ${K.pc(lo6.cutoff)} on ${K.day(lo6.auction)}, paid ${K.sgd2(at(lo6.cutoff))} on ${K.sgd(10000)} over six months. The highest, ${K.pc(hi6.cutoff)} on ${K.day(hi6.auction)}, paid ${K.sgd2(at(hi6.cutoff))} on the same amount. For the 1-year bill, the range ran from ${K.pc(lo1.cutoff)} to ${K.pc(hi1.cutoff)}. In ${over3} of the ${B6.length} 6-month auctions in our data, the cut-off was 3 % or more; in ${under1}, it was below 1 %.</p>
<p>The climb from the lowest 6-month cut-off to the highest took ${climb} months. That is the main lesson of the series for anyone comparing a bill with a product whose rate is fixed for years: the bill's yield is a snapshot, and the snapshot has changed by several points before. The ${h.a('ssb-rates-history', 'Savings Bond history')} shows the same period from the other side, with ten-year rates locked at each issue.</p>

<h2>What rolling actually paid, year by year</h2>
<p>Averages hide the order in which yields came. A more concrete test is to replay a year: ${K.sgd(10000)} placed in the first 6-month bill of January, then rolled into the auction held thirteen fortnights later, set against the same ${K.sgd(10000)} placed in the first 1-year bill of the year. Each line uses the cut-offs MAS actually published, so it is what those two choices really earned at the time.</p>
${h.table(['Year', 'First 6-month bill', 'Second 6-month bill', 'Two 6-month bills earned', 'First 1-year bill', 'One 1-year bill earned'], rollYears.slice().reverse().map((r) => [r.y, `${K.pc(r.a.cutoff)} (${K.monthShort(r.a.auction)})`, `${K.pc(r.b.cutoff)} (${K.monthShort(r.b.auction)})`, K.sgd2(r.two), `${K.pc(r.c.cutoff)} (${K.monthShort(r.c.auction)})`, K.sgd2(r.one)]), 'S$10,000 of face value each time, no reinvestment of interest. Cut-offs from the MAS statistics API.', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>The pair of 6-month bills earned more in ${twoWins} of these ${rollYears.length} years, and the single 1-year bill in the others. Over every year in which both bills were auctioned, the 1-year average cut-off sat above the 6-month average in ${oneAbove} of ${both.length}. Neither route wins by rule: it depends on whether yields rose or fell between January and July of that year.</p>

<h2>Demand through the cycle</h2>
<p>The bid-to-cover ratio, money bid divided by money offered, adds a second dimension. ${(() => { const c = r6.map((r) => ({ y: r.y, c: r.s6!.cover })); const hiC = [...c].sort((a, b) => b.c - a.c)[0], loC = [...c].sort((a, b) => a.c - b.c)[0]; return `For the 6-month bill, the yearly average ratio was highest in ${hiC.y}, at ${K.dec(hiC.c, 2)}, and lowest in ${loC.y}, at ${K.dec(loC.c, 2)}.`; })()} A high ratio means more competition for each dollar of bills, which pushes the cut-off down for a given level of market rates, since MAS fills competitive bids from the lowest yield upward. Issue sizes have also changed over the years, so the ratio compares demand with supply rather than measuring demand alone.</p>
${h.mini('thist', { t: 'A year of 1-year bills from the early series', p: ['yr'], d: { tm: '1Y', yr: '2016' } })}

<h2>How the figures are built</h2>
<p>Every number on this page is worked out from the auction results that MAS publishes in its statistics API, which our script reads each business day: the cut-off yield, the median yield and the bid-to-cover ratio of every 6-month and 1-year bill. Averages are simple means, one auction counting once. MAS publishes no yearly average of its own. The year list of the calculator runs back to 2015 for both bills; for the 6-month bill, the years before ${start6.auction.slice(0, 4)} show no auction, because our 6-month series starts with the auction of ${K.day(start6.auction)}. Interest figures on this page are per ${K.sgd(10000)} of face value, at the cut-off price, with no bank fee, since MAS publishes none for T-bills. The results are refreshed when a new auction is published, so the row for ${thisYear} changes through the year. The ${h.a('6-month-t-bill', '6-month bill page')} lists the latest twelve results in detail, and the ${h.a('next-t-bill-auction', 'next auction page')} shows how far a cut-off typically moves from one auction to the next. Sources: ${h.src('mas_api_bills', 'MAS statistics API, bonds and bills')} and ${h.src('mas_tbill', 'MAS, T-bills for individuals')}.</p>`,
  tool: 'thist',
  toolArg: { tm: '6M', yr: '2023' },
  related: ['6-month-t-bill', '1-year-t-bill', 'ssb-rates-history', 'next-t-bill-auction', 't-bill-yield'],
  sources: ['mas_api_bills', 'mas_tbill', 'mas_auction'],
});
