# 🗳️ Votons.app — Présidentielle 2027

Site d'information électorale : un quiz d'affinité pour découvrir quel candidat à l'élection présidentielle française de 2027 se rapproche le plus de vos idées — et bien plus.

> ℹ️ **Ce document explique, en toute transparence, comment le site fonctionne** : d'où viennent les données, comment les scores sont calculés, ce qui est automatisé, ce qui reste humain, et quelles sont nos limites. La documentation technique (installation, déploiement, stack) est dans [`README-dev.md`](./README-dev.md).

## ✨ Les fonctionnalités

### 🎯 Le quiz d'affinité
1. **100 questions** (10 thèmes × 10) sur les vraies propositions des candidats : économie, retraites, institutions, immigration, sécurité, écologie, éducation, Europe & politique internationale, numérique & IA, religion & laïcité.
2. **3 réponses possibles** : d'accord, mitigé, pas d'accord — le nombre de questions (10 à 100) est choisi librement.
3. **Résultat** : score de compatibilité pour chaque candidat + détail des accords/désaccords, avec la position exacte extraite du programme officiel.

### ✍️ Compose ton programme
Piochez parmi **toutes les propositions extraites des programmes officiels 2027**, listées de manière anonyme et regroupées par thématique, pour composer votre propre programme — puis comparez-le à ceux des candidats : quelles propositions vous sont communes, lesquelles divergent, avec pour chacune le lien direct vers sa source dans le programme d'origine.

### 🗳️ Récap des votes
Voir clairement, **par groupe parlementaire, qui a voté quoi** à l'Assemblée nationale (17e législature) :
- **Les 20 derniers scrutins publics** et leur résultat officiel (adopté / rejeté), avec le détail pour / contre / abstention de chaque groupe.
- **Par thèmes** (budget & impôts, santé & fin de vie, enfance & protection) : la position cumulée de chaque groupe sur des scrutins de référence.
- **Recherche** d'un scrutin par mot-clé ou numéro.

### 👥 Les candidats
La liste de tous les candidats déclarés, avec le résumé de leur programme, leurs statuts de candidature et l'état de publication de leur programme 2027.

### 📅 Le calendrier
Toutes les élections à venir, en France et en Europe.

## 📚 Sources — 100 % officielles

Les positions sont extraites des sites et programmes officiels des candidats :

| Candidat | Parti | Programme |
|---|---|---|
| Jean-Luc Mélenchon | La France Insoumise | [melenchon2027.fr — L'Avenir en commun](https://melenchon2027.fr/programme/decouvrir/) |
| Raphaël Glucksmann | Place publique | [place-publique.eu](https://www.place-publique.eu/) |
| Gabriel Attal | Renaissance | [attalpresident.fr](https://attalpresident.fr/) |
| Édouard Philippe | Horizons | [edouardphilippe.fr](https://www.edouardphilippe.fr/) |
| Marine Le Pen | Rassemblement National | [rassemblementnational.fr](https://rassemblementnational.fr/) |

Pour les candidats dont le programme 2027 n'est **pas encore publié**, les positions s'appuient sur **leur ancien programme ou leurs prises de position publiques** — un bandeau « ⚠️ » l'indique systématiquement, avec le lien vers la source utilisée. Ces positions seront remplacées par le programme officiel dès sa publication.

Référence institutionnelle : [programme-candidats.interieur.gouv.fr](https://programme-candidats.interieur.gouv.fr/) (professions de foi publiées par le ministère de l'Intérieur).

Pour le récap des votes, la source unique et officielle est l'**open data de l'Assemblée nationale** — https://www.assemblee-nationale.fr/dyn/17/scrutins — avec un lien direct depuis chaque fiche pour vérifier et aller plus loin.

## 🧮 Méthode de scoring — comment le score est calculé

- Chaque candidat a une position par question : **pour (1)**, **nuancé (0)**, **contre (-1)**.
- Une réponse d'accord avec un candidat « pour » rapporte +1 ; un désaccord -1.
- Les positions « nuancées » et les réponses « je ne sais pas » sont neutralisées (exclues du dénominateur).
- Score final : `50 + (accords − désaccords) / questions comptées × 50`, normalisé sur 0–100 %.

**Code couleur des scores** : 0–25 % rouge · 25–50 % orange · 50–75 % bleu · 75–100 % vert.

## 🔍 Statuts et labels — que signifient-ils ?

| Label | Signification |
|---|---|
| ⚠️ **Candidat déclaré** (violet) | Candidature déclarée publiquement, mais **pas encore officielle** : les parrainages n'ont pas été validés par le Conseil constitutionnel |
| **Candidature conditionnelle** | La participation du candidat à l'élection n'est pas encore confirmée |
| **Candidature officielle** | Candidature validée officiellement |
| 📄 **Programme publié** | Le programme de campagne 2027 est publié : les propositions affichées sont directement issues du programme officiel |
| 📄 **Programme non publié** | Le programme 2027 n'est pas encore publié : les positions s'appuient sur l'ancien programme ou des prises de position publiques |

## 🔄 Comment les données sont mises à jour

La fraîcheur des données repose sur un mélange **d'automatisation et de travail éditorial humain** — voici exactement qui fait quoi :

### Automatique (chaque jour)
- **Scrutins de l'Assemblée nationale** : chaque nuit, l'open data officielle est téléchargée et agrégée par groupe parlementaire — la section « Récap des votes » se met à jour toute seule.
- **Propositions des programmes** : les pages des programmes officiels publiés sont re-extraites chaque jour (intitulés exacts, liens directs).
- **Surveillance des sources** : les URLs des programmes et sources de tous les candidats sont vérifiées (site inaccessible, page déplacée) — toute anomalie est signalée dans un rapport quotidien.

### Éditorial (par des humains)
- **Statuts des candidatures** (déclaré / officiel / conditionnel) : il n'existe pas de flux machine public et fiable pour ces informations — elles sont vérifiées et saisies via le back-office.
- **Positions sur les questions du quiz** : chaque position est relue, sourcée et datée par rapport au texte officiel du programme.
- **Prises de parole** : sélection et reformulation sourcée.

Un rapport de mise à jour est généré quotidiennement (`server/data/rapport-maj.json`) ; les anomalies détectées (ex. programme déplacé) sont vérifiées avant correction.

## 🔒 Vie privée — ce que nous collectons (rien)

**Aucune donnée personnelle n'est collectée.** :

- Le quiz tourne **entièrement dans votre navigateur** — vos réponses ne quittent jamais votre appareil.
- Aucun compte utilisateur, aucun cookie publicitaire, aucun traceur.
- Le backend ne sert que du contenu (programmes, scrutins) — il ne reçoit ni ne stocke vos réponses.
- Aucune donnée de navigation n'est exploitée à des fins commerciales.

## ⚖️ Limites assumées

- **Fenêtre glissante des scrutins** : le site affiche les 20 derniers scrutins et des votes de référence par thème (fenêtre de douze mois), pas l'intégralité de la législature. Les « non-votants » (présidents de séance, absents) ne sont pas comptés dans les jauges.
- **Simplification assumée** : les scores et synthèses résultent d'un traitement simplifié d'informations publiques — ils ne reflètent pas l'exhaustivité ni la complexité des programmes.
- **Programmes incomplets** : les programmes 2027 étant publiés progressivement, « Compose ton programme » ne compare aujourd'hui que les candidats au programme publié et extractible — les autres sont explicitement signalés.
- **Datation** : les positions sont datées (octobre 2026) et mises à jour au fil des publications officielles.

## 📌 Avertissement

**Votons.app est un projet indépendant de vulgarisation à but strictement informatif.** Les contenus proposés — quiz d'affinité, compose ton programme, récapitulatif des votes et positions des candidats — sont établis à partir de sources officielles, mais ne constituent **ni un conseil de vote**, ni une recommandation, ni un soutien à un candidat ou à une formation politique, et ne se substituent en aucun cas à la recherche et la lecture intégrale des programmes électoraux et des textes officiels.

L'application a pour seul objet de vous aider à **y voir plus clair** dans l'offre politique et à orienter votre propre réflexion. En utilisant ce site, vous reconnaissez que vos choix électoraux relèvent de votre seule et entière responsabilité.

---

🔧 Pour la documentation technique (installation, déploiement, choix de stack) : **[README-dev.md](./README-dev.md)**
