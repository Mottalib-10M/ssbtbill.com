import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const I = K.ISSUES, S = K.LATEST, first = I[0];
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
const byAvg = [...I].sort((a, b) => b.avg[9] - a.avg[9]);
const top = byAvg[0], low = byAvg[byAvg.length - 1];
const topY1 = [...I].sort((a, b) => b.coupon[0] - a.coupon[0])[0];
const lowY1 = [...I].sort((a, b) => a.coupon[0] - b.coupon[0])[0];
// Slope of each issue: year-10 coupon minus year-1 coupon. Flattest and steepest issues.
const slope = (i: (typeof I)[number]) => i.coupon[9] - i.coupon[0];
const flat = [...I].sort((a, b) => slope(a) - slope(b))[0], steep = [...I].sort((a, b) => slope(b) - slope(a))[0];
// One row per calendar year of issue.
const years = [...new Set(I.map((i) => i.issue.slice(0, 4)))];
const yearly = years.map((y) => {
  const xs = I.filter((i) => i.issue.startsWith(y));
  return { y, n: xs.length, y1: mean(xs.map((i) => i.coupon[0])), a10: mean(xs.map((i) => i.avg[9])), over: xs.filter(K.oversubscribed).length, xs };
});
const bestYear = [...yearly].sort((a, b) => b.a10 - a.a10)[0], worstYear = [...yearly].sort((a, b) => a.a10 - b.a10)[0];
const above3 = I.filter((i) => i.avg[9] >= 3).length, below1 = I.filter((i) => i.avg[9] < 1).length;
const matured = I.filter((i) => i.maturity <= K.SSB_READ);
const last24 = I.slice(-24).reverse();
// Rank of the latest issue among all issues by ten-year return (1 = best).
const rank = byAvg.findIndex((i) => i.code === S.code) + 1;
const busy = [...yearly].sort((a, b) => b.over - a.over || b.n - a.n)[0];
const top5 = byAvg.slice(0, 5), bot5 = byAvg.slice(-5);
const span = (xs: typeof I) => { const d = xs.map((i) => i.issue).sort(); return [d[0], d[d.length - 1]]; };
const noDown = I.filter((i) => i.coupon.every((c, k) => k === 0 || c >= i.coupon[k - 1])).length;
const allMean = mean(I.map((i) => i.avg[9]));
const tenK = K.yby(top.code, 10000, 10)[9].cumulative, tenKlow = K.yby(low.code, 10000, 10)[9].cumulative;

export default defineGuide({
  id: 'ssb-rates-history',
  group: 'ssb',
  order: 30,
  slug: 'ssb-rates-history',
  nav: 'SSB rates history',
  card: 'Every issue since 2015, its first coupon and ten-year return',
  title: 'SSB Rates History 2026: Every Issue Since 2015 in One Table',
  description: `SSB rates history to 2026: ${I.length} issues since 2015, ten-year returns from ${K.pc(low.avg[9])} to ${K.pc(top.avg[9])}. Yearly averages, best and worst issues, and the latest 24 in full.`,
  h1: 'SSB rates history: every Savings Bond issue since the first one',
  intro: `Choose any past issue in the list to open its ten coupons and its average return for each holding period, exactly as MAS published them when the bond was announced.`,
  resume: `Since the first Savings Bond was issued in ${K.month(first.issue)}, MAS has launched ${I.length} issues, one a month, and their ten-year average return has ranged from ${K.pc(low.avg[9])} for ${low.code} (${K.month(low.issue)}) to ${K.pc(top.avg[9])} for ${top.code} (${K.month(top.issue)}). The mean across all issues is ${K.pc(allMean)}. By calendar year, ${worstYear.y} was the weakest, with issues averaging ${K.pc(worstYear.a10)} over ten years, and ${bestYear.y} the strongest, at ${K.pc(bestYear.a10)}. The highest first-year coupon on record is ${K.pc(topY1.coupon[0])} (${K.month(topY1.issue)}), the lowest ${K.pc(lowY1.coupon[0])} (${K.month(lowY1.issue)}). The gap matters in money: ${K.sgd(10000)} held ten years in the best issue earns ${K.sgd2(tenK)} of coupons, against ${K.sgd2(tenKlow)} in the weakest. The ${K.month(S.issue)} issue ranks ${rank} of ${I.length} by ten-year return. ${matured.length} issue${matured.length === 1 ? ' has' : 's have'} already reached maturity, the first on ${K.day(first.maturity)}. Each issue's rates are fixed at launch and stay unchanged for life.`,
  faqs: [
    { q: 'Which Savings Bond issue had the highest ten-year return so far?', a: `${top.code}, issued in ${K.month(top.issue)}, with a ten-year average of ${K.pc(top.avg[9])} and a first coupon of ${K.pc(top.coupon[0])}. Holders who kept it still receive those coupons today, because an issue's table never changes. Nobody can buy into it now: Savings Bonds are only sold when they are first issued and cannot be bought from another holder.` },
    { q: 'Have any Savings Bonds already matured?', a: `Yes. ${matured.length} issue${matured.length === 1 ? ' has' : 's have'} reached the end of their ten years, starting with ${first.code} on ${K.day(first.maturity)}. MAS states that no redemption request is needed at maturity: the principal and the last interest payment are credited automatically to the bank account linked to CDP, or to the SRS account, and the S$2 fee does not apply.` },
    { q: 'Does the rates history help predict the next issue?', a: 'Not in any useful way. Each new table is built from the average government bond yields of the month before applications open, so it follows the bond market of that month, not the pattern of past issues. The history shows the range a Savings Bond has paid and how fast it can change, which is a guide to scale, not to direction.' },
    { q: 'Can I still buy an older Savings Bond issue with a better rate?', a: 'No. MAS sells each issue once, in the month before it is issued, and Savings Bonds cannot be traded on SGX, transferred or bought from another investor, except in cases such as the death of the holder. The only issue you can apply for is the one currently open, at the rates announced for it.' },
  ],
  body: (h) => `
<h2>Ten years of rates, compressed into one row per year</h2>
<p>The archive is long, so the first table sums it up by calendar year of issue. For each year it gives the number of issues, the mean first-year coupon, the mean ten-year return and how many of those issues drew more applications than MAS offered. The yearly view hides the swings inside a year, but it makes the big movements easy to see: the years when a ten-year return below 1.5 % was normal, and the years when it sat near or above 3 %.</p>
${h.table(['Year of issue', 'Issues', 'Mean year-1 coupon', 'Mean 10-year return', 'Oversubscribed'], yearly.map((r) => [r.y, String(r.n), K.pc(r.y1), K.pc(r.a10), String(r.over)]), `All ${I.length} Savings Bond issues by year of issue. Source: MAS statistics API, read ${K.day(K.SSB_READ)}.`, ['l', 'r', 'r', 'r', 'r'])}
<p>The lowest year, ${worstYear.y}, is the trough of the archive; the highest, ${bestYear.y}, sits at the top of the climb that followed. Oversubscription does not simply follow the rate. The year with the most oversubscribed issues was ${busy.y}, with ${busy.over} of ${busy.n}, at a mean ten-year return of ${K.pc(busy.a10)}: demand depends on the amount MAS offers each month as much as on the rate. ${above3} issue${above3 === 1 ? '' : 's'} returned 3 % a year or more over ten years, and ${below1} returned less than 1 %.</p>
${h.mini('ssbrate', { t: 'The weakest issue on record', p: ['iss'], d: { iss: low.code } })}

<h2>The five best and five weakest issues</h2>
<p>Extremes say more than averages about what a timing difference can cost. The table ranks issues by their ten-year return. The top five were all issued between ${K.month(span(top5)[0])} and ${K.month(span(top5)[1])}, the bottom five between ${K.month(span(bot5)[0])} and ${K.month(span(bot5)[1])}, so the distance between them is less a matter of luck than of the period in which the money was placed.</p>
${h.table(['Rank', 'Issued', 'Code', 'Year 1', '10-year return'], [...byAvg.slice(0, 5).map((i, k) => [String(k + 1), K.month(i.issue), i.code, K.pc(i.coupon[0]), K.pc(i.avg[9])]), ...byAvg.slice(-5).map((i, k) => [String(I.length - 4 + k), K.month(i.issue), i.code, K.pc(i.coupon[0]), K.pc(i.avg[9])])], 'Highest and lowest ten-year average returns of all issues.', ['r', 'l', 'l', 'r', 'r'])}
<p>A best-to-worst spread of ${K.dec(top.avg[9] - low.avg[9], 2)} point a year sounds abstract until it is multiplied. On ${K.sgd(10000)}, ten years of coupons come to ${K.sgd2(tenK)} in ${top.code} and ${K.sgd2(tenKlow)} in ${low.code}. Someone who held the weakest issue was free to redeem it in any month and buy a newer one, which is exactly what the ${h.a('ssb-switch', 'switch calculator')} weighs.</p>

<h2>Shape of the curve, not just its level</h2>
<p>The gap between year one and year ten tells a second story. In ${steep.code} (${K.month(steep.issue)}), the coupon climbed from ${K.pc(steep.coupon[0])} to ${K.pc(steep.coupon[9])}, the steepest staircase in the archive: patience was paid handsomely, early exit poorly. In ${flat.code} (${K.month(flat.issue)}), the coupons went from ${K.pc(flat.coupon[0])} to ${K.pc(flat.coupon[9])}, nearly flat, because short and long government yields stood close together that month. For a flat issue, redeeming after two or three years costs little against the full term; for a steep one, it gives up most of the reward.</p>
<p>MAS adjusts the table when the yield curve would produce a step down, and the rule shows up in the data: ${noDown === I.length ? `across all ${I.length} tables, every coupon is equal to or higher than the one before it` : `${noDown} of ${I.length} tables never step down`}. The adjustment leaves the ten-year return unchanged; it only moves interest between years.</p>
${h.mini('ssb', { t: 'Ten years of coupons in the best issue', p: ['amt'], d: { amt: 10000, yrs: 10, iss: top.code } })}

<h2>The last two years, issue by issue</h2>
<p>The longer table covers the most recent 24 issues with the amount offered and the amount applied for. It is the period that most current holders own, and the one where the comparison with the latest issue is most often made.</p>
${h.table(['Issued', 'Code', 'Year 1', '5-year return', '10-year return', 'Offered', 'Applied'], last24.map((i) => [K.monthShort(i.issue), i.code, K.pc(i.coupon[0]), K.pc(i.avg[4]), K.pc(i.avg[9]), K.mn(i.size), i.done ? K.mn(i.applied) : 'open']), 'Latest 24 issues. Amounts in Singapore dollars as published by MAS.', ['l', 'l', 'r', 'r', 'r', 'r', 'r'])}
<p>The issue size itself has moved over time. MAS raised the monthly amount in 2018 and has varied it since, so a month with fewer applications than the amount offered is not the same thing as a month with little interest: it depends on both numbers. The ${h.a('ssb-allotment', 'allotment page')} shows what a given application received in each of these issues.</p>

<h2>Matured issues and what happened to them</h2>
<p>The first issue, ${first.code}, paid ${K.pc(first.coupon[0])} in its first year and averaged ${K.pc(first.avg[9])} over its full term. It matured on ${K.day(first.maturity)}, and ${matured.length} issue${matured.length === 1 ? '' : 's'} in all ${matured.length === 1 ? 'has' : 'have'} now reached the end of their ten years. Holders did not need to act: MAS credits the principal and the last coupon automatically, without the redemption fee. From now on, each month brings one more maturity alongside the new issue, so the share of the archive still outstanding shrinks slowly.</p>
<p>Data on this page comes from the ${h.src('mas_api_ssbi', 'MAS statistics API for Savings Bond rates')} and the ${h.src('mas_api_ssb', 'MAS statistics API for issues and allotment')}, read every business day. The rate-setting rule is described in the ${h.src('mas_ssb_invest', 'MAS guide to investing in Savings Bonds')}; the latest rates are explained on the ${h.a('ssb-interest-rate', 'interest rate page')}, and the product itself on the ${h.a('singapore-savings-bonds', 'Savings Bonds overview')}.</p>`,
  tool: 'ssbrate',
  toolArg: { iss: top.code },
  related: ['ssb-interest-rate', 'singapore-savings-bonds', 'ssb-switch', 'ssb-allotment', 't-bill-yield-history'],
  sources: ['mas_api_ssbi', 'mas_api_ssb', 'mas_ssb_invest', 'mas_ssb'],
});
