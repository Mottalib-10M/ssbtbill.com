/** Display formats (en-SG). Results in whole dollars; cents only where money is paid to the cent. */
import { formatNumber, formatPercent, formatDecimal, displayDate } from './format';
const sign = (x: number) => (x < -0.005 ? '-' : '');
/** S$1,234 (no cents). */
export const sgd = (x: number) => `${sign(x)}S$${formatNumber(Math.abs(Math.round(x)), 0)}`;
/** S$1,234.56: amounts paid or charged to the cent (T-bill cost, coupons, fees). */
export const sgd2 = (x: number) => `${sign(x)}S$${formatNumber(Math.abs(x), Number.isInteger(Math.round(x * 100) / 100) ? 0 : 2)}`;
/** Rates given as decimals: 0.0167 → "1.67 %". */
export const pct = (x: number, d = 2) => formatPercent(x, d);
/** Rates given as MAS publishes them, in per cent: 1.67 → "1.67 %". */
export const pc = (x: number, d = 2) => formatPercent(x / 100, d);
export const num = (x: number, d = 0) => formatNumber(x, d);
export const dec = (x: number, d = 3) => formatDecimal(x, d);
/** "21 October 2026". */
export const day = (iso: string) => displayDate(iso.slice(0, 10), 'en-SG');
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** "November 2026" from "2026-11" or "2026-11-02". */
export const month = (iso: string) => `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;
export const monthShort = (iso: string) => `${MONTHS[Number(iso.slice(5, 7)) - 1].slice(0, 3)} ${iso.slice(0, 4)}`;
/** S$ millions as MAS publishes amounts: 1904.3 → "S$1.9 billion", 243.4 → "S$243 million". */
export const mn = (x: number) => (x >= 1000 ? `S$${formatDecimal(x / 1000, 1)} billion` : `S$${formatNumber(Math.round(x), 0)} million`);
