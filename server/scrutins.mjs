import { mkdir, readFile, writeFile, copyFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { telecharger, decompresser, fichiersJson, lireJson, enTableau, entier } from './utilitaires.mjs'

export const RACINE_OPENDATA = 'https://data.assemblee-nationale.fr/static/openData/repository'
export const LEGISLATURE = '17'
export const URL_SCRUTINS = `${RACINE_OPENDATA}/${LEGISLATURE}/loi/scrutins/Scrutins.json.zip`
export const URL_ORGANES = `${RACINE_OPENDATA}/${LEGISLATURE}/amo/deputes_actifs_mandats_actifs_organes/AMO10_deputes_actifs_mandats_actifs_organes.json.zip`
export const URL_ANALYSE_SCRUTIN = 'https://www.assemblee-nationale.fr/dyn/17/scrutins'

const CACHE = path.resolve('server/.cache')
const DOSSIER_SCRUTINS = path.resolve('server/data')

const COULEURS_GROUPES = {
  RN: '#0d3b66', EPR: '#009fe3', 'LFI-NFP': '#ce1126', SOC: '#f4762a',
  DR: '#4056a1', ECOS: '#00b57f', DEM: '#f5a623', HOR: '#14357f',
  LIOT: '#c9b100', GDR: '#9b1b30', UDDPLR: '#7d2181', UDR: '#4a148c', NI: '#8d8d8d',
}

const MOTS_CLES = [
  ['finances', 'economie'], ['financement', 'economie'], ['fiscal', 'economie'],
  ['impot', 'economie'], ['imposition', 'economie'], ['budget', 'economie'],
  ['economie', 'economie'], ['travail', 'economie'], ['salaire', 'economie'],
  ['chomage', 'economie'], ['entreprise', 'economie'], ['retraites', 'retraites'],
  ['pensions', 'retraites'], ['constitution', 'institutions'], ['election', 'institutions'],
  ['elections', 'institutions'], ['parlement', 'institutions'], ['institution', 'institutions'],
  ['immigration', 'immigration'], ['etrangers', 'immigration'], ['asile', 'immigration'],
  ['sejour', 'immigration'], ['nationalite', 'immigration'], ['securite', 'securite'],
  ['justice', 'securite'], ['penal', 'securite'], ['police', 'securite'], ['prison', 'securite'],
  ['violences', 'securite'], ['criminalite', 'securite'], ['climat', 'ecologie'],
  ['environnement', 'ecologie'], ['energie', 'ecologie'], ['ecologie', 'ecologie'],
  ['biodiversite', 'ecologie'], ['agricole', 'ecologie'], ['agriculture', 'ecologie'],
  ['education', 'education'], ['ecole', 'education'], ['enseignement', 'education'],
  ['universite', 'education'], ['etudiant', 'education'], ['eleves', 'education'],
  ['europeenne', 'europe'], ['europeen', 'europe'], ['ue ', 'europe'], ['union europeenne', 'europe'],
  ['international', 'europe'], ['etranger', 'europe'], ['defense', 'europe'],
]

const normaliserTexte = (s) =>
  String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

function classifier(texte) {
  const t = ` ${normaliserTexte(texte)} `
  for (const [mot, theme] of MOTS_CLES) {
    if (t.includes(mot)) return theme
  }
  return null
}

async function construireGroupes(dossierActeurs) {
  const tous = await fichiersJson(dossierActeurs)
  const fichiers = tous.filter((f) => f.includes('/organe/'))
  const table = new Map()
  for (const f of fichiers) {
    const o = (await lireJson(f)).organe
    if (o?.codeType !== 'GP') continue
    table.set(o.uid, {
      code: o.libelleAbrev ?? o.libelleAbrege ?? o.uid,
      nom: o.libelle ?? o.libelleAbrev ?? o.uid,
    })
  }
  if (table.size === 0) throw new Error('Aucun groupe politique trouvé dans le référentiel des organes')
  return table
}

function aplatirScrutin(brut, groupes) {
  const s = brut.scrutin ?? brut
  const numero = entier(s.numero)
  const groupesBruts = enTableau(s?.ventilationVotes?.organe?.groupes?.groupe)
  if (!numero || groupesBruts.length === 0) return null

  const decomptes = {}
  for (const g of groupesBruts) {
    const meta = groupes.get(g.organeRef) ?? { code: g.organeRef, nom: g.organeRef }
    const d = g?.vote?.decompteVoix
    if (!d) continue
    decomptes[meta.code] = {
      pour: entier(d.pour),
      contre: entier(d.contre),
      abstention: entier(d.abstentions),
    }
  }

  const synthese = s?.syntheseVote ?? {}
  const titre = String(s?.titre ?? `Scrutin n°${numero}`)
  return {
    numero,
    date: String(s?.dateScrutin ?? '').slice(0, 10),
    seance: `Scrutin n°${numero} du ${String(s?.dateScrutin ?? '').slice(0, 10)}`,
    intitule: titre,
    theme: classifier(titre) ?? 'autres',
    adopte: s?.sort?.code === 'adopté',
    votants: entier(synthese.nombreVotants),
    exprimes: entier(synthese.suffragesExprimes),
    majorite: entier(synthese.nbrSuffragesRequis),
    sortLibelle: s?.sort?.libelle ?? null,
    typeVote: s?.typeVote?.libelleTypeVote ?? null,
    groupes: decomptes,
  }
}

export async function mettreAJourScrutins() {
  await mkdir(CACHE, { recursive: true })

  const zipOrganes = path.join(CACHE, 'organes.zip')
  await telecharger(URL_ORGANES, zipOrganes)
  const dossierOrganes = path.join(CACHE, 'organes')
  await decompresser(zipOrganes, dossierOrganes)
  const groupes = await construireGroupes(dossierOrganes)

  const zipScrutins = path.join(CACHE, 'scrutins.zip')
  await telecharger(URL_SCRUTINS, zipScrutins)
  const dossierScrutins = path.join(CACHE, 'scrutins')
  await decompresser(zipScrutins, dossierScrutins)

  const fichiers = await fichiersJson(dossierScrutins)
  const scrutins = []
  let echecs = 0
  for (const f of fichiers) {
    try {
      const aplatit = aplatirScrutin(await lireJson(f), groupes)
      if (aplatit) scrutins.push(aplatit)
    } catch {
      echecs++
    }
  }
  if (scrutins.length === 0 || (fichiers.length > 10 && echecs > fichiers.length * 0.1)) {
    throw new Error(`Format de l'open data probablement modifié (${echecs}/${fichiers.length} échecs) — publication annulée`)
  }
  scrutins.sort((a, b) => b.numero - a.numero)

  // Fenêtre glissante : toute la législature pèse ~9 Mo, trop lourd pour une
  // requête navigateur. Le front n'affiche que les 20 derniers scrutins et des
  // cumuls par thème ; 12 mois couvrent largement ces usages.
  const DEPUIS = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10)
  const fenetre = scrutins.filter((s) => s.date >= DEPUIS)

  const referentielGroupes = {}
  for (const [uid, g] of groupes) {
    referentielGroupes[g.code] = {
      nom: g.nom,
      couleur: COULEURS_GROUPES[g.code] ?? '#8d8d8d',
      organeRef: uid,
    }
  }

  const sortie = {
    generateur: 'WhoVoteWhat — maj quotidienne des scrutins',
    source: URL_SCRUTINS,
    sourceAnalyse: URL_ANALYSE_SCRUTIN,
    licence: 'Licence Ouverte / Open Licence 2.0 — Assemblée nationale, data.assemblee-nationale.fr',
    legislature: LEGISLATURE,
    majLe: new Date().toISOString(),
    depuis: DEPUIS,
    groupes: referentielGroupes,
    scrutins: fenetre,
  }

  await mkdir(DOSSIER_SCRUTINS, { recursive: true })
  const cible = path.join(DOSSIER_SCRUTINS, 'scrutins.json')
  const temp = `${cible}.tmp`
  await writeFile(temp, JSON.stringify(sortie))
  await copyFile(temp, cible)
  await rm(temp, { force: true })
  return { scrutins: fenetre.length, majLe: sortie.majLe }
}

export async function lireScrutins() {
  try {
    return JSON.parse(await readFile(path.join(DOSSIER_SCRUTINS, 'scrutins.json'), 'utf8'))
  } catch {
    return null
  }
}
