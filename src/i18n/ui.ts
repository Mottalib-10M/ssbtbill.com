import type { Locale } from './routes';
const en = {
  updatedOn: 'Figures checked on', editorialPolicy: 'Editorial policy', contactLabel: 'Contact', reviewedBy: 'Worked out by',
  skipToContent: 'Skip to content', mainNav: 'Main navigation', breadcrumbLabel: 'Breadcrumb', breadcrumbHome: 'Home', menuOpen: 'Open menu',
  faqTitle: 'What savers ask us', relatedCalculators: 'Work out next', sourcesTitle: 'Where the figures come from', writtenBy: 'Worked out by',
  asOf: 'Rates and rules of', lastUpdated: 'auction data last read on', footerValidated: 'Sources: MAS statistics API (Savings Bonds and SGS bills), MAS bond and bill pages, CPF Board interest and retirement pages, IRAS, SDIC',
  footerBrowser: 'Computed in your browser · no e-mail, no account · nothing to buy, no bank to call',
  footerDisclaimer: 'Independent site published by Radif Partners, a company based in France. Not affiliated with the Monetary Authority of Singapore, the CPF Board, any bank or any broker. Calculations and general information only, not a recommendation to buy, hold or redeem anything.',
  footerPopular: 'Most used',
  notFound: 'This page does not exist. The comparison on the home page shows what a sum earns in the latest Savings Bond, the latest T-bill, a fixed deposit and CPF, year by year.',
  readMore: 'Read the full answer',
  estimate: 'Coupons and cut-off yields are the ones MAS published; what your bank or CDP account credits is the figure that counts. CPF interest uses the CPF Board rates and extra-interest rules on balances you enter, not your statement. This is a calculation tool, not advice on what to do with your money. We sell nothing and link to no bank or broker.',
};
export function t(_lang: Locale) { return en; }
