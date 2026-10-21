/**
 * The calculators of the site, one entry per subject. Every figure comes from the engine
 * (src/lib/engine/*), which reads ssb.json, tbills.json and params-2026.json. A spec lists its inputs
 * (visible first, `adv` ones folded) and a pure `run` that turns them into a result card.
 */
import P from '../data/params-2026.json';
import type { ToolSpec, V, Input, ToolOut } from './tool-types';
import { sgd, sgd2, pct, pc, num, day, month, monthShort, mn } from './fmt';
import { ISSUES, LATEST_ISSUE, LAST_ALLOTTED, byCode, yearByYear, redeemAfter, allotmentFor, switchCompare, oversubscribed, type SsbIssue } from './engine/ssb';
import { buy, latestBill, naiveEstimate, priceFromYield, returnOnCash, rollover, upcoming, doneBills, yearBills, type Bill } from './engine/tbill';
import { cpfInterest, cpfProject, oaVersusBill, retirementCheck, lifePayout, type CpfIn } from './engine/cpf';
import { depositInterest, tieredInterest, compareOffers, latestDeposits } from './engine/deposit';
import { SORA, soraLoan } from './engine/sora';

const n = (v: V, k: string) => Number(v[k]) || 0;
const s = (v: V, k: string) => String(v[k]);

/* ---------- shared inputs and helpers ---------- */
const amountIn = (def: number, label = 'Amount', help?: string): Input => ({ id: 'amt', label, def, unit: 'S$', max: 10000000, help });
const issueOpts = ISSUES.slice().reverse().map((i) => ({ value: i.code, label: `${monthShort(i.issue)} (${i.code})` }));
const issueIn = (def = LATEST_ISSUE.code, label = 'SSB issue'): Input => ({ kind: 'select', id: 'iss', label, def, options: issueOpts, help: 'Month the bond was issued' });
const issueOf = (v: V, k = 'iss') => byCode(s(v, k)) ?? LATEST_ISSUE;
const termIn = (def: '6M' | '1Y' = '6M'): Input => ({ kind: 'choice', id: 'tm', label: 'T-bill', def, options: [{ value: '6M', label: '6-month' }, { value: '1Y', label: '1-year' }] });
const term = (v: V) => (s(v, 'tm') === '1Y' ? '1Y' : '6M') as '6M' | '1Y';
const SSB = P.ssb, TB = P.tbill;
const billLine = (b: Bill) => `${b.term === '6M' ? '6-month' : '1-year'} T-bill ${b.code}, auction of ${day(b.auction)}, ${b.days} days`;

/* ---------- comparison (home) ---------- */
export interface Place { key: string; name: string; rate: number; interest: number; note: string }
/** What `amount` earns over `years` in each place, with the rates of the build. */
export function comparePlaces(amount: number, years: number, fdRate: number, age55: boolean): Place[] {
  const y = Math.max(1, Math.min(10, Math.round(years)));
  const ssbRows = yearByYear(LATEST_ISSUE, Math.floor(amount / SSB.lot) * SSB.lot, y);
  const ssbInt = (ssbRows.at(-1)?.cumulative ?? 0) - SSB.fee;
  const b = latestBill('6M');
  const roll = rollover(amount, b.cutoff, y, TB.fee, b.days);
  const fd = depositInterest(amount, fdRate, y * 12, true);
  const cpfRate = age55 ? P.cpf.rates.ra : P.cpf.rates.sa;
  const cpf = Math.round(amount * (Math.pow(1 + cpfRate, y) - 1));
  return [
    { key: 'ssb', name: `Savings Bond, ${month(LATEST_ISSUE.issue)} issue`, rate: ssbInt / Math.max(1, amount) / y, interest: ssbInt, note: `${pc(LATEST_ISSUE.coupon[0])} in year 1, stepping up; coupons not reinvested; S$${SSB.fee} fee` },
    { key: 'tbill', name: `6-month T-bill, renewed at ${pc(b.cutoff)}`, rate: roll.gain / Math.max(1, amount) / y, interest: roll.gain, note: `cut-off of ${day(b.auction)} kept for ${roll.rolls} rolls (illustration); no bank fee counted` },
    { key: 'fd', name: `Fixed deposit at ${pct(fdRate)}`, rate: fd.interest / Math.max(1, amount) / y, interest: fd.interest, note: 'the rate you enter, renewed at the same rate each year' },
    { key: 'cpf', name: age55 ? 'CPF Retirement Account' : 'CPF Special Account (top-up)', rate: cpf / Math.max(1, amount) / y, interest: cpf, note: `${pct(cpfRate)} a year compounded, before extra interest; money locked until payout age` },
  ];
}

export const SPECS: Record<string, (arg?: Record<string, number | string>) => ToolSpec> = {
  /* Home: one sum in four places */
  compare: () => ({
    inputs: [
      amountIn(20000, 'Cash to place'),
      { id: 'yrs', label: 'Years', def: 3, unit: 'yrs', max: 10, help: '1 to 10' },
      { id: 'fd', label: 'Fixed deposit rate you were offered', def: latestDeposits().fd12, unit: '%', max: 10, decimals: 2, help: 'Type the rate of the offer in front of you' },
      { kind: 'choice', id: 'age', label: 'Your age', def: 'u55', options: [{ value: 'u55', label: 'Under 55' }, { value: 'o55', label: '55 or older' }] },
    ],
    run: (v) => {
      const amt = n(v, 'amt'), yrs = Math.max(1, Math.min(10, Math.round(n(v, 'yrs')) || 1));
      const places = comparePlaces(amt, yrs, n(v, 'fd') / 100, s(v, 'age') === 'o55');
      const best = [...places].sort((a, b) => b.interest - a.interest)[0];
      return {
        label: `Interest on ${sgd(amt)} over ${yrs} year${yrs > 1 ? 's' : ''}`,
        value: sgd(best.interest),
        sub: `Highest of the four with these inputs: ${best.name}.`,
        rows: places.map((p) => [`${p.name} · ${pct(p.rate)} a year`, sgd(p.interest), Math.max(0, p.interest)]),
        table: { caption: 'What each figure assumes', headers: ['Place', 'Assumption'], rows: places.map((p) => [p.name, p.note]), align: ['l', 'l'] },
        note: 'CPF money cannot be taken out like cash; a top-up is not reversible. The T-bill line keeps today’s cut-off, which will change.',
      };
    },
  }),

  /* SSB: interest year by year for one issue */
  ssb: () => ({
    inputs: [amountIn(10000, 'Amount invested', `Multiples of S$${SSB.lot}, up to S$${num(SSB.maxHolding)} held`), { id: 'yrs', label: 'Years you keep it', def: 10, unit: 'yrs', max: 10 }, issueIn()],
    run: (v) => {
      const i = issueOf(v), want = n(v, 'amt');
      const amt = Math.min(Math.floor(want / SSB.lot) * SSB.lot, SSB.maxHolding);
      const yrs = Math.max(1, Math.min(10, Math.round(n(v, 'yrs')) || 1));
      const rows = yearByYear(i, amt, yrs);
      const total = rows.at(-1)!.cumulative;
      return {
        label: `Interest over ${yrs} year${yrs > 1 ? 's' : ''}`,
        value: sgd2(total),
        sub: `${sgd(amt)} in the ${month(i.issue)} issue (${i.code}); average return ${pc(i.avg[yrs - 1])} a year if held ${yrs} year${yrs > 1 ? 's' : ''}.${amt !== want ? ` Rounded to S$${SSB.lot} lots${want > SSB.maxHolding ? ' and capped at the holding limit' : ''}.` : ''}`,
        rows: [
          ['Interest in year 1', sgd2(rows[0].interest), rows[0].interest],
          ...(yrs > 1 ? [[`Interest in year ${yrs}`, sgd2(rows[yrs - 1].interest), rows[yrs - 1].interest] as [string, string, number]] : []),
          ['Paid every six months', `${pc(i.coupon[0] / 2)} of the amount, then more`],
          ['Application fee', `S$${SSB.fee}`],
        ],
        table: { caption: 'Coupon and interest, year by year (two payments a year)', headers: ['Year', 'Coupon', 'Interest', 'Total so far', 'Average a year'], rows: rows.map((r) => [String(r.year), pct(r.coupon), sgd2(r.interest), sgd2(r.cumulative), pct(r.avgReturn)]), align: ['l', 'r', 'r', 'r', 'r'] },
        note: 'Coupons as published by MAS for this issue. Interest is paid into your bank account, not reinvested.',
      };
    },
  }),

  /* SSB: rates of one issue, and how they compare with the latest */
  ssbrate: () => ({
    inputs: [issueIn(LATEST_ISSUE.code)],
    run: (v) => {
      const i = issueOf(v);
      const prev = ISSUES[ISSUES.indexOf(i) - 1];
      return {
        label: `${month(i.issue)} Savings Bond, 10-year average`,
        value: pc(i.avg[9]),
        sub: `${i.code}: ${pc(i.coupon[0])} in year 1, ${pc(i.coupon[9])} in year 10.${prev ? ` Previous issue: ${pc(prev.avg[9])} over ten years.` : ''}`,
        rows: [
          ['Year 1 coupon', pc(i.coupon[0])], ['Average if held 5 years', pc(i.avg[4])], ['Applications closed', day(i.lastDay)],
          ['Issue size', mn(i.size)], ['Applied', i.done ? mn(i.applied) : 'open, not known yet'],
        ],
        table: { caption: 'Coupon and average return per year held, as MAS publishes them', headers: ['Year', 'Coupon', 'Average return'], rows: i.coupon.map((c, k) => [String(k + 1), pc(c), pc(i.avg[k])]), align: ['l', 'r', 'r'] },
      };
    },
  }),

  /* SSB: redeem early */
  ssbredeem: () => ({
    inputs: [amountIn(20000, 'Amount held'), issueIn(ISSUES.find((i) => i.issue.startsWith('2024-01'))?.code ?? LATEST_ISSUE.code, 'Bond you hold'), { id: 'mo', label: 'Months held when you redeem', def: 30, unit: 'mo', max: 120 }],
    run: (v) => {
      const i = issueOf(v), amt = Math.floor(n(v, 'amt') / SSB.lot) * SSB.lot;
      const r = redeemAfter(i, amt, n(v, 'mo'), SSB.fee);
      const full = yearByYear(i, amt, 10).at(-1)!.cumulative;
      return {
        label: 'Interest you take home if you redeem then',
        value: sgd2(r.net),
        sub: `${sgd(amt)} of ${i.code}, redeemed ${r.months} months after issue (${month(r.redeemOn)}); ${pct(r.perYear)} a year on what you put in.`,
        rows: [['Coupons already paid', sgd2(r.couponsPaid), r.couponsPaid], ['Interest accrued since the last coupon', sgd2(r.accrued), r.accrued], ['Redemption fee', `-S$${SSB.fee}`], ['Interest if held the full ten years', sgd2(full)]],
        note: 'No penalty: you get your principal back plus interest earned. What you give up is the higher coupons of later years.',
      };
    },
  }),

  /* SSB: allotment in past issues */
  ssballot: () => ({
    inputs: [amountIn(50000, 'You apply for')],
    run: (v) => {
      const amt = Math.min(Math.floor(n(v, 'amt') / SSB.lot) * SSB.lot, SSB.maxHolding);
      const recent = ISSUES.filter((i) => i.done).slice(-24).reverse();
      const rows = recent.map((i) => { const a = allotmentFor(i, amt, SSB.maxHolding); return [monthShort(i.issue), mn(i.size), mn(i.applied), a.random ? `${sgd(a.sure)} + ${pct(a.chance, 0)} chance of S$500` : sgd(a.sure)]; });
      const over = recent.filter(oversubscribed);
      const last = LAST_ALLOTTED, a = allotmentFor(last, amt, SSB.maxHolding);
      return {
        label: `Allotted in the ${month(last.issue)} issue`,
        value: sgd(a.sure),
        sub: `${over.length} of the last ${recent.length} issues ${over.length === 1 ? 'was' : 'were'} oversubscribed. Applied in ${month(last.issue)}: ${mn(last.applied)} for ${mn(last.size)} offered.`,
        rows: [['You applied for', sgd(amt)], ['Fully allotted up to', sgd(Math.round(last.cutoff * 1e6))], ['Random draw above that', last.randomRate ? pct(last.randomRate / 100) : 'none']],
        table: { caption: 'What the same application got in each of the last 24 issues', headers: ['Issue', 'Offered', 'Applied', 'You would get'], rows, align: ['l', 'r', 'r', 'r'] },
      };
    },
  }),

  /* SSB: switch an old bond into the latest issue */
  ssbswitch: () => ({
    inputs: [amountIn(30000, 'Amount held'), issueIn(ISSUES.find((i) => i.issue.startsWith('2025-01'))?.code ?? ISSUES[0].code, 'Bond you hold'), { id: 'mo', label: 'Months held so far', def: 21, unit: 'mo', max: 119 }, { id: 'yrs', label: 'Years ahead to compare', def: 5, unit: 'yrs', max: 10 }],
    run: (v) => {
      const old = issueOf(v), amt = Math.floor(n(v, 'amt') / SSB.lot) * SSB.lot;
      const yrs = Math.max(1, Math.min(10, Math.round(n(v, 'yrs')) || 1));
      const r = switchCompare(old, LATEST_ISSUE, amt, n(v, 'mo'), yrs, SSB.fee);
      return {
        label: r.gain >= 0 ? 'Switching earns more by' : 'Keeping the old bond earns more by',
        value: sgd(Math.abs(r.gain)),
        sub: `Over the next ${yrs} years: keep ${old.code} (${r.yearsKept} coupon years left in that span) or redeem and apply for ${LATEST_ISSUE.code}.`,
        rows: [[`Keep ${old.code}`, sgd(r.keep), r.keep], [`Switch to ${LATEST_ISSUE.code}`, sgd(r.move), Math.max(0, r.move)], ['Fees counted', `2 × S$${SSB.fee}`]],
        note: 'Assumes the new application is allotted in full and ignores the month without interest between the two bonds. Undersubscribed issues allot in full; oversubscribed ones may not.',
      };
    },
  }),

  /* T-bill: buy at the latest cut-off */
  tbill: (arg) => ({
    inputs: [amountIn(10000, 'Face value you apply for', 'Multiples of S$1,000; you pay less than this'), termIn((arg?.tm as '6M' | '1Y') ?? '6M'), { id: 'yl', label: 'Cut-off yield', def: latestBill((arg?.tm as '6M' | '1Y') ?? '6M').cutoff, unit: '%', max: 10, decimals: 2, help: 'Latest auction filled in; change it to test another' }],
    run: (v) => {
      const b = latestBill(term(v));
      const r = buy(n(v, 'amt'), n(v, 'yl'), b.days, TB.fee);
      return {
        label: 'Interest at maturity',
        value: sgd2(r.interest),
        sub: `You pay ${sgd2(r.cost)} on ${day(b.issue)} and receive ${sgd(r.face)} on ${day(b.maturity)} (dates of ${b.code}).`,
        rows: [['Price per S$100', String(r.price)], ['Cash paid', sgd2(r.cost), r.cost], ['Interest at maturity', sgd2(r.net), r.net], ['Yearly return on the cash paid', pct(r.yearly)]],
        note: `Price = 100 × (1 − yield × ${b.days} ÷ 365), the formula behind every MAS result we checked. No bank fee is counted: MAS does not publish one for T-bills, so check yours.`,
      };
    },
  }),

  /* T-bill: yield ↔ price converter */
  tcalc: () => ({
    inputs: [{ id: 'yl', label: 'Cut-off yield', def: latestBill('6M').cutoff, unit: '%', max: 10, decimals: 2 }, { id: 'dy', label: 'Days to maturity', def: latestBill('6M').days, unit: 'days', max: 400 }],
    run: (v) => {
      const y = n(v, 'yl'), d = Math.max(1, n(v, 'dy'));
      const p = priceFromYield(y, d);
      return {
        label: 'Price per S$100 of face value', value: String(p),
        sub: `At ${pc(y)} for ${d} days.`,
        rows: [['Discount per S$100', `S$${num(Math.round((100 - p) * 1000) / 1000, 3)}`], ['Yearly return on cash paid', pct(returnOnCash(p, d), 3)], ['Gap with the quoted yield', `${num(Math.round((returnOnCash(p, d) * 100 - y) * 1000) / 1000, 3)} point`]],
      };
    },
  }),

  /* T-bill: next auction and the naive estimate with its past error */
  tnext: (arg) => ({
    inputs: [termIn((arg?.tm as '6M' | '1Y') ?? '6M'), amountIn(20000, 'Face value you plan to apply for')],
    run: (v) => {
      const t = term(v), e = naiveEstimate(t), up = upcoming().filter((b) => b.term === t)[0];
      const lo = Math.max(0, e.estimate - e.p80), hi = e.estimate + e.p80;
      const r = buy(n(v, 'amt'), e.estimate, up?.days ?? e.from.days, TB.fee);
      return {
        label: up ? `Estimate for the auction of ${day(up.auction)}` : 'Estimate for the next auction',
        value: `${pc(e.estimate)}`,
        sub: `Estimate, not a forecast from MAS: the last cut-off (${day(e.from.auction)}) carried forward. Over the last ${e.count} auctions this rule missed by ${num(Math.round(e.mae * 100) / 100, 2)} point on average; 8 times in 10 the miss was ${num(Math.round(e.p80 * 100) / 100, 2)} point or less.`,
        rows: [['Likely range (8 in 10)', `${pc(lo)} to ${pc(hi)}`], ['Interest on your amount at the estimate', sgd2(r.interest)], ['Applications close', up ? `usually 1 to 2 business days before ${day(up.auction)}; each bank sets its own time` : 'see the MAS calendar']],
      };
    },
  }),

  /* T-bill: cut-offs of a year */
  thist: (arg) => ({
    inputs: [termIn((arg?.tm as '6M' | '1Y') ?? '6M'), { kind: 'select', id: 'yr', label: 'Year', def: String(arg?.yr ?? latestBill('6M').auction.slice(0, 4)), options: Array.from({ length: Number(latestBill('6M').auction.slice(0, 4)) - 2014 }, (_, k) => String(Number(latestBill('6M').auction.slice(0, 4)) - k)).map((y) => ({ value: y, label: y })) }],
    run: (v) => {
      const t = term(v), yr = n(v, 'yr'), list = yearBills(t, yr);
      if (!list.length) return { label: `Cut-off yields in ${yr}`, value: 'n/a', sub: 'No auction of this bill in that year.', rows: [] };
      const ys = list.map((b) => b.cutoff), avg = ys.reduce((a, b) => a + b, 0) / ys.length;
      return {
        label: `Average cut-off, ${t === '6M' ? '6-month' : '1-year'} bills, ${yr}`, value: pc(avg),
        sub: `${list.length} auctions; from ${pc(Math.min(...ys))} to ${pc(Math.max(...ys))}.`,
        rows: [['First auction of the year', `${pc(list[0].cutoff)} (${day(list[0].auction)})`], ['Last auction', `${pc(list.at(-1)!.cutoff)} (${day(list.at(-1)!.auction)})`], ['Average bid-to-cover', num(list.reduce((a, b) => a + b.cover, 0) / list.length, 2)]],
        table: { caption: 'Every auction of the year', headers: ['Auction', 'Code', 'Cut-off', 'Median', 'Bid-to-cover'], rows: list.slice().reverse().map((b) => [day(b.auction), b.code, pc(b.cutoff), pc(b.median), num(b.cover, 2)]), align: ['l', 'l', 'r', 'r', 'r'] },
      };
    },
  }),

  /* T-bill with CPF OA money */
  tcpf: () => ({
    inputs: [amountIn(20000, 'OA money used'), termIn('6M'), { id: 'yl', label: 'Cut-off yield', def: latestBill('6M').cutoff, unit: '%', max: 10, decimals: 2 }],
    run: (v) => {
      const b = latestBill(term(v));
      const r = oaVersusBill(n(v, 'amt'), n(v, 'yl'), b.days);
      return {
        label: r.gain >= 0 ? 'Gain over leaving it in the OA' : 'Loss against leaving it in the OA',
        value: sgd2(Math.abs(r.gain)),
        sub: `T-bill interest ${sgd2(r.billInterest)}, minus ${sgd2(r.charges)} of agent bank charges, against ${sgd2(r.oaInterest)} of OA interest lost over ${r.monthsOut} months out of the account.`,
        rows: [['T-bill interest', sgd2(r.billInterest), r.billInterest], ['OA interest given up', sgd2(r.oaInterest), r.oaInterest], ['Agent bank charges', sgd2(r.charges)], ['Yield needed to break even', pc(r.breakEven)]],
        note: r.note,
      };
    },
  }),

  /* Fixed deposit: one placement */
  fd: () => ({
    inputs: [amountIn(20000, 'Deposit'), { id: 'rt', label: 'Rate offered', def: latestDeposits().fd12, unit: '%', max: 10, decimals: 2 }, { id: 'mo', label: 'Tenor', def: 12, unit: 'mo', max: 60 }],
    run: (v) => {
      const r = depositInterest(n(v, 'amt'), n(v, 'rt') / 100, n(v, 'mo'), false);
      const ins = Math.min(n(v, 'amt'), P.sdic.limit);
      return {
        label: `Interest at maturity, ${num(r.months)} months`, value: sgd2(r.interest),
        sub: `Simple interest on ${sgd(n(v, 'amt'))} at ${pct(n(v, 'rt') / 100)} a year, paid at maturity.`,
        rows: [['Interest', sgd2(r.interest), r.interest], ['Monthly equivalent', sgd2(r.interest / Math.max(1, r.months))], ['Covered by deposit insurance (per bank)', sgd(ins)]],
        note: 'Banks count days; a 12-month deposit started on a given day can differ from this by a few cents. Breaking a deposit early usually forfeits some or all interest.',
      };
    },
  }),

  /* Fixed deposit: three offers side by side */
  fdcompare: () => ({
    inputs: [amountIn(30000, 'Deposit'), { id: 'r1', label: 'Offer A rate', def: 1.55, unit: '%', max: 10, decimals: 2 }, { id: 'm1', label: 'Offer A tenor', def: 6, unit: 'mo', max: 60 }, { id: 'r2', label: 'Offer B rate', def: 1.4, unit: '%', max: 10, decimals: 2 }, { id: 'm2', label: 'Offer B tenor', def: 12, unit: 'mo', max: 60 }],
    run: (v) => {
      const b = latestBill('6M');
      const offers = compareOffers(n(v, 'amt'), [[n(v, 'r1') / 100, n(v, 'm1')], [n(v, 'r2') / 100, n(v, 'm2')]], 12);
      const t = buy(n(v, 'amt'), b.cutoff, b.days, TB.fee);
      const tYear = Math.round(t.net * (365 / b.days) * 100) / 100;
      return {
        label: 'Interest over 12 months, best offer', value: sgd2(Math.max(...offers.map((o) => o.year))),
        sub: 'Each offer renewed at the same rate until 12 months are covered; a shorter tenor gives you the choice again sooner.',
        rows: [...offers.map((o, k) => [`Offer ${'AB'[k]} · ${pct(o.rate)} for ${o.months} months`, sgd2(o.year), o.year] as [string, string, number]), [`6-month T-bill at ${pc(b.cutoff)}, twice`, sgd2(tYear), tYear]],
      };
    },
  }),

  /* Savings account with bonus tiers */
  tiers: () => ({
    inputs: [amountIn(80000, 'Balance'), { id: 'b1', label: 'Rate on the first tier', def: 1, unit: '%', max: 10, decimals: 2 }, { id: 't1', label: 'Size of the first tier', def: 50000, unit: 'S$', max: 1000000 }, { id: 'b2', label: 'Rate above it', def: 0.05, unit: '%', max: 10, decimals: 2 }],
    run: (v) => {
      const r = tieredInterest(n(v, 'amt'), [[n(v, 't1'), n(v, 'b1') / 100], [Infinity, n(v, 'b2') / 100]]);
      return {
        label: 'Interest over a year', value: sgd2(r.interest),
        sub: `Effective rate on the whole balance: ${pct(r.effective)}.`,
        rows: r.parts.map(([amt, rate, i], k) => [`Tier ${k + 1}: ${sgd(amt)} at ${pct(rate)}`, sgd2(i), i]),
        note: 'Bonus rates usually need conditions (salary credit, card spend). Enter the rate you actually qualify for.',
      };
    },
  }),

  /* SORA */
  sora: () => ({
    inputs: [amountIn(500000, 'Loan or deposit amount'), { id: 'sp', label: 'Spread over 3M compounded SORA', def: 0.8, unit: '%', max: 5, decimals: 2 }, { id: 'yrs', label: 'Years left', def: 25, unit: 'yrs', max: 35 }],
    run: (v) => {
      const r = soraLoan(n(v, 'amt'), n(v, 'sp') / 100, n(v, 'yrs'));
      if (!r) return { label: 'SORA', value: 'n/a', sub: 'SORA data was not available when the site was built.', rows: [] };
      return {
        label: 'Rate today: 3M compounded SORA + spread', value: pct(r.rate),
        sub: `3M compounded SORA ${pct(r.sora3m, 4)} on ${day(r.date)}.`,
        rows: [['Monthly instalment at that rate', sgd(r.monthly), r.monthly], ['If SORA moves 0.5 point up', sgd(r.up)], ['If SORA moves 0.5 point down', sgd(r.down)], ['Overnight SORA', pct(r.overnight, 4)]],
        note: 'An illustration at today’s rate: a SORA loan resets every 3 months, so the instalment moves with it.',
      };
    },
  }),

  /* CPF interest on current balances */
  cpfint: () => ({
    inputs: [
      { kind: 'choice', id: 'age', label: 'Age this year', def: 'u55', options: [{ value: 'u55', label: 'Under 55' }, { value: 'o55', label: '55 or older' }] },
      { id: 'oa', label: 'Ordinary Account', def: 40000, unit: 'S$', max: 5000000 },
      { id: 'sa', label: 'Special Account', def: 30000, unit: 'S$', max: 5000000, showIf: { id: 'age', is: 'u55' } },
      { id: 'ra', label: 'Retirement Account', def: 200000, unit: 'S$', max: 5000000, showIf: { id: 'age', is: 'o55' } },
      { id: 'ma', label: 'MediSave Account', def: 25000, unit: 'S$', max: 5000000 },
    ],
    run: (v) => {
      const o55 = s(v, 'age') === 'o55';
      const r = cpfInterest({ age55: o55, oa: n(v, 'oa'), sa: o55 ? 0 : n(v, 'sa'), ma: n(v, 'ma'), ra: o55 ? n(v, 'ra') : 0 });
      return {
        label: 'CPF interest in a year', value: sgd(r.total),
        sub: `Base interest ${sgd(r.base)} plus extra interest ${sgd(r.extra)} on these balances, at the rates of ${P.cpf.quarterLabel}.`,
        rows: r.lines.map(([l, x]) => [l, sgd(x), x]),
        note: 'CPF pays interest on the lowest balance of each month and credits it once a year; with balances that stay put, that is the figure above. Extra interest earned on the OA is paid into the SA (or RA from 55).',
      };
    },
  }),

  /* CPF projection with yearly additions */
  cpfproj: () => ({
    inputs: [
      { id: 'age', label: 'Age now', def: 35, unit: 'yrs', max: 54 },
      { id: 'oa', label: 'Ordinary Account', def: 60000, unit: 'S$', max: 5000000 },
      { id: 'sa', label: 'Special Account', def: 40000, unit: 'S$', max: 5000000 },
      { id: 'ma', label: 'MediSave Account', def: 30000, unit: 'S$', max: 5000000 },
      { id: 'add', label: 'Added each year (all accounts)', def: 12000, unit: 'S$', max: 500000, help: 'From your CPF statement; not computed from salary here' },
    ],
    run: (v) => {
      const r = cpfProject(n(v, 'age'), { oa: n(v, 'oa'), sa: n(v, 'sa'), ma: n(v, 'ma') }, n(v, 'add'));
      return {
        label: `Balances at 55 (in ${r.year55})`, value: sgd(r.total),
        sub: `Of which ${sgd(r.interest)} of interest if today’s rates held every year. The 4 % floor on the SA and MA is promised to 31 December 2027, not beyond.`,
        rows: [['Ordinary Account', sgd(r.oa), r.oa], ['Special Account', sgd(r.sa), r.sa], ['MediSave Account (capped at the BHS)', sgd(r.ma), r.ma], [`Full Retirement Sum ${P.retirement.year}`, sgd(P.retirement.frs)]],
        note: 'A projection at constant rates, with additions split as you entered them in proportion to today’s balances. MediSave above the Basic Healthcare Sum flows to the SA in this projection.',
      };
    },
  }),

  /* Retirement sums */
  cpfrs: () => ({
    inputs: [{ id: 'ra', label: 'What you can set aside at 55', def: 230000, unit: 'S$', max: 5000000, help: 'SA and OA savings that move to the RA' }],
    run: (v) => {
      const r = retirementCheck(n(v, 'ra'));
      return {
        label: r.label, value: sgd(r.gap),
        sub: `Retirement sums for members turning 55 in ${P.retirement.year}.`,
        rows: [[`Basic Retirement Sum`, sgd(P.retirement.brs)], [`Full Retirement Sum`, sgd(P.retirement.frs)], [`Enhanced Retirement Sum`, sgd(P.retirement.ers)], ['Above the FRS, can be withdrawn from 55', sgd(r.withdrawable)]],
      };
    },
  }),

  /* CPF LIFE payout from the published table */
  cpflife: () => ({
    inputs: [{ id: 'ra', label: 'Retirement Account at 55', def: P.retirement.frs, unit: 'S$', max: 2000000 }],
    run: (v) => {
      const r = lifePayout(n(v, 'ra'));
      return {
        label: 'Estimated CPF LIFE payout from 65, a month', value: r ? `about ${sgd(r.low)}` : 'n/a',
        sub: r ? `Straight line between the three CPF Board estimates for members turning 55 in ${P.retirement.year} (Standard plan, 4% interest): our interpolation, not a CPF figure.` : `The CPF Board publishes estimates from ${sgd(P.retirement.brs)} (the BRS) to ${sgd(P.retirement.ers)} (the ERS); outside that range we show nothing.`,
        rows: r ? r.rows : [],
        note: 'The payout depends on future interest, the plan chosen and when payouts start (up to 7% more for each year deferred, to 70). Your own estimate is in your CPF account.',
      };
    },
  }),
  /* T-bill: a competitive bid against past cut-offs */
  tbid: (arg) => ({
    inputs: [termIn((arg?.tm as '6M' | '1Y') ?? '6M'), { id: 'bid', label: 'Yield you would bid', def: Math.max(0.1, Math.round((latestBill('6M').cutoff - 0.05) * 100) / 100), unit: '%', max: 10, decimals: 2, help: 'A competitive bid: the lowest yield you accept' }],
    run: (v) => {
      const t = term(v), bid = n(v, 'bid'), list = doneBills(t).slice(-12).reverse();
      const won = list.filter((b) => bid < b.cutoff + 1e-9);
      const atCut = list.filter((b) => Math.abs(bid - b.cutoff) < 1e-9);
      return {
        label: `Allotted in the last ${list.length} auctions`, value: `${won.length} of ${list.length}`,
        sub: `A bid at ${pc(bid)} is allotted when it is at or below the cut-off; at exactly the cut-off it may be allotted only in part. Everyone allotted earns the cut-off yield, not their bid.`,
        rows: [['Fully allotted (bid below cut-off)', String(won.length - atCut.length)], ['At the cut-off (partly allotted)', String(atCut.length)], ['Not allotted (bid above cut-off)', String(list.length - won.length)], ['Non-competitive bids', 'always allotted, at least in part']],
        table: { caption: 'Your bid against each cut-off', headers: ['Auction', 'Cut-off', 'Non-competitive allotted', 'Your bid'], rows: list.map((b) => [day(b.auction), pc(b.cutoff), `${num(b.ncPct, 0)} %`, bid < b.cutoff - 1e-9 ? 'allotted' : Math.abs(bid - b.cutoff) < 1e-9 ? 'partly' : 'not allotted']), align: ['l', 'r', 'r', 'l'] },
      };
    },
  }),

  /* SRS money in a T-bill or SSB, with the tax relief at the marginal rate you enter */
  srs: () => ({
    inputs: [amountIn(P.srs.capCitizen, 'SRS contribution this year'), { id: 'mr', label: 'Your marginal income tax rate', def: 11.5, unit: '%', max: 24, decimals: 1, help: 'Read it on your IRAS assessment; not computed here' }, { id: 'yl', label: 'Yield earned inside SRS', def: latestBill('6M').cutoff, unit: '%', max: 10, decimals: 2 }, { id: 'yrs', label: 'Years until withdrawal', def: 15, unit: 'yrs', max: 40 }],
    run: (v) => {
      const amt = Math.min(n(v, 'amt'), P.srs.capForeigner), mr = n(v, 'mr') / 100, y = n(v, 'yl') / 100, yrs = Math.round(n(v, 'yrs'));
      const relief = Math.round(amt * mr), end = Math.round(amt * Math.pow(1 + y, yrs));
      return {
        label: 'Tax saved this year', value: sgd(relief),
        sub: `${sgd(amt)} contributed at a ${pct(mr, 1)} marginal rate. Grown at ${pct(y)} a year for ${yrs} years: ${sgd(end)}, of which ${pct(P.srs.taxableShare, 0)} is taxable when withdrawn from the statutory retirement age.`,
        rows: [['Contribution', sgd(amt)], ['Tax relief at your rate', sgd(relief), relief], ['Balance at withdrawal', sgd(end), end], ['Part taxed at withdrawal', sgd(end * P.srs.taxableShare)]],
        note: `SRS caps: ${sgd(P.srs.capCitizen)} a year for citizens and PRs, ${sgd(P.srs.capForeigner)} for foreigners. Personal relief is capped at ${sgd(P.srs.reliefCap)} in total across reliefs.`,
      };
    },
  }),

  /* Deposit insurance across two banks */
  sdic: () => ({
    inputs: [{ id: 'a', label: 'Deposits at bank A', def: 150000, unit: 'S$', max: 100000000 }, { id: 'b', label: 'Deposits at bank B', def: 60000, unit: 'S$', max: 100000000 }],
    run: (v) => {
      const a = n(v, 'a'), b = n(v, 'b'), L = P.sdic.limit;
      const ca = Math.min(a, L), cb = Math.min(b, L);
      return {
        label: 'Insured by the Deposit Insurance Scheme', value: sgd(ca + cb),
        sub: `Up to ${sgd(L)} per depositor per scheme member; not insured: ${sgd(a - ca + b - cb)}.`,
        rows: [['Bank A insured', sgd(ca), ca], ['Bank A above the limit', sgd(a - ca)], ['Bank B insured', sgd(cb), cb], ['Bank B above the limit', sgd(b - cb)]],
        note: 'Savings Bonds and T-bills are not deposits and are not covered by deposit insurance: they are obligations of the Singapore Government itself.',
      };
    },
  }),

  /* CPF extra interest alone */
  cpfextra: () => ({
    inputs: [{ kind: 'choice', id: 'age', label: 'Age this year', def: 'u55', options: [{ value: 'u55', label: 'Under 55' }, { value: 'o55', label: '55 or older' }] }, { id: 'oa', label: 'Ordinary Account', def: 25000, unit: 'S$', max: 5000000 }, { id: 'rest', label: 'SA, MA and RA together', def: 30000, unit: 'S$', max: 5000000 }],
    run: (v) => {
      const o55 = s(v, 'age') === 'o55', oa = n(v, 'oa'), rest = n(v, 'rest');
      const r = cpfInterest({ age55: o55, oa, sa: rest, ma: 0, ra: 0 });
      const counted = Math.min(oa, P.cpf.extra.oaCap) + rest;
      return {
        label: 'Extra interest in a year', value: sgd(r.extra),
        sub: o55 ? `${pct(P.cpf.extra.over55.first.rate, 0)} on the first ${sgd(P.cpf.extra.over55.first.on)} and ${pct(P.cpf.extra.over55.next.rate, 0)} on the next ${sgd(P.cpf.extra.over55.next.on)} of combined balances.` : `${pct(P.cpf.extra.under55.rate, 0)} on the first ${sgd(P.cpf.extra.under55.on)} of combined balances.`,
        rows: [['Balances counted', sgd(Math.min(counted, o55 ? P.cpf.extra.over55.first.on + P.cpf.extra.over55.next.on : P.cpf.extra.under55.on))], ['OA counted (cap)', sgd(Math.min(oa, P.cpf.extra.oaCap))], ['Base interest on the same balances', sgd(r.base)]],
      };
    },
  }),

  /* Cash top-up to the SA/RA against a Savings Bond */
  topup: () => ({
    inputs: [amountIn(8000, 'Cash top-up'), { id: 'yrs', label: 'Years compared', def: 10, unit: 'yrs', max: 10 }, { id: 'mr', label: 'Your marginal income tax rate', def: 7, unit: '%', max: 24, decimals: 1, help: 'For the tax relief; not computed here' }],
    run: (v) => {
      const amt = n(v, 'amt'), yrs = Math.max(1, Math.min(10, Math.round(n(v, 'yrs')))), mr = n(v, 'mr') / 100;
      const cpf = Math.round(amt * (Math.pow(1 + P.cpf.rates.sa, yrs) - 1));
      const ssbI = Math.round(yearByYear(LATEST_ISSUE, Math.floor(amt / SSB.lot) * SSB.lot, yrs).at(-1)!.cumulative);
      const relief = Math.round(Math.min(amt, P.cpf.topupReliefCap) * mr);
      return {
        label: `CPF top-up earns more over ${yrs} years by`, value: sgd(cpf + relief - ssbI),
        sub: `CPF at ${pct(P.cpf.rates.sa)} compounded (${sgd(cpf)}) plus tax relief (${sgd(relief)}), against ${sgd(ssbI)} from the ${month(LATEST_ISSUE.issue)} Savings Bond. The top-up cannot be taken back; the bond can be redeemed in any month.`,
        rows: [['CPF interest', sgd(cpf), cpf], ['Tax relief on the top-up', sgd(relief), relief], ['Savings Bond interest', sgd(ssbI), ssbI]],
        note: `Tax relief for cash top-ups to your own account is capped at ${sgd(P.cpf.topupReliefCap)} a year (another ${sgd(P.cpf.topupReliefCap)} for family members). Extra interest not counted.`,
      };
    },
  }),
};

export function getTool(kind: string, arg?: Record<string, number | string>): ToolSpec {
  const f = SPECS[kind];
  if (!f) throw new Error(`Unknown calculator ${kind}`);
  const spec = f(arg);
  if (!arg) return spec;
  return { ...spec, inputs: spec.inputs.map((i) => (arg[i.id] === undefined ? i : { ...i, def: (typeof i.def === 'number' ? Number(arg[i.id]) : String(arg[i.id])) as never })) };
}
export const TOOL_KINDS = Object.keys(SPECS);
export { doneBills, ISSUES };
export type { CpfIn, SsbIssue };
