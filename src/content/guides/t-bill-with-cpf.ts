import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const C = K.P.cpf, b6 = K.bill('6M'), b1 = K.bill('1Y');
// Worked case of this page: S$50,000 of OA money above the first S$20,000, in the latest 6-month and 1-year bills.
const amt = 50000;
const r6 = K.oaBill(amt, b6.cutoff, b6.days), r1 = K.oaBill(amt, b1.cutoff, b1.days);
const keep = C.investOaAbove;
// How often past auctions cleared above today's break-even yields.
const all6 = K.bills('6M'), all1 = K.bills('1Y');
const above6 = all6.filter((b) => b.cutoff > r6.breakEven), above1 = all1.filter((b) => b.cutoff > r1.breakEven);
const top6 = [...all6].sort((a, b) => b.cutoff - a.cutoff)[0];
const verdict = (g: number) => (g >= 0 ? `a gain of ${K.sgd2(g)}` : `a loss of ${K.sgd2(-g)}`);
const smaller = K.oaBill(30000, b1.cutoff, b1.days);
const next6 = K.CAL.bills.find((x) => x.term === '6M');

export default defineGuide({
  id: 't-bill-with-cpf',
  group: 'tbill',
  order: 100,
  slug: 't-bill-with-cpf',
  nav: 'T-bills with CPF OA money',
  card: 'OA interest given up, and the yield a bill needs to make up for it',
  title: 'T-Bill With CPF 2026: OA Money, Lost Interest, Break-Even',
  description: `T-bill with CPF OA money in 2026: a 6-month bill needs about ${K.pc(r6.breakEven)} to beat the ${K.pct(C.rates.oa, 1)} the OA pays, once the months out of the OA are counted. Check yours.`,
  h1: 'Buying a T-bill with CPF Ordinary Account money: what it really earns',
  intro: `Enter the OA money you would use, the bill and the cut-off yield. The calculator sets the bill's interest against the OA interest given up while the money is out of the account, and gives the yield needed to break even.`,
  resume: `A T-bill bought with CPF Ordinary Account (OA) money earns its cut-off yield, but the money stops earning the OA's ${K.pct(C.rates.oa, 1)} while it is out, and in our count it is out one month longer than the bill lasts. That puts the break-even yield for a 6-month bill at about ${K.pc(r6.breakEven)} and for a 1-year bill at about ${K.pc(r1.breakEven)}, before any agent bank charge. At the last 6-month cut-off of ${K.pc(b6.cutoff)}, ${K.sgd(amt)} of OA money earns ${K.sgd2(r6.billInterest)} in the bill against ${K.sgd2(r6.oaInterest)} of OA interest given up over ${r6.monthsOut} months, ${verdict(r6.gain)}. In the 1-year bill at ${K.pc(b1.cutoff)}, the result is ${verdict(r1.gain)}. Only OA savings above the first ${K.sgd(keep)} can be invested, through a CPF Investment Account with an agent bank, DBS/POSB, OCBC or UOB. MAS itself warns that CPF interest rates may be higher than government bond yields, and the CPF Board asks members to invest only if they are confident of earning more than CPF interest. Agent bank charges are not published by MAS and are not counted here.`,
  faqs: [
    { q: 'How much Ordinary Account money can go into T-bills?', a: `Only what is above the first ${K.sgd(keep)}. The CPF Board lets members invest OA savings after setting aside ${K.sgd(keep)} in the OA, and only members aged at least 18, not undischarged bankrupts, who have completed its Self-Awareness Questionnaire. With ${K.sgd(70000)} in the OA, up to ${K.sgd(70000 - keep)} could be used, in multiples of ${K.sgd(K.P.tbill.lot)} for a T-bill.` },
    { q: 'Why can a T-bill bought with OA money earn less than the OA itself?', a: `Because the OA keeps paying ${K.pct(C.rates.oa, 1)} on money that stays, and the bill must beat that rate over the whole time the money is away, which in our count is a month longer than the bill. At the last 6-month cut-off of ${K.pc(b6.cutoff)}, against a break-even of about ${K.pc(r6.breakEven)}, the bill earns ${r6.gain >= 0 ? 'more' : 'less'} than the OA would have.` },
    { q: 'What yield does a 6-month T-bill need to beat the Ordinary Account?', a: `About ${K.pc(r6.breakEven)} on our count, with no agent bank charge. The figure is above the OA rate of ${K.pct(C.rates.oa, 1)} because the money misses OA interest for ${r6.monthsOut} months, not six. Of the ${all6.length} six-month auctions since ${all6[0].auction.slice(0, 4)} in our data, ${above6.length} cleared above that level. A bank charge would raise the break-even further.` },
    { q: 'Can Special Account savings buy T-bills?', a: `Yes, under the CPF Investment Scheme for the SA, once ${K.sgd(C.investSaAbove)} is set aside in the SA, and without a CPF Investment Account; applications go through the CPFIS bond dealers, DBS/POSB, OCBC or UOB. The SA earns ${K.pct(C.rates.sa, 1)}, so the bar for a bill is much higher than with OA money. Members aged 55 and above no longer have an SA.` },
  ],
  body: (h) => `
<h2>Who can use OA money, and how much</h2>
<p>The CPF Investment Scheme lets members put part of their OA savings into approved investments, Singapore Government T-bills among them. The conditions, on ${h.src('cpf_invest', 'the CPF Board page on investing CPF savings')}, are short: be at least 18, not be an undischarged bankrupt, have more than ${K.sgd(keep)} in the OA, and complete the Self-Awareness Questionnaire. The first ${K.sgd(keep)} stays in the OA; only the rest can be invested. For OA money you also need a CPF Investment Account with one of the three agent banks, DBS/POSB, OCBC or UOB, and the T-bill application must go through that bank, online.</p>
<p>The bill is bought at the same auction as everyone else's and gets the same cut-off yield. What differs is where the money comes from: the OA, through the agent bank, whose CPFIS statement then shows the bill among your holdings.</p>

<h2>The application, step by step</h2>
<p>MAS restricts CPFIS-OA applications to your own agent bank, to make settlement possible. DBS/POSB and OCBC take them through internet banking or the mobile app, UOB through internet banking for T-bills. Banks close their channels one or two business days before the auction, earlier than the auction itself, so the date to watch is the bank's cut-off, not the auction date. About an hour after the auction closes, MAS posts the aggregate results on its issuance calendar, and the bills are issued three business days later. If a bid fails, the money is refunded to the account used for the application one or two business days after the auction. ${next6 ? `The next 6-month auction already announced is on ${K.day(next6.auction)}.` : ''}</p>

<h2>The months the OA does not pay</h2>
<p>Leaving the OA has a cost: the money stops earning ${K.pct(C.rates.oa, 1)}. A 6-month bill pays for ${b6.days} days, but the money leaves the OA before the auction and the proceeds come back after maturity, so in our count the OA misses ${r6.monthsOut} months of interest, not six; for the 1-year bill, ${r1.monthsOut} months. On ${K.sgd(amt)}, that is ${K.sgd2(r6.oaInterest)} given up for the 6-month bill and ${K.sgd2(r1.oaInterest)} for the 1-year bill. The bill's own interest, ${K.sgd2(r6.billInterest)} and ${K.sgd2(r1.billInterest)}, has to cover it.</p>
${h.table(['Bill', 'Cut-off', 'Bill interest', 'OA interest given up', 'Result', 'Break-even yield'], [[`6-month, ${K.day(b6.auction)}`, K.pc(b6.cutoff), K.sgd2(r6.billInterest), K.sgd2(r6.oaInterest), verdict(r6.gain), K.pc(r6.breakEven)], [`1-year, ${K.day(b1.auction)}`, K.pc(b1.cutoff), K.sgd2(r1.billInterest), K.sgd2(r1.oaInterest), verdict(r1.gain), K.pc(r1.breakEven)]], `${K.sgd(amt)} of OA money, OA at ${K.pct(C.rates.oa, 1)}, months out of the OA as counted on this site, no agent bank charge.`, ['l', 'r', 'r', 'r', 'r', 'r'])}
${h.mini('tcpf', { t: 'Try another cut-off for a 1-year bill', p: ['yl'], d: { amt: 30000, tm: '1Y', yl: b1.cutoff } })}

<h2>The break-even yield, against past auctions</h2>
<p>The break-even barely depends on the sum: it is the yield at which the bill's interest equals the OA interest lost. For the 6-month bill it is about ${K.pc(r6.breakEven)}, for the 1-year bill about ${K.pc(r1.breakEven)}${r1.breakEven < r6.breakEven ? '; the 1-year figure is lower because one extra month weighs less over twelve than over six' : ''}. Set against history, ${above6.length} of the ${all6.length} six-month auctions in our data since ${all6[0].auction.slice(0, 4)} cleared above the 6-month break-even, and ${above1.length} of ${all1.length} one-year auctions above the 1-year one. The highest 6-month cut-off on record here was ${K.pc(top6.cutoff)}, on ${K.day(top6.auction)}.</p>
<p>That history is not a forecast. It shows that with the OA at ${K.pct(C.rates.oa, 1)}, using OA money for a bill has paid in some periods and not in others, and that the answer turns on the cut-off of each auction, which is known only after it closes.</p>

<h2>Charges you have to add yourself</h2>
<p>MAS does not publish any bank charge for T-bill applications, and the calculator counts none. Agent banks set their own terms for the CPF Investment Account, and the CPF Board reminds members to weigh the fees and charges of an investment against the CPF interest they would otherwise earn. If your agent bank charges, the simplest way to reflect it is to lower the yield you type until the bill's interest is reduced by the charge. On ${K.sgd(30000)} in a 1-year bill, the break-even without any charge is ${K.pc(smaller.breakEven)}.</p>
${h.mini('tcpf', { t: 'A larger sum in the 6-month bill', p: ['amt'], d: { amt: 100000, tm: '6M', yl: b6.cutoff } })}

<h2>What MAS and the CPF Board say</h2>
<p>Both bodies flag the same point. On ${h.src('mas_auction', 'its page on buying at auction')}, MAS notes that the prevailing CPF interest rates may be higher than the yield on government securities. The CPF Board's advice is to invest CPF savings only if you are confident of earning more than CPF interest. A T-bill is backed by the Singapore Government, so the question is not safety but whether its yield beats an OA that already pays ${K.pct(C.rates.oa, 1)} with no effort. ${h.a('cpf-interest-rate', 'The CPF interest page')} shows the OA rate and its floor, and ${h.a('t-bill-singapore', 'the T-bill page')} explains how a cut-off is set.</p>`,
  tool: 'tcpf',
  toolArg: { amt, tm: '6M', yl: b6.cutoff },
  related: ['t-bill-singapore', 'cpf-interest-rate', '6-month-t-bill', '1-year-t-bill', 'next-t-bill-auction'],
  sources: ['cpf_invest', 'mas_auction', 'mas_tbill', 'cpf_interest'],
});
