import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const D = K.dep(), Q = K.DEPOSITS.quarters;
const S = K.LATEST, b6 = K.bill('6M'), SB = K.P.ssb;
// Example tiers used on this page (not an offer): a bonus of 2 % on the first S$50,000, the MAS average savings rate above it.
const bonus = 0.02, cap = 50000, base = D.sav / 100;
const tiers: Array<[number, number]> = [[cap, bonus], [Infinity, base]];
const amt = 65000;
const mine = K.tiers(amt, tiers);
const flat = K.tiers(amt, [[Infinity, base]]);
const ladder = [20000, 50000, 80000, 150000, 250000].map((b) => { const r = K.tiers(b, tiers); return [K.sgd(b), K.sgd2(r.interest), K.pct(r.effective)]; });
const big = K.tiers(150000, tiers);
const history = Q.slice(-8).reverse().map((q) => [q.q, K.pc(q.sav), K.pc(q.topSav)]);
const ssb1 = K.yby(S.code, 20000, 1)[0].interest;
const bill = K.buy(20000, b6.cutoff, b6.days);

export default defineGuide({
  id: 'best-savings-account-singapore',
  group: 'deposit',
  order: 30,
  slug: 'best-savings-account-singapore',
  nav: 'Savings account rates',
  card: 'Bonus tiers turned into one effective rate on your balance',
  title: 'Best Savings Account Singapore 2026: Tiers, Effective Rate',
  description: `Best savings account in Singapore for 2026: the MAS average was ${K.pc(D.sav)} in ${D.q}. Turn bonus tiers into one effective rate on your balance, cap included.`,
  h1: 'Savings accounts with bonus tiers: the rate your whole balance earns',
  intro: `Enter your balance, the bonus rate on the first tier, the size of that tier and the rate paid above it. The calculator returns a year of interest and the effective rate on the whole balance.`,
  resume: `The best savings account for a given balance is the one with the highest effective rate on that balance, not the highest headline rate, because bonus rates often stop at a cap. The average savings deposit at the full banks paid ${K.pc(D.sav)} a year in ${D.q}, according to MAS table III.3A, while the highest rate quoted for a new savings deposit that quarter was ${K.pc(D.topSav)}. Take an example account paying ${K.pct(bonus, 0)} on the first ${K.sgd(cap)} and the MAS average above it: a balance of ${K.sgd(amt)} earns ${K.sgd2(mine.interest)} in a year, an effective ${K.pct(mine.effective)}. At ${K.sgd(150000)}, the same tiers give only ${K.pct(big.effective)} on the whole balance. A plain account at the average rate earns ${K.sgd2(flat.interest)} on ${K.sgd(amt)}. Bonus rates often depend on conditions set by each bank, so type the rate you actually qualify for. We rank no bank.`,
  faqs: [
    { q: 'What is the effective rate on a tiered savings account?', a: `It is a year of interest divided by the whole balance. Each slice of the balance earns its own tier rate, and the effective rate mixes them. With ${K.pct(bonus, 0)} on the first ${K.sgd(cap)} and ${K.pc(D.sav)} above it, ${K.sgd(amt)} earns an effective ${K.pct(mine.effective)}. That is the number to compare with a fixed deposit or a T-bill, since those pay one rate on the full sum.` },
    { q: 'Does a bonus interest rate apply to the whole balance?', a: 'Usually not. A bonus is normally paid on a slice of the balance, up to a cap set by the bank, and the money above it earns a lower base rate. Some accounts also split the cap into several tiers with different rates. Read the tier table of the account and enter the first tier in the calculator; the money above it is what the second rate field is for.' },
    { q: 'Why does the MAS average savings rate look so low?', a: `Because it is a weighted average across every Singapore dollar savings balance at the full banks, up to the deposit insurance limit. Balances that earn only a base rate count in proportion to their size, whatever bonus rates are advertised. In ${D.q} that average was ${K.pc(D.sav)}, while the highest rate quoted for a new savings deposit was ${K.pc(D.topSav)}.` },
    { q: 'How fast can money come back from a savings account, a Savings Bond or a T-bill?', a: `A savings account balance can be withdrawn whenever the bank allows. A Savings Bond redeemed in a given month is paid back by the second business day of the next month, with a ${K.sgd(SB.redemptionFee)} fee. A T-bill pays its face value only at maturity; before that, it can only be sold at a market price at a bank's main branch.` },
  ],
  body: (h) => `
<h2>What a savings balance earns on average</h2>
<p>MAS publishes, every quarter, a weighted average rate for all Singapore dollar savings deposits held at the full banks, for balances up to the deposit insurance limit, and the highest rate any of those banks quoted for a new savings deposit. The gap between the two is wide, and it tells you something: the typical balance earns far less than the best advertised account. In ${D.q} the average was ${K.pc(D.sav)} and the top quote ${K.pc(D.topSav)}.</p>
${h.table(['Quarter', 'Average savings deposit rate', 'Highest quote, new savings deposit'], history, `Singapore dollar savings deposits at full banks, balances up to the deposit insurance limit. Source: MAS Monthly Statistical Bulletin table III.3A, read ${K.day(K.DEPOSITS.read)}.`, ['l', 'r', 'r'])}
<p>The top quote is a single rate, often for an account whose bonus depends on several conditions, and on a limited slice of the balance. Read it as the ceiling of what was on offer that quarter rather than as a rate you can expect on all your money.</p>

<h2>From tiers to a single rate</h2>
<p>Bonus accounts pay by slices. The first slice earns the bonus rate, the next slice a lower rate, and the rest the base rate. The figure that matters is the effective rate: total interest for the year divided by the whole balance. In the example used on this page, an account pays ${K.pct(bonus, 0)} on the first ${K.sgd(cap)} and the MAS average of ${K.pc(D.sav)} on anything above. On ${K.sgd(amt)}, that gives ${K.sgd2(mine.interest)} a year, or ${K.pct(mine.effective)} effective. Those tier values are an illustration, not the terms of any bank.</p>
${h.mini('tiers', { t: 'Effective rate on your balance', p: ['amt', 'b1'], d: { amt: 65000, b1: 2, t1: 50000, b2: D.sav } })}

<h2>The dollar above the cap</h2>
<p>Once the bonus tier is full, each extra dollar earns only the rate above the cap. That is why the effective rate falls as the balance grows, as the table shows with the same example tiers. At ${K.sgd(150000)}, two thirds of the money sits above the bonus slice and the effective rate drops to ${K.pct(big.effective)}. For a large balance, the question is less which account pays the highest bonus than where the money above the cap goes.</p>
${h.table(['Balance', 'Interest in a year', 'Effective rate'], ladder, `Example tiers: ${K.pct(bonus, 0)} on the first ${K.sgd(cap)}, ${K.pc(D.sav)} above (MAS average savings rate, ${D.q}). Simple interest over one year.`, ['l', 'r', 'r'])}
<p>The money above the cap can earn more elsewhere without leaving the banking system, in a ${h.a('fixed-deposit-rates-singapore', 'fixed deposit')}, or outside it. Comparing those options means comparing like with like: a year of interest on the same sum.</p>
${h.mini('tiers', { t: 'What the money above the cap earns', p: ['amt'], d: { amt: 150000, b1: 2, t1: 50000, b2: D.sav } })}

<h2>Conditions behind a bonus rate</h2>
<p>Banks often tie bonus rates to the way you use the account, and the conditions vary from one bank to the next and change over time. A rate you do not meet in a given month is not a rate you earn that month. The calculator has one field for the first tier because that is how the reader can test a real case: enter the rate that applies to you with the conditions you already meet, then try the rate you would get by meeting one more. The difference, in dollars over a year, tells you what the extra condition is worth.</p>

<h2>Three misreadings of a tier table</h2>
<p>The first is to read an advertised maximum as the rate on all your money. An advertised maximum is often reached only when every condition is met, and then only on the capped slice. The second is to add tier rates together across slices, as if the bonus of the first slice also applied to the second. Each slice earns its own rate and nothing more. The third is to compare an account's top tier with a fixed deposit rate. A deposit pays one rate on the whole sum, so the fair comparison is the account's effective rate on the same balance, which the calculator gives in the line below the result.</p>
<p>A quick check catches all three: multiply each slice by its own rate, add the results, and divide by the balance. If the answer differs a lot from the headline rate, the headline was describing a smaller balance than yours.</p>

<h2>Instant access against a little more yield</h2>
<p>A savings account is the only one of these places where money can leave the same day. A Savings Bond can be redeemed in any month, and MAS pays it back by the second business day of the following month; on ${K.sgd(20000)}, the ${K.month(S.issue)} issue pays ${K.sgd2(ssb1)} in its first year. A 6-month T-bill bought at the last cut-off of ${K.pc(b6.cutoff)} pays ${K.sgd2(bill.interest)} on the same face value, but only at maturity. ${h.a('singapore-savings-bonds', 'The Savings Bond page')} and ${h.a('t-bill-singapore', 'the T-bill page')} work these out on your amount.</p>

<h2>Insurance on a savings balance</h2>
<p>Singapore dollar savings accounts at a member bank are insured up to ${K.sgd(K.P.sdic.limit)} per depositor, counted together with fixed and current accounts at the same bank, under the scheme described by ${h.src('sdic', 'SDIC')}. Interest from approved banks is not taxable for individuals (${h.src('iras_interest', 'IRAS')}). The averages above are read from ${h.src('mas_msb_iii3a', 'MAS table III.3A')}, and ${h.a('sdic-deposit-insurance', 'the deposit insurance page')} works out the cover across two banks.</p>`,
  tool: 'tiers',
  toolArg: { amt, b1: 2, t1: cap, b2: D.sav },
  related: ['fixed-deposit-rates-singapore', 'best-fixed-deposit-singapore', 'sdic-deposit-insurance', 'singapore-savings-bonds', 't-bill-singapore'],
  sources: ['mas_msb_iii3a', 'sdic', 'iras_interest'],
});
