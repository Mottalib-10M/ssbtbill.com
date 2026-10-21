/** Fixed deposits and savings accounts: simple interest at maturity, renewal, tiers. Rates are decimals. */
const c = (x: number) => Math.round(x * 100) / 100;
/** Interest of `amount` at `rate` for `months`. `renew` = placed again each 12 months with the interest added. */
export function depositInterest(amount: number, rate: number, months: number, renew: boolean) {
  const m = Math.max(1, Math.round(months));
  if (!renew) return { months: m, interest: c(amount * rate * m / 12) };
  let a = amount, left = m;
  while (left > 0) { const k = Math.min(12, left); a += c(a * rate * k / 12); left -= k; }
  return { months: m, interest: c(a - amount) };
}
/** Offers [rate, tenor months], each renewed at the same rate (interest added) to cover `horizon` months. */
export function compareOffers(amount: number, offers: Array<[number, number]>, horizon = 12) {
  return offers.map(([rate, months]) => {
    const t = Math.max(1, Math.round(months));
    let a = amount, done = 0;
    while (done < horizon) { const k = Math.min(t, horizon - done); a += c(a * rate * k / 12); done += k; }
    return { rate, months: t, year: c(a - amount) };
  });
}
/** Tiered account: [[tier size, rate]…], last tier may be Infinity. One year of interest. */
export function tieredInterest(balance: number, tiers: Array<[number, number]>) {
  let left = Math.max(0, balance);
  const parts: Array<[number, number, number]> = [];
  for (const [size, rate] of tiers) { if (left <= 0) break; const a = Math.min(left, size); parts.push([a, rate, c(a * rate)]); left -= a; }
  const interest = c(parts.reduce((s, p) => s + p[2], 0));
  return { interest, effective: balance > 0 ? interest / balance : 0, parts };
}

/** MAS Monthly Statistical Bulletin table III.3A: weighted average rates of all outstanding SGD deposits, quarterly, per cent. */
import DEP from '../../data/deposits.json';
export interface DepQuarter { q: string; fd1: number; fd3: number; fd6: number; fd12: number; sav: number; top12: number; topSav: number }
export const DEPOSITS = { read: (DEP as { meta: { read: string } }).meta.read, quarters: (DEP as { quarters: DepQuarter[] }).quarters };
export const latestDeposits = () => DEPOSITS.quarters[DEPOSITS.quarters.length - 1];
