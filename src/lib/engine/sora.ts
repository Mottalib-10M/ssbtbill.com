/** SORA (MAS): latest overnight and 3-month compounded values, read at build time from src/data/sora.json. */
import D from '../../data/sora.json';
export interface SoraDay { date: string; overnight: number; c1m: number | null; c3m: number | null; c6m: number | null }
export const SORA = { read: (D as { meta: { read: string } }).meta.read, days: (D as { days: SoraDay[] }).days };
export const latestSora = () => SORA.days[SORA.days.length - 1];
const pay = (p: number, r: number, n: number) => (r === 0 ? p / n : (p * r) / (1 - Math.pow(1 + r, -n)));
/** Instalment of a loan at 3M compounded SORA + spread (decimals), with ±0.5 point. */
export function soraLoan(amount: number, spread: number, years: number) {
  const d = latestSora();
  if (!d || d.c3m === null) return null;
  const rate = d.c3m / 100 + spread, n = Math.max(1, Math.round(years * 12));
  return { date: d.date, sora3m: d.c3m / 100, overnight: d.overnight / 100, rate, monthly: Math.round(pay(amount, rate / 12, n)), up: Math.round(pay(amount, (rate + 0.005) / 12, n)), down: Math.round(pay(amount, Math.max(0, rate - 0.005) / 12, n)) };
}
