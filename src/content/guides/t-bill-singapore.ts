import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const TB = K.P.tbill;
const b6 = K.bill('6M'), b1 = K.bill('1Y');
const HOW_URL = 'https://www.mas.gov.sg/bonds-and-bills/investing-in-singapore-government-securities/how-sgs-auctions-are-conducted';
const CAL_URL = 'https://www.mas.gov.sg/bonds-and-bills/auctions-and-issuance-calendar';
// Worked case of this page: S$25,000 of face value in each bill.
const amt = 25000;
const x6 = K.buy(amt, b6.cutoff, b6.days), x1 = K.buy(amt, b1.cutoff, b1.days);
// The price formula checked against every published result.
const all = [...K.bills('6M'), ...K.bills('1Y')];
const match = all.filter((b) => Math.abs(K.price(b.cutoff, b.days) - b.price) < 0.0005).length;
const next = K.CAL.bills[0];
const nextOf = (t: '6M' | '1Y') => K.CAL.bills.find((b) => b.term === t);
const n6 = nextOf('6M'), n1 = nextOf('1Y');
const per = (b: typeof b6) => K.pct(b.ncAllotted / b.offered, 0);
const lastRow = (b: typeof b6) => [b.term === '6M' ? '6-month' : '1-year', b.code, K.day(b.auction), K.day(b.issue), K.day(b.maturity), String(b.days), K.pc(b.cutoff), String(b.price), K.pc(b.median), K.mn(b.offered), K.dec(b.cover, 2)];

export default defineGuide({
  id: 't-bill-singapore',
  group: 'tbill',
  order: 10,
  slug: 't-bill-singapore',
  nav: 'T-bills explained',
  card: 'Auctions, discount prices, cut-off yields and who can bid',
  title: 'T-Bill Singapore 2026: Auctions, Prices and Cut-Off Yields',
  description: `T-bill Singapore 2026: the last 6-month auction cut off at ${K.pc(b6.cutoff)}, the 1-year at ${K.pc(b1.cutoff)}. Price, interest on your amount, auction steps, bids and dates.`,
  h1: 'Singapore T-bills: how the auction works and what you earn',
  intro: `Enter the face value you would apply for and pick the 6-month or 1-year bill. The calculator fills in the latest cut-off and shows what you pay, what you receive and the yearly return.`,
  resume: `A Singapore Treasury bill is a government security of six months or one year that pays no coupon: you buy it below its face value at an auction and receive the full face value at maturity, the difference being your interest. The latest 6-month bill, ${b6.code}, was auctioned on ${K.day(b6.auction)} and cut off at ${K.pc(b6.cutoff)}, a price of ${b6.price} per S$100 for ${b6.days} days; the latest 1-year bill, ${b1.code}, cut off at ${K.pc(b1.cutoff)} on ${K.day(b1.auction)}. On ${K.sgd(amt)} of face value, the 6-month bill costs ${K.sgd2(x6.cost)} and pays ${K.sgd2(x6.interest)} at maturity; the 1-year bill costs ${K.sgd2(x1.cost)} and pays ${K.sgd2(x1.interest)}. Every successful bidder receives the same cut-off yield, the highest yield MAS accepted. Bids start at ${K.sgd(TB.min)} in multiples of ${K.sgd(TB.lot)}, with cash, SRS or CPF money, through DBS/POSB, OCBC or UOB, and bank channels close one to two business days before the auction. A T-bill cannot be redeemed early, and interest is tax-exempt for individuals.${next ? ` The next auction on the calendar is ${next.code} on ${K.day(next.auction)}.` : ''}`,
  faqs: [
    { q: 'Who can bid at a Singapore T-bill auction?', a: `Any individual aged 18 or above, including non-residents, as well as institutions. An individual applies through DBS/POSB, OCBC or UOB, using cash with an individual CDP account linked to a bank account, SRS money through an SRS operator, or CPF Investment Scheme money through a CPF agent bank. The minimum is ${K.sgd(TB.min)}, in multiples of ${K.sgd(TB.lot)}.` },
    { q: 'How is the T-bill price worked out from the cut-off yield?', a: `Price per S$100 = 100 × (1 − yield × days ÷ 365), rounded to three decimals. For ${b6.code}, that is 100 × (1 − ${K.dec(b6.cutoff / 100, 4)} × ${b6.days} ÷ 365) = ${b6.price}. Checked against the ${all.length} auction results in our data, the formula reproduces the published price in ${match} cases.` },
    { q: 'Can I sell a T-bill before it matures?', a: 'There is no early redemption with MAS. A holder can sell in the secondary market at the main branches of DBS, OCBC or UOB, but at the market price of the day, which MAS says may be above or below what you paid. Someone who may need the money within the term usually looks at the Savings Bond, which can be redeemed in any month at full value.' },
    { q: 'How much of one T-bill auction can a person get?', a: `A person can submit up to ${K.sgd(TB.ncLimit)} in non-competitive bids at each T-bill auction. The overall limit for an individual, competitive and non-competitive bids together, is 15 % of the issue size, according to MAS. There is no limit on how much a person may hold across auctions.` },
    { q: 'Is there a fee to apply for a T-bill?', a: 'MAS does not publish any bank fee for T-bill applications, and the calculations on this site count none. Banks set their own terms, so it is worth checking the application screen of your bank. Where a charge applies, it lowers the return you keep: on a six-month bill, a few dollars can take a visible slice of the interest on a small amount.' },
  ],
  body: (h) => `
<h2>A discount, not a coupon</h2>
<p>A T-bill pays its interest in one go, as a discount. At the auction, the yield determines a price below S$100; you pay that price and, on the maturity date, receive S$100 for every S$100 of face value. MAS describes the interest simply as the difference between the purchase price and the face value (${h.ext(HOW_URL, 'MAS, how SGS auctions are conducted')}). The government issues two bills for individuals: the 6-month bill, coded BS, auctioned every two weeks, and the 1-year bill, coded BY, auctioned once a quarter.</p>
<p>The price follows a fixed formula: 100 × (1 − yield × days ÷ 365), rounded to three decimals. For ${b6.code}, ${K.pc(b6.cutoff)} over ${b6.days} days gives ${b6.price}. We checked the formula against all ${all.length} auction results in our data and it reproduces the published price in ${match} of them. The quoted yield is therefore a discount yield on face value. Measured on the cash you actually pay, the return is a little higher, ${K.pct(x6.yearly)} a year for the latest 6-month bill; the ${h.a('t-bill-yield', 'yield page')} explains the gap.</p>
${h.mini('tcalc', { t: 'Price per S$100 at the median yield of the last auction', p: ['yl'], d: { yl: b6.median, dy: b6.days } })}

<h2>From announcement to issue: the auction timeline</h2>
<p>Every T-bill auction runs on dates published in advance in the MAS issuance calendar (${h.ext(CAL_URL, 'MAS, auctions and issuance calendar')}). The bill is announced five business days before the auction, with the amount on offer. Individuals then apply through their bank, whose ATM and internet banking channels typically close one to two business days before auction day, at a time each bank sets. Primary dealers, the only bidders allowed to submit bids to MAS, must enter all bids by noon on auction day. Results come out about two hours later, and the bill is issued three business days after the auction.</p>
<p>${n6 ? `The next 6-month auction on the calendar is ${n6.code} on ${K.day(n6.auction)}, for issue on ${K.day(n6.issue)}.` : 'The next 6-month auction will appear in the MAS calendar.'} ${n1 ? `The next 1-year auction listed is ${n1.code} on ${K.day(n1.auction)}.` : 'No 1-year auction is listed yet in the calendar we read.'} The ${h.a('next-t-bill-auction', 'next auction page')} adds an estimate of the cut-off, with its past error.</p>

<h2>Competitive and non-competitive bids</h2>
<p>MAS runs a uniform-price auction. A non-competitive bid gives only an amount and accepts whatever yield the auction sets. Non-competitive bids are filled first, up to 40 % of the issue; above that, they are pro-rated. The rest of the issue goes to competitive bids, which state the lowest yield the bidder will accept, to two decimals, filled from the lowest yield upward until the issue is used up. The yield of the last bid filled is the cut-off, and everyone allotted, competitive or not, receives that same yield. A competitive bid above the cut-off gets nothing. The ${h.a('t-bill-competitive-bid', 'competitive bid page')} tests a bid against the last twelve auctions.</p>

<h2>The latest auctions in detail</h2>
<p>Each result includes the cut-off yield and price, the median and average yields, the amount offered and the bid-to-cover ratio, which divides the money bid by the money offered. In the latest 6-month auction, non-competitive bids took ${per(b6)} of the issue; in the latest 1-year auction, ${per(b1)}.</p>
${h.table(['Bill', 'Code', 'Auction', 'Issued', 'Matures', 'Days', 'Cut-off', 'Price', 'Median', 'Offered', 'Bid-to-cover'], [lastRow(b6), lastRow(b1)], `Latest results. Source: MAS statistics API, read ${K.day(K.BILLS_READ)}.`, ['l', 'l', 'l', 'l', 'l', 'r', 'r', 'r', 'r', 'r', 'r'])}
${h.mini('tbill', { t: 'The 1-year bill on a larger sum', p: ['amt'], d: { amt: 60000, tm: '1Y' } })}

<h2>Who can buy, with what money, and what it costs</h2>
<p>T-bill auctions are open to all individuals of 18 and above, non-residents included. Three kinds of money can pay. Cash needs an individual CDP account with the Direct Crediting Service, linked to a bank account with DBS/POSB, OCBC or UOB. Supplementary Retirement Scheme (SRS) money goes through the SRS operator. CPF Ordinary Account savings go through the CPF Investment Scheme, via the agent bank where the CPF investment account is held, subject to CPF rules; MAS notes that CPF interest rates may be higher than the yield on the bill, and the ${h.a('t-bill-with-cpf', 'CPF page')} works out that trade-off. A bid is at least ${K.sgd(TB.min)}, in multiples of ${K.sgd(TB.lot)}, and there is no ceiling on what a person may hold, only per-auction limits (${h.src('mas_tbill', 'MAS, T-bills for individuals')}).</p>
<p>${TB.feeNote} Bank channels debit the amount when you apply; an unsuccessful bid is refunded one to two business days after the auction (${h.src('mas_auction', 'MAS, buying at auction')}).</p>

<h2>Before maturity and after it</h2>
<p>There is no early redemption. A holder who needs the money can sell at the main branches of the three local banks, at the day's market price, which can be above or below the purchase price. At maturity, the face value is paid out; for cash holders, it goes to the bank account linked to CDP through the Direct Crediting Service. Interest on government securities is tax-exempt for individuals, residents or not, and Singapore has no capital gains tax (${h.src('mas_tax', 'MAS, tax')}). For a saver choosing between this and a Savings Bond, the ${h.a('ssb-vs-t-bill', 'side-by-side comparison')} runs both on the same sum, and the ${h.a('6-month-t-bill', '6-month')} and ${h.a('1-year-t-bill', '1-year')} pages follow each bill on its own.</p>`,
  tool: 'tbill',
  toolArg: { amt, tm: '6M' },
  related: ['6-month-t-bill', '1-year-t-bill', 'next-t-bill-auction', 't-bill-yield', 't-bill-competitive-bid', 'ssb-vs-t-bill'],
  sources: ['mas_tbill', 'mas_auction', 'mas_compare', 'mas_api_bills', 'mas_tax'],
});
