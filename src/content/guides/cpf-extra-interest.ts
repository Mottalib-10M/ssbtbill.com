import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const C = K.P.cpf, X = C.extra, R = C.rates;
const maxYoung = X.under55.rate * X.under55.on;
const maxOld = X.over55.first.rate * X.over55.first.on + X.over55.next.rate * X.over55.next.on;
const capOld = X.over55.first.on + X.over55.next.on;
// Five members, each one showing a different cap at work. `rest` = SA, MA and RA together.
const cases: Array<[string, boolean, number, number]> = [
  ['Under 55, savings mostly in the OA', false, 25000, 0],
  ['Under 55, OA small, other accounts large', false, 8000, 70000],
  ['Under 55, OA above its cap', false, 50000, 30000],
  ['55 or older, modest balances', true, 10000, 25000],
  ['55 or older, Full Retirement Sum set aside', true, 40000, 200000],
];
const rows = cases.map(([label, o55, oa, rest]) => {
  const r = K.cpf({ age55: o55, oa, sa: rest, ma: 0, ra: 0 });
  const counted = Math.min(Math.min(oa, X.oaCap) + rest, o55 ? capOld : X.under55.on);
  return [label, K.sgd(oa), K.sgd(rest), K.sgd(counted), K.sgd(r.extra)];
});
const ex = K.cpf({ age55: false, oa: 18000, sa: 52000, ma: 0, ra: 0 });
// The same S$70,000 of savings the year before and the year after 55 (SA moved to the RA at 55).
const before = K.cpf({ age55: false, oa: 15000, sa: 55000, ma: 0, ra: 0 });
const after = K.cpf({ age55: true, oa: 15000, sa: 0, ma: 0, ra: 55000 });
// Share of extra interest in a year's total, for a small and a large set of balances.
const small = K.cpf({ age55: false, oa: 20000, sa: 25000, ma: 15000, ra: 0 });
const large = K.cpf({ age55: false, oa: 120000, sa: 150000, ma: 70000, ra: 0 });

export default defineGuide({
  id: 'cpf-extra-interest',
  group: 'cpf',
  order: 20,
  slug: 'cpf-extra-interest',
  nav: 'CPF extra interest',
  card: 'The 1 % and 2 % on top, with the OA cap, worked out',
  title: 'CPF Extra Interest 2026: Rules Under 55 and From Age 55',
  description: `CPF extra interest in 2026: ${K.pct(X.under55.rate, 0)} on the first ${K.sgd(X.under55.on)} under 55, up to ${K.pct(X.over55.first.rate, 0)} from 55, with the OA counted up to ${K.sgd(X.oaCap)}. Work out the bonus on your balances.`,
  h1: 'CPF extra interest: who gets 1 %, who gets 2 %, and on what',
  intro: `Pick your age group, then enter your Ordinary Account balance and your other CPF accounts added together. The calculator applies the extra interest rules and the cap on the OA.`,
  resume: `CPF extra interest is a bonus paid by the Government on top of the normal CPF rates, on the first slices of a member's combined balances. Under 55, it is an extra ${K.pct(X.under55.rate, 0)} on the first ${K.sgd(X.under55.on)}; from 55, an extra ${K.pct(X.over55.first.rate, 0)} on the first ${K.sgd(X.over55.first.on)} and ${K.pct(X.over55.next.rate, 0)} on the next ${K.sgd(X.over55.next.on)}. In both cases the Ordinary Account (OA) counts only up to ${K.sgd(X.oaCap)}. That puts the most a member can earn at ${K.sgd(maxYoung)} a year under 55 and ${K.sgd(maxOld)} from 55. The bonus earned on OA money is not paid into the OA but into the Special Account (SA), or the Retirement Account (RA) from 55. A member under 55 with ${K.sgd(18000)} in the OA and ${K.sgd(52000)} elsewhere receives ${K.sgd(ex.extra)} of extra interest on top of ${K.sgd(ex.base)} of base interest. These rules apply for ${C.quarterLabel}, as set out in the CPF Board's release of 22 September 2026.`,
  faqs: [
    { q: 'How much of the Ordinary Account counts towards extra interest?', a: `Up to ${K.sgd(X.oaCap)}. OA savings above that sum still earn the normal OA rate of ${K.pct(R.oa, 1)}, but they do not count for the bonus. The rest of the sum that earns the bonus has to come from the Special, MediSave or Retirement Account for a member to reach the full extra interest.` },
    { q: 'Where is extra interest on Ordinary Account savings credited?', a: 'To the Special Account for members under 55, or to the Retirement Account for members aged 55 and above, not to the OA itself. The CPF Board does this to add to retirement savings. The money therefore earns the higher retirement rate from then on, but it can no longer be used like OA savings, for instance for housing payments.' },
    { q: 'Do savings used for CPF LIFE still earn extra interest?', a: `Yes. The CPF Board states that a member aged 55 or above who takes part in CPF LIFE still earns extra interest on combined CPF balances, including the savings used for CPF LIFE. Moving money into the annuity therefore does not remove it from the ${K.sgd(capOld)} that earns the bonus.` },
    { q: 'What is the most extra interest a CPF member can earn in a year?', a: `At the current rules, ${K.sgd(maxYoung)} under 55, which is ${K.pct(X.under55.rate, 0)} of ${K.sgd(X.under55.on)}, and ${K.sgd(maxOld)} from 55: ${K.pct(X.over55.first.rate, 0)} of the first ${K.sgd(X.over55.first.on)} plus ${K.pct(X.over55.next.rate, 0)} of the next ${K.sgd(X.over55.next.on)}. Reaching it takes combined balances of at least those sums, with no more than ${K.sgd(X.oaCap)} of them counted from the OA.` },
  ],
  body: (h) => `
<h2>Two schedules, one OA cap</h2>
<p>The bonus works on combined balances, not account by account. The CPF Board adds up a member's accounts, counting the OA only up to ${K.sgd(X.oaCap)}, and pays the extra rate on the first slices of that total. Below 55 there is a single slice: ${K.sgd(X.under55.on)} at an extra ${K.pct(X.under55.rate, 0)}. From 55 there are two: ${K.sgd(X.over55.first.on)} at an extra ${K.pct(X.over55.first.rate, 0)}, then ${K.sgd(X.over55.next.on)} at an extra ${K.pct(X.over55.next.rate, 0)}. Anything above those slices earns the normal rates only.</p>
<p>Added to the base rates of ${C.quarterLabel}, the first dollars of a member's savings therefore earn more than the headline figures. Under 55, OA money inside the cap earns ${K.pct(R.oa + X.under55.rate, 1)} in total and SA or MediSave money ${K.pct(R.sa + X.under55.rate, 1)}. From 55, the first slice earns up to ${K.pct(R.ra + X.over55.first.rate, 1)} on RA money. The CPF Board's top-up page, read on 21 October 2026, speaks of interest rates of up to 6 % a year on retirement savings, which is this sum of base and extra interest.</p>

<h2>Five members, five caps at work</h2>
${h.table(['Member', 'OA', 'SA, MA and RA', 'Counted for the bonus', 'Extra interest a year'], rows, `Extra interest at the rules of ${C.quarterLabel}, balances held all year. Source: CPF Board news release of 22 September 2026.`, ['l', 'r', 'r', 'r', 'r'])}
<p>The first line shows the OA cap alone: of ${K.sgd(25000)} in the OA, only ${K.sgd(X.oaCap)} counts. The second hits the overall ceiling: ${K.sgd(cases[1][2] + cases[1][3])} of savings, but only ${K.sgd(X.under55.on)} earns the bonus. The third combines both: the OA is cut to ${K.sgd(X.oaCap)} and the total falls short of the ceiling. From 55, the fourth member gets the higher rate on the first ${K.sgd(X.over55.first.on)} and the lower one on the rest, and the fifth reaches the maximum of ${K.sgd(maxOld)}.</p>
${h.mini('cpfextra', { t: 'The bonus from 55 on your balances', p: ['age', 'rest'], d: { age: 'o55', oa: 12000, rest: 45000 } })}

<h2>Where the bonus lands</h2>
<p>Extra interest earned because of OA savings is credited to the SA, or to the RA from 55, as the CPF Board explains on ${h.src('cpf_interest', 'its interest page')}. The intent is to grow retirement savings, and the effect is that the bonus earns the higher long-term rate afterwards. It also means that the bonus does not add to what is available in the OA for a home loan or an approved investment. Members who take part in CPF LIFE keep earning extra interest on their combined balances, and the CPF Board specifies that the savings used for CPF LIFE are included in them.</p>

<h2>What the OA cap means for an OA-heavy member</h2>
<p>For a member whose CPF sits mostly in the OA, for instance because it is kept for housing, the cap matters more than the rate. A member with ${K.sgd(60000)} in the OA and little elsewhere earns the bonus on ${K.sgd(X.oaCap)} only, ${K.sgd(X.oaCap * X.under55.rate)} a year, a third of the ${K.sgd(maxYoung)} available. The calculator above shows how the counted total changes as balances shift from the OA to the other accounts.</p>
${h.mini('cpfextra', { t: 'An OA-heavy member under 55', p: ['oa'], d: { age: 'u55', oa: 60000, rest: 6000 } })}

<h2>The year a member turns 55</h2>
<p>Turning 55 changes the schedule, not the cap on the OA. Take ${K.sgd(70000)} of savings, ${K.sgd(15000)} in the OA and ${K.sgd(55000)} in the SA. Under 55, the bonus is ${K.sgd(before.extra)} a year. Once the SA savings have moved into the new RA at 55, the same sum earns ${K.sgd(after.extra)} of extra interest, because the first ${K.sgd(X.over55.first.on)} now carries ${K.pct(X.over55.first.rate, 0)}. The base interest does not move, since the RA pays the same rate as the SA did: ${K.sgd(before.base)} before, ${K.sgd(after.base)} after.</p>

<h2>A bigger share of a small balance</h2>
<p>Because the bonus stops at a fixed sum, it weighs most for members with modest savings. With ${K.sgd(60000)} spread across the OA, SA and MediSave, extra interest is ${K.sgd(small.extra)} out of ${K.sgd(small.total)}, about ${K.pct(small.extra / small.total, 0)} of a year's interest. With ${K.sgd(340000)} in the same accounts, it is still ${K.sgd(large.extra)}, now ${K.pct(large.extra / large.total, 0)} of ${K.sgd(large.total)}. In dollars the bonus is capped; as a share of the total it shrinks as savings grow.</p>

<h2>How long the rules have held, and what can change</h2>
<p>The Government pays extra interest as part of its efforts to boost retirement savings, and the CPF Board restates the schedule with each quarterly announcement, together with the base rates, so the next release is where any change would appear. The figures on this page are read from ${h.src('cpf_pr_2026_09_22', 'the release of 22 September 2026')} and recalculated when a new one is published. ${h.a('cpf-interest-rate', 'The CPF interest rate page')} covers the base rates and their pegs.</p>`,
  tool: 'cpfextra',
  toolArg: { age: 'u55', oa: 18000, rest: 52000 },
  related: ['cpf-interest-rate', 'cpf-calculator', 'cpf-life-payout', 'cpf-sa-top-up', 'cpf-retirement-sum'],
  sources: ['cpf_pr_2026_09_22', 'cpf_interest', 'cpf_bhs_2026'],
});
