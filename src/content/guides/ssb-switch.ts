import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const SB = K.P.ssb, S = K.LATEST;
// Months between an issue and the latest issue date: a switch redeems the old bond on that date.
const held = (iss: string) => (Number(S.issue.slice(0, 4)) - Number(iss.slice(0, 4))) * 12 + Number(S.issue.slice(5, 7)) - Number(iss.slice(5, 7));
const sw = (code: string, amt: number, yrs: number) => {
  const r = K.tool('ssbswitch', { amt, iss: code, mo: held(K.ssb(code).issue), yrs });
  const keep = Number(r.rows[0][2]), move = Number(r.rows[1][2]);
  return { keep, move, gain: move - keep };
};
// Every issue of the last three years, S$50,000 each, compared over five years.
const amt = 50000, yrs = 5;
const cands = K.ISSUES.filter((i) => i.issue < S.issue && held(i.issue) >= 1 && held(i.issue) <= 36);
const table = cands.map((i) => ({ i, m: held(i.issue), ...sw(i.code, amt, yrs) }));
const winners = table.filter((t) => t.gain > 0);
const bestWin = [...table].sort((a, b) => b.gain - a.gain)[0], worstLoss = [...table].sort((a, b) => a.gain - b.gain)[0];
// The page's case: the November 2025 issue, one of the lowest first coupons of recent years.
const D = K.ssbOf('2025-11');
const horizons = [2, 4, 6, 8].map((y) => ({ y, ...sw(D.code, amt, y) }));
const dm = held(D.issue), dCase = sw(D.code, amt, 6);
const startYear = Math.floor(dm / 12) + 1;
const feeShare = (2 * SB.fee) / amt;

export default defineGuide({
  id: 'ssb-switch',
  group: 'ssb',
  order: 60,
  slug: 'ssb-switch',
  nav: 'Switching issues',
  card: 'Redeem an older bond for the new issue: when the gap covers the cost',
  title: 'SSB Switch 2026: When Redeeming for the New Issue Pays Off',
  description: `SSB switch in 2026: redeem an older Savings Bond for ${S.code} at ${K.pc(S.avg[9])} over ten years? Two S$2 fees against the coupon gap, tested on ${table.length} recent issues.`,
  h1: 'Switching Savings Bonds: old coupons against the new issue',
  intro: `Enter the amount you hold, the issue, how many months you have held it and how many years ahead to compare. The calculator sets its remaining coupons against those of the latest issue.`,
  resume: `Switching means redeeming a Savings Bond you hold and applying for the newest issue with the money. It pays only when the coupons of the new bond, over the years you compare, exceed the coupons the old one still had to pay, by more than the two ${K.sgd(SB.fee)} fees. The comparison is not first coupon against first coupon. An issue held ${dm} months is entering its year ${startYear}, so its next coupons are its higher ones, while the new bond starts again at year one. With ${K.sgd(amt)} of ${D.code} from ${K.month(D.issue)}, compared over six years against ${S.code}, keeping earns ${K.sgd(dCase.keep)} and switching ${K.sgd(dCase.move)} after fees, so ${dCase.gain > 0 ? `the switch comes out ahead by ${K.sgd(dCase.gain)}` : dCase.gain < 0 ? `keeping comes out ahead by ${K.sgd(-dCase.gain)}` : 'the two paths are level'}. Across the ${table.length} issues of the last three years, compared on ${K.sgd(amt)} over five years, switching to ${S.code} wins for ${winners.length}. The calculation assumes the new application is filled in full and leaves aside the month the money may sit idle between the two bonds.`,
  faqs: [
    { q: 'Does switching Savings Bonds reset the step-up?', a: `Yes, and that is the whole trade-off. The new bond starts at its year-one coupon, ${K.pc(S.coupon[0])} for ${S.code}, while the bond you give up was already climbing its own table. A switch wins when the new table is high enough to make up for starting again at the bottom of the staircase, over the years you actually expect to hold.` },
    { q: 'What does a switch between two Savings Bonds cost in fees?', a: `Two bank fees: ${K.sgd(SB.redemptionFee)} for the redemption request and ${K.sgd(SB.fee)} for the new application, ${K.sgd(SB.fee + SB.redemptionFee)} in all. On ${K.sgd(amt)}, that is ${K.pct(feeShare, 3)} of the sum, small next to a coupon gap of even a tenth of a point a year. On ${K.sgd(1000)}, the same ${K.sgd(SB.fee + SB.redemptionFee)} can swallow most of a small gain.` },
    { q: 'Can redemption money pay for the new issue in the same month?', a: 'Not directly. The bank debits the application at the moment you apply, while redemption proceeds arrive by the second business day of the following month. Paying for the new bond with other cash avoids a gap, since the old bond is redeemed on the day the new one is issued. Waiting for the proceeds means applying a month later, at that month\'s rates.' },
    { q: 'Is a switch still worth it if the new issue is oversubscribed?', a: 'It can go wrong. A redemption request cannot be cancelled once submitted, but an application can be cut if the new issue draws more money than MAS offers. The part not allotted comes back as cash and earns nothing until placed again. The calculator assumes a full allotment, which is what an issue that is not oversubscribed gives every applicant up to the holding limit.' },
  ],
  body: (h) => `
<h2>Why the first coupons are the wrong comparison</h2>
<p>The tempting test is to set the new issue's first-year coupon against the old one's, or the two ten-year averages side by side. Neither reflects what changes when you switch. From the day of the switch, the old bond would have paid its remaining coupons, the later and larger ones of its table. The new bond pays its first coupons, the smallest of its table. The comparison has to start from where each bond actually stands.</p>
<p>The page's case makes this concrete. ${D.code}, issued in ${K.month(D.issue)}, has been held ${dm} months by the time ${S.code} is issued, so its coming year is year ${startYear}, at ${K.pc(D.coupon[startYear - 1])}. ${S.code} would start at ${K.pc(S.coupon[0])}. Over six years, the old table pays ${K.sgd(dCase.keep)} on ${K.sgd(amt)} and the new one ${K.sgd(dCase.move)} after the two fees. ${dCase.gain > 0 ? 'The new table is high enough to overcome the reset.' : 'The reset to year one costs more than the higher new table brings.'}</p>
${h.mini('ssbswitch', { t: 'A high-rate 2024 bond against the newest issue', p: ['mo'], d: { amt: 20000, iss: K.ssbOf('2024-06').code, mo: held(K.ssbOf('2024-06').issue), yrs: 4 } })}

<h2>${table.length} recent issues tested on the same terms</h2>
<p>Each line below compares keeping ${K.sgd(amt)} of an issue from the last three years with redeeming it into ${S.code}, over the next ${yrs} years. The months held are counted to ${K.day(S.issue)}, the date the new bond is issued and the old one would be redeemed. A positive difference favours the switch.</p>
${h.table(['Issue held', 'Code', 'Months held', 'Keep: coupons', 'Switch: coupons less fees', 'Difference'], table.slice().reverse().map((t) => [K.monthShort(t.i.issue), t.i.code, String(t.m), K.sgd(t.keep), K.sgd(t.move), `${t.gain > 0 ? '+' : ''}${K.sgd(t.gain)}`]), `${K.sgd(amt)} compared over ${yrs} years against ${S.code}. Coupons from the MAS statistics API; full allotment assumed.`, ['l', 'l', 'r', 'r', 'r', 'r'])}
<p>The switch wins for ${winners.length} of the ${table.length} issues. ${bestWin.gain > 0 ? `The largest gain is with ${bestWin.i.code}, at ${K.sgd(bestWin.gain)} over ${yrs} years.` : 'No issue in the list gains from the switch over this horizon.'} ${worstLoss.gain < 0 ? `At the other end, giving up ${worstLoss.i.code} would cost ${K.sgd(-worstLoss.gain)}, because its remaining coupons sit well above anything the new table pays in its first years.` : ''} The ranking follows the rate history: bonds whose tables were set lower than the current one are the candidates, and bonds from high-rate months rarely are.</p>

<h2>How far ahead you look changes the answer</h2>
<p>The years-ahead setting is not a detail. Over a short span, the old bond's next coupons are compared with the new bond's very first ones, the lowest of its table. Over a long span, the new bond's later, higher coupons come into the sum, while the old bond may run out of years: an issue held several years has fewer than ten left, and the calculator only counts the coupons it still has. For ${K.sgd(amt)} of ${D.code}, the difference in favour of ${horizons[0].gain >= 0 ? 'switching' : 'keeping'} is ${K.sgd(Math.abs(horizons[0].gain))} over ${horizons[0].y} years, and the result over ${horizons[1].y}, ${horizons[2].y} and ${horizons[3].y} years is ${horizons.slice(1).map((x) => `${x.gain >= 0 ? '+' : '-'}${K.sgd(Math.abs(x.gain))}`).join(', ')} for the switch. A horizon is a statement about your own plans, so it is the one input nobody else can fill in for you.</p>

<h2>The costs the table leaves out</h2>
<p>Three frictions are outside the calculation. The first is idle money. The application is paid when it is made, but the redemption proceeds land only by the second business day of the next month, so unless other cash funds the new bond, the money waits a month and the new application goes into the following issue, at rates not yet known.</p>
<p>The second is allotment. The old bond is gone once the request is sent, since redemption requests cannot be cancelled, but the new application can be cut if that month is oversubscribed. The ${h.a('ssb-allotment', 'allotment page')} lists how often that happened. The third is the horizon itself. A switch extends the maturity: the new bond runs ten years from its issue date, the old one fewer. Beyond the years you compare, nothing here says what either bond would be worth to you.</p>
${h.mini('ssbswitch', { t: 'A January 2026 bond, over a longer horizon', p: ['yrs'], d: { amt: 70000, iss: K.ssbOf('2026-01').code, mo: held(K.ssbOf('2026-01').issue), yrs: 8 } })}

<h2>Where the fees stop mattering</h2>
<p>The two fees total ${K.sgd(SB.fee + SB.redemptionFee)}, flat. On ${K.sgd(amt)} they are ${K.pct(feeShare, 3)} of the sum, which a coupon gap of one hundredth of a point a year covers within the first year. On a few thousand dollars, the same gap takes several years to repay them. Size matters more than the fees themselves: the larger the holding, the smaller the gap that justifies the paperwork.</p>
<p>Redemption rules, including the 9pm cut-off on the fourth last business day and the multiples of ${K.sgd(SB.lot)}, are on the ${h.a('ssb-early-redemption', 'early redemption page')}. The ten coupons of the current issue are on the ${h.a('ssb-interest-rate', 'interest rate page')}, and the full archive on the ${h.a('ssb-rates-history', 'rates history')}. The rules quoted come from ${h.src('mas_ssb_redeem', 'MAS, how to redeem')} and ${h.src('mas_ssb_buy', 'MAS, how to buy')}.</p>`,
  tool: 'ssbswitch',
  toolArg: { amt, iss: D.code, mo: dm, yrs: 6 },
  related: ['ssb-early-redemption', 'ssb-interest-rate', 'ssb-rates-history', 'ssb-allotment', 'singapore-savings-bonds'],
  sources: ['mas_ssb_redeem', 'mas_ssb_buy', 'mas_api_ssbi'],
});
