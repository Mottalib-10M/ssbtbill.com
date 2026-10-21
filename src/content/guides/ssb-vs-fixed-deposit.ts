import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const S = K.LATEST, SB = K.P.ssb;
const dep = K.dep();
const Q = K.DEPOSITS.quarters.slice(-6).reverse();
// Worked case of this page: S$75,000 for four years.
const amt = 75000, yrs = 4;
const ssbInt = (y: number) => K.compare(amt, y, dep.fd12 / 100, false).find((p) => p.key === 'ssb')!.interest;
const fdInt = (rate: number, y: number) => K.fd(amt, rate, y * 12, true).interest;
// Fixed deposit rate, renewed yearly with interest added, that earns as much as the bond over y years.
const breakEven = (y: number) => {
  const target = ssbInt(y);
  let lo = 0, hi = 0.1;
  for (let k = 0; k < 40; k++) { const mid = (lo + hi) / 2; if (fdInt(mid, y) < target) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
};
const H = [1, 2, 3, 4, 5, 7].map((y) => ({ y, ssb: ssbInt(y), fd: fdInt(dep.fd12 / 100, y), be: breakEven(y) }));
const four = H[3];
const be1 = H[0].be;
const insured = Math.min(amt, K.P.sdic.limit);

export default defineGuide({
  id: 'ssb-vs-fixed-deposit',
  group: 'ssb',
  order: 90,
  slug: 'ssb-vs-fixed-deposit',
  nav: 'SSB vs fixed deposit',
  card: 'Bond coupons against bank deposit rates on the same sum',
  title: 'SSB vs Fixed Deposit 2026: Bond Coupons Against Bank Rates',
  description: `SSB vs fixed deposit 2026: ${S.code} averages ${K.pc(S.avg[3])} a year over 4 years, the MAS 12-month deposit average is ${K.pc(dep.fd12)}. The deposit rate that would match it.`,
  h1: 'Savings Bond or fixed deposit: which rate it takes to break even',
  intro: `Enter a sum, a number of years and the fixed deposit rate you were offered. The calculator sets that offer against the latest Savings Bond, a 6-month T-bill and CPF.`,
  resume: `On ${K.sgd(amt)} for four years, the ${K.month(S.issue)} Savings Bond earns ${K.sgd(four.ssb)} after its ${K.sgd(SB.fee)} fee, an average of ${K.pc(S.avg[3])} a year. A fixed deposit renewed every year at ${K.pc(dep.fd12)}, the MAS average rate for 12-month deposits in ${dep.q}, earns ${K.sgd(four.fd)} over the same four years. To match the bond, the deposit would need about ${K.pct(four.be)} a year, renewed at that rate each year. Over a single year, the break-even rate is lower, about ${K.pct(be1)}, because the bond's first coupon is its smallest. The MAS averages for ${dep.q} were ${K.pc(dep.fd3)} for 3 months, ${K.pc(dep.fd6)} for 6 months and ${K.pc(dep.fd12)} for 12 months, while banks also run their own promotions above or below those levels. The two products protect money differently. Deposits are insured up to ${K.sgd(K.P.sdic.limit)} per depositor per bank under the Deposit Insurance Scheme; a Savings Bond is not a deposit and is backed by the Singapore Government itself. A bond can be redeemed in any month with its interest; breaking a fixed deposit usually costs some or all of the interest.`,
  faqs: [
    { q: 'What fixed deposit rate would match the Savings Bond over four years?', a: `About ${K.pct(four.be)} a year on ${K.sgd(amt)}, with the deposit renewed every twelve months and its interest added, against ${K.sgd(four.ssb)} from ${S.code} after the fee. The MAS average for 12-month deposits in ${dep.q} was ${K.pc(dep.fd12)}. A promotional offer above the break-even rate earns more over that span, if it can be renewed at the same rate each year.` },
    { q: 'Is a Savings Bond protected the way a bank deposit is?', a: `Not by the same scheme. The Deposit Insurance Scheme run by SDIC covers Singapore dollar deposits up to ${K.sgd(K.P.sdic.limit)} per depositor per member bank and excludes investment products and securities. A Savings Bond is a government security, so it falls outside deposit insurance, but its principal and interest are backed by the Singapore Government directly.` },
    { q: 'Why compare against the MAS average rather than a bank promotion?', a: 'Because promotions change often, come with conditions and differ by bank, while the MAS figure is one published series for all commercial banks, quarter by quarter. It shows the level most deposits actually earn. The calculator lets you type the rate of any offer you hold, so the average is a starting point rather than the answer.' },
    { q: 'What happens to the interest if I need the money before the end?', a: `With a Savings Bond, you redeem in any month and keep the coupons already paid plus accrued interest, less a ${K.sgd(SB.redemptionFee)} fee, with the cash arriving by the second business day of the next month. With a fixed deposit, the rules are the bank's own: breaking it early usually forfeits some or all of the interest. Check the terms of your deposit before comparing.` },
  ],
  body: (h) => `
<h2>The deposit rate that matches the bond, year by year</h2>
<p>A fixed deposit pays one rate for its tenor and nothing changes until it matures. A Savings Bond pays a rising coupon. So the break-even deposit rate depends on how long you compare: over one year, the deposit only has to beat the bond's first coupon; over four, it has to match an average that includes three higher coupons. The table runs ${K.sgd(amt)} through both, with the deposit renewed every twelve months at the same rate and its interest added each time.</p>
${h.table(['Years', `Savings Bond ${S.code}, after fee`, `Deposit at ${K.pc(dep.fd12)}, renewed`, 'Deposit rate needed to match'], H.map((r) => [String(r.y), K.sgd(r.ssb), K.sgd(r.fd), K.pct(r.be)]), `${K.sgd(amt)}. Deposit rate: MAS table III.3A average for 12-month deposits, ${dep.q}. Bond coupons from the MAS statistics API.`, ['r', 'r', 'r', 'r'])}
<p>The last column climbs with the horizon, which is the step-up showing through. It is also the most useful number on the page when a bank quotes a rate: an offer above the break-even line for your horizon earns more than the bond, provided it can be renewed at that rate, which a promotion often cannot. Banks set their own promotional rates and change them often; this site lists no bank and ranks none.</p>
${h.mini('fd', { t: 'A six-month deposit at the MAS average', p: ['rt'], d: { amt, rt: dep.fd6, mo: 6 } })}

<h2>What banks paid on average, quarter by quarter</h2>
<p>MAS publishes, every quarter, the deposit rates of commercial banks for Singapore dollar deposits by tenor, in table III.3A of its Monthly Statistical Bulletin. The figures below are the last six quarters. They are averages across banks, not the headline rate of any single offer.</p>
${h.table(['Quarter', '1 month', '3 months', '6 months', '12 months', 'Savings'], Q.map((q) => [q.q, K.pc(q.fd1), K.pc(q.fd3), K.pc(q.fd6), K.pc(q.fd12), K.pc(q.sav)]), `Commercial banks, Singapore dollar deposits. Source: ${'MAS Monthly Statistical Bulletin, table III.3A'}.`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>${dep.fd3 > dep.fd12 ? 'The pattern across tenors is not the textbook one.' : 'Longer tenors paid at least as much as shorter ones, as the textbook expects.'} In ${dep.q}, the 3-month average was ${dep.fd3 > dep.fd12 ? 'higher than' : dep.fd3 < dep.fd12 ? 'lower than' : 'equal to'} the 12-month average, ${K.pc(dep.fd3)} against ${K.pc(dep.fd12)}, and the average savings account paid ${K.pc(dep.sav)}. A Savings Bond's first coupon, ${K.pc(S.coupon[0])} for ${S.code}, is ${S.coupon[0] > dep.fd12 ? 'above' : S.coupon[0] < dep.fd12 ? 'below' : 'level with'} the 12-month average; its four-year average, ${K.pc(S.avg[3])}, is the figure to set against a deposit renewed over four years (${h.src('mas_msb_iii3a', 'MAS, table III.3A')}).</p>

<h2>Insurance, government backing and liquidity</h2>
<p>A fixed deposit with a Deposit Insurance Scheme member is insured up to ${K.sgd(K.P.sdic.limit)} per depositor per bank, all accounts at that bank added together. On ${K.sgd(amt)} at one bank, ${K.sgd(insured)} is covered. A Savings Bond sits outside that scheme, which excludes securities, but it is an obligation of the Singapore Government, which holds the top AAA rating from the international agencies, according to MAS. The two protections are different in kind: one is an insurance fund for bank failures, the other is the issuer itself (${h.src('sdic', 'SDIC, deposit insurance FAQ')}).</p>
<p>Liquidity differs as much. A Savings Bond is redeemed in any month at face value, with the coupons already paid and the interest accrued, less a ${K.sgd(SB.redemptionFee)} fee; the cash arrives by the second business day of the next month, so the wait can be up to about five weeks. A fixed deposit can usually be broken at short notice, but on the bank's terms, which commonly mean losing part or all of the interest. Neither choice is free: one costs time, the other costs interest.</p>
${h.mini('ssb', { t: 'Four years in the current bond on the same sum', p: ['amt'], d: { amt, yrs } })}

<h2>Limits, tax and renewal</h2>
<p>A person can hold at most ${K.sgd(SB.maxHolding)} of Savings Bonds, and a busy month may cut an application, as the ${h.a('ssb-allotment', 'allotment page')} shows; a deposit has no such ceiling but loses insurance above ${K.sgd(K.P.sdic.limit)} per bank. Tax treats both alike for an individual: IRAS lists interest from deposits with approved banks and from debt securities among income that is not taxable (${h.src('iras_interest', 'IRAS, interest')}).</p>
<p>The two ceilings matter most for larger sums. Take ${K.sgd(150000)}: it fits inside the Savings Bond limit in a month that is not oversubscribed, while in a single bank deposit only ${K.sgd(Math.min(150000, K.P.sdic.limit))} of it would be insured, so a depositor wanting full cover would spread it over two banks. The bond is also bought in lots of ${K.sgd(SB.lot)}, and an amount that is not a multiple is rounded down by the calculator; deposit minimums and tenors are set by each bank.</p>
<p>Renewal is the hidden variable. The bond's ten coupons are known today. A deposit renewed each year will earn whatever the bank offers at each renewal, which the table above assumes stays at today's rate. The ${h.a('fixed-deposit-rates-singapore', 'fixed deposit rates page')} tracks the MAS averages over a longer period, and the ${h.a('ssb-vs-t-bill', 'Savings Bond and T-bill comparison')} runs the bond against the latest bill on the same logic.</p>`,
  tool: 'compare',
  toolArg: { amt, yrs },
  related: ['fixed-deposit-rates-singapore', 'ssb-vs-t-bill', 'sdic-deposit-insurance', 'ssb-early-redemption', 'ssb-interest-rate'],
  sources: ['mas_msb_iii3a', 'sdic', 'mas_ssb', 'mas_ssb_redeem', 'iras_interest'],
});
