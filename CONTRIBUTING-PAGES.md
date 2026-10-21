# Écrire une page de SG Safe Savings (sg-safe-savings)

Notice pour qui écrit les pages. À lire en entier avant d'écrire, avec `~/Documents/GitHub/RECETTE-SITE.md`
(§0, §5, §6, §6.5, §7, §9.3, §11, §17.4, §21, §26).

**Le site** : ce que rapporte une somme placée à Singapour dans les placements « sans risque » : Singapore Savings Bonds
(SSB), T-bills de 6 mois et 1 an, dépôts à terme, comptes d'épargne, SORA, et intérêts CPF (OA, SA, MA, RA, extra
interest, retirement sums, CPF LIFE), plus SRS. **Anglais seul**, sous `/en/`. Éditeur : la société **Radif Partners**
(jamais un nom de personne). Nom provisoire : « SG Safe Savings ».

**L'angle (phrase de valeur ajoutée)** : la page de la MAS donne le taux d'une SSB sans aucun champ de calcul ; les blogs
qui classent donnent des taux recopiés et des tableaux figés. Nous transformons, pour le montant et la durée du lecteur,
chaque émission de SSB, chaque adjudication de T-bill et les taux CPF en dollars d'intérêts année par année, avec les données
de la MAS relues chaque jour ouvré. Rapport SERP : `~/Documents/GitHub/reports/sg-safe-savings-serp-2026-10-21.md`.

## Interdits

- Jamais se présenter comme la MAS, le CPF Board, l'IRAS ou la SDIC ; jamais « official calculator ». **Aucun lien vers une
  banque, un courtier, un robo-advisor, un comparateur** (dbs, ocbc, uob, posb, moomoo, syfe, endowus, seedly, moneysmart,
  dollarsandsense, beansprout…), aucun nom de banque dans un classement, **aucun conseil personnalisé** (« you should buy »,
  « the best option for you », « we recommend »), aucune promesse. Le site calcule ; il ne choisit pas. Les trois banques
  locales peuvent être nommées comme **canaux de souscription** (DBS/POSB, OCBC, UOB), jamais comparées ni liées.
- Pas de « guaranteed » (le test le refuse) : écrire « backed by the Singapore Government », « you always get back your
  principal ».
- Liens externes : seulement les sources officielles via `h.src(clé)` (clés de `src/data/params-2026.json > sources`) ou
  `h.ext(url, texte)` pour une URL officielle (mas.gov.sg, cpf.gov.sg, iras.gov.sg, sdic.org.sg, data.gov.sg) **que tu as
  lue** (à signaler dans ton compte rendu).
- Aucun lien ni copie vers un site du portefeuille (`~/Documents/GitHub/_trame/domaines-ovh.txt`). Ne pas recouper
  singaporesalary.com : **pas de calcul de cotisations CPF sur salaire** (taux employeur/employé, plafond de salaire) ; on
  part toujours de soldes que le lecteur saisit.
- **Un chiffre incertain ne se publie pas.** Tout chiffre vient du kit (`K.…`) ou d'un calcul du moteur. Un nombre absent du
  kit ne s'écrit pas, sauf lu toi-même sur une source officielle (alors `h.ext`, et signale-le). Les textes officiels déjà lus
  sont dans `research/sources/*.txt` (copie des pages MAS, CPF, IRAS, SDIC lues le 2026-10-21) : **lis-les avant d'écrire une
  règle**.
- **Pas de frais de T-bill** : la MAS ne publie aucun frais bancaire pour les T-bills ; ne pas écrire « $2 fee » pour un
  T-bill. Les frais SSB (2 $ par demande, 2 $ par rachat, rien à l'échéance) sont, eux, publiés (`K.P.ssb.fee`,
  `K.P.ssb.redemptionFee`).
- Une **estimation** (prochaine adjudication) s'écrit « estimate », avec sa méthode et son erreur passée (`K.estimate`) ;
  jamais « forecast », jamais présentée comme venant de la MAS.
- Dates écrites en toutes lettres (`K.day('2026-10-27')` → « 27 October 2026 », `K.month`), jamais 2026-10-27 dans le texte.

## D'où viennent les chiffres

| Donnée | Source | Fichier |
|---|---|---|
| Émissions SSB (coupons 1 à 10, moyennes, dates, taille, demandes, allotment) depuis 2015 | API statistique MAS | `src/data/ssb.json` |
| Adjudications T-bills 1 an (BY) depuis 2015, 6 mois (BS) depuis juin 2019 | API statistique MAS | `src/data/tbills.json` |
| Calendrier annoncé (prochaines SSB, prochaines adjudications) | API MAS (issuance calendar) | `src/data/calendar.json` |
| SORA quotidien, 12 mois (overnight, 1M/3M/6M compounded) | MAS Domestic Interest Rates | `src/data/sora.json` |
| Taux moyens des dépôts bancaires (FD 1/3/6/12 mois, épargne), trimestriels depuis 2021 T3 | MAS MSB table III.3A | `src/data/deposits.json` |
| Règles SSB/T-bill, taux CPF T4 2026, extra interest, BHS, BRS/FRS/ERS 2026-2027, CPF LIFE, SRS, SDIC | MAS, CPF Board, IRAS, SDIC | `src/data/params-2026.json` |

Ces fichiers sont réécrits chaque jour ouvré par `scripts/update-data.mjs` : **un texte ne doit jamais supposer une valeur**
(« the coupon is 1.67 % ») ; il la lit (`K.pc(K.LATEST.coupon[0])`). Et une phrase doit rester vraie si la valeur change
(pas de « rates fell this month » écrit en dur : le calculer, ou ne pas l'écrire).

## Les fichiers d'une page

| Page | Fichier | Route |
|---|---|---|
| Sujet + calculateur | `src/content/guides/<id>.ts` (`defineGuide`) | `/en/<slug>/` |
| Accueil | `src/content/home.ts` | `/en/` |

Pages prévues : `src/lib/planned.ts`. **Modèle (copier la structure, jamais les phrases)** :
`src/content/guides/singapore-savings-bonds.ts`.

Le gabarit affiche seul : H1, `intro`, le calculateur (`tool`, réglé par `toolArg`), le chapeau replié (`resume`), le corps
(`body`), la FAQ, les pages liées, les sources.

### Champs

| Champ | Règle |
|---|---|
| `id` = nom du fichier = `slug` | minuscules et tirets, sans année |
| `group` | `ssb`, `tbill`, `deposit` ou `cpf` ; `order` = rang dans le groupe (10, 20, 30…) |
| `title` | **50 à 60 caractères**, contient **2026**, **terme-clé en tête** (« SSB Interest Rate 2026: … »). Jamais How/What/When/Why/Is/Can/Calculator/« SG » en tête ; « Singapore » en tête seulement dans « Singapore Savings Bonds ». Pas de tiret cadratin ni demi-cadratin ; unique |
| `description` | **150 à 160 caractères**, contient 2026, un chiffre du kit, unique. **Attention aux valeurs variables** : un nom de mois (May / September) ou un nombre qui change de largeur fait varier la longueur ; préférer des chiffres de largeur stable (`K.pc`) et garder 3 à 4 caractères de marge de chaque côté |
| `intro` | une phrase propre à la page, qui dit quoi saisir dans le calculateur |
| `resume` | **UN** paragraphe de 120 mots ou plus (viser 130 à 170) : la réponse, chiffres compris ; la première phrase porte le message |
| `body(h)` | HTML (`h2`, `h3`, `p`, `ul`, `h.table`). **≥ 650 mots de prose hors tableaux** (viser 750 à 1 000) |
| `faqs` | 3 à 6 vraies questions, réponses **40 à 90 mots** ; **une question n'existe qu'une fois sur tout le site** (accueil compris : voir `home.ts`) |
| `related` | 3 à 6 ids de `planned.ts` (ou `method`, `about`) |
| `sources` | ≥ 2 clés de `params-2026.json > sources` (≥ 3 pour une page pilier) |
| `tool` | une clé de `src/lib/tool-specs.ts` (tableau ci-dessous) |
| `toolArg` | valeurs par défaut propres à la page (clés des champs) |

### Calculateurs (`tool`, `h.mini(kind, …)`) et leurs champs

| Clé | Champs (id, libellé) |
|---|---|
| `compare` | `amt` Cash to place · `yrs` Years · `fd` Fixed deposit rate (%) · `age` (`u55`/`o55`) |
| `ssb` | `amt` Amount invested · `yrs` Years you keep it · `iss` (code d'émission, ex. `GX26110X`) |
| `ssbrate` | `iss` |
| `ssbredeem` | `amt` · `iss` · `mo` Months held when you redeem |
| `ssballot` | `amt` You apply for |
| `ssbswitch` | `amt` · `iss` Bond you hold · `mo` Months held so far · `yrs` Years ahead |
| `tbill` | `amt` Face value · `tm` (`6M`/`1Y`) · `yl` Cut-off yield (%) |
| `tcalc` | `yl` Yield (%) · `dy` Days to maturity |
| `tnext` | `tm` · `amt` |
| `thist` | `tm` · `yr` (année, chaîne `'2024'`) |
| `tcpf` | `amt` OA money used · `tm` · `yl` |
| `fd` | `amt` · `rt` Rate offered (%) · `mo` Tenor (months) |
| `fdcompare` | `amt` · `r1` · `m1` · `r2` · `m2` (taux en %, durées en mois) |
| `tiers` | `amt` Balance · `b1` Rate first tier (%) · `t1` Size first tier · `b2` Rate above (%) |
| `sora` | `amt` · `sp` Spread over 3M compounded SORA (%) · `yrs` Years left |
| `cpfint` | `age` (`u55`/`o55`) · `oa` · `sa` · `ra` · `ma` |
| `cpfproj` | `age` Age now (nombre) · `oa` · `sa` · `ma` · `add` Added each year |
| `cpfrs` | `ra` What you can set aside at 55 |
| `cpflife` | `ra` Retirement Account at 55 |
| `tbid` | `tm` · `bid` Yield you would bid (%) |
| `srs` | `amt` · `mr` Marginal tax rate (%) · `yl` Yield inside SRS (%) · `yrs` |
| `sdic` | `a` Deposits at bank A · `b` Deposits at bank B |
| `cpfextra` | `age` (`u55`/`o55`) · `oa` · `rest` SA, MA and RA together |
| `topup` | `amt` Cash top-up · `yrs` · `mr` (%) |

## Le kit (règle des chiffres)

```ts
import { KIT as K } from '../../lib/kit';
K.P                      // params-2026.json : K.P.ssb (min, lot, maxHolding, fee, redemptionFee, opens, closes…), K.P.tbill (min, lot, ncLimit…),
                         // K.P.cpf (quarterLabel, rates {oa, sa, ma, ra}, extra {oaCap, under55 {rate, on}, over55 {first, next}}, bhs, hdbRate, smraPeg, floors,
                         //          investOaAbove, investSaAbove, topupReliefCap, topupReliefFamilyCap), K.P.retirement {year, brs, frs, ers, next {year, brs, frs, ers}},
                         // K.P.life.rows [[ra, payout, payout]…], K.P.srs {capCitizen, capForeigner, taxableShare, reliefCap}, K.P.sdic.limit, K.P.valid_to
K.ISSUES                 // toutes les SSB (ordre chronologique) : { code, issue, lastDay, allotment, maturity, size, applied, allotted, done, cutoff, randomRate,
                         //   coupon[10] (en %, ex. 1.67), avg[10] (en %) } — montants size/applied/allotted en S$ millions (K.mn)
K.LATEST, K.ALLOTTED     // dernière émission annoncée (peut être encore ouverte) ; dernière émission dont l'allotment est publié
K.ssb('GX26110X'), K.ssbOf('2024-01')     // une émission par code ou par mois d'émission
K.yby(code, amt, yrs)    // [{ year, coupon (décimal), interest, cumulative, avgReturn (décimal) }]
K.redeem(code, amt, months) // { couponsPaid, accrued, interest, fee, net, perYear (décimal), redeemOn }
K.allot(code, amt)       // { known, sure, random, chance }
K.oversubscribed(issue)
K.bill('6M'|'1Y')        // dernière adjudication : { code, auction, issue, maturity, days, cutoff (%), price, median, average, offered, allotted, bids, cover, ncAllotted, ncPct, cPct }
K.bills('6M'), K.yearBills('6M', 2024), K.upcoming()
K.estimate('6M')         // { estimate (%), from, mae, p80, count, within10 } — estimation naïve (dernier cut-off), erreur passée
K.buy(face, y%, days)    // { face, cost, interest, net, yearly (décimal), price } ; K.price(y%, days) ; K.roc(price, days) ; K.rollover(cash, y%, years, 0, days)
K.cpf({ age55, oa, sa, ma, ra })  // { base, extra, total, lines }
K.oaBill(amt, y%, days)  // { billInterest, oaInterest, gain, monthsOut, breakEven (%) }
K.life(ra), K.rs(ra)     // CPF LIFE (interpolation entre les 3 estimations CPF : à dire) ; position face aux retirement sums
K.fd(amt, rate décimal, months, renew), K.tiers(balance, [[size, rate]…]), K.compare(amt, yrs, fdRate décimal, age55)
K.sora()                 // dernier jour { date, overnight, c1m, c3m, c6m } (en %) ; K.SORA.days ; K.soraLoan(amt, spread décimal, years)
K.dep(), K.DEPOSITS      // dernier trimestre III.3A { q: '2026 Q2', fd1, fd3, fd6, fd12, sav, top12, topSav } (en %) ; K.DEPOSITS.quarters
K.CAL                    // calendrier annoncé : K.CAL.ssb [{ code, name, lastDay, allotment, issue }], K.CAL.bills [{ code, term, auction, issue, days }]
K.tool('ssb', { amt: 5000, yrs: 3 })      // résultat d'un calculateur { label, value, sub, rows, table? }
K.SSB_READ, K.BILLS_READ // date des dernières données
K.sgd(x) "S$1,234" · K.sgd2(x) "S$1,234.56" · K.pct(0.0167) "1.67 %" · K.pc(1.67) "1.67 %" (valeur en %, comme la MAS) · K.num · K.dec(x, d)
K.day('2026-10-27') "27 October 2026" · K.month('2026-11') "November 2026" · K.monthShort · K.mn(243.4) "S$243 million"
```

Dans `body(h)` : tout le kit, plus `h.a(id, texte)` (lien interne ; id inconnu = test en échec, sauf id prévu dans
`planned.ts`), `h.table(entêtes, lignes, légende, alignements)`, `h.src(clé, texte)`, `h.ext(url, texte)`, `h.box(titre, html)`,
`h.mini(kind, { t: 'titre', p: ['ids des champs montrés'], d: { valeurs par défaut } })`.

**Mini-simulateurs (RECETTE §9.3)** : 1 à 3 par page, **au moins un**, sur le sujet du paragraphe qui précède, 1 ou 2 champs
montrés, valeurs propres à la page. Jamais le même mini avec les mêmes valeurs qu'une autre page.

## Ton et unicité

- Anglais (orthographe britannique, comme à Singapour : « programme », « recognise »), voix humaine, phrases de longueur
  variable, **le chiffre d'abord**. Lecteur : un salarié singapourien qui a 30 000 S$ qui dorment sur un compte, un retraité
  qui fait tourner ses T-bills, un expatrié qui découvre les SSB, un membre CPF de 50 ans qui regarde sa Full Retirement Sum.
  Expliquer chaque sigle à sa première apparition (SGS, CDP, SRS, OA, SA, MA, RA, BHS, FRS, SORA).
- Interdits (le test les refuse) : tirets cadratin et demi-cadratin, « it's important to note », « dive into », « delve »,
  « whether you're », « navigate the », « Moreover », « Additionally », « Furthermore », « game changer », « unlock »,
  « guaranteed », « call us », « you should buy/invest/redeem/sell/switch ». Pas de triplets en série, pas de conclusion qui
  résume, pas d'émoji.
- **Unicité** (§6) : `python3 scripts/sim-pages.py` compare toutes les pages (texte hors tableaux et calculateurs, chiffres
  neutralisés, seuil 30 %). Titres `h2`/`h3` propres, angle propre, exemples chiffrés propres à la page (montants, émissions,
  durées différents d'une page à l'autre). Ne jamais reprendre une phrase d'une autre page ni du modèle.
- `1.67 %` s'écrit avec `K.pc`/`K.pct` ; un pourcentage tapé à la main prend une espace (« 4 % »).

## Contrôles

```bash
cd ~/Documents/GitHub/a-publier/Mottalib-10M/sg-safe-savings
PAGE_FILES=ssb-interest-rate,cpf-calculator npx vitest run tests/pages.test.ts   # tes pages
npx vitest run tests/pages.test.ts && python3 scripts/sim-pages.py               # tout le site + similarité ≤ 30 %
```
