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

## 🚀 Démarrer

```bash
npm install
npm run dev
```

Build de production :

```bash
npm run build
```

## 🛠️ Stack

- React 19 (Vite)
- Aucune dépendance externe, aucun backend, aucune donnée collectée — 100 % côté client.

## 📌 Avertissement

Site indépendant et non partisan. Les programmes étant publiés progressivement par les candidats, les positions sont datées (octobre 2026) et mises à jour au fil des publications officielles.
