import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const S = K.LATEST, A = K.ALLOTTED, SB = K.P.ssb;
// Worked case: S$25,000 in the latest issue, held ten years, then redeemed after 18 months instead.
const amt = 25000;
const rows = K.yby(S.code, amt, 10);
const total = rows[9].cumulative;
const early = K.redeem(S.code, amt, 18);
// Ten years of issues: the spread between year-1 coupon and 10-year average.
const first = K.ISSUES[0];
const yearly = [...new Set(K.ISSUES.map((i) => i.issue.slice(0, 4)))].map((y) => {
  const xs = K.ISSUES.filter((i) => i.issue.startsWith(y));
  const avg10 = xs.reduce((s, i) => s + i.avg[9], 0) / xs.length;
  const hi = Math.max(...xs.map((i) => i.avg[9])), lo = Math.min(...xs.map((i) => i.avg[9]));
  return [y, String(xs.length), K.pc(lo), K.pc(hi), K.pc(avg10)];
});
const top = [...K.ISSUES].sort((a, b) => b.avg[9] - a.avg[9])[0];
const low = [...K.ISSUES].sort((a, b) => a.avg[9] - b.avg[9])[0];
const recent = K.ISSUES.filter((i) => i.done).slice(-24);
const over = recent.filter(K.oversubscribed).length;

export default defineGuide({
  id: 'singapore-savings-bonds',
  group: 'ssb',
  order: 10,
  slug: 'singapore-savings-bonds',
  nav: 'Savings Bonds explained',
  card: 'Coupons, step-up, redemption and allotment in one place',
  title: 'Singapore Savings Bonds 2026: Rates, Interest and Rules',
  description: `Singapore Savings Bonds in 2026: the latest issue pays ${K.pc(S.coupon[0])} in year 1 and ${K.pc(S.avg[9])} a year over ten years. Interest on your amount, fees, redemption rules.`,
  h1: 'Singapore Savings Bonds: what they pay and how they work',
  intro: `Enter an amount and how long you would keep the bond. The calculator returns the interest paid each year by the issue you choose, from the coupons MAS published for it.`,
  resume: `A Singapore Savings Bond is a ten-year bond issued every month by the Singapore Government, which you can redeem in any month without a penalty. Its coupons are fixed when it is issued and rise year after year: the ${K.month(S.issue)} issue, ${S.code}, pays ${K.pc(S.coupon[0])} in year 1 and ${K.pc(S.coupon[9])} in year 10, an average of ${K.pc(S.avg[9])} a year if held to maturity. On ${K.sgd(amt)}, that is ${K.sgd2(rows[0].interest)} of interest in the first year and ${K.sgd2(total)} over ten years, paid into your bank account every six months. Redeemed after 18 months, the same bond returns your ${K.sgd(amt)} plus ${K.sgd2(early.net)} of interest after the ${K.sgd(SB.redemptionFee)} fee. You can apply from ${K.sgd(SB.min)} in multiples of ${K.sgd(SB.lot)}, hold at most ${K.sgd(SB.maxHolding)} across all issues, and pay with cash or SRS money but not CPF. Interest is not taxed for individuals. Applications for the ${K.month(S.issue)} issue close on ${K.day(S.lastDay)} at 9pm.`,
  faqs: [
    { q: 'What makes a Savings Bond different from a normal government bond?', a: `A normal Singapore Government Securities bond pays the same coupon every year and its price moves on the market, so selling early can mean a loss. A Savings Bond has coupons that step up each year, cannot be traded, and is redeemed by MAS at its full face value in any month. You always get back what you put in, plus the interest earned to that month.` },
    { q: 'Why does the first-year coupon look low next to the ten-year average?', a: `Because the coupons follow the government's yield curve. MAS sets the schedule so that someone holding all ten years earns the average yield of the 10-year bond in the month before issue, and someone leaving earlier earns roughly what a bond of that shorter length paid. When short yields sit below long yields, the early coupons are lower and the later ones higher.` },
    { q: 'How much can one person hold in Savings Bonds?', a: `The limit is ${K.sgd(SB.maxHolding)} held at any time, across every issue you own and whether you paid with cash or SRS money. Redeeming or reaching maturity frees room under that cap. Applications are in multiples of ${K.sgd(SB.lot)}, with ${K.sgd(SB.min)} as the smallest amount, and each issue also has its own size, so a popular month may allot you less than you asked.` },
    { q: 'What fees come with a Savings Bond?', a: `There is a ${K.sgd(SB.fee)} transaction fee for each application, kept by the bank even if you receive nothing, and a ${K.sgd(SB.redemptionFee)} fee for each redemption request. No fee applies when the bond reaches maturity after ten years. On small amounts the fee counts: on ${K.sgd(1000)}, ${K.sgd(SB.fee)} is a fifth of a year of interest at a 1 % coupon.` },
    { q: 'Who is allowed to buy Savings Bonds?', a: 'Individuals aged 18 or more who hold an individual CDP securities account with direct crediting, or an SRS account for SRS purchases. Non-residents can apply too, according to MAS. Applications go through the ATMs, internet banking or mobile apps of the three local banks, or an SRS operator. Companies and other entities cannot apply.' },
  ],
  body: (h) => `
<h2>Ten coupons fixed on day one</h2>
<p>Every issue comes with a table of ten coupons, one per year, announced on the first business day of the month before the bond is issued. The table never changes afterwards. What changes from one month to the next is the table of the new issue, because MAS builds it from the average Singapore Government Securities yields of the previous month. The latest table is below, applied to ${K.sgd(amt)}; each year is paid in two halves, six months apart, and each half is rounded to the cent.</p>
${h.table(['Year', 'Coupon', 'Interest that year', 'Total so far', 'Average a year'], rows.map((r) => [String(r.year), K.pct(r.coupon), K.sgd2(r.interest), K.sgd2(r.cumulative), K.pct(r.avgReturn)]), `${K.sgd(amt)} in ${S.code}, issued ${K.day(S.issue)}. Coupons from the MAS statistics API, read ${K.day(K.SSB_READ)}.`, ['l', 'r', 'r', 'r', 'r'])}
<p>The last column is the figure MAS calls the average return per year: what you earn a year, on average, if you redeem at the end of that year. It is the number to compare with a deposit or a T-bill of the same length, more than the coupon of a single year. The year-10 figure, ${K.pc(S.avg[9])}, matches the average 10-year government bond yield of the month before issue, which is how MAS designs the schedule.</p>
${h.mini('ssb', { t: 'Interest on your own amount', p: ['amt', 'yrs'], d: { amt: 8000, yrs: 4 } })}

<h2>Leaving early costs coupons, never capital</h2>
<p>A Savings Bond can be redeemed in any month, and the request goes through the same bank channels as the application. MAS pays the face value plus the interest accrued since the last coupon, by the second business day of the following month. There is no market price involved, so the amount you get back never falls below what you paid. The real cost of leaving early is the later coupons you give up, plus the ${K.sgd(SB.redemptionFee)} fee.</p>
<p>Take the ${K.sgd(amt)} above, redeemed 18 months after issue. Three half-year coupons have been paid, ${K.sgd2(early.couponsPaid)} in total, and the accrual since the last one is ${K.sgd2(early.accrued)}. After the fee, you keep ${K.sgd2(early.net)}, which is ${K.pct(early.perYear)} a year on your money. The ${h.a('ssb-early-redemption', 'redemption calculator')} does this for any issue and any month, and the ${h.a('ssb-switch', 'switch calculator')} checks whether redeeming an older bond to buy a newer one pays.</p>
${h.mini('ssbredeem', { t: 'Interest kept if you redeem this bond early', p: ['mo'], d: { amt: 12000, mo: 42 } })}

<h2>How rates moved since the first issue</h2>
<p>The scheme started with the ${K.month(first.issue)} issue. Since then, the ten-year average has ranged from ${K.pc(low.avg[9])} (${K.month(low.issue)}) to ${K.pc(top.avg[9])} (${K.month(top.issue)}). The table groups the issues by calendar year, with the lowest, highest and mean ten-year average of each year. The ${h.a('ssb-rates-history', 'full history')} lists every issue with its first coupon.</p>
${h.table(['Year', 'Issues', 'Lowest 10-year average', 'Highest', 'Mean'], yearly, 'Ten-year average return of every Savings Bond issue, by year of issue. Source: MAS statistics API.', ['l', 'r', 'r', 'r', 'r'])}
<p>The spread inside a single year can be wide. When yields move fast, two bonds issued a few months apart lock in very different returns for a decade. That is why some holders redeem an old issue and apply for a newer one when the gap is large enough to cover two fees and a month without interest.</p>

<h2>Applying and getting allotted</h2>
<p>Applications for an issue open at 6pm on the first business day of the month before it is issued and close at 9pm on the fourth last business day of that month. Results come out on the third last business day, and the bond is issued on the first business day of the next month. MAS allots in a way that spreads the issue across as many applicants as possible: if the issue is oversubscribed, everyone gets up to a common amount, and part of the applicants receive one more ${K.sgd(SB.lot)} lot by random draw.</p>
<p>In ${recent.length} recent issues, ${over} ${over === 1 ? 'was' : 'were'} oversubscribed. The ${K.month(A.issue)} issue received applications for ${K.mn(A.applied)} against ${K.mn(A.size)} offered. ${h.a('ssb-allotment', 'The allotment page')} shows, issue by issue, what an application of your size would have received, and ${h.a('how-to-buy-ssb', 'the buying guide')} walks through the bank channels and the SRS route.</p>

<h2>What a Savings Bond is not</h2>
<p>It is not a deposit, so deposit insurance does not apply: the bond is a direct obligation of the Singapore Government. It cannot be bought with CPF Ordinary or Special Account money. It cannot be sold to someone else or used as collateral. And its coupons go into your bank account rather than back into the bond, so the interest does not compound unless you invest it yourself. Comparing it with a ${h.a('t-bill-singapore', 'T-bill')} or a ${h.a('fixed-deposit-rates-singapore', 'fixed deposit')} only makes sense over the same horizon, which ${h.a('ssb-vs-t-bill', 'the side-by-side calculator')} handles. Interest is tax-exempt for individuals (${h.src('mas_tax', 'MAS, tax on government securities')}), and the rules above come from the MAS pages on ${h.src('mas_ssb_buy', 'buying')} and ${h.src('mas_ssb_redeem', 'redeeming')} Savings Bonds.</p>`,
  tool: 'ssb',
  toolArg: { amt: 25000 },
  related: ['ssb-interest-rate', 'ssb-early-redemption', 'ssb-allotment', 'ssb-vs-t-bill', 'how-to-buy-ssb'],
  sources: ['mas_ssb_invest', 'mas_ssb_buy', 'mas_ssb_redeem', 'mas_api_ssbi', 'mas_tax'],
});
