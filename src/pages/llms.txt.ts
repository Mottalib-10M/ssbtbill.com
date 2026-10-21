/** llms.txt (RECETTE §21), generated from the page registry. */
import { GUIDES } from '../lib/pages';
import { SITE_URL, LAST_UPDATED, SITE_NAMES } from '../data/site-config';
import { route } from '../i18n/routes';
import { GROUPS } from '../i18n/nav';
export function GET() {
  const lines = [
    `# ${SITE_NAMES.en}`, '',
    `> Calculators for safe savings in Singapore. Interest year by year of every Singapore Savings Bond issue since October 2015, from the step-up coupons published by the Monetary Authority of Singapore; early redemption and allotment of past issues; the price, cost and return of every 6-month and 1-year SGS T-bill auction since 2015, with a labelled estimate of the next cut-off and its past error; fixed deposit interest and the MAS average bank deposit rates; SORA; CPF interest on OA, SA, MA and RA balances with the extra interest, retirement sums and CPF LIFE estimates. Auction data refreshed from the MAS statistics API on weekdays. Independent site published by Radif Partners; calculations, not financial advice. Last updated ${LAST_UPDATED}.`, '',
    ...GROUPS.flatMap((g) => [`## ${g.label}`, ...GUIDES.filter((p) => p.group === g.id).map((p) => `- [${p.nav}](${SITE_URL}${route(p.id, 'en')}): ${p.card}`), '']),
    '## About', `- [How we calculate](${SITE_URL}${route('method', 'en')})`, `- [About](${SITE_URL}${route('about', 'en')})`,
  ];
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
