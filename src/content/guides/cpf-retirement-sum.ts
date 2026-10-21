import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const R = K.P.retirement, N = R.next;
const rise = (a: number, b: number) => [K.sgd(b - a), K.pct((b - a) / a, 1)];
const sums = [
  ['Basic Retirement Sum (BRS)', K.sgd(R.brs), K.sgd(N.brs), ...rise(R.brs, N.brs)],
  ['Full Retirement Sum (FRS)', K.sgd(R.frs), K.sgd(N.frs), ...rise(R.frs, N.frs)],
  ['Enhanced Retirement Sum (ERS)', K.sgd(R.ers), K.sgd(N.ers), ...rise(R.ers, N.ers)],
];
const frsX = R.frs / R.brs, ersX = R.ers / R.brs;
// Worked cases of this page: S$260,000 set aside at 55 (above the FRS), and S$150,000 (between BRS and FRS).
const rich = 260000, mid = 150000;
const a = K.rs(rich), b = K.rs(mid);
const lifeFrs = K.life(R.frs), lifeMid = K.life(mid);
const halfFrs = R.frs / 2;

export default defineGuide({
  id: 'cpf-retirement-sum',
  group: 'cpf',
  order: 40,
  slug: 'cpf-retirement-sum',
  nav: 'CPF retirement sums',
  card: 'BRS, FRS and ERS for 2026 and 2027, and what happens at 55',
  title: 'CPF Retirement Sum 2026: BRS, FRS and ERS, 2027 Figures',
  description: `CPF retirement sums for members turning 55 in 2026: BRS ${K.sgd(R.brs)}, FRS ${K.sgd(R.frs)}, ERS ${K.sgd(R.ers)}, with the ${N.year} figures. What moves to your RA at age 55.`,
  h1: 'CPF retirement sums: what is set aside at 55, and what can come out',
  intro: `Enter the savings you expect to have in your Special and Ordinary Accounts when you turn 55. The calculator places that sum against the retirement sums of ${R.year} and shows what could be withdrawn.`,
  resume: `For CPF members turning 55 in ${R.year}, the Basic Retirement Sum (BRS) is ${K.sgd(R.brs)}, the Full Retirement Sum (FRS) ${K.sgd(R.frs)} and the Enhanced Retirement Sum (ERS) ${K.sgd(R.ers)}. For those turning 55 in ${N.year}, the figures are ${K.sgd(N.brs)}, ${K.sgd(N.frs)} and ${K.sgd(N.ers)}. At 55, the CPF Board opens a Retirement Account (RA) and moves savings into it from the Special Account (SA) first, then the Ordinary Account (OA), up to the member's FRS. The SA is then closed, and savings above the FRS stay in the OA, where they can be withdrawn. A member with ${K.sgd(rich)} in the SA and OA at 55 in ${R.year} sets aside ${K.sgd(R.frs)} and can take out ${K.sgd(a.withdrawable)}. A member who cannot reach the FRS may still withdraw up to ${K.sgd(5000)}. The BRS and FRS are fixed by the year you turn 55; the ERS is the ceiling for voluntary top-ups and is raised every January, for all members aged 55 and above.`,
  faqs: [
    { q: 'Which retirement sum applies to me?', a: `The one of the year you turn 55, which then stays fixed for life. A member turning 55 in ${R.year} has a BRS of ${K.sgd(R.brs)} and an FRS of ${K.sgd(R.frs)}; a member turning 55 in ${N.year} has ${K.sgd(N.brs)} and ${K.sgd(N.frs)}. The ERS is different: it is the current year's figure for everyone aged 55 or above, ${K.sgd(R.ers)} in ${R.year}.` },
    { q: 'Can I withdraw my CPF savings at 55?', a: `Savings above your Full Retirement Sum can be withdrawn from 55: they remain in the OA after the transfer to the Retirement Account. If you cannot set aside the FRS, up to ${K.sgd(5000)} may still be set aside in the OA and withdrawn. Savings kept in the Retirement Account fund the monthly payouts that start from 65.` },
    { q: 'Can a property count towards the Full Retirement Sum?', a: `Yes, in part. A member who owns a property in Singapore with a lease running at least to age 95 can meet up to half the FRS with it, ${K.sgd(halfFrs)} for ${R.year}, and withdraw RA savings above the BRS. If the property is sold later, the CPF savings withdrawn this way, with accrued interest, have to be refunded to restore the RA up to the FRS.` },
    { q: 'Can I top up my Retirement Account beyond the Full Retirement Sum?', a: `From 55, yes, up to the current Enhanced Retirement Sum, ${K.sgd(R.ers)} in ${R.year}. Since January 2025 the ERS is four times the BRS. Because it rises every January, a member can top up again each year to the new ceiling. Cash top-ups may earn tax relief, and members can also transfer OA savings into the RA.` },
  ],
  body: (h) => `
<h2>Three sums, two years</h2>
${h.table(['Retirement sum', `Turning 55 in ${R.year}`, `Turning 55 in ${N.year}`, 'Increase', 'In per cent'], sums, 'Source: CPF Board, What is the CPF retirement sum, updated 7 January 2026.', ['l', 'r', 'r', 'r', 'r'])}
<p>The three sums are reference points rather than targets you must hit. The BRS is meant to provide payouts for basic living needs, excluding rent. The FRS is, in the CPF Board's words, an ideal point of reference of how much one needs in retirement, and it is the cap on what is moved into the RA at 55. For ${R.year}, the FRS is ${K.dec(frsX, 0)} times the BRS and the ERS ${K.dec(ersX, 0)} times; the ERS was raised to four times the BRS in January 2025. The CPF Board announces the sums ahead of time so members can prepare, and adjusts the BRS and FRS each year for long-term inflation, longer life expectancy and better living standards.</p>

<h2>The transfer on your 55th birthday</h2>
<p>The Retirement Account is created on your 55th birthday. Savings move first from the SA, then from the OA, until the RA holds your FRS. The SA is then closed. If the SA alone held more than the FRS, the surplus goes to the OA and can be withdrawn. If the SA and OA together fall short, up to ${K.sgd(5000)} can still be kept in the OA for withdrawal, and the rest goes to the RA. Savings in the RA earn the same long-term rate the SA paid, and they are what CPF LIFE turns into monthly payouts.</p>
<p>A member who plans to keep using OA savings for a home after 55 can reserve the amount needed, so that it is not transferred to the RA; savings that have moved to the RA can no longer finance a home. The SA of every member aged 55 and above was closed on 19 January 2025, which is why the transfer now ends with the SA disappearing rather than running alongside the RA.</p>

<h2>Two members, two outcomes</h2>
<p>With ${K.sgd(rich)} in the SA and OA at 55 in ${R.year}, the member is ${K.sgd(a.gap)} above the FRS, and that surplus stays in the OA, where it can be withdrawn. The RA receives the FRS of ${K.sgd(R.frs)}, which the CPF Board estimates at about ${lifeFrs ? K.sgd(lifeFrs.low) : 'n/a'} a month from 65 on the Standard plan. With ${K.sgd(mid)}, the member sits between the BRS and the FRS, ${K.sgd(b.gap)} short of the full sum. Up to ${K.sgd(5000)} can come out; the rest funds a payout that our straight line between the CPF estimates puts near ${lifeMid ? K.sgd(lifeMid.low) : 'n/a'} a month.</p>
${h.mini('cpfrs', { t: 'Your savings at 55 against the sums', p: ['ra'], d: { ra: 150000 } })}

<h2>Meeting part of the FRS with a property</h2>
<p>Members who own a property in Singapore with a lease that lasts until they are at least 95 can meet up to half of the FRS with it, ${K.sgd(halfFrs)} for those turning 55 in ${R.year}. They can then withdraw RA savings above the BRS. The catch comes later: if the property is sold, the savings withdrawn under this option, with the interest they would have earned, are refunded to the RA up to the FRS. The option lowers what must stay in the RA, and with it the monthly payout.</p>

<h2>Falling short of the BRS</h2>
<p>Reaching none of the sums does not cancel the payouts. A member below the BRS at 55 still receives monthly payouts from 65, only smaller ones. What decides how they are paid is the RA balance when payouts begin: members born in 1958 or later with at least ${K.sgd(60000)} in the RA at that point are included in CPF LIFE automatically and receive payouts for life. With less, payouts run until the savings are used up, though Singapore Citizens and permanent residents outside the scheme can still choose to join it.</p>

<h2>Above the FRS: the Enhanced Retirement Sum</h2>
<p>From 55, members can top up their RA beyond the FRS, up to the current ERS, for higher payouts. Unlike the BRS and FRS, the ERS is not fixed by cohort: it is the current year's figure for everyone aged 55 or above, and it rises every January, so a member can top up again each year. Cash top-ups may qualify for tax relief, and eligible members may receive matching grants under the Matched Retirement Savings Scheme, up to ${K.sgd(2000)} a year and ${K.sgd(20000)} over a lifetime.</p>
${h.mini('cpfrs', { t: 'A Retirement Account near the ERS', p: ['ra'], d: { ra: 470000 } })}
<p>The sums and transfer rules on this page come from ${h.src('cpf_rs', 'the CPF Board guide to retirement sums')} and ${h.src('cpf_55', 'its page on reaching 55')}. ${h.a('cpf-life-payout', 'The CPF LIFE page')} turns an RA balance into a monthly estimate, and ${h.a('cpf-calculator', 'the CPF calculator')} projects your balances to the year you turn 55.</p>`,
  tool: 'cpfrs',
  toolArg: { ra: rich },
  related: ['cpf-life-payout', 'cpf-calculator', 'cpf-sa-top-up', 'cpf-interest-rate', 'cpf-extra-interest'],
  sources: ['cpf_rs', 'cpf_55', 'cpf_life'],
});
