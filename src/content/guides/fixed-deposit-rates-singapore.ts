import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const D = K.dep(), Q = K.DEPOSITS.quarters;
const yearAgo = Q[Math.max(0, Q.length - 5)];
const b6 = K.bill('6M'), b1 = K.bill('1Y');
// Worked case of this page: S$40,000 placed for each tenor at the MAS average of the latest quarter.
const amt = 40000;
const tenors: Array<[string, number, number]> = [['1-month', D.fd1, 1], ['3-month', D.fd3, 3], ['6-month', D.fd6, 6], ['12-month', D.fd12, 12]];
const top = [...tenors].sort((a, b) => b[1] - a[1])[0];
const low = [...tenors].sort((a, b) => a[1] - b[1])[0];
const fd12 = K.fd(amt, D.fd12 / 100, 12, false);
const fd6 = K.fd(amt, D.fd6 / 100, 6, false);
const bill6 = K.buy(amt, b6.cutoff, b6.days), bill1 = K.buy(amt, b1.cutoff, b1.days);
const rows = Q.slice(-8).reverse().map((q) => [q.q, K.pc(q.fd1), K.pc(q.fd3), K.pc(q.fd6), K.pc(q.fd12), K.pc(q.top12)]);
const peak = [...Q].sort((a, b) => b.fd12 - a.fd12)[0];
const gap6 = Math.round((bill6.interest - fd6.interest) * 100) / 100;

export default defineGuide({
  id: 'fixed-deposit-rates-singapore',
  group: 'deposit',
  order: 10,
  slug: 'fixed-deposit-rates-singapore',
  nav: 'Fixed deposit rates',
  card: 'MAS average rates by tenor and the interest on your sum',
  title: 'Fixed Deposit Rates Singapore 2026: MAS Averages, Tenors',
  description: `Fixed deposit rates in Singapore for 2026: the MAS average was ${K.pc(D.fd12)} for 12 months and ${K.pc(D.fd3)} for 3 months in ${D.q}. Work out interest on your own sum.`,
  h1: 'Fixed deposit rates in Singapore: the MAS average, tenor by tenor',
  intro: `Type the sum you would place, the rate on the offer in front of you and the tenor in months. The calculator gives the interest paid at maturity and how much of the deposit falls under deposit insurance.`,
  resume: `The average fixed deposit in Singapore paid ${K.pc(D.fd12)} a year for a 12-month tenor in ${D.q}, according to table III.3A of the MAS Monthly Statistical Bulletin, against ${K.pc(D.fd6)} for 6 months, ${K.pc(D.fd3)} for 3 months and ${K.pc(D.fd1)} for one month. These are weighted averages of every deposit still on the books of full banks, for amounts up to the deposit insurance limit, so they include deposits placed months earlier at older rates. On ${K.sgd(amt)} held twelve months, the 12-month average gives ${K.sgd2(fd12.interest)} of interest at maturity. The highest rate any bank quoted for a new 12-month deposit in the same quarter was ${K.pc(D.top12)}, a single quote that can carry conditions. For comparison, the last 6-month Treasury bill cut off at ${K.pc(b6.cutoff)} on ${K.day(b6.auction)}. Interest on deposits with approved banks is not taxed for individuals, and deposits are insured up to ${K.sgd(K.P.sdic.limit)} per depositor per bank. We name no bank: enter the rate you were offered.`,
  faqs: [
    { q: 'Why is the MAS average fixed deposit rate below the rates banks advertise?', a: `Because the MAS figure is a weighted average of all fixed deposits outstanding at the end of the quarter, not of new offers. A 12-month deposit placed a year ago still counts at the rate it was given then. When banks cut their offers, the average follows slowly; when they raise them, it also lags. An advertised rate may also come with conditions, such as a minimum sum, which the average does not show.` },
    { q: 'Which deposits does MAS table III.3A cover?', a: `Singapore dollar fixed and savings deposits that commercial banks hold for non-bank customers, where commercial banks means qualifying full bank licensees. The fixed deposit rates are given for amounts up to the maximum covered by the Deposit Insurance Scheme, which MAS applied to the table at ${K.sgd(K.P.sdic.limit)} from the third quarter of 2024. Foreign currency deposits are not part of it.` },
    { q: 'Is fixed deposit interest taxable for individuals in Singapore?', a: 'IRAS lists interest from deposits with approved banks in Singapore among the income that is not taxable, and you do not declare it in your tax return. Interest from deposits with banks that are not approved is taxable. IRAS points to the MAS directory of commercial and merchant banks to check which banks are approved.' },
    { q: 'How often does MAS publish new deposit rate averages?', a: `Once a quarter, in the Monthly Statistical Bulletin. The latest quarter on this page is ${D.q}, and our data script reads the MAS table every business day, last on ${K.day(K.DEPOSITS.read)}, so a new quarter appears here at the first daily run after MAS posts it. Between two releases, the rate a bank quotes you today can differ from the average by a wide margin.` },
  ],
  body: (h) => `
<h2>What the MAS figure is, and what it is not</h2>
<p>MAS collects deposit rates from the full banks every quarter and publishes two kinds of numbers. The first is a weighted average rate for all outstanding fixed deposits, split into 1, 3, 6 and 12 months. Weighted means a large deposit counts more than a small one, and outstanding means every deposit still running at quarter end, whatever day it was placed. The second is the highest rate quoted for a new fixed deposit of each tenor during the quarter. Both are restricted to amounts up to the deposit insurance cap, so the figures describe what ordinary savers hold rather than large corporate placements.</p>
<p>The average is the more useful number for judging an offer. If a bank proposes a rate well above it, the offer is generous against what other depositors actually hold. The highest quote, ${K.pc(D.top12)} for 12 months in ${D.q}, tells you less: it is one rate from one bank, sometimes for a product with strings attached, and it can stay at the same level for many quarters while the average moves. We print it because MAS publishes it, not as a rate most people receive.</p>

<h2>Eight quarters of averages by tenor</h2>
${h.table(['Quarter', '1 month', '3 months', '6 months', '12 months', 'Highest new 12-month quote'], rows, `Weighted average rate of all outstanding Singapore dollar fixed deposits, amounts up to the deposit insurance limit, full banks. Source: MAS Monthly Statistical Bulletin table III.3A, read ${K.day(K.DEPOSITS.read)}.`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>A year before the latest quarter, in ${yearAgo.q}, the 12-month average stood at ${K.pc(yearAgo.fd12)}; it is ${K.pc(D.fd12)} now. Since our series starts in ${Q[0].q}, its highest point was ${K.pc(peak.fd12)}, in ${peak.q}. In ${D.q} the ${top[0]} tenor carried the highest average, ${K.pc(top[1])}, and the ${low[0]} tenor the lowest, ${K.pc(low[1])}. A longer tenor does not always pay more: the order depends on what banks were offering when the deposits still outstanding were placed, and on how much money sits in each tenor.</p>

<h2>The same ${K.sgd(amt)} at each tenor</h2>
<p>The calculator counts simple interest paid at maturity: the sum times the yearly rate times the share of the year. At the 12-month average, ${K.sgd(amt)} earns ${K.sgd2(fd12.interest)} after a year. At the 6-month average the same sum earns ${K.sgd2(fd6.interest)} for half a year, and what happens next depends on the rate the bank offers when it matures. Banks count days, so a deposit started on a given date can differ from these figures by a few cents.</p>
${h.mini('fd', { t: 'Interest on a deposit at the rate you were offered', p: ['amt', 'rt'], d: { amt: 40000, rt: D.fd12, mo: 12 } })}
<p>If the offer you hold is for an unusual tenor, such as 9 or 18 months, type it in months. The calculator keeps the yearly rate and scales the interest to the length you enter, which is how banks quote these deposits.</p>

<h2>Against the Treasury bill of the same length</h2>
<p>The closest government alternative to a 6-month deposit is the 6-month T-bill. At its cut-off of ${K.pc(b6.cutoff)} on ${K.day(b6.auction)}, ${K.sgd(amt)} of face value cost ${K.sgd2(bill6.cost)} and paid back ${K.sgd(amt)} after ${b6.days} days, ${K.sgd2(bill6.interest)} of interest. The 6-month deposit average gives ${K.sgd2(fd6.interest)} over a similar period, a difference of ${K.sgd2(Math.abs(gap6))} ${gap6 >= 0 ? 'in favour of the bill' : 'in favour of the deposit'}. For twelve months, the 1-year bill of ${K.day(b1.auction)} at ${K.pc(b1.cutoff)} returns ${K.sgd2(bill1.interest)} on the same face value, against ${K.sgd2(fd12.interest)} for the 12-month average deposit.</p>
<p>The two are not identical. A T-bill is bought at auction, its yield is known only after the auction, and it cannot be cashed in early except by selling it at a bank's main branch at the market price. A deposit has a rate fixed on the day you place it; ending it early follows the bank's own terms. ${h.a('t-bill-vs-fixed-deposit', 'The T-bill and fixed deposit comparison')} goes through those differences in detail, and ${h.a('best-fixed-deposit-singapore', 'the page on comparing offers')} sets two bank quotes side by side.</p>
${h.mini('fd', { t: 'A shorter tenor at the 3-month average', p: ['mo'], d: { amt: 15000, rt: D.fd3, mo: 3 } })}

<h2>Tax and insurance on a deposit</h2>
<p>For individuals, interest on deposits with approved banks in Singapore is not taxable, as ${h.src('iras_interest', 'IRAS explains')}, so the rate you are quoted is the rate you keep. Fixed deposits in Singapore dollars are also covered by the Deposit Insurance Scheme up to ${K.sgd(K.P.sdic.limit)} per depositor per member bank, counted together with your savings and current accounts at that bank. Above that sum, a second bank gives a second limit. ${h.a('sdic-deposit-insurance', 'The deposit insurance page')} shows how the cover adds up across banks and accounts.</p>
<p>The averages on this page come from ${h.src('mas_msb_iii3a', 'MAS table III.3A')}. They are updated once a quarter, so between releases the market can move faster than the table. For the rate you can lock in today, the offer from the bank is the only figure that counts; the average tells you where that offer sits.</p>`,
  tool: 'fd',
  toolArg: { amt: 40000, rt: D.fd12, mo: 12 },
  related: ['best-fixed-deposit-singapore', 't-bill-vs-fixed-deposit', 'best-savings-account-singapore', 'sdic-deposit-insurance', 'ssb-vs-fixed-deposit'],
  sources: ['mas_msb_iii3a', 'iras_interest', 'sdic', 'mas_tbill'],
});
