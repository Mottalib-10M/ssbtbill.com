#!/usr/bin/env node
/**
 * Refreshes the auction data from the MAS statistics API (no key, JSON) and rewrites src/data/ssb.json,
 * tbills.json, calendar.json, sora.json and deposits.json. Run before every build (the GitHub Actions workflow does it every weekday).
 *
 *   node scripts/update-data.mjs            fetch, check, write
 *   node scripts/update-data.mjs --dry-run  fetch and check, print a summary, write nothing
 *
 * Sources (read 2026-10-21, see CONTRIBUTING-DONNEES.md for the terms of use):
 *   SSB issues ......... https://eservices.mas.gov.sg/statistics/api/v1/bondsandbills/m/listsavingbonds
 *   SSB coupons ........ https://eservices.mas.gov.sg/statistics/api/v1/bondsandbills/m/savingbondsinterest
 *   SGS bills .......... https://eservices.mas.gov.sg/statistics/api/v1/bondsandbills/m/listbondsandbills (product_type:B)
 *   Calendar ........... …/savingbondsissuancecalendar and …/issuancecalendar (issue_type:T)
 *   SORA ............... https://eservices.mas.gov.sg/statistics/dir/DomesticInterestRates.aspx (form post, 12 months)
 *   Deposit rates ...... https://www.mas.gov.sg/api/v1/MAS/chart/table_iii_3a_... (MSB table III.3A, quarterly)
 * The script refuses to write when a sanity check fails (empty answer, missing coupon, yield out of range), so a
 * bad answer from the API never reaches the site: the previous files stay in place.
 */
import { writeFileSync, readFileSync } from 'node:fs';

const API = 'https://eservices.mas.gov.sg/statistics/api/v1/bondsandbills/m/';
const DRY = process.argv.includes('--dry-run');
const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; sg-safe-savings data refresh)' };

async function get(path, params) {
  const url = `${API}${path}?${new URLSearchParams(params)}`;
  for (let k = 0; k < 3; k++) {
    try {
      const r = await fetch(url, { headers: UA });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      if (!j.success || !j.result?.records) throw new Error('unexpected answer');
      return j.result.records;
    } catch (e) {
      if (k === 2) throw new Error(`${path}: ${e.message}`);
      await new Promise((s) => setTimeout(s, 2000 * (k + 1)));
    }
  }
}
const num = (x) => (x === null || x === undefined || x === '' ? null : Number(x));
const fail = (m) => { console.error(`update-data: ${m}`); process.exit(1); };

// --- Singapore Savings Bonds -------------------------------------------------------------------------
const issues = await get('listsavingbonds', { rows: 500, sort: 'issue_code desc' });
const coupons = await get('savingbondsinterest', { rows: 500, sort: 'issue_code desc' });
const byCode = new Map(coupons.map((c) => [c.issue_code, c]));
const ssb = issues.map((s) => {
  const c = byCode.get(s.issue_code);
  if (!c) fail(`no coupons for ${s.issue_code}`);
  const coupon = [], avg = [];
  for (let y = 1; y <= 10; y++) { coupon.push(num(c[`year${y}_coupon`])); avg.push(num(c[`year${y}_return`])); }
  if (coupon.some((x) => x === null || x < 0 || x > 10)) fail(`bad coupon for ${s.issue_code}`);
  const applied = num(s.amt_applied), allotted = num(s.amt_alloted);
  return {
    code: s.issue_code, isin: s.isin_code,
    announced: s.ann_date, lastDay: s.last_day_to_apply, allotment: s.tender_date,
    issue: s.issue_date, maturity: s.maturity_date, payMonths: s.payment_month,
    size: num(s.issue_size), applied, allotted,
    // amounts in S$ million as published; null while the issue is still open
    done: applied !== null && applied > 0,
    cutoff: num(s.cutoff_amt), randomRate: num(s.rndm_alloted_rate),
    coupon, avg,
  };
}).sort((a, b) => a.issue.localeCompare(b.issue));
if (ssb.length < 100) fail(`only ${ssb.length} SSB issues`);

// --- SGS T-bills (6-month BS, 1-year BY; the 3-month BQ ended in 2013) ---------------------------------
const rows = [];
for (let start = 0; ; start += 500) {
  const r = await get('listbondsandbills', { rows: 500, start, filters: 'product_type:B', sort: 'auction_date desc' });
  rows.push(...r);
  if (r.length < 500 || r[r.length - 1].auction_date < '2015-01-01') break;
}
const bills = rows
  .filter((r) => ['BS', 'BY'].includes(r.issue_code.slice(0, 2)) && r.auction_date >= '2015-01-01')
  .map((r) => ({
    code: r.issue_code, isin: r.isin_code, term: r.issue_code.startsWith('BS') ? '6M' : '1Y',
    announced: r.ann_date, auction: r.auction_date, issue: r.issue_date, maturity: r.maturity_date, days: num(r.raw_tenor),
    done: num(r.cutoff_yield) > 0,
    cutoff: num(r.cutoff_yield), price: num(r.cutoff_price), median: num(r.median_yield), average: num(r.avg_yield),
    offered: num(r.auction_amt), allotted: num(r.total_amt_allot), bids: num(r.total_bids), cover: num(r.bid_to_cover),
    ncAllotted: num(r.amt_allot_non_cmpt_appls), ncPct: num(r.pct_non_cmpt_appls_cutoff), cPct: num(r.pct_cmpt_appls_cutoff),
  }))
  .sort((a, b) => a.auction.localeCompare(b.auction));
for (const b of bills) if (b.done && (b.cutoff > 10 || !(b.price > 90 && b.price < 100))) fail(`bad bill ${b.code}`);
if (bills.filter((b) => b.done && b.term === '6M').length < 100) fail('too few 6-month bills');

// --- SORA (MAS Domestic Interest Rates form: daily, no key; the JSON API needs a subscription) -------------
const SORA_URL = 'https://eservices.mas.gov.sg/statistics/dir/DomesticInterestRates.aspx';
async function soraDays() {
  const first = await fetch(SORA_URL, { headers: UA });
  const cookie = (first.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).join('; ');
  const page = await first.text();
  const hidden = (n) => (page.match(new RegExp(`id="${n}" value="([^"]*)"`)) || page.match(new RegExp(`name="${n}"[^>]*value="([^"]*)"`)) || [, ''])[1];
  const end = new Date(), start = new Date(end.getFullYear(), end.getMonth() - 12, 1);
  const P = 'ctl00$ContentPlaceHolder1$';
  const f = new URLSearchParams({ __EVENTTARGET: '', __EVENTARGUMENT: '', __VIEWSTATE: hidden('__VIEWSTATE'), __VIEWSTATEGENERATOR: hidden('__VIEWSTATEGENERATOR'), __EVENTVALIDATION: hidden('__EVENTVALIDATION') });
  f.set(P + 'StartYearDropDownList', String(start.getFullYear())); f.set(P + 'StartMonthDropDownList', String(start.getMonth() + 1));
  f.set(P + 'EndYearDropDownList', String(end.getFullYear())); f.set(P + 'EndMonthDropDownList', String(end.getMonth() + 1));
  for (const i of [13, 14, 15, 16, 17]) f.set(`${P}ColumnsCheckBoxList$${i}`, 'on');
  f.set(P + 'Button1', 'Display');
  const r = await fetch(SORA_URL, { method: 'POST', body: f, headers: { ...UA, 'Content-Type': 'application/x-www-form-urlencoded', Cookie: cookie } });
  const html = await r.text();
  const panel = html.slice(html.indexOf('SoraResultPanel'));
  const M = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
  const out = []; let year = '', mon = '';
  for (const tr of panel.split('<tr').slice(1)) {
    const td = [...tr.matchAll(/<td[^>]*>([^<]*)<\/td>/g)].map((m) => m[1].replace(/&nbsp;/g, '').trim());
    if (td.length < 9) continue;
    if (td[0]) year = td[0]; if (td[1]) mon = M[td[1]] ?? mon;
    const v = td.slice(4).map((x) => (x === '' || x === '-' ? null : Number(x)));
    if (!year || !mon || v[0] === null || Number.isNaN(v[0])) continue;
    out.push({ date: `${year}-${mon}-${td[2].padStart(2, '0')}`, overnight: v[0], c1m: v[2], c3m: v[3], c6m: v[4] });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}
let sora = [];
for (let k = 0; k < 3 && sora.length === 0; k++) { try { sora = await soraDays(); } catch (e) { if (k === 2) fail(`SORA: ${e.message}`); } }
if (sora.length < 150) fail(`only ${sora.length} SORA days`);
for (const d of sora) if (!(d.overnight >= 0 && d.overnight < 10)) fail(`bad SORA on ${d.date}`);

// --- Bank deposit rates, MAS Monthly Statistical Bulletin table III.3A (quarterly) -----------------------
const III3A = 'https://www.mas.gov.sg/api/v1/MAS/chart/table_iii_3a_commercial_bnks_dep_rate_of_sgd_denominated_deposits_offered_to_non_banks_cus';
const CHROME = { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36', Accept: 'application/json' };
let dep = null;
for (let k = 0; k < 3 && !dep; k++) { try { const r = await fetch(III3A, { headers: CHROME }); if (r.ok) dep = (await r.json()).elements; } catch { /* retry */ } }
if (!dep || dep.length < 8) fail('III.3A deposit table unavailable');
const quarters = dep.map((e) => ({
  q: `${e.year} Q${e.quarter}`, fd1: e.war_fd_1mnts, fd3: e.war_fd_3mnts, fd6: e.war_fd_6mnts, fd12: e.war_fd_12mnts, sav: e.war_sd_ls_75k,
  top12: e.hqr_fd_12mnts, topSav: e.hqr_sd_ls_75k,
})).sort((a, b) => a.q.localeCompare(b.q));
for (const q of quarters) if ([q.fd3, q.fd6, q.fd12, q.sav].some((x) => typeof x !== 'number' || x < 0 || x > 10)) fail(`bad deposit row ${q.q}`);

// --- Issuance calendar (announced SSB issues and T-bill auctions still to come) --------------------------
const today = new Date().toISOString().slice(0, 10);
const calS = await get('savingbondsissuancecalendar', { rows: 24, sort: 'issue_date desc' });
const calT = await get('issuancecalendar', { rows: 200, filters: 'issue_type:T', sort: 'auction_date desc' });
const calendar = {
  ssb: calS.filter((x) => x.issue_date >= today).map((x) => ({ code: x.issue_code, name: x.savings_bond_code, announced: x.ann_date, lastDay: x.last_day_to_apply, allotment: x.tender_date, issue: x.issue_date })).sort((a, b) => a.issue.localeCompare(b.issue)),
  bills: calT.filter((x) => x.auction_date >= today && ['BS', 'BY'].includes(x.issue_code.slice(0, 2))).map((x) => ({ code: x.issue_code, term: x.issue_code.startsWith('BS') ? '6M' : '1Y', announced: x.ann_date, auction: x.auction_date, issue: x.issue_date, days: num(x.raw_tenor) })).sort((a, b) => a.auction.localeCompare(b.auction)),
};

const now = new Date().toISOString().slice(0, 10);
const meta = { source: 'Monetary Authority of Singapore, statistics API (bonds and bills)', read: now };
const summary = `SORA ${sora.length} days (last ${sora.at(-1).date} ${sora.at(-1).overnight}), deposits ${quarters.at(-1).q}, SSB ${ssb.length} issues (last ${ssb.at(-1).code}), bills ${bills.length} (last ${bills.filter((b) => b.done).at(-1).code} ${bills.filter((b) => b.done).at(-1).cutoff} %)`;
if (DRY) { console.log(`dry run: ${summary}`); process.exit(0); }
const write = (f, o) => {
  const p = new URL(`../src/data/${f}`, import.meta.url);
  let prev = ''; try { prev = readFileSync(p, 'utf8'); } catch { /* first run */ }
  const next = JSON.stringify(o, null, 1) + '\n';
  // the read date changes on every run; only rewrite when the data itself changed
  if (prev && JSON.stringify({ ...JSON.parse(prev), meta: null }) === JSON.stringify({ ...o, meta: null })) return false;
  writeFileSync(p, next); return true;
};
const a = write('ssb.json', { meta, issues: ssb });
const b = write('tbills.json', { meta, auctions: bills });
const c = write('sora.json', { meta: { source: 'Monetary Authority of Singapore, Domestic Interest Rates (SORA)', read: now }, days: sora });
const d = write('deposits.json', { meta: { source: 'Monetary Authority of Singapore, Monthly Statistical Bulletin table III.3A', read: now }, quarters });
const e = write('calendar.json', { meta: { source: 'Monetary Authority of Singapore, statistics API (issuance calendar)', read: now }, ...calendar });
console.log(`${summary}; calendar ${calendar.ssb.length} SSB + ${calendar.bills.length} bills ${e ? 'updated' : 'unchanged'}; ssb ${a ? 'updated' : 'unchanged'}, tbills ${b ? 'updated' : 'unchanged'}, sora ${c ? 'updated' : 'unchanged'}, deposits ${d ? 'updated' : 'unchanged'}`);
