/** Every page id the site is meant to have. Content tests accept links to these ids while pages are being
 *  written; the "all planned pages exist" test fails until each has its file. */
export const PLANNED_GUIDES = [
  // Savings Bonds
  'singapore-savings-bonds', 'ssb-interest-rate', 'ssb-rates-history', 'ssb-early-redemption', 'ssb-allotment', 'ssb-switch', 'how-to-buy-ssb', 'ssb-vs-t-bill', 'ssb-vs-fixed-deposit', 'ssb-with-srs',
  // T-bills
  't-bill-singapore', 't-bill-yield', '6-month-t-bill', '1-year-t-bill', 'next-t-bill-auction', 't-bill-yield-history', 't-bill-with-cpf', 't-bill-competitive-bid', 't-bill-vs-fixed-deposit',
  // Deposits and SORA
  'fixed-deposit-rates-singapore', 'best-fixed-deposit-singapore', 'best-savings-account-singapore', 'sdic-deposit-insurance', 'sora-rate',
  // CPF
  'cpf-interest-rate', 'cpf-extra-interest', 'cpf-calculator', 'cpf-retirement-sum', 'cpf-life-payout', 'cpf-sa-top-up', 'srs',
];
export const PLANNED_IDS = new Set<string>(PLANNED_GUIDES);
