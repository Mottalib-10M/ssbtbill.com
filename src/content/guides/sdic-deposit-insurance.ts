import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const L = K.P.sdic.limit;
// Worked case of this page: S$180,000 at one member bank, S$45,000 at another.
const a = 180000, b = 45000;
const two = K.tool('sdic', { a, b });
const outA = Math.max(0, a - L);
// SDIC's own joint-account illustration: S$60,000 in your name plus half of a S$90,000 joint account.
const own = 60000, joint = 90000;
const jointTotal = own + joint / 2, jointCovered = Math.min(jointTotal, L);
// SDIC's illustration with a card balance at the same bank: savings plus fixed deposit, nothing netted off.
const sav = 80000, fdep = 40000;
const loanCase = Math.min(sav + fdep, L);
// A large cash sum and the number of member banks it needs to be fully inside the limit.
const big = 250000, banks = Math.ceil(big / L);
const covered = [
  ['Savings account in Singapore dollars', 'Insured, counted together per bank'],
  ['Fixed deposit in Singapore dollars', 'Insured, counted together per bank'],
  ['Current account in Singapore dollars', 'Insured, counted together per bank'],
  ['Money placed under the Supplementary Retirement Scheme', 'Insured, counted together per bank'],
  ['Money under the CPF Investment Scheme or CPF Retirement Sum Scheme', `Insured separately, up to ${K.sgd(L)}`],
  ['Trust and client accounts', `Insured per account, up to ${K.sgd(L)} each`],
  ['Foreign currency deposits', 'Not insured'],
  ['Structured deposits', 'Not insured'],
  ['Unit trusts, shares and other securities', 'Not insured'],
];

export default defineGuide({
  id: 'sdic-deposit-insurance',
  group: 'deposit',
  order: 40,
  slug: 'sdic-deposit-insurance',
  nav: 'Deposit insurance (SDIC)',
  card: 'What the S$100,000 cover counts, bank by bank',
  title: 'SDIC Deposit Insurance 2026: S$100,000 Cover per Bank',
  description: `SDIC deposit insurance 2026: Singapore dollar deposits covered up to ${K.sgd(L)} per depositor per member bank. What counts, what does not, two banks at once.`,
  h1: 'SDIC deposit insurance: what the cover counts, and where it stops',
  intro: `Enter what you hold at two member banks, savings, current and fixed deposits together. The calculator shows the part covered by the Deposit Insurance Scheme at each bank and the part above the limit.`,
  resume: `Deposit insurance in Singapore covers up to ${K.sgd(L)} per depositor per member bank, for Singapore dollar savings, current and fixed deposits and money placed under the Supplementary Retirement Scheme, all added together at each bank. It is run by the Singapore Deposit Insurance Corporation (SDIC), and the limit rose to ${K.sgd(L)} on 1 April 2024 from ${K.sgd(75000)}. Money under the CPF Investment Scheme and the CPF Retirement Sum Scheme is counted separately, with its own ${K.sgd(L)} limit. Someone with ${K.sgd(a)} at one bank and ${K.sgd(b)} at another is insured for ${two.value} in total; ${K.sgd(outA)} at the first bank sits above the limit. Foreign currency deposits, structured deposits and investment products such as unit trusts and shares are outside the scheme. So are Savings Bonds and T-bills, which are not deposits at all but securities issued by the Singapore Government. Coverage is automatic and free for the depositor: member banks pay the premiums.`,
  faqs: [
    { q: 'Does deposit insurance cover Singapore Savings Bonds and T-bills?', a: 'No. The scheme covers deposits placed with member banks, and SDIC lists investment products such as shares and other securities among what it does not insure. Savings Bonds and T-bills are securities issued by the Singapore Government and held at the Central Depository or with your SRS operator. They do not depend on a bank staying solvent, which is why the question of deposit insurance does not arise for them.' },
    { q: 'How is a joint account counted for deposit insurance?', a: `SDIC splits a joint account equally between the holders unless the bank's records show other shares, then adds each person's share to the deposits in his or her own name at that bank. In SDIC's example, ${K.sgd(own)} in your name plus half of a ${K.sgd(joint)} joint account makes ${K.sgd(jointTotal)}, of which ${K.sgd(jointCovered)} is insured.` },
    { q: 'Do I need to register or pay to be covered by SDIC?', a: 'No. Cover is automatic for eligible deposits, with no form to fill in and no premium charged to depositors; member banks and finance companies pay into the Deposit Insurance Fund. SDIC asks depositors to keep their name, identity number, mobile number and address up to date with the bank, and to register for PayNow with their NRIC, FIN or UEN so a payout can reach them.' },
    { q: 'How quickly would SDIC pay out if a bank failed?', a: 'SDIC states that its target is to send most payments within seven working days after MAS activates a payout. Depositors do not file a claim: compensation is worked out from the failed bank’s records, and paid by PayNow or by cashier’s order to the address registered with the bank. For amounts above the limit, SDIC submits a claim to the liquidator on the depositor’s behalf.' },
    { q: 'Are SRS and CPF investment balances insured?', a: `Cash placed under the Supplementary Retirement Scheme with a member bank is insured and added to your other deposits at that bank, within the same ${K.sgd(L)}. Cash balances under the CPF Investment Scheme and the CPF Retirement Sum Scheme are added together and insured separately, up to another ${K.sgd(L)}. Securities bought with SRS or CPF money, such as shares or bonds, are not deposits and are not covered.` },
  ],
  body: (h) => `
<h2>One limit per depositor, per bank</h2>
<p>The limit applies to a person at a bank, not to an account. Every Singapore dollar savings, current and fixed deposit you hold at one member bank is added up, together with any SRS money placed there, and the total is insured up to ${K.sgd(L)}. Open three accounts at the same bank and you still have one limit there. Hold deposits at two different member banks and you have two limits, one at each.</p>
<p>In the worked case at the top, ${K.sgd(a)} at bank A and ${K.sgd(b)} at bank B are insured for ${two.value} together. The whole of bank B's balance is inside the limit; at bank A, ${K.sgd(outA)} is not. The calculator does not ask for account types because the scheme does not separate them: only the total per bank matters.</p>
${h.mini('sdic', { t: 'Cover at a single bank', p: ['a'], d: { a: 130000, b: 0 } })}

<h2>What the scheme covers and what it leaves out</h2>
${h.table(['Product', 'Treatment under the Deposit Insurance Scheme'], covered, 'Source: SDIC, scope of coverage and deposit insurance FAQ, read 21 October 2026.', ['l', 'l'])}
<p>The list follows the ${h.ext('https://www.sdic.org.sg/di_scope_of_coverage/', 'SDIC scope of coverage')}. Each member bank keeps a register of the deposit products it offers that are insured, and SDIC notes that account opening forms, statements and marketing material carry the scheme's disclosure statement when a product is insured. Foreign currency deposits and structured deposits are left out because, in SDIC's words, they resemble investment products where the investor takes more risk for a potentially higher return.</p>

<h2>Savings Bonds and T-bills sit outside it, for a different reason</h2>
<p>People moving savings from a bank to government securities sometimes ask whether they give up the insurance. They do give it up, but the comparison is not like for like. A deposit is a claim on a bank, and the insurance exists in case that bank fails. A ${h.a('singapore-savings-bonds', 'Savings Bond')} or a ${h.a('t-bill-singapore', 'T-bill')} is a claim on the Singapore Government, backed by the government itself and held for you at the Central Depository, so its repayment does not depend on any bank staying solvent. There is also no cap: the ${K.sgd(L)} limit has no counterpart for these securities, though Savings Bonds have a holding limit of ${K.sgd(K.P.ssb.maxHolding)} per person.</p>

<h2>Joint accounts, loans and mergers</h2>
<p>A joint account is split equally between holders unless the bank's records show otherwise, and each share joins the holder's own deposits at that bank. SDIC's illustration: ${K.sgd(own)} in your own name and a ${K.sgd(joint)} joint account with a spouse give you ${K.sgd(jointTotal)} at the bank, insured up to ${K.sgd(jointCovered)}.</p>
<p>Money you owe the same bank is not deducted. With ${K.sgd(sav)} in savings and ${K.sgd(fdep)} in a fixed deposit at one bank, and an outstanding credit card balance there too, ${K.sgd(loanCase)} is insured; the card balance is still owed to the liquidator. A deposit pledged as collateral for a loan keeps its cover. When two member banks merge and your combined balance across them was above the limit just before the merger, SDIC keeps separate limits for one year after the transfer, up to ${K.sgd(L * 2)} in all.</p>
${h.mini('sdic', { t: 'Two banks, two limits', p: ['a', 'b'], d: { a: 95000, b: 120000 } })}

<h2>A sum larger than one limit</h2>
<p>Because the cover is counted per bank, a large sum is fully insured only if no single member bank holds more than ${K.sgd(L)} of it in your name. A retiree with ${K.sgd(big)} in cash would need it spread over at least ${banks} member banks for every dollar to fall inside the scheme. That is arithmetic, not a recommendation: many people accept an uninsured part at a bank they trust, and others move the part above the limit out of deposits altogether. The calculator shows the split for two banks; for a third, run it again with the remaining sum.</p>
<p>Two details catch people out. Deposits held in the name of your sole proprietorship at the same bank are added to your personal deposits there, as SDIC's own examples show, while a partnership counts as a separate depositor with its own limit. And the limit applies to Singapore dollar balances only: a US dollar deposit at the same bank adds nothing to the cover.</p>

<h2>Who is a member, and how a payout works</h2>
<p>All full banks and finance companies in Singapore must be members of the scheme unless MAS exempts them, including foreign banks with a full banking licence; wholesale and merchant banks are not required to join. The fund that pays compensation is built from yearly premiums paid by members. If MAS decides that a payout is needed, after a winding-up order or a finding that a member cannot meet its obligations, SDIC computes each depositor's compensation from the bank's records and aims to send most payments within seven working days.</p>
<p>When the limit went up to ${K.sgd(L)} in 2024, SDIC reported that MAS expected it to cover 91 % of depositors in full, up from 89 % at the old limit, according to ${h.ext('https://www.sdic.org.sg/api/207/Deposit%20insurance%20limit%20goes%20up%20to%20100000%20from%20today%20SDIC%20launches%20public%20education%20campaign.pdf', 'the SDIC media release of 1 April 2024')}. The rules on this page come from the ${h.src('sdic', 'SDIC deposit insurance FAQ')}; the treatment of government securities is described on ${h.src('mas_compare', 'the MAS comparison of SGS bonds, T-bills and Savings Bonds')}.</p>`,
  tool: 'sdic',
  toolArg: { a, b },
  related: ['fixed-deposit-rates-singapore', 'best-savings-account-singapore', 't-bill-vs-fixed-deposit', 'singapore-savings-bonds', 'srs'],
  sources: ['sdic', 'mas_compare', 'mas_tbill'],
});
