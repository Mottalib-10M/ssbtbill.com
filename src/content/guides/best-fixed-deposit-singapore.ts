import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const D = K.dep();
const b6 = K.bill('6M');
// Worked case of this page: S$50,000, a 3-month offer and a 12-month offer at the MAS averages of the latest quarter.
const amt = 50000;
const pair = K.tool('fdcompare', { amt, r1: D.fd3, m1: 3, r2: D.fd12, m2: 12 });
const [rowA, rowB, rowBill] = pair.rows;
// Same rate, two tenors: what renewing a 3-month deposit four times adds over one 12-month deposit.
const same = K.tool('fdcompare', { amt, r1: D.fd12, m1: 3, r2: D.fd12, m2: 12 });
const sameGap = Math.round((Number(same.rows[0][2]) - Number(same.rows[1][2])) * 100) / 100;
// Renewal rate that a second 6-month deposit needs to match one 12-month deposit (simple interest each time).
const r6 = D.fd6 / 100, r12 = D.fd12 / 100;
const needed = 2 * ((1 + r12) / (1 + r6 / 2) - 1);
const first6 = K.fd(amt, r6, 6, false), whole12 = K.fd(amt, r12, 12, false);
const lim = K.P.sdic.limit;

export default defineGuide({
  id: 'best-fixed-deposit-singapore',
  group: 'deposit',
  order: 20,
  slug: 'best-fixed-deposit-singapore',
  nav: 'Comparing deposit offers',
  card: 'Two offers on the same twelve months, renewal included',
  title: 'Best Fixed Deposit Singapore 2026: Compare Two Offers',
  description: `Best fixed deposit in Singapore for 2026: line up two offers over the same 12 months, renewal included, against the ${K.pc(D.fd12)} MAS average and a ${K.pc(b6.cutoff)} T-bill.`,
  h1: 'The best fixed deposit is the one that wins over your horizon',
  intro: `Enter your sum and two offers, each with its rate and tenor in months. The calculator renews each one at the same rate until twelve months are covered and adds the latest 6-month T-bill for reference.`,
  resume: `There is no single best fixed deposit in Singapore: the answer depends on how the offers compare over the same stretch of time, which a headline rate does not show. Put on twelve months, ${K.sgd(amt)} in a 3-month deposit at ${K.pc(D.fd3)}, renewed three times at that rate, earns ${rowA[1]}, while a 12-month deposit at ${K.pc(D.fd12)} earns ${rowB[1]}. Those two rates are the MAS averages for ${D.q}, used here as stand-ins for real offers. The short tenor only wins if its rate holds at each renewal, which no bank promises. A 6-month deposit at the ${K.pc(D.fd6)} average needs a renewal rate of ${K.pct(needed)} for its second half to match the 12-month deposit. The latest 6-month T-bill, bought twice at its ${K.pc(b6.cutoff)} cut-off, gives ${rowBill[1]} on the same sum. This page ranks no bank and links to none: you type the offers you hold, and the calculator lines them up.`,
  faqs: [
    { q: 'Is a longer fixed deposit tenor always the better deal?', a: `No. A longer tenor fixes the rate for longer, which helps if rates fall and costs you if they rise. In ${D.q}, the MAS average for 3-month deposits was ${K.pc(D.fd3)} and for 12-month deposits ${K.pc(D.fd12)}, so the shorter tenor paid ${D.fd3 >= D.fd12 ? 'at least as much' : 'less'} that quarter. Compare offers over the same months, with a realistic guess for the renewal rate.` },
    { q: 'What rate applies when a fixed deposit renews automatically?', a: 'The original offer covers its own tenor and nothing after it. When the deposit matures and rolls over, the rate is the one the bank sets for that tenor on the renewal day, which may sit well below a promotional rate. What happens at maturity follows the instruction recorded when you placed the deposit, so the renewal terms on your placement confirmation are the part to read.' },
    { q: 'How do I compare a 6-month offer with a 12-month offer?', a: `Put both on twelve months. The 12-month offer gives its rate once; the 6-month offer gives its rate for half a year and then whatever rate applies at renewal. With the MAS averages of ${D.q}, the second 6-month deposit would need ${K.pct(needed)} to match the 12-month deposit. If you expect a lower renewal rate, the longer offer comes out ahead.` },
    { q: 'Does splitting a large sum across two banks change the interest?', a: `Not by itself: the interest depends on the rate and tenor at each bank. What changes is deposit insurance, which covers up to ${K.sgd(lim)} per depositor per member bank, counting all your Singapore dollar savings, current and fixed deposits there. A sum above that limit placed at a single bank has an uninsured part; spread across two member banks, each part falls under its own limit.` },
  ],
  body: (h) => `
<h2>Two offers, one horizon</h2>
<p>Banks advertise a rate and a tenor, and the two travel together. A rate quoted for 3 months cannot be set against a rate quoted for 12 months as if the money were tied up for the same time. The fair test fixes a horizon first, here twelve months, then works out what each offer pays over it. For the shorter offer, that means assuming what happens when it matures: the calculator renews it at the same rate, with the interest added, which is the most favourable case for the short deposit.</p>
<p>With the MAS averages of ${D.q} plugged in, ${K.sgd(amt)} gives the result below. The figures change when MAS publishes a new quarter, and they are only placeholders: the point of the calculator is to replace them with the two quotes on your desk.</p>
${h.table(['Offer', 'Interest over 12 months'], [[String(rowA[0]), String(rowA[1])], [String(rowB[0]), String(rowB[1])], [String(rowBill[0]), String(rowBill[1])]], `${K.sgd(amt)}, each offer renewed at its own rate until twelve months are covered. Rates: MAS table III.3A averages for ${D.q}; T-bill cut-off of ${K.day(b6.auction)}.`, ['l', 'r'])}
${h.mini('fdcompare', { t: 'Your two offers over twelve months', p: ['r1', 'r2'], d: { amt: 50000, r1: D.fd6, m1: 6, r2: D.fd12, m2: 12 } })}

<h2>The renewal rate nobody quotes you</h2>
<p>A short deposit hides a second decision. Take a 6-month placement at ${K.pc(D.fd6)}: on ${K.sgd(amt)} it pays ${K.sgd2(first6.interest)} for the first half-year. A 12-month placement at ${K.pc(D.fd12)} pays ${K.sgd2(whole12.interest)} for the full year. For the two to end level, the money coming back after six months, interest included, must be placed again at ${K.pct(needed)} for the remaining six. Above that renewal rate the short route wins; below it, the long one does.</p>
<p>This break-even renewal rate is the most useful number when you weigh a short promotion against a longer plain offer. It turns a guess about the future into a single figure you can judge: is it likely that the bank, or another bank, will offer that much in six months? Nobody knows, but you can look at where the MAS averages have been over recent quarters on ${h.a('fixed-deposit-rates-singapore', 'the deposit rates page')} before you answer.</p>

<h2>Same rate, shorter tenor: the small compounding bonus</h2>
<p>If two offers carry the same rate, the shorter one pays slightly more over a year when it renews at that rate, because each renewal puts the interest to work. At ${K.pc(D.fd12)}, four 3-month deposits in a row earn ${same.rows[0][1]} on ${K.sgd(amt)}, against ${same.rows[1][1]} for one 12-month deposit, a gap of ${K.sgd2(sameGap)}. At deposit rates of this size the effect is small. It never makes up for a lower renewal rate, which is the real risk of the short tenor.</p>

<h2>Terms that change what you keep</h2>
<p>A quoted rate can depend on conditions that the rate itself does not show. Before typing an offer into the calculator, it is worth reading the placement terms for a few points:</p>
<ul>
<li>the minimum and maximum sums the rate applies to, and the rate for any amount outside that band;</li>
<li>whether the rate is reserved for money that is new to the bank;</li>
<li>what happens to the interest if you withdraw before maturity;</li>
<li>the renewal instruction, and the rate that applies after the first tenor.</li>
</ul>
<p>Enter the rate you actually qualify for, for the sum you actually place. Two offers whose conditions you meet are worth comparing; a third you cannot meet is not an offer for you.</p>

<h2>Where a T-bill enters the picture</h2>
<p>The last line of the calculator buys the latest 6-month Treasury bill twice, at its cut-off of ${K.pc(b6.cutoff)} from ${K.day(b6.auction)}. It is there as a yardstick from outside the banking system: a bill backed by the Singapore Government, bought at auction, with no bank fee counted here, since MAS publishes none. Its yield is set at each auction, so the second purchase would not repeat the first rate. ${h.a('t-bill-vs-fixed-deposit', 'The T-bill and deposit comparison')} covers what else differs, from price to liquidity.</p>

<h2>Why no bank is ranked here</h2>
<p>A ranking of banks goes stale in days, and it compares offers whose conditions differ from one reader to the next. We publish the MAS averages from ${h.src('mas_msb_iii3a', 'table III.3A')}, which describe what deposits pay across the full banks, and a calculator that puts any two offers on equal terms. Deposits in Singapore dollars are insured up to ${K.sgd(lim)} per depositor per member bank under the scheme run by ${h.src('sdic', 'SDIC')}, and interest from approved banks is not taxable for individuals according to ${h.src('iras_interest', 'IRAS')}. Beyond that, the choice is yours.</p>`,
  tool: 'fdcompare',
  toolArg: { amt, r1: D.fd3, m1: 3, r2: D.fd12, m2: 12 },
  related: ['fixed-deposit-rates-singapore', 't-bill-vs-fixed-deposit', 'best-savings-account-singapore', 'sdic-deposit-insurance', 'ssb-vs-fixed-deposit'],
  sources: ['mas_msb_iii3a', 'sdic', 'iras_interest', 'mas_tbill'],
});
