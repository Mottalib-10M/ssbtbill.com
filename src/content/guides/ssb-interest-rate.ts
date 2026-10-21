import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const S = K.LATEST, PR = K.ISSUES[K.ISSUES.length - 2];
const open = S.lastDay >= K.SSB_READ;
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
// The twelve most recent issues: average first-year coupon and ten-year return.
const last12 = K.ISSUES.slice(-12);
const m1 = mean(last12.map((i) => i.coupon[0])), m10 = mean(last12.map((i) => i.avg[9]));
const hi12 = [...last12].sort((a, b) => b.avg[9] - a.avg[9])[0], lo12 = [...last12].sort((a, b) => a.avg[9] - b.avg[9])[0];
const rises = last12.slice(1).filter((i, k) => i.avg[9] > last12[k].avg[9] + 1e-9).length;
// Step-up of the latest issue: the largest jump between two consecutive years.
const steps = S.coupon.slice(1).map((c, k) => ({ year: k + 2, jump: c - S.coupon[k] }));
const big = [...steps].sort((a, b) => b.jump - a.jump)[0];
const spread = S.coupon[9] - S.coupon[0];
// Worked case of this page: S$40,000 in the latest issue.
const amt = 40000;
const rows = K.yby(S.code, amt, 10);
const half = rows[0].interest / 2;
// Latest issue against the previous one, in points.
const d10 = S.avg[9] - PR.avg[9], d1 = S.coupon[0] - PR.coupon[0];
const pts = (d: number) => `${K.dec(Math.abs(d), 2)} point`;
const vs = (d: number, up: string, down: string) => (Math.abs(d) < 0.005 ? 'the same as' : d > 0 ? up : down);
const nextSsb = K.CAL.ssb.find((x) => x.issue > S.issue);
const fee1k = K.yby(S.code, 1000, 1)[0].interest;

export default defineGuide({
  id: 'ssb-interest-rate',
  group: 'ssb',
  order: 20,
  slug: 'ssb-interest-rate',
  nav: 'SSB interest rate',
  card: 'The ten coupons of the latest issue and the one before it',
  title: 'SSB Interest Rate 2026: Latest Issue, Step-Up and Average',
  description: `SSB interest rate 2026: the latest issue pays ${K.pc(S.coupon[0])} in year 1 and ${K.pc(S.coupon[9])} in year 10, ${K.pc(S.avg[9])} a year on average. Each coupon set against the previous issue.`,
  h1: 'SSB interest rate: the latest issue, coupon by coupon',
  intro: `Pick an issue in the list. The calculator shows its ten coupons, the average return for each holding period and how its ten-year figure compares with the issue before it.`,
  resume: `The Savings Bond interest rate is set issue by issue, and the ${K.month(S.issue)} bond, ${S.code}, pays ${K.pc(S.coupon[0])} in its first year, then ${S.coupon.every((c, k) => k === 0 || c > S.coupon[k - 1]) ? 'a higher coupon every year' : 'coupons that never fall'} up to ${K.pc(S.coupon[9])} in year ten. Held the full ten years, that works out to an average return of ${K.pc(S.avg[9])} a year; held five years, ${K.pc(S.avg[4])}. The previous issue, ${PR.code} for ${K.month(PR.issue)}, started at ${K.pc(PR.coupon[0])} and averaged ${K.pc(PR.avg[9])} over ten years, so the newer bond's ten-year figure is ${Math.abs(d10) < 0.005 ? 'unchanged' : `${d10 > 0 ? 'higher' : 'lower'} by ${pts(d10)}`}. Across the last twelve issues, the first-year coupon averaged ${K.pc(m1)} and the ten-year return ${K.pc(m10)}. In dollars, ${K.sgd(amt)} in ${S.code} earns ${K.sgd2(rows[0].interest)} in year one and ${K.sgd2(rows[9].interest)} in year ten, paid in two equal halves each year. MAS fixes all ten coupons when it announces the bond and never revises them. Applications for this issue ${open ? 'close' : 'closed'} on ${K.day(S.lastDay)} at 9pm.`,
  faqs: [
    { q: 'When is the next Savings Bond interest rate announced?', a: `MAS announces each new issue, with its ten coupons and the amount on offer, on the first business day of the month before it is issued. ${nextSsb ? `The calendar we read lists ${nextSsb.name} (${nextSsb.code}) as announced on ${K.day(nextSsb.announced)}, with applications closing on ${K.day(nextSsb.lastDay)}.` : 'The next date appears in the MAS issuance calendar.'} Until that day, nobody outside MAS knows its rates.` },
    { q: 'Can the coupon of a Savings Bond I already hold change later?', a: 'No. The ten coupons of an issue are fixed and locked in on the day it is issued, according to MAS, and nothing that happens to market yields afterwards touches them. If rates rise, newer issues pay more but yours keeps its table. If rates fall, your bond keeps paying its higher coupons until you redeem it or it matures.' },
    { q: 'Is the SSB interest rate quoted per year or per half-year?', a: `Per year. Each yearly coupon is paid in two halves, six months apart, on the first business day of the month. With ${K.pc(S.coupon[0])} in year one, ${K.sgd(10000)} receives ${K.sgd2(K.yby(S.code, 10000, 1)[0].interest / 2)} at the first payment and the same again six months later. The coupons go to your bank account or SRS account, not back into the bond.` },
    { q: 'Why do two issues a month apart carry different rates?', a: 'Because each issue is priced from the average Singapore Government Securities yields of the month before its applications open. If the government bond market moved during that month, the new table moves with it. Two bonds bought a few weeks apart can therefore lock in different ten-year returns, which is why some holders compare their older issue with the newest one.' },
  ],
  body: (h) => `
<h2>The table of ${S.code}, next to the issue before it</h2>
<p>A Savings Bond has two sets of numbers, and mixing them up is the commonest misreading. The coupon is what the bond pays in a given year. The average return is what you have earned a year, compounded, if you redeem at the end of that year. The first column below is the one that lands in your account; the second is the one to hold against a deposit or a T-bill of the same length. ${S.code} is set beside ${PR.code}, the issue that came just before.</p>
${h.table(['Year', `${S.code} coupon`, `${S.code} average`, `${PR.code} coupon`, `${PR.code} average`], S.coupon.map((c, k) => [String(k + 1), K.pc(c), K.pc(S.avg[k]), K.pc(PR.coupon[k]), K.pc(PR.avg[k])]), `Coupons and average return per year held, from the MAS statistics API, read ${K.day(K.SSB_READ)}.`, ['l', 'r', 'r', 'r', 'r'])}
<p>The step-up is the feature that defines the product. In ${S.code}, the gap between the first and the last coupon is ${pts(spread)}, and the largest single jump comes in year ${big.year}, when the coupon rises by ${pts(big.jump)}. In the first year, the newer bond pays ${vs(d1, 'more than', 'less than')} ${PR.code}${Math.abs(d1) < 0.005 ? '' : `, by ${pts(d1)}`}; over the full term it returns ${vs(d10, 'more than', 'less than')} its predecessor${Math.abs(d10) < 0.005 ? '' : `, by ${pts(d10)} a year`}. A difference of a few hundredths looks small, but on a large holding kept a decade it adds up, which the ${h.a('ssb-switch', 'switch calculator')} turns into dollars.</p>
<p>MAS states two exceptions to the rule that each holding period matches a government bond yield. When the shape of the yield curve would make a later coupon lower than an earlier one, MAS adjusts the table so that payments never step down, without changing the ten-year return. And the averages can carry rounding differences of up to 0.03 point. Neither exception changes what you are paid: the coupon column is exact.</p>
${h.mini('ssbrate', { t: 'Open the rates of another issue', p: ['iss'], d: { iss: PR.code } })}

<h2>Where the rate comes from each month</h2>
<p>MAS links the average return over each holding period to the yield of a Singapore Government Securities bond of the same length, measured over the month before applications open. The five-year average of a new issue tracks the five-year government yield; the ten-year average tracks the ten-year yield. The coupons are then worked backwards from those averages. That is why a Savings Bond rate cannot be negotiated, does not depend on the bank you apply through and is the same for a ${K.sgd(K.P.ssb.min)} application as for a ${K.sgd(K.P.ssb.maxHolding)} one.</p>
<p>It also explains the monthly drift. Over the last twelve issues, the ten-year return went up from one month to the next ${rises} time${rises === 1 ? '' : 's'} out of eleven. The best of those twelve was ${hi12.code}, issued in ${K.month(hi12.issue)}, at ${K.pc(hi12.avg[9])}; the weakest was ${lo12.code} at ${K.pc(lo12.avg[9])}. The ${h.a('ssb-rates-history', 'rates history')} goes back to the very first issue in ${K.month(K.ISSUES[0].issue)}, through the low-rate period and the peak that followed it.</p>

<h2>${K.sgd(amt)} at these coupons, year by year</h2>
<p>Turn the percentages into money and the step-up becomes concrete. Placed in ${S.code}, ${K.sgd(amt)} receives ${K.sgd2(half)} six months after issue and the same amount again at the end of year one. By year ten, each half-yearly payment has grown to ${K.sgd2(rows[9].interest / 2)}. Over the decade, the coupons total ${K.sgd2(rows[9].cumulative)}, before the ${K.sgd(K.P.ssb.fee)} application fee. Each half-year payment is rounded to the cent here.</p>
${h.table(['Year', 'Coupon', 'Interest that year', 'Running total'], rows.map((r) => [String(r.year), K.pct(r.coupon), K.sgd2(r.interest), K.sgd2(r.cumulative)]), `${K.sgd(amt)} in ${S.code}, issued ${K.day(S.issue)}.`, ['l', 'r', 'r', 'r'])}
<p>The interest is not reinvested. Unlike a fixed deposit that rolls over with its interest, the bond sends each coupon out to your bank account, so ${K.sgd(amt)} stays ${K.sgd(amt)} for the whole term. Anyone who wants a compounding effect has to place those coupons somewhere themselves.</p>
${h.mini('ssb', { t: 'Interest on S$40,000 for the years you choose', p: ['yrs'], d: { amt, yrs: 7 } })}

<h2>Twelve months of rates at a glance</h2>
<p>The table lists the most recent twelve issues with their first coupon, their five-year average and their ten-year average. It is the quickest way to see whether the latest bond sits near the top or the bottom of its own year, without reading the whole archive.</p>
${h.table(['Issued', 'Code', 'Year 1', '5-year average', '10-year average'], last12.slice().reverse().map((i) => [K.month(i.issue), i.code, K.pc(i.coupon[0]), K.pc(i.avg[4]), K.pc(i.avg[9])]), 'Latest twelve Savings Bond issues. Source: MAS statistics API.', ['l', 'l', 'r', 'r', 'r'])}
<p>A pattern stands out across most of the archive: the first-year coupon sits below the ten-year average, because short government yields usually trade below long ones. When the curve flattens, the two figures draw close and the step-up shrinks. When it steepens, early holders are paid less and patient ones more.</p>

<h2>What the headline rate leaves out</h2>
<p>Three things change what a holder actually keeps. The ${K.sgd(K.P.ssb.fee)} fee is charged on every application, allotted or not: on ${K.sgd(1000)}, the first year of ${S.code} pays ${K.sgd2(fee1k)}, so the fee takes ${K.pct(K.P.ssb.fee / Math.max(0.01, fee1k), 0)} of it. Allotment decides how much of the rate you get to hold, since a popular month can cut large applications, as the ${h.a('ssb-allotment', 'allotment page')} shows. And redeeming early means earning the average of the shorter period, not the ten-year figure: the ${h.a('ssb-early-redemption', 'early redemption calculator')} prices that for any month.</p>
<p>Tax does not reduce the rate. MAS states that interest on government securities is exempt for individuals, residents or not, unless it is earned through a partnership or a trade (${h.src('mas_tax', 'MAS, tax on government securities')}). For a side-by-side reading against a bill of the same length, the ${h.a('ssb-vs-t-bill', 'Savings Bond and T-bill comparison')} applies the latest cut-off to your own horizon, and ${h.a('how-to-buy-ssb', 'the application guide')} covers the channels and the dates. The rate rules quoted here come from the ${h.src('mas_ssb', 'MAS Savings Bonds page')} and the ${h.src('mas_ssb_invest', 'MAS investing guide')}.</p>`,
  tool: 'ssbrate',
  toolArg: { iss: S.code },
  related: ['ssb-rates-history', 'singapore-savings-bonds', 'ssb-switch', 'ssb-vs-t-bill', 'how-to-buy-ssb'],
  sources: ['mas_ssb', 'mas_ssb_invest', 'mas_api_ssbi', 'mas_tax'],
});
