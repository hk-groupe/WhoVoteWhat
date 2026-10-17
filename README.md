# 🗳️ QuiVoteQuoi — Présidentielle 2027

Site d'information électorale : un quiz d'affinité pour découvrir quel candidat à l'élection présidentielle française de 2027 se rapproche le plus de vos idées.

## ✨ Fonctionnement

1. **17 questions simples** sur les vraies propositions des candidats (économiques, retraite, immigration, écologie, institutions, Europe...).
2. **3 réponses possibles** : d'accord, mitigé, pas d'accord.
3. **Résultat** : score de compatibilité pour chaque candidat + détail des accords/désaccords, avec la position exacte extraite du programme officiel.

## 📚 Sources — 100 % officielles

Les positions sont extraites des sites et programmes officiels des candidats :

| Candidat | Parti | Programme |
|---|---|---|
| Jean-Luc Mélenchon | La France Insoumise | [melenchon2027.fr — L'Avenir en commun](https://melenchon2027.fr/programme/decouvrir/) |
| Raphaël Glucksmann | Place publique | [place-publique.eu](https://www.place-publique.eu/) |
| Gabriel Attal | Renaissance | [attalpresident.fr](https://attalpresident.fr/) |
| Édouard Philippe | Horizons | [edouardphilippe.fr](https://www.edouardphilippe.fr/) |
| Marine Le Pen | Rassemblement National | [rassemblementnational.fr](https://rassemblementnational.fr/) |

Référence institutionnelle : [programme-candidats.interieur.gouv.fr](https://programme-candidats.interieur.gouv.fr/) (professions de foi publiées par le ministère de l'Intérieur).

## 🧮 Méthode de scoring

- Chaque candidat a une position par question : **pour (1)**, **nuancé (0)**, **contre (-1)**.
- Une réponse d'accord avec un candidat « pour » rapporte +1 ; un désaccord -1.
- Les positions « nuancées » et les réponses « je ne sais pas » sont neutralisées (exclues du dénominateur).
- Score final : `50 + (accords − désaccords) / questions comptées × 50`, normalisé sur 0–100 %.

## 🗳️ Récap des votes

La deuxième brique du site : voir clairement, **par groupe parlementaire, qui a voté quoi** dans les projets de loi à l'Assemblée nationale (17e législature).

- **Les 20 derniers scrutins publics** et leur résultat officiel (adopté / rejeté), avec le détail pour / contre / abstention de chaque groupe.
- **Par thèmes** (budget & impôts, santé & fin de vie, enfance & protection) : la position cumulée de chaque groupe sur des scrutins de référence — l'action réelle des partis.
- **Recherche** d'un scrutin par mot-clé ou numéro.

Source unique et officielle : les pages « Analyse du scrutin » de l'Assemblée nationale — https://www.assemblee-nationale.fr/dyn/17/scrutins — lien direct depuis chaque fiche.

## 🚀 Démarrer

```bash
npm install
npm run dev
```

Build de production :

```bash
npm run build
```

Backend (API de contenu partagée + mise à jour quotidienne des scrutins) :

```bash
npm run api          # démarre l'API sur le port 4000 (PORT, CLE_SECRETE, ORIGINE_AUTORISEE configurables)
npm run maj-scrutins # consolide une fois l'open data officielle des scrutins
```

Au démarrage, l'API consolide l'open data si aucune donnée locale n'existe, puis rejoue la consolidation chaque nuit (03:30 par défaut, `HEURE_MAJ_SCRUTINS`).

## 🚀 Mise en production

### 1. Préparer le serveur

- **Node.js 18+** et **npm** installés sur le serveur.
- Un nom de domaine avec certificat HTTPS (obligatoire pour un site public).

### 2. Récupérer le code et installer

```bash
git clone https://github.com/hk-groupe/WhoVoteWhat.git
cd WhoVoteWhat
npm ci
```

### 3. Configurer les variables d'environnement

| Variable | Rôle | Valeur recommandée en production |
|---|---|---|
| `PORT` | Port d'écoute de l'API | `4000` (ou le port choisi) |
| `CLE_SECRETE` | Clé de session du back-office | une chaîne aléatoire longue (obligatoire, sinon les sessions ne survivent pas à un redémarrage) |
| `ORIGINE_AUTORISEE` | Origine CORS autorisée pour l'API | l'URL publique du site, ex. `https://whovotewhat.fr` (ne pas laisser `*` en production) |
| `HEURE_MAJ_SCRUTINS` | Heure de la mise à jour quotidienne des scrutins | `03:30` par défaut |
| `VITE_API_URL` | URL de l'API utilisée par le front (build/dev) | ex. `https://api.whovotewhat.fr` |

Exemple :

```bash
export PORT=4000
export CLE_SECRETE="$(openssl rand -hex 32)"
export ORIGINE_AUTORISEE="https://whovotewhat.fr"
```

### 4. Construire le front

```bash
npm run build
```

Le site statique est généré dans `dist/` : servez-le avec Nginx, Caddy ou tout serveur statique.

### 5. Démarrer l'API en service persistant

L'API Node tourne sans dépendance externe. Utilisez un process manager pour qu'elle survive aux redémarrages :

```bash
# Exemple avec pm2
npm install -g pm2
pm2 start server/index.mjs --name whovotewhat-api
pm2 save && pm2 startup
```

Au premier démarrage, l'API consolide l'open data des scrutins, puis rejoue la consolidation chaque nuit — aucune tâche planifiée à configurer.

### 6. Exposer le site (reverse proxy)

Exemple minimal Nginx : le front en statique sur le domaine public, l'API en proxy inverse sur `/api` :

```nginx
server {
  listen 443 ssl;
  server_name whovotewhat.fr;

  root /srv/WhoVoteWhat/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
  }
}
```

### 7. Vérifier la mise en production

- Le site se charge et le quiz fonctionne.
- La section « Récap des votes » affiche les scrutins (données consolidées depuis l'API).
- Le back-office requiert une session (`CLE_SECRETE` configurée).
- En cas d'API injoignable, le site reste consultable grâce aux données de repli embarquées.

### 8. Mettre à jour

```bash
git pull
npm ci
npm run build
pm2 restart whovotewhat-api
```

## 🛠️ Stack

- **Front** : React 19 (Vite), aucune dépendance externe.
- **Back** : Node sans dépendance (`node:http`). Deux rôles :
  - **API de contenu partagée** — le back-office enregistre sur le serveur : tous les utilisateurs voient immédiatement les candidats, questions, thèmes et sources mis à jour, sans mettre à jour de fichiers.
  - **Consolidation quotidienne des scrutins** — chaque nuit, l'open data officielle des scrutins de l'Assemblée nationale (`data.assemblee-nationale.fr`, Licence Ouverte 2.0) est téléchargée et agrégée par groupe ; la section « Récap des votes » se met à jour toute seule.
- **Repli** : si le backend est injoignable, le front retombe sur les données du code source — le site reste consultable.
- Aucune donnée personnelle collectée : le quiz tourne dans le navigateur, le backend ne sert que du contenu et des scrutins.

## 📌 Avertissement

Site indépendant et non partisan. Les programmes étant publiés progressivement par les candidats, les positions sont datées (octobre 2026) et mises à jour au fil des publications officielles.
