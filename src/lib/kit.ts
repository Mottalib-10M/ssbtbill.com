/**
 * Writing kit (CONTRIBUTING-PAGES.md): every figure written in a page comes from here, never typed by hand.
 *   K.P                    params-2026.json (SSB and T-bill rules, CPF rates and sums, SDIC, fees, sources)
 *   K.ISSUES, K.ssb(code)  every Savings Bond issue (coupons, averages, dates, amounts); K.LATEST, K.ALLOTTED
 *   K.yby(code, amt, yrs)  interest year by year; K.redeem(code, amt, months); K.allot(code, amt)
 *   K.bill('6M'|'1Y')      latest auction; K.bills(term), K.yearBills(term, y), K.upcoming(), K.estimate(term)
 *   K.buy(face, y, days)   cost, interest, yearly return; K.price(y, days); K.roc(price, days)
 *   K.cpf({...})           CPF interest on balances; K.oaBill(amt, y, days); K.SORA, K.sora() latest day, K.soraLoan
 *   K.DEPOSITS, K.dep()    MAS table III.3A bank deposit rates by quarter (per cent), latest quarter
 *   K.CAL                  announced calendar: K.CAL.ssb (next issues, lastDay, allotment, issue), K.CAL.bills (next auctions)
 *   K.tool(kind, args)     runs a calculator of tool-specs.ts and returns its result card
 *   formats                K.sgd, K.sgd2, K.pct (decimal), K.pc (per cent as MAS writes it), K.num, K.dec, K.day, K.month, K.mn
 */
import P from '../data/params-2026.json';
import CAL from '../data/calendar.json';
import { ISSUES, LATEST_ISSUE, LAST_ALLOTTED, byCode, yearByYear, redeemAfter, allotmentFor, oversubscribed, SSB_READ } from './engine/ssb';
import { BILLS_READ, latestBill, doneBills, yearBills, upcoming, naiveEstimate, buy, priceFromYield, returnOnCash, rollover } from './engine/tbill';
import { cpfInterest, oaVersusBill, lifePayout, retirementCheck } from './engine/cpf';
import { SORA, latestSora, soraLoan } from './engine/sora';
import { depositInterest, tieredInterest, DEPOSITS, latestDeposits } from './engine/deposit';
import { getTool, comparePlaces } from './tool-specs';
import { sgd, sgd2, pct, pc, num, dec, day, month, monthShort, mn } from './fmt';
import type { V } from './tool-types';

const need = (code: string) => { const i = byCode(code); if (!i) throw new Error(`Unknown SSB issue ${code}`); return i; };
function tool(kind: string, args: V = {}) {
  const spec = getTool(kind);
  const v: V = { ...Object.fromEntries(spec.inputs.map((i) => [i.id, i.def])), ...args };
  return spec.run(v);
}
export const KIT = {
  P, CAL, ISSUES, LATEST: LATEST_ISSUE, ALLOTTED: LAST_ALLOTTED, ssb: need, oversubscribed, SSB_READ, BILLS_READ,
  yby: (code: string, amt: number, yrs = 10) => yearByYear(need(code), amt, yrs),
  redeem: (code: string, amt: number, months: number) => redeemAfter(need(code), amt, months, P.ssb.fee),
  allot: (code: string, amt: number) => allotmentFor(need(code), amt, P.ssb.maxHolding),
  /** Issue whose issue date starts with "YYYY-MM". */
  ssbOf: (ym: string) => { const i = ISSUES.find((x) => x.issue.startsWith(ym)); if (!i) throw new Error(`No SSB issued in ${ym}`); return i; },
  bill: latestBill, bills: doneBills, yearBills, upcoming, estimate: naiveEstimate,
  buy: (face: number, y: number, days: number) => buy(face, y, days, P.tbill.fee), price: priceFromYield, roc: returnOnCash, rollover,
  cpf: cpfInterest, oaBill: oaVersusBill, life: lifePayout, rs: retirementCheck, SORA, sora: latestSora, soraLoan, DEPOSITS, dep: latestDeposits,
  fd: depositInterest, tiers: tieredInterest, compare: comparePlaces, tool,
  sgd, sgd2, pct, pc, num, dec, day, month, monthShort, mn,
};
export type Kit = typeof KIT;
