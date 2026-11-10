# 🔧 Votons.app — Documentation technique

Documentation à destination des développeurs : stack, choix techniques, installation locale et mise en production. Pour la présentation du site et sa transparence : **[README.md](./README.md)**.

## 🛠️ Stack et pourquoi ces choix

| Technologie | Rôle | Pourquoi ce choix |
|---|---|---|
| **React 19** | Front (UI) | Écosystème mature, composants réutilisables (badges, légendes partagés entre écrans), hooks pour un état local simple. Aucune dépendance UI externe : tout le style est fait main dans `index.css`. |
| **Vite 8** | Build / dev server | Démarrage instantané, HMR rapide, build statique optimisé (`dist/`) déployable partout. Le proxy intégré (`/api` → port 4000) évite tout CORS en local. |
| **Node sans framework** (`node:http`) | Backend | Le serveur (`server/index.mjs`) n'a **aucune dépendance npm** : modules natifs uniquement. Résultat : `npm ci` n'installe rien côté serveur, déploiement FTP possible sans build serveur, surface d'attaque minimale. |
| **ESM partout** (`.mjs`, `.jsx`) | Modules | Import/export natifs, un seul système de modules entre front et back, pas de transpilation serveur. |
| **oxlint** | Lint | Linter Rust très rapide (~60 ms), zéro config, 0 erreur tolérée. |
| **PM2** | Process manager | Redémarrage automatique, logs, démarrage au boot (`pm2 startup`). |
| **Caddy** *(ou Nginx + Certbot)* | Reverse proxy | Caddy gère le HTTPS automatiquement (obtention + renouvellement Let's Encrypt sans intervention). |

**Architecture en bref** :

```
Navigateur ── dist/ (statique) ──┐
                               ├── Caddy/Nginx (HTTPS, /api → proxy)
Navigateur ── /api/* ───────────┘         │
                                          ▼
                              API Node (port 4000)
                              ├─ contenu partagé (back-office)
                              ├─ scrutins consolidés (open data AN)
                              └─ fusion auto code ↔ contenu.json
```

- **Repli gracieux** : si l'API est injoignable, le front retombe sur les données du code source (`src/data/programmes.mjs`) — le site reste consultable.
- **Fusion automatique** : au démarrage, l'API fusionne les candidats/positions du code source dans `server/data/contenu.json` (les éditions back-office ne sont jamais écrasées).

## 📁 Structure du projet

```
├── index.html                  # point d'entrée (titre, favicon)
├── src/
│   ├── App.jsx                 # écrans : accueil, quiz, résultats, transparence
│   ├── ComposeProgramme.jsx    # « Compose ton programme » (sélection + comparatif)
│   ├── Candidats.jsx           # fiches candidats
│   ├── RecapVotes.jsx          # scrutins de l'Assemblée
│   ├── Calendrier.jsx          # élections à venir
│   ├── Badges.jsx              # badges statut / programme (info-bulles)
│   ├── LegendeLabels.jsx       # légende des labels (partagée)
│   ├── NomInformel.jsx         # affichage « Parti · Nom »
│   ├── couleurScore.mjs        # code couleur des scores (0-25 rouge … 75-100 vert)
│   ├── backoffice/             # back-office (édition contenu) + store
│   ├── api/client.mjs          # client API du front
│   └── data/
│       ├── programmes.mjs      # ⭐ candidats, statuts, questions, positions, thèmes
│       ├── positions-complements.mjs  # sources de repli (sourcesBase), positions complémentaires
│       └── propositions-programmes.mjs # propositions extraites des programmes officiels
├── server/
│   ├── index.mjs               # API (contenu partagé, comptes, sessions)
│   ├── scrutins.mjs            # consolidation open data Assemblée nationale
│   └── data/                   # contenu.json, scrutins consolidés, rapports (⚠️ ne pas écraser en déploiement)
├── scripts/
│   ├── maj-quotidienne.mjs     # mise à jour quotidienne complète (cron)
│   ├── maj-scrutins.mjs        # scrutins seuls
│   └── extraire-propositions.mjs # extraction des programmes officiels
└── public/
    └── favicon.svg             # urne de vote aux couleurs de la marque
```

### Où modifier quoi

| Je veux changer… | Fichier |
|---|---|
| Un candidat (nom, parti, couleur, statut, URL programme) | `src/data/programmes.mjs` → `CANDIDATS` |
| Une question du quiz ou une position sourcée | `src/data/programmes.mjs` → `QUESTIONS` |
| Les sources de repli (programme non publié) | `src/data/positions-complements.mjs` → `SOURCES_BASE` |
| Les thèmes (labels, emojis) | `src/data/programmes.mjs` → `THEMES` |
| Les libellés des badges de statut | `src/data/programmes.mjs` → `STATUTS` |
| Le code couleur des scores | `src/couleurScore.mjs` |
| Les couleurs de la marque | `src/index.css` → `:root` (`--violet`, `--rose`…) |

## 💻 Installation locale

Prérequis : **Node.js 18+** et npm.

```bash
git clone git@github.com:hk-groupe/WhoVoteWhat.git
cd WhoVoteWhat
npm install
```

### Lancer le site (2 terminaux)

```bash
# Terminal 1 — front (http://localhost:5173)
npm run dev

# Terminal 2 — API (http://localhost:4000)
npm run api
```

Vite proxifie `/api` vers le port 4000 : le front et le back-office fonctionnent ensemble. **Sans le terminal 2**, vous verrez des erreurs proxy (`ECONNREFUSED`) et le site utilisera les données de repli du code source.

### Vérifier l'installation

```bash
npm run lint   # 0 erreur attendu
npm run build  # génère dist/
```

### ⚠️ Données locales persistées

Le back-office sauvegarde dans `server/data/contenu.json`. **Ce fichier persiste les données d'avant les mises à jour du code** — si des corrections de données (questions, URLs) ne s'affichent pas, réinitialisez :

```bash
rm server/data/contenu.json   # puis relancer npm run api
```

Les scrutins consolidés (`server/data/scrutins-*.json`, cache) se régénèrent automatiquement.

## 🚀 Mise en production

Le site a deux composants à déployer :

- **Front** : site statique généré dans `dist/` — servi par Caddy/Nginx.
- **API Node** (`server/index.mjs`) : contenu partagé (back-office) + consolidation quotidienne des scrutins. Doit tourner en process persistant (PM2).

> 💡 **Contenu persisté** : si un `server/data/contenu.json` existe déjà, l'API **fusionne automatiquement** au démarrage les candidats et positions manquants du code source. Vos éditions du back-office restent intactes.

### Méthode A — Déploiement via Git avec clé SSH (recommandée)

#### 1. Préparer le serveur

- **Node.js 18+** et npm installés.
- Le domaine pointe (A/AAAA) vers l'IP du serveur.
- Accès SSH au serveur.

#### 2. Créer la clé de déploiement SSH

```bash
ssh-keygen -t ed25519 -C "deploy-votons" -f ~/.ssh/id_ed25519_deploy -N ""
cat ~/.ssh/id_ed25519_deploy.pub
```

Déclarer la clé sur GitHub : repo `hk-groupe/WhoVoteWhat` → **Settings → Deploy keys → Add deploy key** (Read only suffit).

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
cat >> ~/.ssh/config <<'EOF'
Host github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_deploy
  IdentitiesOnly yes
EOF
chmod 600 ~/.ssh/config
ssh -T git@github.com   # attendu : "Hi hk-groupe/WhoVoteWhat!"
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
| `PORT` | Port d'écoute de l'API | `4000` |
| `CLE_SECRETE` | Clé de session du back-office | chaîne aléatoire longue (**obligatoire**, sinon les sessions ne survivent pas à un redémarrage) |
| `ORIGINE_AUTORISEE` | Origine CORS autorisée | votre domaine (ne pas laisser `*` en production) |
| `HEURE_MAJ_SCRUTINS` | Heure de la consolidation quotidienne | `03:30` par défaut |
| `VITE_API_URL` | URL de l'API intégrée au build | laisser vide — l'API est proxifiée sur `/api` du même domaine |

```bash
cat > ecosystem.config.cjs <<'EOF'
module.exports = {
  apps: [{
    name: 'votons-api',
    script: 'server/index.mjs',
    env: {
      PORT: 4000,
      CLE_SECRETE: '<coller ici le résultat de openssl rand -hex 32>',
      ORIGINE_AUTORISEE: 'https://votons.app'
    }
  }]
}
EOF
chmod 600 ecosystem.config.cjs
```

#### 5. Construire et démarrer

```bash
npm run build
sudo npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

> ⚠️ `pm2 startup` affiche la commande exacte à exécuter : la copier telle quelle. Après `pm2 save`, l'API redémarre au reboot du serveur.

#### 6. Exposer le site (reverse proxy + HTTPS)

**Variante Caddy (recommandée — HTTPS automatique)** :

```bash
sudo tee /etc/caddy/Caddyfile >/dev/null <<'EOF'
votons.app {
    root * /srv/WhoVoteWhat/dist
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

**Variante Nginx + Certbot** :

```bash
sudo apt install nginx certbot python3-certbot-nginx
sudo tee /etc/nginx/sites-available/votons.app >/dev/null <<'EOF'
server {
  listen 80;
  server_name votons.app;
  root /srv/WhoVoteWhat/dist;
  index index.html;
  location / { try_files $uri $uri/ /index.html; }
  location /api {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
EOF
sudo ln -sf /etc/nginx/sites-available/votons.app /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d votons.app
```

#### 7. Mettre à jour (routine)

```bash
cd /srv/WhoVoteWhat
git pull
npm ci
npm run build
pm2 restart votons-api
```

### Méthode B — Déploiement via FTP / SFTP

Le backend n'ayant **aucune dépendance externe**, rien n'est à installer sur le serveur.

1. En local : `git pull && npm ci && npm run build`
2. Transférer **uniquement** : `dist/`, `server/` (⚠️ ne pas écraser `server/data/`), `public/`, `package.json`, `package-lock.json`
3. Sur le serveur : configurer les variables (méthode A, étape 4) puis :
   ```bash
   sudo npm install -g pm2
   pm2 start server/index.mjs --name votons-api
   pm2 save && pm2 startup
   ```
4. Mise à jour : re-transférer `dist/` et `server/` puis `pm2 restart votons-api`.

### Variante « front seul » (hébergement 100 % statique)

Sans Node, déployez uniquement `dist/` : le site reste **totalement fonctionnel en lecture** grâce au repli sur les données du code source. Limites : pas de back-office en ligne, pas de mise à jour quotidienne des scrutins.

## 🔄 Mise à jour quotidienne des données (cron)

`npm run maj-quotidienne` orchestre :

1. **Scrutins** — open data de l'Assemblée nationale → `server/data/`
2. **Propositions des programmes officiels** — extraction → `src/data/propositions-programmes.mjs`
3. **Vérification des URLs** des programmes et sources (404, redirections inter-domaines)
4. **Cohérence** candidats du code vs contenu persisté

Rapport : `server/data/rapport-maj.json`. Exit code 1 si une étape échoue (cron enverra la sortie par e-mail). Option `--commit` : commite les fichiers régénérés.

**Ce qui reste éditorial** (pas d'API publique fiable) : statuts des candidatures, positions sur les questions, prises de parole — signalés dans le rapport, mis à jour via le back-office.

```cron
0 4 * * * cd /srv/WhoVoteWhat && /usr/bin/node scripts/maj-quotidienne.mjs --commit >> /var/log/votons-maj.log 2>&1
```

## ✅ Vérifier la mise en production

- Le site se charge : page « 👥 Les candidats » affiche **19 candidats**.
- Bandeaux « ⚠️ » sur les fiches des candidats sans programme 2027 publié.
- Le quiz fonctionne et classe tous les candidats.
- « 🗳️ Récap des votes » affiche les scrutins (données consolidées depuis l'API).
- Le back-office est accessible depuis le menu (connexion requise, `CLE_SECRETE` configurée).
- `https://votons.app/api/contenu` répond en JSON.
- En cas d'API injoignable, le site reste consultable (repli embarqué).
