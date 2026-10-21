import { describe, expect, it } from 'vitest';
import { ISSUES, byCode, yearByYear, redeemAfter, allotmentFor } from '../src/lib/engine/ssb';

describe('Singapore Savings Bonds', () => {
  const nov = byCode('GX26110X')!;
  it('has every issue since October 2015 with ten coupons', () => {
    expect(ISSUES[0].issue).toBe('2015-10-01');
    for (const i of ISSUES) expect(i.coupon).toHaveLength(10);
  });
  it('coupons step up (never down) within an issue', () => {
    for (const i of ISSUES) for (let k = 1; k < 10; k++) expect(i.coupon[k], i.code).toBeGreaterThanOrEqual(i.coupon[k - 1]);
  });
  it('S$10,000 of the November 2026 issue: S$167 in year 1, sum of coupons over ten years', () => {
    const r = yearByYear(nov, 10000);
    expect(r[0].interest).toBe(167);
    expect(r[1].interest).toBe(200);
    expect(r[9].cumulative).toBeCloseTo(10000 * nov.coupon.reduce((s, c) => s + c, 0) / 100, 2);
  });
  it('redeeming after 12 months gives the two first-year coupons, less the fee', () => {
    const r = redeemAfter(nov, 10000, 12, 2);
    expect(r.couponsPaid).toBe(167);
    expect(r.accrued).toBe(0);
    expect(r.net).toBe(165);
  });
  it('redeeming after 3 months gives accrued interest only', () => {
    const r = redeemAfter(nov, 10000, 3, 0);
    expect(r.couponsPaid).toBe(0);
    expect(r.accrued).toBeGreaterThan(40);
    expect(r.accrued).toBeLessThan(43);
  });
  it('allotment of an oversubscribed issue (September 2022: S$13,000 in full)', () => {
    const s = byCode('GX22090Z')!;
    expect(allotmentFor(s, 50000, 200000)).toMatchObject({ known: true, sure: 13000, random: 500 });
    expect(allotmentFor(s, 10000, 200000)).toMatchObject({ sure: 10000, random: 0 });
  });
});
