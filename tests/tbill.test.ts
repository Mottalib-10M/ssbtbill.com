import { describe, expect, it } from 'vitest';
import { BILLS, priceFromYield, buy, naiveEstimate, latestBill, returnOnCash } from '../src/lib/engine/tbill';

describe('T-bill price = 100 × (1 − y × days ÷ 365), as MAS publishes it', () => {
  const done = BILLS.filter((b) => b.done);
  it('reproduces the published cut-off price of every auction since 2015', () => {
    expect(done.length).toBeGreaterThan(150);
    const off = done.filter((b) => Math.abs(priceFromYield(b.cutoff, b.days) - b.price) > 0.0015);
    expect(off.map((b) => `${b.code} ${b.cutoff} ${b.price} ${priceFromYield(b.cutoff, b.days)}`)).toEqual([]);
  });
  it('S$10,000 of the 26-week bill of 8 Oct 2026 (1.90 %, 182 days)', () => {
    const b = buy(10000, 1.9, 182, 0);
    expect(b.price).toBe(99.053);
    expect(b.cost).toBe(9905.3);
    expect(b.interest).toBe(94.7);
    expect(b.yearly).toBeCloseTo(returnOnCash(99.053, 182), 6);
    expect(b.yearly).toBeGreaterThan(0.019);
  });
  it('rounds the face value down to S$1,000 lots', () => { expect(buy(12500, 2, 182, 0).face).toBe(12000); });
  it('naive estimate uses the last cut-off and measures its past error', () => {
    const e = naiveEstimate('6M');
    expect(e.estimate).toBe(latestBill('6M').cutoff);
    expect(e.count).toBeGreaterThan(10);
    expect(e.mae).toBeGreaterThan(0);
  });
});
