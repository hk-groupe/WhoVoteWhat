# 🗳️ Votons.app — Présidentielle 2027

Site d'information électorale : un quiz d'affinité pour découvrir quel candidat à l'élection présidentielle française de 2027 se rapproche le plus de vos idées.

## ✨ Fonctionnement

1. **100 questions** (10 thèmes × 10) sur les vraies propositions des candidats : économie, retraites, institutions, immigration, sécurité, écologie, éducation, Europe & politique internationale, numérique & IA, religion & laïcité.
2. **3 réponses possibles** : d'accord, mitigé, pas d'accord — le nombre de questions (10 à 100) est choisi librement sur la page d'accueil.
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

Le site a deux composants à déployer :

- **Front** : site statique généré dans `dist/` — à servir derrière Nginx/Apache ou un hébergeur statique.
- **API Node** (`server/index.mjs`) : contenu partagé (back-office) + consolidation quotidienne des scrutins. Elle doit tourner sur un serveur Node (pas d'hébergement statique pur).

> 💡 **Contenu persisté** : si un `server/data/contenu.json` existe déjà (créé par une sauvegarde back-office), l'API **fusionne automatiquement** au démarrage les candidats et positions manquants du code source. Vos éditions du back-office restent intactes. Aucune suppression manuelle n'est nécessaire.

Le site est en production sur **https://timerush.hk-groupe.fr/** — l'application **et** le back-office sont servis sur ce domaine unique (le back-office est accessible depuis le menu du site, l'API étant proxifiée sur `/api`).

### Méthode A — Déploiement via Git avec clé SSH (recommandée)

Le serveur tire le code directement depuis GitHub (`git pull`) en s'authentifiant avec une **clé de déploiement** (deploy key) dédiée — aucun mot de passe, aucun token.

#### 1. Préparer le serveur

- **Node.js 18+** et **npm** installés.
- Le domaine `timerush.hk-groupe.fr` pointe (enregistrement A/AAAA) vers l'IP du serveur.
- Un certificat HTTPS (voir étape 7, Certbot).
- Accès SSH au serveur (ex. `ssh ubuntu@vps-c8527c7e.vps.ovh.net`).

#### 2. Créer la clé de déploiement SSH

Sur le serveur, générer une paire de clés dédiée au déploiement (sans phrase de passe, pour permettre `git pull` non interactif) :

```bash
ssh-keygen -t ed25519 -C "deploy-timerush" -f ~/.ssh/id_ed25519_deploy -N ""
cat ~/.ssh/id_ed25519_deploy.pub
```

Déclarer la clé publique sur GitHub : repo `hk-groupe/WhoVoteWhat` → **Settings → Deploy keys → Add deploy key**, coller la clé publique, titre `deploy-timerush`, **Read only** suffit (pas besoin d'accès en écriture).

Configurer SSH pour utiliser cette clé avec GitHub. Le fichier `~/.ssh/config` indique au client SSH quelle clé présenter quand on parle à `github.com` ; s'il n'existe pas encore, la commande `cat >>` le crée :

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
cat >> ~/.ssh/config <<'EOF'
Host github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_deploy
  IdentitiesOnly yes
EOF
chmod 600 ~/.ssh/config
```

- `Host github.com` : les lignes suivantes s'appliquent dès qu'une connexion vise `github.com` (c'est le cas de `git@github.com:hk-groupe/WhoVoteWhat.git`).
- `User git` : utilisateur SSH imposé par GitHub pour Git.
- `IdentityFile` : chemin de la **clé privée** de déploiement créée à l'étape précédente (le fichier sans `.pub`).
- `IdentitiesOnly yes` : n'essaie que cette clé, sans parcourir les autres clés de l'agent — évite d'être rejeté pour trop de tentatives.

Vérifier :

```bash
ssh -T git@github.com
# attendu : "Hi hk-groupe/WhoVoteWhat! You've successfully authenticated..."
```

#### 3. Récupérer le code et installer

```bash
sudo mkdir -p /srv && sudo chown $USER /srv
git clone git@github.com:hk-groupe/WhoVoteWhat.git /srv/WhoVoteWhat
cd /srv/WhoVoteWhat
npm ci
```

#### 4. Configurer les variables d'environnement

| Variable | Rôle | Valeur recommandée en production |
|---|---|---|
| `PORT` | Port d'écoute de l'API | `4000` (ou le port choisi) |
| `CLE_SECRETE` | Clé de session du back-office | une chaîne aléatoire longue (obligatoire, sinon les sessions ne survivent pas à un redémarrage) |
| `ORIGINE_AUTORISEE` | Origine CORS autorisée pour l'API | `https://timerush.hk-groupe.fr` (ne pas laisser `*` en production) |
| `HEURE_MAJ_SCRUTINS` | Heure de la mise à jour quotidienne des scrutins | `03:30` par défaut |
| `VITE_API_URL` | URL de l'API intégrée au build du front | laisser vide — l'API est proxifiée sur `/api` du même domaine (renseigner uniquement si l'API est sur un autre domaine) |

Exemple :

```bash
export PORT=4000
export CLE_SECRETE="$(openssl rand -hex 32)"
export ORIGINE_AUTORISEE="https://timerush.hk-groupe.fr"
```

Rendre la configuration persistante, par exemple dans un fichier PM2 chargé au démarrage — à créer **à la racine du projet** (remplacer `/srv/WhoVoteWhat` par votre chemin réel si différent, ex. `/home/ubuntu/WhoVoteWhat`) :

```bash
cat > ecosystem.config.cjs <<'EOF'
module.exports = {
  apps: [{
    name: 'votons-api',
    script: 'server/index.mjs',
    env: {
      PORT: 4000,
      CLE_SECRETE: '<coller ici le résultat de la commande openssl rand -hex 32>',
      ORIGINE_AUTORISEE: 'https://timerush.hk-groupe.fr'
    }
  }]
}
EOF
chmod 600 ecosystem.config.cjs
```

#### 5. Construire le front

```bash
npm run build
```

Le site statique (application + back-office) est généré dans `dist/`.

#### 6. Démarrer l'API en service persistant

L'installation globale de PM2 écrit dans `/usr/lib/node_modules` : elle nécessite `sudo` (l'erreur npm `EACCES` apparaît sans lui).

```bash
sudo npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

> ⚠️ `pm2 startup` affiche lui-même la commande exacte à exécuter (avec `sudo env PATH=...`) : la copier telle quelle. Après le `pm2 save`, l'API redémarre automatiquement au reboot du serveur.

Au premier démarrage, l'API consolide l'open data des scrutins, puis rejoue la consolidation chaque nuit — aucune tâche planifiée à configurer.

#### 7. Exposer le site (reverse proxy + HTTPS automatique)

Deux variantes selon le serveur web installé.

**Variante Caddy (recommandée — HTTPS entièrement automatique, aucun certificat à gérer)** :

```bash
sudo tee /etc/caddy/Caddyfile >/dev/null <<'EOF'
timerush.hk-groupe.fr {
    root * /home/ubuntu/WhoVoteWhat/dist
    encode gzip

    handle /api/* {
        reverse_proxy 127.0.0.1:4000
    }

    handle {
        try_files {path} /index.html
        file_server
    }
}
EOF
sudo systemctl reload caddy
```

Caddy obtient et renouvelle le certificat HTTPS tout seul, redirige le HTTP vers HTTPS, sert le front depuis `dist/` et proxifie l'API sur `/api`. Adapter le chemin `root` à l'emplacement du clone. Si Nginx est aussi installé, le désactiver pour libérer le port 80 : `sudo systemctl disable --now nginx`.

**Variante Nginx + Certbot** :

```bash
sudo apt install nginx certbot python3-certbot-nginx
sudo tee /etc/nginx/sites-available/timerush.hk-groupe.fr >/dev/null <<'EOF'
server {
  listen 80;
  server_name timerush.hk-groupe.fr;
  root /srv/WhoVoteWhat/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
EOF
sudo ln -sf /etc/nginx/sites-available/timerush.hk-groupe.fr /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d timerush.hk-groupe.fr
```

Le site (et le back-office, via le bouton « 🛠️ Back-office (admin) » du menu) est alors servi sur **https://timerush.hk-groupe.fr/** ; l'API répond sur `https://timerush.hk-groupe.fr/api/...`.

Le front statique étant servi par Nginx depuis `dist/`, le chemin du projet dans `root` doit correspondre à l'emplacement du clone (adapter `/srv/WhoVoteWhat/dist` si le projet est ailleurs, ex. `root /home/ubuntu/WhoVoteWhat/dist;`).

#### 8. Mettre à jour (routine)

Après un push sur `main`, depuis le serveur (la clé de déploiement s'authentifie automatiquement, sans mot de passe) :

```bash
cd /srv/WhoVoteWhat
git pull
npm ci
npm run build
pm2 restart votons-api
```

### Méthode B — Déploiement via FTP / SFTP (glisser-déposer depuis votre PC)

Adaptée à un serveur accessible en FTP/SFTP (VPS, hébergement mutualisé avec Node.js). Le backend n'ayant **aucune dépendance externe** (modules Node natifs uniquement), rien n'est à installer sur le serveur : vous déposez simplement les fichiers.

#### 1. Construire en local

```bash
npm ci
npm run build          # génère dist/
```

#### 2. Glisser-déposer sur le serveur

Avec FileZilla, WinSCP ou lftp, transférez **uniquement** ces éléments (par exemple vers `/srv/WhoVoteWhat/`) :

- `dist/` — le site statique
- `server/` — le backend (⚠️ ne pas écraser `server/data/` s'il existe : il contient vos données back-office)
- `public/` — assets servis par le backend
- `package.json` et `package-lock.json`

**N'uploadez pas** `node_modules/` (inutile sur le serveur : le backend tourne sans rien installer) ni `src/`, `scripts/`, fichiers de config (utiles uniquement pour rebuild en local).

Exemple SFTP avec lftp (VPS OVH) :

```bash
lftp sftp://ubuntu@vps-c8527c7e.vps.ovh.net
mirror -R dist/ /srv/WhoVoteWhat/dist/
mirror -R server/ /srv/WhoVoteWhat/server/ -x data/
mirror -R public/ /srv/WhoVoteWhat/public/
put package.json -o /srv/WhoVoteWhat/package.json
put package-lock.json -o /srv/WhoVoteWhat/package-lock.json
```

#### 3. Configurer et démarrer

Sur le serveur (SSH), même configuration que la méthode A :

```bash
cd /srv/WhoVoteWhat
export PORT=4000
export CLE_SECRETE="$(openssl rand -hex 32)"
export ORIGINE_AUTORISEE="https://timerush.hk-groupe.fr"

# service persistant
sudo npm install -g pm2
pm2 start server/index.mjs --name votons-api
pm2 save && pm2 startup
```

> 💡 Sur un VPS, la **méthode A (Git)** reste la plus simple au quotidien ; la méthode B convient si vous préférez FileZilla ou ne voulez pas de Git sur le serveur.

#### 4. Mettre à jour (routine)

1. En local : `git pull && npm ci && npm run build`
2. Re-transférer `dist/` et `server/` (écraser, sauf `server/data/`)
3. Sur le serveur : `pm2 restart votons-api`

#### Variante « front seul » (hébergement 100 % statique, sans Node)

Si votre hébergement ne propose pas Node, seul le front peut être déployé. Le site reste **totalement fonctionnel en lecture** grâce au repli sur les données du code source (candidats, questions, positions — y compris les compléments « ancien programme / prises de position publiques »).

Limites : le back-office en ligne et la mise à jour quotidienne des scrutins ne fonctionnent pas ; le contenu est figé à la version buildée.

```bash
npm ci
npm run build
# puis uploader uniquement le contenu de dist/ à la racine du site
```

### ✅ Vérifier la mise en production

- Le site se charge : page « 👥 Les candidats » affiche **19 candidats** (18 déclarés + Marine Tondelier, conditionnelle).
- Bandeaux « ⚠️ » visibles sur les fiches des 14 candidats sans programme 2027 publié.
- Le quiz fonctionne et classe les 19 candidats.
- La section « 🗳️ Récap des votes » affiche les scrutins (données consolidées depuis l'API).
- **https://timerush.hk-groupe.fr/** se charge, et le back-office est accessible depuis le menu (connexion requise, `CLE_SECRETE` configurée).
- `https://timerush.hk-groupe.fr/api/contenu` répond en JSON (API proxifiée et lancée).
- En cas d'API injoignable, le site reste consultable grâce aux données de repli embarquées.

## 🛠️ Stack

- **Front** : React 19 (Vite), aucune dépendance externe.
- **Back** : Node sans dépendance (`node:http`). Deux rôles :
  - **API de contenu partagée** — le back-office enregistre sur le serveur : tous les utilisateurs voient immédiatement les candidats, questions, thèmes et sources mis à jour, sans mettre à jour de fichiers.
  - **Consolidation quotidienne des scrutins** — chaque nuit, l'open data officielle des scrutins de l'Assemblée nationale (`data.assemblee-nationale.fr`, Licence Ouverte 2.0) est téléchargée et agrégée par groupe ; la section « Récap des votes » se met à jour toute seule.
- **Repli** : si le backend est injoignable, le front retombe sur les données du code source — le site reste consultable.
- Aucune donnée personnelle collectée : le quiz tourne dans le navigateur, le backend ne sert que du contenu et des scrutins.

## 📌 Avertissement

Site indépendant et non partisan. Les programmes étant publiés progressivement par les candidats, les positions sont datées (octobre 2026) et mises à jour au fil des publications officielles.
