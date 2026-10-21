import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const SB = K.P.ssb, S = K.LATEST;
// Worked case of this page: S$15,000 of the June 2025 issue.
const B = K.ssbOf('2025-06');
const amt = 15000;
const full = K.yby(B.code, amt, 10)[9].cumulative;
const marks = [6, 12, 18, 24, 36, 48, 60, 84, 108];
const rows = marks.map((m) => { const r = K.redeem(B.code, amt, m); return { m, r, lost: full - r.interest }; });
const r16 = K.redeem(B.code, amt, 16), r24 = K.redeem(B.code, amt, 24), r60 = K.redeem(B.code, amt, 60);
// Small amounts: a S$500 bond redeemed two months after issue.
const tiny = K.redeem(S.code, 500, 2);
const open = S.lastDay >= K.SSB_READ;

export default defineGuide({
  id: 'ssb-early-redemption',
  group: 'ssb',
  order: 40,
  slug: 'ssb-early-redemption',
  nav: 'Early redemption',
  card: 'What you take home when you leave before ten years',
  title: 'SSB Early Redemption 2026: What You Get Back, Month by Month',
  description: `SSB early redemption in 2026: principal back in full plus interest to date, minus a S$2 fee. ${K.sgd(amt)} of ${B.code} kept for 24 months nets ${K.sgd2(r24.net)} of interest.`,
  h1: 'Redeeming a Savings Bond early: what you keep and what you give up',
  intro: `Enter the amount you hold, the issue and how many months after issue you would redeem. The calculator adds the coupons already paid, the accrued interest and the fee.`,
  resume: `Redeeming a Savings Bond before its ten years are up never costs principal: MAS pays back the full face value, plus every coupon already received and the interest accrued since the last one, and the bank charges a ${K.sgd(SB.redemptionFee)} fee per request. What you give up is the higher coupons of later years. Take ${K.sgd(amt)} of ${B.code}, issued in ${K.month(B.issue)}. Redeemed after 16 months, it leaves ${K.sgd2(r16.net)} of interest after the fee, or ${K.pct(r16.perYear)} a year. After 24 months, ${K.sgd2(r24.net)}; after five years, ${K.sgd2(r60.net)}. Kept to maturity, the same bond would pay ${K.sgd2(full)} of coupons with no fee. Requests open on the first business day of each month and close at 9pm on the fourth last business day, in multiples of ${K.sgd(SB.lot)}; the money arrives by the second business day of the following month. Requests cannot be amended or cancelled once submitted, and SRS bonds can only be redeemed online through the SRS operator.`,
  faqs: [
    { q: 'How long after a redemption request does the money arrive?', a: `By the second business day of the month after the request. A request sent on any day of the window, from the first business day to the fourth last business day at 9pm, is processed together with the others on the issue date of the next Savings Bond. ${open ? `Requests made by ${K.day(S.lastDay)} are redeemed on ${K.day(S.issue)}.` : 'The dates are in the MAS issuance calendar.'}` },
    { q: 'Can I redeem only part of one Savings Bond?', a: `Yes. Redemptions go in multiples of ${K.sgd(SB.lot)}, up to the amount you hold in that issue, and you can redeem from more than one issue in the same month. The part you keep goes on earning its coupons as before. Each request carries the ${K.sgd(SB.redemptionFee)} fee, so splitting one exit into several requests multiplies the cost.` },
    { q: 'Is there a penalty for redeeming a Savings Bond in its first year?', a: `No penalty of any kind: MAS states you can exit in any month. The only charge is the ${K.sgd(SB.redemptionFee)} bank fee. The first coupon arrives six months after issue, so a bond redeemed earlier pays only accrued interest, and on a small holding that accrual can be smaller than the fee itself.` },
    { q: 'Can a redemption request be withdrawn once it is submitted?', a: 'No. MAS states that submitted redemption requests cannot be amended or cancelled. If you change your mind after sending one, the bond is redeemed on the next issue date all the same. The amount you choose in the request is final, so it is worth checking it against the holdings shown in CDP or in the My Savings Bonds portal first.' },
  ],
  body: (h) => `
<h2>What arrives in your account when you leave</h2>
<p>A redemption has three parts. The face value comes back whole, whatever happened to interest rates since you bought. The coupons you have already received stay yours. And MAS adds the interest that has built up since the last coupon date, called accrued interest, which is the part of the next coupon you earned before leaving. The bank then takes its ${K.sgd(SB.redemptionFee)} fee. Nothing else is deducted, and there is no market price to worry about, because Savings Bonds are redeemed by the government and never sold to another buyer.</p>
<p>MAS gives its own example on the redemption page. A ${K.sgd(1000)} bond issued in January is due to pay a ${K.sgd(6)} coupon in July. Redeemed in June, the holder receives the principal and the full scheduled coupon. Redeemed in March, the holder receives the principal and about ${K.sgd(3)} of accrued interest, for three months of holding. Our calculator applies the same idea with day counts, coupon by coupon, for any issue in the archive (${h.src('mas_ssb_redeem', 'MAS, how to redeem')}).</p>
${h.mini('ssbredeem', { t: 'A small holding of the newest issue, redeemed early', p: ['mo'], d: { amt: 6000, iss: S.code, mo: 9 } })}

<h2>${K.sgd(amt)} of ${B.code}, redeemed at nine different points</h2>
<p>The table follows one holding through its life. Each line answers the question a holder asks before sending a request: what would I take home if I left now, and how much of the full-term interest would I leave on the table?</p>
${h.table(['Months after issue', 'Redeemed in', 'Interest kept, after fee', 'A year on the amount', 'Left behind vs ten years'], rows.map(({ m, r, lost }) => [String(m), K.month(r.redeemOn), K.sgd2(r.net), K.pct(r.perYear), K.sgd2(lost)]), `${K.sgd(amt)} of ${B.code}, issued ${K.day(B.issue)}. Coupons from the MAS statistics API; accrued interest by days.`, ['r', 'l', 'r', 'r', 'r'])}
<p>Two things show in the last column. The amount left behind falls only slowly at first, because the late coupons are the large ones: after two years, most of the full-term interest is still ahead. And the yearly return on the money climbs the longer you stay, which is the step-up at work. A holder who redeems after ${r24.months} months has earned ${K.pct(r24.perYear)} a year; one who waits until month ${r60.months} has earned ${K.pct(r60.perYear)}.</p>
<p>Every line is a whole number of months after issue, because redemptions are settled on the first business day of a month, the issue date of the next bond. The table says nothing about what the money does next. If the cash moves into a newer issue, the ${h.a('ssb-switch', 'switch calculator')} compares the two paths over the same years.</p>

<h2>When the fee is bigger than the interest</h2>
<p>The fee is flat, so it weighs most on small and short holdings. ${tiny.net < 0 ? `A ${K.sgd(500)} lot of ${S.code}, redeemed two months after issue, would have accrued ${K.sgd2(tiny.interest)} of interest, less than the ${K.sgd(SB.redemptionFee)} fee: the holder would end up ${K.sgd2(-tiny.net)} short on interest, still with the full principal back.` : `A ${K.sgd(500)} lot of ${S.code}, redeemed two months after issue, would have accrued ${K.sgd2(tiny.interest)} of interest, just enough to leave ${K.sgd2(tiny.net)} after the fee.`} Add the ${K.sgd(SB.fee)} paid when applying and a very short stay can return less than it cost in fees. On ${K.sgd(amt)}, by contrast, two fees are a rounding error against a single coupon.</p>
${h.mini('ssbredeem', { t: 'A larger holding of a high-rate issue', p: ['amt'], d: { amt: 45000, iss: K.ssbOf('2023-12').code, mo: 33 } })}

<h2>The redemption window, step by step</h2>
<p>Requests follow the same monthly rhythm as applications. The window opens on the first business day of the month and closes at 9pm on the fourth last business day, with requests accepted from 7am to 9pm, Monday to Saturday, outside public holidays. Bonds bought with cash are redeemed through the internet banking or ATMs of DBS/POSB, OCBC or UOB, or through OCBC's mobile application. Bonds bought with Supplementary Retirement Scheme (SRS) money can only be redeemed online through the SRS operator that holds them, and the proceeds go back into the SRS account.</p>
<p>All requests of a month are settled together on the issue date of the next Savings Bond, and the money reaches the bank account linked to your Central Depository (CDP) account by the second business day of that month, as a single amount covering principal and accrued interest. If the redemption falls on a scheduled coupon date, the coupon is paid with it. ${open ? `For the current window, requests close on ${K.day(S.lastDay)} at 9pm and are redeemed on ${K.day(S.issue)}.` : ''}</p>

<h3>No action needed at maturity</h3>
<p>None of this applies after ten years. At maturity, MAS credits the principal and the last coupon automatically, and the ${K.sgd(SB.redemptionFee)} fee is not charged. A holder whose bond matures next month does not need to submit anything, and requesting a redemption only to receive the money a month earlier means paying the fee for very little. The ${h.a('singapore-savings-bonds', 'Savings Bonds overview')} explains the product, and the ${h.a('ssb-interest-rate', 'interest rate page')} shows the coupon table of the current issue.</p>`,
  tool: 'ssbredeem',
  toolArg: { amt, iss: B.code, mo: 16 },
  related: ['ssb-switch', 'singapore-savings-bonds', 'ssb-interest-rate', 'ssb-vs-fixed-deposit', 'how-to-buy-ssb'],
  sources: ['mas_ssb_redeem', 'mas_ssb', 'mas_ssb_invest', 'mas_api_ssbi'],
});
