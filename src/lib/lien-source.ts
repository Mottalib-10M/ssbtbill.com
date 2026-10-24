/**
 * Sources citées sans lien : le CPF Board et l'IRAS n'autorisent un lien vers leur page d'accueil
 * qu'après une notification écrite, que leurs formulaires (UEN ou Singpass exigés) ne permettent pas
 * à un éditeur étranger (décision de l'éditeur, 2026-10-24). La source reste nommée, avec son domaine
 * en texte. La MAS, notifiée par écrit, garde son lien vers la page d'accueil.
 */
const SANS_LIEN = /^https?:\/\/(www\.)?(cpf|iras)\.gov\.sg(\/|$)/i;
export const lienAutorise = (url: string) => !SANS_LIEN.test(url);
export const domaine = (url: string) => url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/.*$/, '');
