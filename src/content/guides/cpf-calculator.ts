import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const C = K.P.cpf, R = K.P.retirement;
const until = K.day(C.floors.smraFloorUntil);
// Worked case of this page: a member aged 42 with S$70,000 / S$55,000 / S$40,000 in OA, SA and MA, S$14,000 added a year.
const base = { age: 42, oa: 70000, sa: 55000, ma: 40000, add: 14000 };
const start = base.oa + base.sa + base.ma;
const years = 55 - base.age;
const run = (add: number, age = base.age) => {
  const r = K.tool('cpfproj', { ...base, age, add });
  const [oa, sa, ma] = r.rows.slice(0, 3).map((x) => Number(x[2]));
  const total = oa + sa + ma, y = 55 - age;
  return { oa, sa, ma, total, interest: total - start - add * y, label: r.label };
};
const main = run(base.add);
const adds = [0, 6000, base.add, 24000].map((a) => { const r = run(a); return [K.sgd(a), K.sgd(a * years), K.sgd(r.interest), K.sgd(r.total)]; });
const noAdd = run(0);
const early = run(base.add, 32);
// Projected SA and OA against the latest announced Full Retirement Sum (the member's own FRS, set for a later year, is not yet known).
const movable = main.sa + main.oa, overFrs = movable - R.next.frs;

export default defineGuide({
  id: 'cpf-calculator',
  group: 'cpf',
  order: 30,
  slug: 'cpf-calculator',
  nav: 'CPF calculator',
  card: 'Your balances projected to 55 at today’s CPF rates',
  title: 'CPF Calculator 2026: Project Your Balances and Interest',
  description: `CPF calculator for 2026: project your OA, SA and MediSave balances to age 55 at ${K.pct(C.rates.oa, 1)} and ${K.pct(C.rates.sa, 1)}, with extra interest, from the figures on your CPF statement.`,
  h1: 'CPF calculator: your balances at 55, from today’s statement',
  intro: `Enter your age, the three balances on your latest CPF statement and the total that goes into your accounts each year. The calculator rolls them forward at this quarter's rates to the year you turn 55.`,
  resume: `This CPF calculator projects the balances you already have, plus a yearly addition you enter, to the year you turn 55, at the CPF rates of ${C.quarterLabel}: ${K.pct(C.rates.oa, 1)} on the Ordinary Account (OA) and ${K.pct(C.rates.sa, 1)} on the Special (SA) and MediSave (MA) Accounts, with extra interest. It does not compute contributions from a salary: the yearly figure comes from your own statement. A member aged ${base.age} with ${K.sgd(start)} today and ${K.sgd(base.add)} added each year reaches about ${K.sgd(main.total)} at 55, of which ${K.sgd(main.interest)} is interest. Without any addition, the same balances grow to ${K.sgd(noAdd.total)}. The projection keeps today's rates every year, although the ${K.pct(C.floors.smra, 1)} floor on SA and MediSave savings is promised only to ${until}. It caps MediSave at the ${R.year} Basic Healthcare Sum of ${K.sgd(C.bhs)} and moves any excess to the SA. At 55, savings move to a new Retirement Account up to the Full Retirement Sum, ${K.sgd(R.frs)} for members turning 55 in ${R.year}.`,
  faqs: [
    { q: 'Does this CPF calculator work out contributions from my salary?', a: 'No. Contribution rates depend on wages, age and other rules, and this site does not compute them. The calculator starts from balances you read on your CPF statement and a yearly amount you enter, for instance the total credited to your accounts over the last twelve months. Everything after that is interest at the published CPF rates.' },
    { q: 'Why does the projection stop at age 55?', a: `Because the accounts change at 55. A Retirement Account is created, savings from the SA and then the OA move into it up to the Full Retirement Sum, and the SA is closed, with any remaining SA savings moving to the OA. A projection that kept the under-55 accounts beyond that age would describe accounts that no longer exist. The retirement sum page of this site covers what happens next.` },
    { q: 'What happens to MediSave savings above the Basic Healthcare Sum?', a: `MediSave contributions above a member's Basic Healthcare Sum are moved automatically to the member's other CPF accounts, according to the CPF Board. For members under 65 the BHS is adjusted every year; it was raised to ${K.sgd(C.bhs)} for ${R.year}. The calculator keeps that figure for every year and sends the excess to the SA, a simplification.` },
    { q: 'How reliable is a CPF projection made at today’s rates?', a: `It is a calculation, not a promise. The OA rate has a legislated minimum of ${K.pct(C.floors.oa, 1)}, but the ${K.pct(C.floors.smra, 1)} floor on SA and MediSave savings is set only to ${until}, and the extra interest schedule is restated by the CPF Board every quarter. Treat the result as what your balances become if nothing changes, then rerun it when the rates do.` },
  ],
  body: (h) => `
<h2>What the projection does, and what it leaves out</h2>
<p>The calculator takes three balances and a yearly addition and rolls them forward one year at a time, to the year you turn 55. Each year, the OA earns ${K.pct(C.rates.oa, 1)}, the SA and MediSave earn ${K.pct(C.rates.sa, 1)}, extra interest is added on the first ${K.sgd(C.extra.under55.on)} of combined balances, and your yearly addition is split across the three accounts in the same proportions as your balances today. That is all. It does not deduct housing payments from the OA, medical bills from MediSave or investments made through the CPF Investment Scheme, and it does not compute contributions from a salary.</p>
<p>Leaving salaries out is deliberate. Contribution rates depend on wages and age bands that change over a career, and any figure built from them would be a second guess on top of the first. Your CPF statement already shows what went into your accounts over the past year; that number, entered as the yearly addition, is a sounder base for a projection.</p>

<h2>A member aged ${base.age}, rolled forward to 55</h2>
<p>Start with ${K.sgd(base.oa)} in the OA, ${K.sgd(base.sa)} in the SA and ${K.sgd(base.ma)} in MediSave, ${K.sgd(start)} in all, and ${K.sgd(base.add)} added each year for ${years} years. At constant rates, the OA reaches ${K.sgd(main.oa)}, the SA ${K.sgd(main.sa)} and MediSave ${K.sgd(main.ma)}${main.ma >= C.bhs ? ', held at the Basic Healthcare Sum' : ''}. The total is ${K.sgd(main.total)}. Of that, ${K.sgd(base.add * years)} are the yearly additions and ${K.sgd(main.interest)} is interest.</p>
${h.mini('cpfproj', { t: 'Start the projection at another age', p: ['age'], d: { age: 30, oa: 25000, sa: 12000, ma: 15000, add: 9000 } })}

<h2>How much the yearly additions weigh</h2>
${h.table(['Added each year', `Added over ${years} years`, 'Interest earned', 'Total at 55'], adds, `Member aged ${base.age} with ${K.sgd(start)} today, rates of ${C.quarterLabel} held constant, MediSave capped at ${K.sgd(C.bhs)}.`, ['r', 'r', 'r', 'r'])}
<p>Interest grows with the additions because each year's money starts earning the following year. With nothing added, the balances still grow to ${K.sgd(noAdd.total)}, through interest alone. Starting earlier counts too: with the same balances and ${K.sgd(base.add)} a year from age 32, the total at 55 would be ${K.sgd(early.total)}.</p>
${h.mini('cpfproj', { t: 'Change the yearly addition', p: ['add'], d: { age: 47, oa: 90000, sa: 85000, ma: 60000, add: 10000 } })}

<h2>The assumptions behind the figure</h2>
<p>Three of them matter. First, the rates: the projection keeps ${K.pct(C.rates.oa, 1)} and ${K.pct(C.rates.sa, 1)} every year. The OA minimum is written into law, but the ${K.pct(C.floors.smra, 1)} floor on SA and MediSave savings has been extended only to ${until}; after that date, without a floor, those accounts would earn their peg, the 12-month average yield of 10-year government bonds plus 1 point. Second, extra interest: the calculator credits all of it to the SA, which matches what the CPF Board does with the bonus earned on OA money. Third, MediSave: the Basic Healthcare Sum is raised each year for members under 65, and contributions above it flow to other accounts. The projection holds it at the ${R.year} level of ${K.sgd(C.bhs)} and moves the excess to the SA.</p>

<h2>Setting the projection against a retirement sum</h2>
<p>In the worked case, the SA and OA together reach ${K.sgd(movable)} at 55. The member turns 55 in ${K.P.year + years}, and the Full Retirement Sum for that year has not been announced; the latest published figure is ${K.sgd(R.next.frs)}, for ${R.next.year}. Against that figure, the projected savings ${overFrs >= 0 ? `are ${K.sgd(overFrs)} above it` : `fall ${K.sgd(-overFrs)} short of it`}. The CPF Board adjusts the BRS and FRS every year to take account of inflation and life expectancy, so the member's own FRS, set closer to the time, can differ from the ${R.next.year} figure.</p>

<h2>Housing and other withdrawals</h2>
<p>When the OA also pays a home loan, every monthly instalment taken from it lowers the balance that earns interest. The calculator has no field for that, so the cleanest way to reflect it is in the inputs: enter the OA balance you expect to keep, and a yearly addition net of what leaves the OA each year for housing. The same applies to money moved out under the CPF Investment Scheme, which stops earning CPF interest while it is invested.</p>

<h2>What 55 changes</h2>
<p>At 55, a Retirement Account is opened. Savings from the SA, then from the OA, are moved into it up to the member's Full Retirement Sum; the SA is then closed and what is left in it goes to the OA, where savings above the FRS can be withdrawn. The FRS is fixed by the year you turn 55: ${K.sgd(R.frs)} for ${R.year} and ${K.sgd(R.next.frs)} for ${R.next.year}, with later years announced ahead of time. ${h.a('cpf-retirement-sum', 'The retirement sum page')} sets a projected balance against those sums, and ${h.a('cpf-life-payout', 'the CPF LIFE page')} turns a Retirement Account into a monthly estimate. The rates used here come from ${h.src('cpf_pr_2026_09_22', 'the CPF Board release of 22 September 2026')}, and the Basic Healthcare Sum from ${h.src('cpf_bhs_2026', 'its release of 15 December 2025')}.</p>`,
  tool: 'cpfproj',
  toolArg: { age: base.age, oa: base.oa, sa: base.sa, ma: base.ma, add: base.add },
  related: ['cpf-interest-rate', 'cpf-extra-interest', 'cpf-retirement-sum', 'cpf-life-payout', 'cpf-sa-top-up'],
  sources: ['cpf_pr_2026_09_22', 'cpf_bhs_2026', 'cpf_55', 'cpf_interest'],
});
