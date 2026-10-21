# Données de SG Safe Savings : sources, licences, mise à jour

## Fichiers et sources

| Fichier | Contenu | Source | Rythme |
|---|---|---|---|
| `src/data/ssb.json` | 134+ émissions SSB depuis 2015 : coupons 1 à 10, moyennes, dates, taille, demandes, allotment (montants en S$ millions) | API statistique MAS `bondsandbills/m/listsavingbonds` + `savingbondsinterest` (sans clé, JSON) | annonce le 1er jour ouvré du mois, résultats l'avant-avant-dernier jour ouvré |
| `src/data/tbills.json` | adjudications T-bills 6 mois (BS) et 1 an (BY) depuis 2015 | API MAS `listbondsandbills?filters=product_type:B` (le filtre `bill_bond_ind:bill` ramène aussi les MAS Bills) | 6 mois : toutes les deux semaines ; 1 an : chaque trimestre |
| `src/data/calendar.json` | prochaines SSB et prochaines adjudications annoncées | API MAS `savingbondsissuancecalendar`, `issuancecalendar?filters=issue_type:T` | au fil des annonces |
| `src/data/sora.json` | 12 mois de SORA quotidien (overnight, 1M/3M/6M compounded) | formulaire MAS `statistics/dir/DomesticInterestRates.aspx` (POST, cases 13 à 17) ; l'API JSON SORA exige une clé APIMG | chaque jour ouvré, publié à 9 h le jour ouvré suivant |
| `src/data/deposits.json` | taux moyens pondérés des dépôts SGD (FD 1/3/6/12 mois, épargne) et plus hauts taux cotés, trimestriels depuis 2021 T3 | MAS MSB table III.3A, `www.mas.gov.sg/api/v1/MAS/chart/table_iii_3a_…` (User-Agent Chrome complet obligatoire) | trimestriel ; l'ancienne série III.3 (mensuelle) est arrêtée depuis mai 2023 |
| `src/data/params-2026.json` | règles SSB/T-bill, taux CPF du trimestre, extra interest, planchers, BHS, BRS/FRS/ERS 2026-2027, estimations CPF LIFE, SRS, SDIC, sources | pages MAS, communiqués CPF Board (22 sept. 2026 ; 15 déc. 2025 pour la BHS), IRAS, SDIC, lus le 2026-10-21 | à la main : chaque trimestre (taux CPF), chaque janvier (sommes de retraite, BHS), à chaque changement de règle |

Copies texte des pages officielles lues : `research/sources/*.txt` (hors git).

## Licences

- **Jeux de données MAS** (API statistique, tableaux MSB, SORA) : *MAS Terms of Use of Datasets* = Singapore Open Data
  Licence v1.0 — licence mondiale, gratuite, usage commercial permis, à condition d'afficher une mention visible de la
  source avec lien vers la licence et de ne suggérer aucun statut officiel ni aval de la MAS. Mention faite sur la page About
  et dans la mention légale ; pied de page « Not affiliated with the Monetary Authority of Singapore ».
- **Pages du site mas.gov.sg** (texte) : reproduction interdite sans accord écrit ; les conditions demandent aussi une
  autorisation avant tout lien profond. Le site ne copie aucun texte MAS (règles reformulées) ; les liens profonds vers les
  pages sources sont à faire valider par l'éditeur (demande d'autorisation à la MAS, ou liens vers les jeux de données).
- **data.gov.sg** : Singapore Open Data Licence v1.0 (même mention).
- **CPF Board, IRAS, SDIC** : chiffres repris (faits), textes reformulés, liens vers la source.

## Mise à jour

`node scripts/update-data.mjs` (ou `--dry-run`) : lit les cinq sources, contrôle (≥ 100 SSB, ≥ 100 T-bills 6 mois, coupons
0-10 %, prix 90-100, ≥ 150 jours de SORA, SORA 0-10 %, ≥ 8 trimestres III.3A) et refuse d'écrire si un contrôle échoue ;
ne réécrit un fichier que si les données ont changé. Le workflow `.github/workflows/deploy.yml` le lance du lundi au
vendredi à 02:30 UTC (10:30 à Singapour), puis tests, commit de `src/data`, build, Pages, IndexNow.

Chaque trimestre : mettre à jour `params-2026.json > cpf` (communiqué CPF Board de fin de trimestre) ; chaque janvier :
`retirement`, `life`, `cpf.bhs`, puis renommer pour l'année.
