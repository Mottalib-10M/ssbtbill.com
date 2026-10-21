/**
 * SGS T-bills (6-month and 1-year): price from the cut-off yield, what you pay and receive, the
 * yearly return on cash actually paid, and a naive estimate of the next cut-off with its past error.
 * Data: src/data/tbills.json (MAS statistics API). Price per S$100 as MAS publishes it:
 * 100 × (1 − yield × days ÷ 365), rounded to 3 decimals (checked on every auction in tests/tbill.test.ts).
 */
import D from '../../data/tbills.json';

export interface Bill {
  code: string; isin: string; term: '6M' | '1Y'; announced: string; auction: string; issue: string; maturity: string; days: number; done: boolean;
  cutoff: number; price: number; median: number; average: number; offered: number; allotted: number | null; bids: number; cover: number;
  ncAllotted: number; ncPct: number; cPct: number;
}
export const BILLS = (D.auctions as Bill[]).slice().sort((a, b) => a.auction.localeCompare(b.auction));
export const BILLS_READ: string = D.meta.read;
export const doneBills = (term: '6M' | '1Y') => BILLS.filter((b) => b.term === term && b.done);
export const latestBill = (term: '6M' | '1Y') => { const d = doneBills(term); return d[d.length - 1]; };
/** Auctions announced but not yet held (cut-off unknown). */
export const upcoming = () => BILLS.filter((b) => !b.done);

export const priceFromYield = (y: number, days: number) => Math.round(100 * (1 - (y / 100) * days / 365) * 1000) / 1000;
/** Yearly return on the cash paid: (100 − P) ÷ P × 365 ÷ days, as a decimal. */
export const returnOnCash = (price: number, days: number) => ((100 - price) / price) * (365 / days);

export interface Buy { face: number; cost: number; interest: number; fee: number; net: number; yearly: number; price: number }
/** Buy `face` (S$, multiple of 1,000) at cut-off yield y (%) for `days`; fee = bank fee in S$. */
export function buy(face: number, y: number, days: number, fee: number): Buy {
  const f = Math.max(0, Math.floor(face / 1000) * 1000);
  const price = priceFromYield(y, days);
  const cost = Math.round(f * price) / 100;
  const interest = Math.round((f - cost) * 100) / 100;
  const net = interest - fee;
  return { face: f, cost, interest, fee, net, yearly: cost > 0 ? (net / cost) * (365 / days) : 0, price };
}

/**
 * Rolling a bill over `years`: each 6-month bill is renewed at the same yield, the interest is added to
 * the next purchase. Returns the cash at the end and the gain (an illustration, labelled as such).
 */
export function rollover(cash: number, y: number, years: number, fee: number, termDays = 182) {
  let c = cash; const n = Math.round((years * 365) / termDays);
  for (let k = 0; k < n; k++) { const b = buy(c, y, termDays, fee); c = c - b.cost + b.face - fee; }
  return { end: Math.round(c), gain: Math.round(c - cash), rolls: n };
}

/** Next cut-off = last cut-off of the same term. Past error of that rule over the last `n` auctions. */
export function naiveEstimate(term: '6M' | '1Y', n = 26) {
  const d = doneBills(term);
  const last = d[d.length - 1];
  const errs: number[] = [];
  for (let k = Math.max(1, d.length - n); k < d.length; k++) errs.push(d[k].cutoff - d[k - 1].cutoff);
  const abs = errs.map(Math.abs).sort((a, b) => a - b);
  const mae = abs.reduce((s, x) => s + x, 0) / Math.max(1, abs.length);
  const p80 = abs[Math.min(abs.length - 1, Math.floor(abs.length * 0.8))] ?? 0;
  return { estimate: last.cutoff, from: last, mae, p80, count: errs.length, within10: abs.filter((x) => x <= 0.1 + 1e-9).length };
}

/** Cut-offs of a calendar year for a term. */
export const yearBills = (term: '6M' | '1Y', year: number) => doneBills(term).filter((b) => b.auction.startsWith(String(year)));
export const yearsCovered = (term: '6M' | '1Y') => [...new Set(doneBills(term).map((b) => Number(b.auction.slice(0, 4))))];
