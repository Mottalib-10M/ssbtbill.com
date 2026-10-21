import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const SB = K.P.ssb, S = K.LATEST;
const open = S.lastDay >= K.SSB_READ;
const cal = K.CAL.ssb;
// Fee against the first year of interest, for a first-time saver's amounts.
const sizes = [500, 1000, 2000, 5000, 10000];
const feeRows = sizes.map((x) => { const y1 = K.yby(S.code, x, 1)[0].interest; return [K.sgd(x), K.sgd2(y1), K.pct(SB.fee / y1, 1), K.sgd2(K.yby(S.code, x, 10)[9].cumulative - SB.fee)]; });
const y1At500 = K.yby(S.code, 500, 1)[0].interest;
const first3k = K.yby(S.code, 3000, 1)[0].interest / 2;
const days = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
const firstPay = (() => { const y = Number(S.issue.slice(0, 4)), m = Number(S.issue.slice(5, 7)) + 6; return `${y + Math.floor((m - 1) / 12)}-${String(((m - 1) % 12) + 1).padStart(2, '0')}`; })();

export default defineGuide({
  id: 'how-to-buy-ssb',
  group: 'ssb',
  order: 70,
  slug: 'how-to-buy-ssb',
  nav: 'How to buy',
  card: 'Accounts, bank channels, SRS, dates and the S$2 fee',
  title: 'SSB Application 2026: How to Buy via CDP, Banks or SRS',
  description: `How to buy SSB in 2026: a CDP account, an ATM or app of DBS/POSB, OCBC or UOB, from S$500 with a S$2 fee. ${S.code} pays ${K.pc(S.coupon[0])} in year 1. Dates and steps.`,
  h1: 'How to buy Singapore Savings Bonds, step by step',
  intro: `Enter the amount you plan to apply for and the years you expect to keep it. The calculator shows the interest the current issue would pay you, after which the steps below cover the application.`,
  resume: `To buy a Singapore Savings Bond with cash, you need three things: to be at least 18, a bank account with DBS/POSB, OCBC or UOB, and an individual CDP securities account with the Direct Crediting Service switched on, so that coupons reach your bank. You then apply through that bank's ATM, internet banking or mobile app during the monthly window, which opens at 6pm on the first business day of the month and closes at 9pm on the fourth last business day. The minimum is ${K.sgd(SB.min)}, in multiples of ${K.sgd(SB.lot)}, up to ${K.sgd(SB.maxHolding)} held in total, and each application costs a ${K.sgd(SB.fee)} fee that is never refunded. SRS money can be used through the SRS operator's online banking; CPF money cannot. Non-residents may apply. ${open ? `The issue open now is ${S.code}, paying ${K.pc(S.coupon[0])} in its first year and ${K.pc(S.avg[9])} a year over ten; applications close on ${K.day(S.lastDay)}, results come out on ${K.day(S.allotment)} and the bond is issued on ${K.day(S.issue)}.` : `The latest issue, ${S.code}, paid ${K.pc(S.coupon[0])} in its first year; the next one is announced on the first business day of the month.`}`,
  faqs: [
    { q: 'Can I apply for a Savings Bond at a bank branch counter?', a: 'No. MAS states that applications cannot be made in person at bank counters. Cash applications go through the ATMs, internet banking or mobile apps of DBS/POSB, OCBC and UOB, and SRS applications through the SRS operator\'s internet banking or, for DBS, its mobile app. A branch can still help open the bank or SRS account you need beforehand.' },
    { q: 'Do I need a CDP account to buy Savings Bonds with SRS money?', a: 'No. For SRS applications, the SRS operator is the custodian of the bonds, so an SRS account with DBS/POSB, OCBC or UOB is what you need. Interest and redemption proceeds go back into that SRS account, not to a bank account. For cash applications, the CDP securities account with direct crediting is required, since CDP holds the bonds.' },
    { q: 'Can I cancel a Savings Bond application after submitting it?', a: `No. MAS states that once submitted, an application cannot be amended or cancelled, and the money is debited from your account at the moment you apply. If you change your mind, the way out is to redeem the bond after it is issued, which costs a ${K.sgd(SB.redemptionFee)} redemption fee on top of the ${K.sgd(SB.fee)} you already paid.` },
    { q: 'When does the first Savings Bond interest payment arrive?', a: `Six months after the bond is issued, on the first business day of that month, and every six months after that. For ${S.code}, issued on ${K.day(S.issue)}, the first payment falls in ${K.month(firstPay)}. On ${K.sgd(3000)}, it would be ${K.sgd2(first3k)}. Cash holders see it in the bank account linked to CDP, SRS holders in the SRS account.` },
  ],
  body: (h) => `
<h2>Before the first application: the accounts</h2>
<p>A Savings Bond bought with cash sits in your account at the Central Depository (CDP), which MAS names as the custodian that processes applications, interest payments and redemptions. It has to be an individual account, opened at 18 or over, with the Direct Crediting Service active: that link is what sends each coupon and the final repayment to your bank account without any action on your part. The bank account itself must be with one of the three local banks, DBS/POSB, OCBC or UOB, because they are the only ones that run the application channels. Non-residents can apply on the same terms, according to MAS.</p>
<p>The Supplementary Retirement Scheme (SRS) is the other route. SRS is a voluntary retirement account that gives a tax relief on contributions, and its money can buy Savings Bonds. In that case no CDP account is needed: the SRS operator holds the bonds, and every payment goes back into the SRS account. CPF savings cannot be used for Savings Bonds at all (${h.src('mas_ssb_buy', 'MAS, how to buy')}). The ${h.a('ssb-with-srs', 'SRS page')} covers that route in detail.</p>

<h2>The application itself</h2>
<h3>With cash</h3>
<p>Apply through the ATM, internet banking or mobile app of DBS/POSB, OCBC or UOB, with your CDP account number at hand. The full amount and the ${K.sgd(SB.fee)} fee are deducted from the bank account at the moment you apply. Applications are accepted from 7am to 9pm, Monday to Saturday, outside public holidays. Once sent, an application cannot be changed or withdrawn, so the amount typed is final. Applying for more than you want is pointless in a busy month, because large applications are cut to the same level as everyone else's, as the ${h.a('ssb-allotment', 'allotment page')} explains.</p>
<h3>With SRS money</h3>
<p>Apply through the internet banking of your SRS operator: DBS/POSB through internet banking or its mobile app, OCBC and UOB through internet banking. The SRS funds are earmarked at the moment you apply. The same ${K.sgd(SB.fee)} fee applies.</p>
${h.mini('ssb', { t: 'What a first small application earns', p: ['amt'], d: { amt: 1500, yrs: 3 } })}

<h2>The dates already announced</h2>
<p>Every issue follows the same monthly cycle: rates and amount announced on the first business day, applications closing on the fourth last business day at 9pm, allotment on the third last business day with results on the MAS website after 3pm, refunds of any excess by the end of the second last business day, and issue on the first business day of the next month. The calendar below is the one MAS publishes, as read on ${K.day(K.CAL.meta.read)}.</p>
${h.table(['Issue', 'Code', 'Rates announced', 'Last day to apply, 9pm', 'Results', 'Issued'], cal.map((x) => [x.name, x.code, K.day(x.announced), K.day(x.lastDay), K.day(x.allotment), K.day(x.issue)]), 'Savings Bond issuance calendar. Source: MAS statistics API (issuance calendar).', ['l', 'l', 'l', 'l', 'l', 'l'])}
<p>${cal.length ? `For ${cal[0].name}, the window runs ${days(cal[0].announced, cal[0].lastDay)} days from announcement to closing day.` : ''} ${cal.length > 1 ? `Between its closing and the announcement of ${cal[1].name}, ${days(cal[0].lastDay, cal[1].announced) - 1} calendar days pass with no issue open at all.` : ''} MAS publishes each year's calendar around October or November of the year before, on its auctions and issuance calendar page.</p>

<h2>What the ${K.sgd(SB.fee)} fee does to a small application</h2>
<p>The fee is per application and flat, so its weight depends on the amount. At ${K.sgd(SB.min)}, the minimum, the first year of ${S.code} pays ${K.sgd2(y1At500)} and the fee takes a large bite of it. At ${K.sgd(10000)}, it barely shows. The last column spreads the fee over the full ten years, which is how a saver who holds to maturity experiences it.</p>
${h.table(['Amount', 'Interest in year 1', 'Fee as share of year 1', 'Ten years of coupons, less the fee'], feeRows, `Coupons of ${S.code}, the latest issue. The fee is charged even if nothing is allotted.`, ['r', 'r', 'r', 'r'])}
<p>This is also why splitting a sum into many small applications across months costs more than it seems, and why the ${K.sgd(SB.redemptionFee)} redemption fee deserves the same arithmetic when you leave. Nothing is charged when the bond reaches maturity.</p>
${h.mini('ssb', { t: 'Ten years of the current issue on your amount', p: ['yrs'], d: { amt: 7500, yrs: 10 } })}

<h2>After the results</h2>
<p>Cash applicants receive a letter from CDP with the amount allotted and can check it in CDP's online service or in the My Savings Bonds portal, which NRIC holders open with Singpass; MAS notes that FIN logins are not available there, and that a new issue appears in the portal one business day after its issue date, by 10am. SRS applicants hear from their SRS operator. CDP also sends half-yearly statements in June and December while you hold bonds. From then on, coupons arrive every six months with no action needed. The ${h.a('ssb-interest-rate', 'interest rate page')} shows what the current issue pays each year, and the ${h.a('singapore-savings-bonds', 'Savings Bonds overview')} covers redemption and the rules in one place. Rules on this page come from ${h.src('mas_ssb_buy', 'MAS, how to buy')} and the ${h.src('mas_ssb', 'MAS Savings Bonds page')}.</p>`,
  tool: 'ssb',
  toolArg: { amt: 3000, yrs: 10 },
  related: ['ssb-allotment', 'ssb-interest-rate', 'ssb-with-srs', 'singapore-savings-bonds', 'ssb-early-redemption'],
  sources: ['mas_ssb_buy', 'mas_ssb', 'mas_ssb_invest', 'mas_api_ssb'],
});
