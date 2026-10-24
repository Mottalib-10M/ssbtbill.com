/** Home page text. Every figure comes from the kit (src/lib/kit.ts). */
import type { FAQ, Helpers } from '../lib/page-types';
import { KIT as K } from '../lib/kit';

const S = K.LATEST, A = K.ALLOTTED;
const b6 = K.bill('6M'), b1 = K.bill('1Y');
const est = K.estimate('6M');
const nextBill = K.CAL.bills[0];
const nextSsb = K.CAL.ssb.find((x) => x.code !== S.code);
const C = K.P.cpf, R = K.P.retirement;
const dep = K.dep();
const so = K.sora();
// Worked case of the home page: S$20,000 for three years, the four places side by side.
const places = K.compare(20000, 3, dep.fd12 / 100, false);
const by = Object.fromEntries(places.map((p) => [p.key, p]));
const ssbYear1 = K.yby(S.code, 20000, 1)[0].interest;
const b6Buy = K.buy(20000, b6.cutoff, b6.days);
// Twelve months of SSB issues and the T-bill auctions of the same months.
const last12 = K.ISSUES.slice(-12).reverse();
const cutOfMonth = (term: '6M' | '1Y', ym: string) => { const x = K.bills(term).filter((b) => b.auction.startsWith(ym)); return x.length ? K.pc(x[x.length - 1].cutoff) : 'no auction'; };
const over = K.ISSUES.slice(-24).filter(K.oversubscribed).length;

export const HOME = {
  title: 'SSB, T-Bill and CPF Calculator 2026: Singapore Safe Savings',
  description: `Singapore Savings Bonds, T-bills, fixed deposits and CPF in 2026: what your sum earns in each, year by year, from MAS auction data read every business day.`,
  h1: 'Savings Bond, T-bill, fixed deposit or CPF: what your money earns',
  intro: `Type a sum and a number of years. The calculator below puts the latest Savings Bond, the latest 6-month T-bill, a fixed deposit at the rate you were offered and CPF interest side by side, in dollars.`,
  trust: `Auction data from the MAS statistics API, last change ${K.day(K.BILLS_READ > K.SSB_READ ? K.BILLS_READ : K.SSB_READ)} · CPF rates of ${C.quarterLabel}`,
  board: [
    {
      k: nextSsb && S.done ? 'Next Savings Bond' : 'Savings Bond open now', title: `${K.month(S.issue)} issue, ${S.code}`,
      lines: [['Year 1 coupon', K.pc(S.coupon[0])], ['10-year average', K.pc(S.avg[9])], ['Apply by', `${K.day(S.lastDay)}, 9pm`], ['Issued', K.day(S.issue)]] as Array<[string, string]>,
      id: 'ssb-interest-rate', l: 'Every rate of this issue',
    },
    {
      k: 'Next 6-month T-bill', title: nextBill ? `Auction of ${K.day(nextBill.auction)}` : 'Calendar not yet published',
      lines: [['Last cut-off', `${K.pc(b6.cutoff)} on ${K.day(b6.auction)}`], ['Naive estimate', `${K.pc(est.estimate)}, missed by ${K.dec(est.mae, 2)} point on average`], ['Bill code', nextBill ? nextBill.code : 'not announced'], ['Issued', nextBill ? K.day(nextBill.issue) : 'not announced']] as Array<[string, string]>,
      id: 'next-t-bill-auction', l: 'How the estimate is made',
    },
    {
      k: 'Latest results', title: '6-month and 1-year T-bills',
      lines: [['6-month', `${K.pc(b6.cutoff)} · ${K.day(b6.auction)}`], ['1-year', `${K.pc(b1.cutoff)} · ${K.day(b1.auction)}`], ['Bid-to-cover, 6-month', K.dec(b6.cover, 2)], ['3M compounded SORA', `${K.dec(so.c3m ?? 0, 4)} % · ${K.day(so.date)}`]] as Array<[string, string]>,
      id: 't-bill-yield-history', l: 'Every cut-off since 2015',
    },
    {
      k: 'CPF interest', title: C.quarterLabel,
      lines: [['Ordinary Account', K.pct(C.rates.oa, 1)], ['Special, MediSave, Retirement', K.pct(C.rates.sa, 1)], ['Extra interest under 55', `${K.pct(C.extra.under55.rate, 0)} on the first ${K.sgd(C.extra.under55.on)}`], [`Full Retirement Sum ${R.year}`, K.sgd(R.frs)]] as Array<[string, string]>,
      id: 'cpf-interest-rate', l: 'Interest on your balances',
    },
  ],
  resume: `On ${K.sgd(20000)} for three years, at the rates of this build, a CPF top-up earns the most on paper (${K.sgd(by.cpf.interest)}), but the money stays in CPF until payout age. Among the places you can take money out of, the ${K.month(S.issue)} Savings Bond earns ${K.sgd(by.ssb.interest)}, rolling the 6-month T-bill at its last cut-off of ${K.pc(b6.cutoff)} earns about ${K.sgd(by.tbill.interest)}, and a fixed deposit at ${K.pct(dep.fd12 / 100)}, the MAS average for 12-month deposits in ${dep.q}, earns ${K.sgd(by.fd.interest)}. The Savings Bond pays ${K.sgd(ssbYear1)} in its first year and more each year after, and can be redeemed in any month without a penalty. The T-bill is bought at a price below face value: ${K.sgd2(b6Buy.cost)} for ${K.sgd(20000)} at the last cut-off, repaid in full after ${b6.days} days. Both are issued by the Singapore Government and the interest is not taxed for individuals. The site reads every issue and auction result from the MAS statistics API each business day, and the CPF rates from the CPF Board, and never tells you which to pick.`,
  monthsTitle: 'Twelve months of rates, side by side',
  monthsIntro: `Each row is one Savings Bond issue and the last T-bill auctions held in the same month. The bond coupon is fixed for ten years at issue; the T-bill yield holds for six months or a year only.`,
  monthsHead: ['Month', 'SSB year 1', 'SSB 10-year average', '6-month T-bill', '1-year T-bill'],
  monthsRows: last12.map((i) => { const ym = i.issue.slice(0, 7); return [K.month(i.issue), K.pc(i.coupon[0]), K.pc(i.avg[9]), cutOfMonth('6M', ym), cutOfMonth('1Y', ym)]; }),
  monthsCaption: `SSB rates per issue month and T-bill cut-off yields of the last auction of that month, as published by MAS. 1-year bills are auctioned once a quarter. Read ${K.day(K.SSB_READ)}.`,
  why: (h: Helpers) => `
<h2>One question, four answers, one screen</h2>
<p>The Monetary Authority of Singapore publishes each Savings Bond's ten coupons and each T-bill's cut-off yield, and the CPF Board publishes its interest rates every quarter. Each source answers its own product. None of them says what ${K.sgd(20000)} becomes in each place over the years you have in mind, and that is the comparison savers end up doing on a spreadsheet. The calculator at the top does it with the rates of this build: the Savings Bond year by year, coupons as paid; the 6-month T-bill bought at the last cut-off and renewed at that same yield, which is an illustration since every auction sets a new one; a fixed deposit at the rate you type; CPF at the rate of the account the money would go into.</p>
<p>Two facts change the reading. A Savings Bond can be redeemed in any month and you get back the principal plus the interest earned, with a ${K.sgd(K.P.ssb.redemptionFee)} fee; a T-bill pays only at maturity, and selling earlier means a bank or broker market price. CPF money cannot be withdrawn before 55, and above that age only what exceeds the Full Retirement Sum can come out. A rate is not the whole story when one of the four keeps your money for decades.</p>
${h.mini('ssb', { t: 'Interest of the latest Savings Bond on your amount', p: ['amt'], d: { amt: 15000, yrs: 5 } })}
<p>The figures come from the MAS statistics API, which publishes every issue and auction since the scheme began, the MAS Monthly Statistical Bulletin for average bank deposit rates, and the CPF Board's news release of ${K.day('2026-09-22')} for the rates of ${C.quarterLabel}. The ${h.a('method', 'method page')} lists each formula and how we checked it: the T-bill price formula reproduces every cut-off price MAS published since 2015, and the Savings Bond coupons match the MAS table for each issue.</p>`,
  datesTitle: 'Dates already set by MAS',
  dates: [
    ...K.CAL.ssb.filter((x) => x.lastDay >= K.P.retrieved_at).flatMap((x) => [[K.day(x.lastDay), `Last day to apply for ${x.name} (${x.code}), 9pm`], [K.day(x.allotment), `Allotment results of ${x.name}`]] as Array<[string, string]>),
    ...K.CAL.bills.map((x) => [K.day(x.auction), `Auction of the ${x.term === '6M' ? '6-month' : '1-year'} T-bill ${x.code}, issued ${K.day(x.issue)}`] as [string, string]),
    [K.day(K.P.valid_to), `End of the CPF interest quarter; the CPF Board announces the next rates before it`] as [string, string],
  ].sort((a, b) => Date.parse(a[0]) - Date.parse(b[0])),
  sections: (h: Helpers) => [
    { title: 'Savings Bond or T-bill: what really differs', html: `<p>A Savings Bond locks ten years of coupons the day it is issued but lets you leave in any month. A T-bill locks one yield for six months or a year and does not let you leave. When the yield curve slopes up, the bond's later coupons are higher than its first; when short rates are high, the bill can pay more than the bond's first years. Over the last 24 issues, ${over} Savings Bond issue${over === 1 ? ' was' : 's were'} oversubscribed, which means large applications were cut. ${h.a('ssb-vs-t-bill', 'The full comparison')} runs both on your amount.</p>` },
    { title: 'Fixed deposits and the MAS average', html: `<p>Banks quote promotional rates on their own pages; MAS publishes the weighted average of all outstanding Singapore dollar deposits each quarter. In ${dep.q}, that average was ${K.pct(dep.fd3 / 100)} for 3-month deposits and ${K.pct(dep.fd12 / 100)} for 12-month deposits, while the average savings account paid ${K.pct(dep.sav / 100)}. We list no bank: type the offer you were given and the ${h.a('fixed-deposit-rates-singapore', 'deposit calculator')} sets it against the T-bill. Deposits are insured up to ${K.sgd(K.P.sdic.limit)} per depositor per bank.</p>` },
    { title: 'CPF: interest you cannot spend yet', html: `<p>The Ordinary Account earns ${K.pct(C.rates.oa, 1)} and the Special, MediSave and Retirement Accounts ${K.pct(C.rates.sa, 1)} from ${C.quarterLabel}, plus extra interest on the first ${K.sgd(C.extra.under55.on)}. Those rates beat the latest T-bill, but money placed in CPF follows CPF rules on withdrawals. ${h.a('cpf-interest-rate', 'Interest on your balances')} and ${h.a('cpf-sa-top-up', 'a top-up against a Savings Bond')} have their own calculators.</p>` },
  ],
  faqs: [
    { q: 'Which pays more right now, a Savings Bond or a T-bill?', a: `With the data of this build, the ${K.month(S.issue)} Savings Bond pays ${K.pc(S.coupon[0])} in its first year and averages ${K.pc(S.avg[9])} over ten years, while the last 6-month T-bill cut off at ${K.pc(b6.cutoff)} and the last 1-year bill at ${K.pc(b1.cutoff)}. Over one year the bill pays more; over several years the bond's step-up counts. The comparison above runs both on your own amount and horizon.` },
    { q: 'Where do the figures on this site come from?', a: `Savings Bond rates and allotments, T-bill auction results and the issuance calendar come from the MAS statistics API, read every business day. Bank deposit averages come from table III.3A of the MAS Monthly Statistical Bulletin, SORA from MAS's domestic interest rates page, CPF rates and retirement sums from the CPF Board and tax rules from IRAS. Each page lists its sources; MAS and SDIC are linked, the CPF Board and IRAS are named with their address (their terms of use restrict links).` },
    { q: 'Is the T-bill estimate on the home page a forecast?', a: `It is a naive estimate: the last cut-off carried forward to the next auction. We publish its record instead of dressing it up. Over the last ${est.count} auctions of 6-month bills, that rule missed the real cut-off by ${K.dec(est.mae, 2)} point on average, and by ${K.dec(est.p80, 2)} point or less eight times in ten. The real yield is known only when MAS publishes the result.` },
    { q: 'Do I pay tax on Savings Bond or T-bill interest in Singapore?', a: `No, for individuals. MAS states that interest on Singapore Government Securities, which include Savings Bonds and T-bills, is tax-exempt for individuals, and IRAS lists interest from deposits with approved banks among income that is not taxable. Singapore also has no capital gains tax. Partnerships and trading businesses follow other rules.` },
    { q: 'Does this site tell me where to put my money?', a: 'No. It calculates what a sum earns under each product’s published rules and rates, and shows the conditions that change the answer, such as being able to redeem a Savings Bond in any month or not touching CPF money before 55. It sells nothing, links to no bank or broker and is not affiliated with MAS or the CPF Board.' },
    { q: 'How often is the data refreshed?', a: `Every business day at 10:30am Singapore time, a script reads the MAS statistics API and rebuilds the site when something changed: a new Savings Bond announcement on the first business day of the month, a T-bill result, a new SORA fixing. CPF rates change once a quarter and are updated when the CPF Board announces them. Each page shows the date of the last data.` },
  ] as FAQ[],
  sources: ['mas_ssb', 'mas_tbill', 'mas_api_ssb', 'mas_api_bills', 'mas_msb_iii3a', 'mas_tax', 'cpf_pr_2026_09_22', 'cpf_interest', 'cpf_rs', 'iras_interest', 'sdic', 'mas_terms'],
};
