import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const so = K.sora(), days = K.SORA.days;
const first = days[0];
const hi = [...days].sort((a, b) => b.overnight - a.overnight)[0];
const lo = [...days].sort((a, b) => a.overnight - b.overnight)[0];
const avgOn = days.reduce((s, d) => s + d.overnight, 0) / days.length;
// One row per calendar month: average overnight SORA and the 3-month compounded rate of the month's last day.
const months = [...new Set(days.map((d) => d.date.slice(0, 7)))].slice(-12).reverse().map((m) => {
  const xs = days.filter((d) => d.date.startsWith(m));
  const last = xs[xs.length - 1];
  return [K.month(m), String(xs.length), K.dec(xs.reduce((s, d) => s + d.overnight, 0) / xs.length, 4) + ' %', last.c3m === null ? 'n/a' : K.dec(last.c3m, 4) + ' %'];
});
const c3 = so.c3m ?? 0, c6 = so.c6m ?? 0;
const b6 = K.bill('6M'), D = K.dep();
// Worked case of this page: a S$600,000 loan priced at 3-month compounded SORA plus 0.75 %, 20 years left.
const loanAmt = 600000, spread = 0.0075, yrs = 20;
const loan = K.soraLoan(loanAmt, spread, yrs);
const swing = loan ? loan.up - loan.monthly : 0;

export default defineGuide({
  id: 'sora-rate',
  group: 'deposit',
  order: 50,
  slug: 'sora-rate',
  nav: 'SORA rate',
  card: 'Overnight and compounded SORA, and what a spread over it costs',
  title: 'SORA Rate 2026: Overnight and Compounded SORA Today',
  description: `SORA rate in 2026: overnight SORA at ${K.dec(so.overnight, 4)} % and 3-month compounded at ${K.dec(c3, 4)} % on the latest day. Twelve months of data and a loan at SORA plus a spread.`,
  h1: 'SORA: the overnight rate, its compounded averages and what they price',
  intro: `Enter a loan or deposit amount, the spread over 3-month compounded SORA written in the contract and the years left. The calculator applies today's 3-month compounded SORA and shows the instalment if SORA moves half a point.`,
  resume: `The Singapore Overnight Rate Average (SORA) was ${K.dec(so.overnight, 4)} % for ${K.day(so.date)}, the latest value date in our data, and the 3-month compounded SORA stood at ${K.dec(c3, 4)} %. SORA is the volume-weighted average rate of unsecured overnight borrowing between banks in Singapore dollars, from 8am to 6.15pm, and MAS publishes it at 9am on the next business day. Compounded SORA strings the daily rates of the last 1, 3 or 6 months together into one rate, the measure a SORA-linked loan usually refers to. Over the ${days.length} business days since ${K.day(first.date)}, overnight SORA ranged from ${K.dec(lo.overnight, 4)} % to ${K.dec(hi.overnight, 4)} %. A ${K.sgd(loanAmt)} loan at 3-month compounded SORA plus ${K.pct(spread)}, with ${yrs} years left, works out at ${loan ? K.sgd(loan.monthly) : 'n/a'} a month at today's rate, an illustration only, since the rate resets with SORA. For savers, SORA is a market reference rather than a product: nobody buys SORA, but it gives a point of comparison for deposit and T-bill yields.`,
  faqs: [
    { q: 'What time is SORA published each day?', a: 'MAS publishes the SORA of a business day at 9am on the next business day, on its website and through data redistributors. If a reporting bank flags an error by 11.30am and the recalculated rate differs by two basis points or more, MAS republishes the rate by noon, once at most. After that deadline the published rate is final.' },
    { q: 'What is the difference between overnight SORA and compounded SORA?', a: `Overnight SORA is the rate of a single business day. Compounded SORA strings together the overnight rates of a past period, 1, 3 or 6 months, as if a sum had been lent overnight and rolled every day with the interest added. It moves slowly and is known only at the end of the period. On ${K.day(so.date)}, overnight SORA was ${K.dec(so.overnight, 4)} % against ${K.dec(c3, 4)} % for 3-month compounded.` },
    { q: 'Why does overnight SORA change so much from one day to the next?', a: `Because it reflects the borrowing done between banks on that one day, weighted by volume. A day with more demand for overnight cash or different trades gives a different rate. Over the last ${days.length} business days in our data, it averaged ${K.dec(avgOn, 4)} %, while single days went from ${K.dec(lo.overnight, 4)} % to ${K.dec(hi.overnight, 4)} %. Compounded SORA smooths those swings out.` },
    { q: 'What happens if there are too few trades to compute SORA?', a: 'MAS then publishes a contingency SORA. It takes the change in the reference rate of the MAS Standing Facility between that day and the previous business day and adds it to the previous day’s SORA, with a floor of zero. When this method is used, MAS shows it under the SORA calculation method on its website.' },
  ],
  body: (h) => `
<h2>How the overnight rate is built</h2>
<p>Each business day, banks that report to MAS send every eligible overnight borrowing trade in unsecured Singapore dollars that they booked between 8am and 6.15pm. MAS checks the data and takes the volume-weighted average of all those trades: a large trade weighs more than a small one. The result, published at 9am the next business day, is that day's SORA. It is a rate built from transactions that actually happened, not from quotes, which is why MAS describes it as meeting the IOSCO principles for financial benchmarks.</p>
<p>SORA took over from the Swap Offer Rate. In August 2019, the industry committee of the Association of Banks in Singapore and the Singapore Foreign Exchange Market Committee recommended SORA as the most suitable replacement for SOR in Singapore dollar interest rate derivatives. MAS administers the benchmark and reviews its method from time to time; the full rules are on ${h.src('mas_sora', 'the MAS SORA page')}.</p>

<h2>Value date, publication date and corrections</h2>
<p>Every SORA carries two dates. The value date is the business day on which the trades took place; the publication date is the next business day, when the figure appears at 9am. MAS's table lists both, and notes that the publication date is also the value date of the compounded SORA index. On this site, each SORA is filed under its value date, so the latest figure, for ${K.day(so.date)}, describes trading on that day.</p>
<p>A published figure can still change once. If a reporting bank tells MAS by 11.30am that an erroneous trade was included, and the recalculated rate lands two basis points or more away from the 9am figure, MAS republishes it by noon. After that, the rate stands, and MAS only reports summary information on smaller errors from time to time. Our script reads the MAS table at 10.30am Singapore time on weekdays, so on a rare correction day the site can show the first figure until the next run.</p>

<h2>Compounded SORA: the figure contracts use</h2>
<p>A single overnight rate is too jumpy to price a loan for three months. Contracts therefore tend to refer to a compounded rate, which chains the daily SORA of the period just ended into one figure. MAS publishes the 1-month, 3-month and 6-month compounded SORA and a SORA index every business day, on the ${h.src('mas_dir', 'Domestic Interest Rates page')}. On ${K.day(so.date)}, the 1-month figure was ${K.dec(so.c1m ?? 0, 4)} %, the 3-month ${K.dec(c3, 4)} % and the 6-month ${K.dec(c6, 4)} %.</p>
<p>Being backward-looking, compounded SORA tells you what overnight money cost over the past months. A loan that resets every three months on 3-month compounded SORA charges, for the next period, a rate that reflects the period behind it. When overnight SORA moves, the compounded rates follow with a lag, the 6-month one most slowly.</p>

<h2>Twelve months of SORA, month by month</h2>
${h.table(['Month', 'Business days', 'Average overnight SORA', '3M compounded, last day'], months, `Overnight SORA by value date and 3-month compounded SORA on the last value date of each month. Source: MAS Domestic Interest Rates, read ${K.day(K.SORA.read)}. The latest month may be incomplete.`, ['l', 'r', 'r', 'r'])}
<p>The lowest overnight fixing of the period was ${K.dec(lo.overnight, 4)} % on ${K.day(lo.date)}, the highest ${K.dec(hi.overnight, 4)} % on ${K.day(hi.date)}. Single days stray from the monthly average; the compounded column moves in small steps.</p>

<h2>A loan priced at SORA plus a spread</h2>
<p>A loan linked to SORA typically charges compounded SORA plus a spread written in the contract. Take ${K.sgd(loanAmt)} with ${yrs} years left and a spread of ${K.pct(spread)} over 3-month compounded SORA. At the rate of ${K.day(so.date)}, the loan costs ${loan ? K.pct(loan.rate) : 'n/a'} a year, and the monthly instalment of a standard repayment loan is ${loan ? K.sgd(loan.monthly) : 'n/a'}. If SORA were half a point higher, it would be ${loan ? K.sgd(loan.up) : 'n/a'}, ${K.sgd(swing)} more each month. The reset dates and rounding rules are set by each lender's contract, so this is an illustration of the sensitivity rather than a quote.</p>
${h.mini('sora', { t: 'Your spread over 3-month compounded SORA', p: ['sp'], d: { amt: 600000, sp: 0.75, yrs: 20 } })}

<h2>Where SORA sits for a saver</h2>
<p>SORA is the cost of overnight money between banks, a useful point of comparison for what short deposits and short government bills pay. On the latest data, 3-month compounded SORA was ${K.dec(c3, 4)} %, the last 6-month T-bill cut off at ${K.pc(b6.cutoff)} on ${K.day(b6.auction)}, and the MAS average for 3-month fixed deposits in ${D.q} was ${K.pc(D.fd3)}. The three are measured differently and over different periods, so the gaps between them are not a fixed rule. ${h.a('t-bill-singapore', 'The T-bill page')} explains how a cut-off is set and ${h.a('fixed-deposit-rates-singapore', 'the deposit rates page')} what the MAS averages cover.</p>
${h.mini('sora', { t: 'Instalment on a smaller balance', p: ['amt'], d: { amt: 250000, sp: 0.75, yrs: 12 } })}`,
  tool: 'sora',
  toolArg: { amt: loanAmt, sp: spread * 100, yrs },
  related: ['fixed-deposit-rates-singapore', 't-bill-singapore', 't-bill-yield', 'best-fixed-deposit-singapore', 'sdic-deposit-insurance'],
  sources: ['mas_sora', 'mas_dir', 'mas_tbill', 'mas_msb_iii3a'],
});
