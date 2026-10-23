import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const SB = K.P.ssb, A = K.ALLOTTED;
// MAS allows links to its home page only (mas.gov.sg/terms-of-use): the page is named in the link text.
const ALLOT_URL = 'https://www.mas.gov.sg/';
const done = K.ISSUES.filter((i) => i.done);
const over = done.filter(K.oversubscribed);
const lastOver = over[over.length - 1];
const cutS = (i: (typeof done)[number]) => Math.round(i.cutoff * 1e6);
const tight = [...over].sort((a, b) => a.cutoff - b.cutoff)[0];
const recent12 = done.slice(-12), over12 = recent12.filter(K.oversubscribed).length;
const recent36 = done.slice(-36), over36 = recent36.filter(K.oversubscribed).length;
const cut = over.filter((i) => cutS(i) < SB.maxHolding);
// Same application in the tightest issue and in the latest oversubscribed one.
const asks = [5000, 20000, 50000, 100000, 200000];
const got = (i: (typeof done)[number], x: number) => { const a = K.allot(i.code, x); return a.random ? `${K.sgd(a.sure)} or ${K.sgd(a.sure + a.random)}` : K.sgd(a.sure); };
const ratio = (i: (typeof done)[number]) => i.applied / i.size;
const busiest = [...done].sort((a, b) => ratio(b) - ratio(a))[0];
const n12 = (n: number) => (n === 0 ? 'none was' : n === 1 ? 'one was' : `${n} were`);
const minSize = Math.min(...done.map((i) => i.size)), maxSize = Math.max(...done.map((i) => i.size));
const fill12 = recent12.map((i) => i.applied / i.size), meanFill = fill12.reduce((a, b) => a + b, 0) / fill12.length;
const maxFill12 = recent12[fill12.indexOf(Math.max(...fill12))];
const aAsk = K.allot(A.code, 80000);

export default defineGuide({
  id: 'ssb-allotment',
  group: 'ssb',
  order: 50,
  slug: 'ssb-allotment',
  nav: 'Allotment',
  card: 'Cut-off amounts and the random S$500 in busy months',
  title: 'SSB Allotment 2026: Cut-Off Amounts and the Random S$500',
  description: `SSB allotment in 2026: ${over.length} of ${done.length} issues so far were oversubscribed; the lowest cut-off was ${K.sgd(cutS(tight))}. How the quantity ceiling works, with every issue listed.`,
  h1: 'Savings Bond allotment: who gets what when an issue is oversubscribed',
  intro: `Type the amount you would apply for. The calculator shows what that application received in each of the last 24 issues, with the cut-off and the chance of one more S$500 lot.`,
  resume: `When applications for a Savings Bond exceed the amount on offer, MAS does not share the issue in proportion to what people asked for. It uses a quantity ceiling: every applicant gets ${K.sgd(SB.lot)}, then another ${K.sgd(SB.lot)}, round after round, until the bonds run out. The level reached is the cut-off amount. An application at or below it is filled in full; one above it gets the cut-off amount, or the cut-off plus one more ${K.sgd(SB.lot)} lot drawn at random. Of the ${done.length} issues allotted so far, ${over.length} were oversubscribed, and ${cut.length} of those cut applications below the ${K.sgd(SB.maxHolding)} holding limit. The tightest was ${tight.code} in ${K.month(tight.issue)}, with a cut-off of ${K.sgd(cutS(tight))} and a chance of ${K.pct(tight.randomRate / 100)} at the extra lot. In the last twelve allotted issues, ${n12(over12)} oversubscribed. The ${K.month(A.issue)} issue drew ${K.mn(A.applied)} of applications for ${K.mn(A.size)} offered, and an ${K.sgd(80000)} application received ${K.sgd(aAsk.sure)}.`,
  faqs: [
    { q: 'What is the cut-off amount in a Savings Bond allotment?', a: `It is the amount every applicant was filled up to in an oversubscribed issue. MAS publishes it with the results after 3pm on allotment day. If you applied for that amount or less, you got all of it. If you applied for more, you got the cut-off amount, and some applicants above it received one more ${K.sgd(SB.lot)} by random draw.` },
    { q: 'Does applying for more than I want improve my allotment?', a: 'No. Under the quantity ceiling, a large application is cut to the same level as everyone else above the cut-off, so asking for more does not buy a bigger share. MAS itself advises applying only for the amount you wish to hold. A small application, on the other hand, has a better chance of being filled completely.' },
    { q: 'When is the excess money from a partial allotment refunded?', a: `By the end of the second last business day of the month, into the bank account used for the application. The bank debits the full amount when you apply, and the unallotted part comes back two business days before the bond is issued. The ${K.sgd(SB.fee)} application fee is not refunded, even if nothing was allotted.` },
    { q: 'How often have recent Savings Bond issues been oversubscribed?', a: `In the last twelve issues with published results, ${n12(over12)} oversubscribed; in the last thirty-six, ${over36 === 0 ? 'none' : over36}. The most recent oversubscribed issue was ${lastOver.code}, issued in ${K.month(lastOver.issue)}, with a cut-off of ${K.sgd(cutS(lastOver))}. Demand depends on the rate and on the amount MAS offers, which has ranged from ${K.mn(minSize)} to ${K.mn(maxSize)} a month.` },
  ],
  body: (h) => `
<h2>The quantity ceiling, round by round</h2>
<p>MAS explains the rule with four applicants on its allotment page. The government offers ${K.sgd(10000)} of bonds. A asks for ${K.sgd(2000)}, B for ${K.sgd(4000)}, C for ${K.sgd(5500)} and D for ${K.sgd(6500)}: ${K.sgd(18000)} in total. Each round hands every unfilled applicant ${K.sgd(SB.lot)}. After four rounds, ${K.sgd(8000)} is gone and A is fully served. Round five gives ${K.sgd(1500)} to B, C and D. The last ${K.sgd(500)} cannot go round, so one of the three gets it by draw. The cut-off is ${K.sgd(2500)}: A ends with ${K.sgd(2000)}, B and D with ${K.sgd(2500)}, and C, the lucky one, with ${K.sgd(3000)} (${h.ext(ALLOT_URL, 'MAS website, Savings Bonds section: allotment for oversubscribed issues')}).</p>
<p>The design favours breadth over size. Spreading a limited issue across as many people as possible means a saver asking for ${K.sgd(5000)} is fully served long before someone asking for ${K.sgd(SB.maxHolding)}. In an extreme month, MAS states that if giving ${K.sgd(SB.lot)} to every applicant would exceed the issue, the bonds go to applicants at random, ${K.sgd(SB.lot)} each.</p>
${h.mini('ssballot', { t: 'What a modest application received', p: ['amt'], d: { amt: 25000 } })}

<h2>Every oversubscribed issue so far</h2>
<p>The table lists each issue that drew more money than MAS offered, with the cut-off it set and the share of applicants above that line who won the extra lot. A cut-off of ${K.sgd(SB.maxHolding)} means the issue was oversubscribed overall but every application, up to the holding limit, was still filled.</p>
${h.table(['Issued', 'Code', 'Offered', 'Applied', 'Cut-off amount', 'Chance of +S$500'], over.slice().reverse().map((i) => [K.monthShort(i.issue), i.code, K.mn(i.size), K.mn(i.applied), K.sgd(cutS(i)), i.randomRate ? K.pct(i.randomRate / 100) : 'none']), `Oversubscribed Savings Bond issues. Source: MAS statistics API, read ${K.day(K.SSB_READ)}.`, ['l', 'l', 'r', 'r', 'r', 'r'])}
<p>The busiest month by the ratio of money applied to money offered was ${busiest.code}, issued in ${K.month(busiest.issue)}, when applications reached ${K.dec(ratio(busiest), 1)} times the ${K.mn(busiest.size)} on offer. Months like that are the reason a large saver can wait several issues to place a sum in full. The random-draw column also shows how close each month came to a round number: a chance near 100 % means the bonds almost stretched to the next ${K.sgd(SB.lot)}; a chance near zero means they barely reached the cut-off.</p>

<h2>One application, two very different months</h2>
<p>Applied to the same five amounts, the tightest issue on record and the latest oversubscribed one give a sense of the range. Where two figures appear, the lower one is what was certain and the higher one what a winner of the draw received.</p>
${h.table(['You apply for', `${tight.code} (${K.monthShort(tight.issue)})`, `${lastOver.code} (${K.monthShort(lastOver.issue)})`], asks.map((x) => [K.sgd(x), got(tight, x), got(lastOver, x)]), 'What each application would have been allotted. Amounts above the cut-off receive the cut-off, or the cut-off plus S$500 by draw.', ['l', 'r', 'r'])}
<p>The pattern is the same in both columns: once an application passes the cut-off, its size stops mattering. In ${tight.code}, an application for ${K.sgd(20000)} and one for ${K.sgd(SB.maxHolding)} received the same thing. That is the practical consequence of the quantity ceiling, and it is why, in busy periods, a large holding can only be built over several issues.</p>
${h.mini('ssballot', { t: 'A large application in recent issues', p: ['amt'], d: { amt: 120000 } })}

<h2>How full the recent issues were</h2>
<p>Oversubscription is a ratio, and the recent months show both sides of it. Across the last twelve issues with results, applications averaged ${K.pct(meanFill, 0)} of the amount on offer. The fullest of those was ${maxFill12.code}, issued in ${K.month(maxFill12.issue)}, with ${K.mn(maxFill12.applied)} applied for ${K.mn(maxFill12.size)} offered. ${over12 === 0 ? 'None of the twelve crossed 100 %, so every application in that period was filled in full, up to the holding limit.' : `${over12 === 1 ? 'One of them' : `${over12} of them`} crossed 100 %, and only in ${over12 === 1 ? 'that month' : 'those months'} did the cut-off bite.`}</p>
<p>The amount on offer is set by MAS each month and announced with the rates, so the two numbers that decide the allotment are only both known after applications close. A rate that looks generous in a month with a large issue can still be filled in full; a modest rate in a month with a small issue can be cut. The calculator at the top applies your amount to each of the last 24 results, which is a more useful guide than any single month.</p>

<h2>Dates, refunds and where to read the result</h2>
<p>MAS allots on the third last business day of the month, called allotment day, and publishes the results on its website after 3pm. The excess money of a partly filled application comes back to the bank account by the end of the second last business day. The bond is issued on the first business day of the following month. Holders who paid in cash receive a CDP letter with the amount allotted and can check it online or in the My Savings Bonds portal; SRS holders hear from their SRS operator.</p>
<p>The fee is the one cost an unlucky applicant cannot recover: the ${K.sgd(SB.fee)} is charged per application and kept by the bank whatever the outcome (${h.src('mas_ssb_buy', 'MAS, how to buy')}). For the rates that drive demand in the first place, see the ${h.a('ssb-interest-rate', 'interest rate page')} and the ${h.a('ssb-rates-history', 'rates history')}; the ${h.a('how-to-buy-ssb', 'application guide')} covers the channels.</p>`,
  tool: 'ssballot',
  toolArg: { amt: 80000 },
  related: ['how-to-buy-ssb', 'ssb-interest-rate', 'ssb-rates-history', 'singapore-savings-bonds', 'ssb-switch'],
  sources: ['mas_ssb_buy', 'mas_api_ssb', 'mas_ssb_invest'],
});
