/**
 * Singapore Savings Bonds: interest year by year, early redemption, allotment. Pure functions over
 * src/data/ssb.json (MAS statistics API, refreshed by scripts/update-data.mjs).
 *
 * Rules applied (MAS, "Singapore Savings Bonds", read 2026-10-21; values in params-2026.json > ssb):
 *  - coupon of year k is fixed at issue and paid in two halves, every six months from the issue date;
 *  - the bond can be redeemed in any month; the investor gets the principal plus interest accrued
 *    since the last coupon date (simple accrual on the half-year coupon, by days);
 *  - one transaction fee per application and per redemption request.
 */
import D from '../../data/ssb.json';

export interface SsbIssue {
  code: string; isin: string; announced: string; lastDay: string; allotment: string; issue: string; maturity: string; payMonths: string;
  size: number; applied: number; allotted: number; done: boolean; cutoff: number; randomRate: number; coupon: number[]; avg: number[];
}
export const ISSUES = (D.issues as SsbIssue[]).slice().sort((a, b) => a.issue.localeCompare(b.issue));
export const SSB_READ: string = D.meta.read;
export const byCode = (code: string) => ISSUES.find((i) => i.code === code);
/** The most recent issue whose rates are announced (it may still be open for applications). */
export const LATEST_ISSUE = ISSUES[ISSUES.length - 1];
/** The most recent issue whose allotment results are published. */
export const LAST_ALLOTTED = [...ISSUES].reverse().find((i) => i.done)!;
/** "2026-11" label used in tool options. */
export const issueMonth = (i: SsbIssue) => i.issue.slice(0, 7);

const iso = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const addMonths = (isoDate: string, k: number) => {
  const y = Number(isoDate.slice(0, 4)), m = Number(isoDate.slice(5, 7)) - 1 + k;
  return iso(y + Math.floor(m / 12), (m % 12 + 12) % 12 + 1, 1);
};
const days = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);

export interface YearRow { year: number; coupon: number; interest: number; cumulative: number; avgReturn: number }
/** Interest paid in each year held (coupons as decimals: 0.0167). Amount in S$. */
export function yearByYear(issue: SsbIssue, amount: number, years = 10): YearRow[] {
  const out: YearRow[] = [];
  let cum = 0;
  for (let k = 0; k < Math.min(10, Math.max(0, years)); k++) {
    const c = issue.coupon[k] / 100;
    // two half-year coupons, each rounded to the cent as paid
    const interest = 2 * Math.round(amount * c * 50) / 100;
    cum += interest;
    out.push({ year: k + 1, coupon: c, interest, cumulative: Math.round(cum * 100) / 100, avgReturn: issue.avg[k] / 100 });
  }
  return out;
}

export interface Redemption { months: number; couponsPaid: number; accrued: number; interest: number; fee: number; net: number; perYear: number; year: number; redeemOn: string }
/**
 * Redeem `months` after issue (1 to 120): coupons already received, interest accrued since the last coupon
 * (actual days on the half-year), less the fee. `perYear` = simple yearly return on the amount.
 */
export function redeemAfter(issue: SsbIssue, amount: number, months: number, fee: number): Redemption {
  const m = Math.max(1, Math.min(120, Math.round(months)));
  const halves = Math.floor(m / 6);
  let paid = 0;
  for (let h = 0; h < halves; h++) paid += Math.round(amount * (issue.coupon[Math.floor(h / 2)] / 100) * 50) / 100;
  let accrued = 0;
  const redeemOn = addMonths(issue.issue, m);
  if (m % 6 && m < 120) {
    const start = addMonths(issue.issue, halves * 6), end = addMonths(issue.issue, halves * 6 + 6);
    const half = amount * (issue.coupon[Math.floor(halves / 2)] / 100) / 2;
    accrued = Math.round(half * (days(start, redeemOn) / days(start, end)) * 100) / 100;
  }
  const interest = Math.round((paid + accrued) * 100) / 100;
  const net = interest - fee;
  return { months: m, couponsPaid: Math.round(paid * 100) / 100, accrued, interest, fee, net, perYear: amount > 0 ? net / amount / (m / 12) : 0, year: Math.floor((m - 1) / 12) + 1, redeemOn };
}

/** What an application of `amount` would have received in a past issue (S$). `random` = chance of one more S$500 lot. */
export function allotmentFor(issue: SsbIssue, amount: number, maxHolding: number) {
  const ask = Math.min(amount, maxHolding);
  if (!issue.done) return { known: false, sure: 0, random: 0, chance: 0 };
  const cut = Math.round(issue.cutoff * 1e6);
  if (ask <= cut || issue.randomRate === 0) return { known: true, sure: ask, random: 0, chance: 0 };
  return { known: true, sure: cut, random: 500, chance: issue.randomRate / 100 };
}
export const oversubscribed = (i: SsbIssue) => i.done && i.applied > i.size;

/** Switching: keep an old bond for `years` more, or redeem it and buy `fresh` for the same years. */
export function switchCompare(old: SsbIssue, fresh: SsbIssue, amount: number, heldMonths: number, years: number, fee: number) {
  const start = Math.floor(heldMonths / 12);
  const yearsKept = Math.max(0, Math.min(10 - start, years));
  let keep = 0;
  for (let k = start; k < start + yearsKept; k++) keep += amount * old.coupon[k] / 100;
  let move = 0;
  for (let k = 0; k < Math.min(10, years); k++) move += amount * fresh.coupon[k] / 100;
  move -= 2 * fee;
  return { keep: Math.round(keep), move: Math.round(move), gain: Math.round(move - keep), yearsKept, coveredYears: Math.min(10, years) };
}
