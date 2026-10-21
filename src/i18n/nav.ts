import { route, type Locale } from './routes';
import { GUIDES, guideById } from '../lib/pages';
import type { Group } from '../lib/page-types';
export interface NavLink { href: string; label: string } export interface NavCategory { label: string; links: NavLink[] }
const CORE: Record<string, string> = { home: 'Compare SSB, T-bills, deposits, CPF', method: 'How we calculate', about: 'About', widget: 'Embed the comparison', contact: 'Contact', editorial: 'Editorial policy', privacy: 'Privacy', terms: 'Legal notice', cookies: 'Cookies' };
export const GROUPS: Array<{ id: Group; label: string }> = [
  { id: 'ssb', label: 'Savings Bonds' },
  { id: 'tbill', label: 'T-bills' },
  { id: 'deposit', label: 'Deposits and SORA' },
  { id: 'cpf', label: 'CPF interest' },
];
export const label = (id: string, _lang?: Locale) => CORE[id] ?? guideById(id)?.nav ?? id;
const link = (id: string, lang: Locale): NavLink => ({ href: route(id, lang), label: label(id) });
export const inGroup = (g: Group, lang: Locale): NavLink[] => GUIDES.filter((p) => p.group === g).map((p) => link(p.id, lang));
export function navCategories(lang: Locale): NavCategory[] {
  return GROUPS.map((g) => ({ label: g.label, links: inGroup(g.id, lang) })).filter((c) => c.links.length);
}
export const navDirect = (lang: Locale): NavLink[] => [link('method', lang)];
export const footerColumns = (lang: Locale): NavCategory[] => [
  ...GROUPS.map((g) => ({ label: g.label, links: inGroup(g.id, lang) })).filter((c) => c.links.length),
  { label: 'This site', links: ['home', 'method', 'about', 'contact', 'editorial', 'widget', 'terms', 'privacy', 'cookies'].map((i) => link(i, lang)) },
];
/** The pages people use most, from every footer. */
export const popularLinks = (lang: Locale): NavLink[] => ['singapore-savings-bonds', 't-bill-singapore', 'fixed-deposit-rates-singapore', 'cpf-interest-rate'].filter((id) => guideById(id)).map((id) => link(id, lang));
