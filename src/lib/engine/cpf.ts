/**
 * CPF interest (CPF Board rates and extra-interest rules, params-2026.json > cpf), retirement sums and the
 * CPF LIFE estimate table (params-2026.json > retirement, life), and the cost of using OA money for a T-bill.
 * Interest is worked out on balances that stay put for the year: CPF computes it monthly on the lowest
 * balance and credits it at the end of the year, so a balance that does not move gives the same figure.
 */
import P from '../../data/params-2026.json';
import { buy } from './tbill';

export interface CpfIn { age55: boolean; oa: number; sa: number; ma: number; ra: number }
const R = P.cpf.rates, X = P.cpf.extra;
const r2 = (x: number) => Math.round(x * 100) / 100;

/** Extra interest on combined balances, OA counted up to its cap. */
export function extraInterest(b: CpfIn) {
  const counted = Math.min(b.oa, X.oaCap) + b.sa + b.ma + b.ra;
  if (!b.age55) return r2(Math.min(counted, X.under55.on) * X.under55.rate);
  const first = Math.min(counted, X.over55.first.on), next = Math.min(Math.max(0, counted - X.over55.first.on), X.over55.next.on);
  return r2(first * X.over55.first.rate + next * X.over55.next.rate);
}
export function cpfInterest(b: CpfIn) {
  const oa = r2(b.oa * R.oa), sa = r2(b.sa * R.sa), ma = r2(b.ma * R.ma), ra = r2(b.ra * R.ra);
  const extra = extraInterest(b);
  const lines: Array<[string, number]> = [['Ordinary Account', oa]];
  if (b.sa) lines.push(['Special Account', sa]);
  if (b.ra) lines.push(['Retirement Account', ra]);
  lines.push(['MediSave Account', ma], ['Extra interest', extra]);
  const base = r2(oa + sa + ma + ra);
  return { base, extra, total: r2(base + extra), lines };
}

/** Balances at 55 with constant rates and yearly additions split like today's balances. */
export function cpfProject(age: number, b: { oa: number; sa: number; ma: number }, add: number) {
  const years = Math.max(0, 55 - Math.round(age));
  let { oa, sa, ma } = b;
  const tot0 = oa + sa + ma || 1;
  const share = { oa: b.oa / tot0, sa: b.sa / tot0, ma: b.ma / tot0 };
  let added = 0;
  for (let k = 0; k < years; k++) {
    const i = cpfInterest({ age55: false, oa, sa, ma, ra: 0 });
    oa += oa * R.oa + add * share.oa;
    sa += sa * R.sa + add * share.sa + i.extra; // all extra interest credited to the SA here
    ma += ma * R.ma + add * share.ma;
    added += add;
    if (ma > P.cpf.bhs) { sa += ma - P.cpf.bhs; ma = P.cpf.bhs; }
  }
  const total = Math.round(oa + sa + ma);
  return { oa: Math.round(oa), sa: Math.round(sa), ma: Math.round(ma), total, interest: Math.round(total - (b.oa + b.sa + b.ma) - added), year55: P.year + years };
}

/** Where a sum set aside at 55 lands against the retirement sums of the year. */
export function retirementCheck(ra: number) {
  const { brs, frs, ers } = P.retirement;
  const label = ra >= ers ? 'Above the Enhanced Retirement Sum by' : ra >= frs ? 'Above the Full Retirement Sum by' : ra >= brs ? 'Short of the Full Retirement Sum by' : 'Short of the Basic Retirement Sum by';
  const gap = ra >= ers ? ra - ers : ra >= frs ? ra - frs : ra >= brs ? frs - ra : brs - ra;
  return { label, gap, withdrawable: Math.max(0, ra - frs) };
}

/** CPF LIFE Standard plan estimate, interpolated between the rows of the CPF Board table (RA at 55 → monthly from 65). */
export function lifePayout(ra: number) {
  const t = P.life.rows as Array<[number, number, number]>;
  if (ra < t[0][0] || ra > t[t.length - 1][0]) return null;
  let k = 0; while (k < t.length - 2 && ra > t[k + 1][0]) k++;
  const [a, l1, h1] = t[k], [b, l2, h2] = t[k + 1];
  const f = (ra - a) / (b - a);
  const low = Math.round(l1 + f * (l2 - l1)), high = Math.round(h1 + f * (h2 - h1));
  return { low, high, rows: t.map(([x, l, h]) => [`RA of S$${x.toLocaleString('en-SG')} at 55`, l === h ? `S$${l.toLocaleString('en-SG')}` : `S$${l.toLocaleString('en-SG')} to S$${h.toLocaleString('en-SG')}`] as [string, string]) };
}

/**
 * OA money in a T-bill. The OA pays interest monthly on the lowest balance, so money that leaves during a
 * month earns nothing for that month, and money that comes back mid-month earns nothing until the next one.
 * `monthsOut` = bill length in months + 1, the usual count for a bill paid and redeemed mid-month.
 */
export function oaVersusBill(amount: number, y: number, days: number) {
  const b = buy(amount, y, days, 0);
  const monthsOut = Math.round(days / 30.4) + 1;
  const oaInterest = r2(b.cost * R.oa * monthsOut / 12);
  const charges = r2(P.tbill.cpfCharges);
  const gain = r2(b.interest - charges - oaInterest);
  // yield at which the bill's interest covers the OA interest lost and the charges
  let lo = 0, hi = 10;
  for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; const bb = buy(amount, m, days, 0); const g = bb.interest - charges - bb.cost * R.oa * monthsOut / 12; if (g > 0) hi = m; else lo = m; }
  return { billInterest: b.interest, oaInterest, charges, gain, monthsOut, breakEven: Math.round(hi * 100) / 100, note: P.tbill.cpfNote };
}
