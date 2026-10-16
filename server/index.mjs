import http from 'node:http'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { CANDIDATS, THEMES, QUESTIONS, INFOS, RESULTATS_LEGEND } from '../src/data/programmes.mjs'
import { mettreAJourScrutins, lireScrutins } from './scrutins.mjs'

const PORT = Number(process.env.PORT || 4000)
const DOSSIER = path.resolve('server/data')
const FICHIER_CONTENU = path.join(DOSSIER, 'contenu.json')

const CONTENU_DEFAUT = {
  candidats: CANDIDATS,
  legendes: RESULTATS_LEGEND,
  themes: THEMES,
  questions: QUESTIONS,
  infos: INFOS,
}

const CLE_SECRETE = process.env.CLE_SECRETE
if (!CLE_SECRETE) {
  console.warn('⚠️  CLE_SECRETE absente — les sessions ne survivront pas à un redémarrage.')
}

const sessions = new Map()
const sessionsPersistables = () => CLE_SECRETE !== undefined

function hacher(motDePasse, sel) {
  return scryptSync(motDePasse, sel, 64).toString('hex')
}

function verifierMotDePasse(motDePasse, stocke) {
  const [sel, empreinte] = String(stocke ?? '').split(':')
  if (!sel || !empreinte) return false
  const calculee = Buffer.from(hacher(motDePasse, sel), 'hex')
  const attendue = Buffer.from(empreinte, 'hex')
  return calculee.length === attendue.length && timingSafeEqual(calculee, attendue)
}

async function chargerEtat() {
  try {
    return JSON.parse(await readFile(FICHIER_CONTENU, 'utf8'))
  } catch {
    return { contenu: CONTENU_DEFAUT, comptes: [creerCompteDefaut()] }
  }
}

let etat
let sauvegardeEnCours = Promise.resolve()

function sauvegarder() {
  sauvegardeEnCours = sauvegardeEnCours.then(() =>
    writeFile(FICHIER_CONTENU, JSON.stringify(etat, null, 2)).catch((e) =>
      console.error('Erreur de sauvegarde :', e.message)))
  return sauvegardeEnCours
}

function creerCompteDefaut() {
  const sel = randomBytes(16).toString('hex')
  return { identifiant: 'admin', motDePasse: `${sel}:${hacher('admin', sel)}`, role: 'admin' }
}


async function initialiser() {
  await mkdir(DOSSIER, { recursive: true })
  etat = await chargerEtat()
  if (!etat.contenu) etat.contenu = CONTENU_DEFAUT
  if (!Array.isArray(etat.comptes) || etat.comptes.length === 0) {
    etat.comptes = [creerCompteDefaut()]
  }
  await sauvegarder()
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ORIGINE_AUTORISEE || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

function repondre(res, code, donnees) {
  const corps = JSON.stringify(donnees)
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(corps)
}

function lireCorps(req) {
  return new Promise((resoudre, rejeter) => {
    let taille = 0
    const morceaux = []
    req.on('data', (m) => {
      taille += m.length
      if (taille > 5 << 20) {
        rejeter(new Error('Corps trop volumineux'))
        req.destroy()
        return
      }
      morceaux.push(m)
    })
    req.on('end', () => {
      if (morceaux.length === 0) return resoudre({})
      try {
        resoudre(JSON.parse(Buffer.concat(morceaux).toString('utf8')))
      } catch {
        rejeter(new Error('JSON invalide'))
      }
    })
    req.on('error', rejeter)
  })
}

function jetonSession() {
  return randomBytes(24).toString('hex') + (sessionsPersistables() ? `.${CLE_SECRETE.length}` : '')
}

function sessionValide(req) {
  const auth = req.headers.authorization ?? ''
  const jeton = auth.startsWith('Bearer ') ? auth.slice(7) : null
  return jeton && sessions.has(jeton) ? { jeton, ...sessions.get(jeton) } : null
}

const CHAMPS_CONTENU = ['candidats', 'legendes', 'themes', 'questions', 'infos']

async function route(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const chemin = url.pathname

  if (req.method === 'OPTIONS') {
    cors(res)
    res.writeHead(204)
    return res.end()
  }
  cors(res)

  if (req.method === 'GET' && (chemin === '/' || chemin === '/sante')) {
    return repondre(res, 200, { service: 'WhoVoteWhat API', statut: 'ok' })
  }

  if (req.method === 'GET' && chemin === '/api/contenu') {
    return repondre(res, 200, etat.contenu)
  }

  if (req.method === 'GET' && chemin === '/api/scrutins') {
    const donnees = await lireScrutins()
    if (!donnees) return repondre(res, 503, { erreur: 'Données des scrutins pas encore consolidées. Réessayez dans quelques minutes.' })
    return repondre(res, 200, donnees)
  }

  if (req.method === 'GET' && chemin === '/api/scrutins/etat') {
    const donnees = await lireScrutins()
    return repondre(res, 200, {
      disponible: Boolean(donnees),
      majLe: donnees?.majLe ?? null,
      nbScrutins: donnees?.scrutins?.length ?? 0,
    })
  }

  if (req.method === 'POST' && chemin === '/api/admin/connexion') {
    const { identifiant, motDePasse } = await lireCorps(req)
    const compte = etat.comptes.find((c) => c.identifiant === identifiant)
    if (!compte || !verifierMotDePasse(motDePasse, compte.motDePasse)) {
      return repondre(res, 401, { erreur: 'Identifiant ou mot de passe incorrect' })
    }
    const jeton = jetonSession()
    sessions.set(jeton, { identifiant: compte.identifiant, role: compte.role })
    return repondre(res, 200, { jeton, identifiant: compte.identifiant, role: compte.role })
  }

  const session = sessionValide(req)
  if (!session && chemin.startsWith('/api/admin')) {
    return repondre(res, 401, { erreur: 'Authentification requise' })
  }
  if (session && chemin.startsWith('/api/admin') && req.method !== 'GET' && session.role !== 'admin') {
    return repondre(res, 403, { erreur: 'Réservé aux administrateurs' })
  }

  if (session && req.method === 'POST' && chemin === '/api/admin/deconnexion') {
    sessions.delete(session.jeton)
    return repondre(res, 200, { ok: true })
  }

  if (session && req.method === 'GET' && chemin === '/api/admin/session') {
    return repondre(res, 200, { identifiant: session.identifiant, role: session.role })
  }

  if (session && req.method === 'GET' && chemin === '/api/admin/comptes') {
    return repondre(res, 200, etat.comptes.map(({ identifiant, role }) => ({ identifiant, role })))
  }

  if (session && req.method === 'POST' && chemin === '/api/admin/comptes') {
    if (session.role !== 'admin') return repondre(res, 403, { erreur: 'Réservé aux administrateurs' })
    const { identifiant, motDePasse, role } = await lireCorps(req)
    if (!identifiant || !motDePasse) return repondre(res, 400, { erreur: 'identifiant et motDePasse requis' })
    if (etat.comptes.some((c) => c.identifiant === identifiant)) {
      return repondre(res, 409, { erreur: 'Identifiant déjà pris' })
    }
    const sel = randomBytes(16).toString('hex')
    etat.comptes.push({ identifiant, motDePasse: `${sel}:${hacher(motDePasse, sel)}`, role: role === 'admin' ? 'admin' : 'editeur' })
    await sauvegarder()
    return repondre(res, 201, { identifiant, role })
  }

  if (session && req.method === 'DELETE' && chemin.startsWith('/api/admin/comptes/')) {
    if (session.role !== 'admin') return repondre(res, 403, { erreur: 'Réservé aux administrateurs' })
    const cible = decodeURIComponent(chemin.split('/').pop())
    if (cible === session.identifiant) return repondre(res, 400, { erreur: 'Impossible de supprimer son propre compte' })
    const avant = etat.comptes.length
    etat.comptes = etat.comptes.filter((c) => c.identifiant !== cible)
    if (etat.comptes.length === avant) return repondre(res, 404, { erreur: 'Compte introuvable' })
    await sauvegarder()
    return repondre(res, 200, { ok: true })
  }

  if (session && (req.method === 'PUT' || req.method === 'POST') && chemin === '/api/admin/contenu') {
    const corps = await lireCorps(req)
    for (const champ of CHAMPS_CONTENU) {
      if (corps[champ] !== undefined) etat.contenu[champ] = corps[champ]
    }
    await sauvegarder()
    return repondre(res, 200, etat.contenu)
  }

  if (session && req.method === 'POST' && chemin === '/api/admin/contenu/reinitialiser') {
    etat.contenu = JSON.parse(JSON.stringify(CONTENU_DEFAUT))
    await sauvegarder()
    return repondre(res, 200, etat.contenu)
  }

  if (session && session.role === 'admin' && req.method === 'POST' && chemin === '/api/admin/scrutins/maj') {
    try {
      const resultat = await mettreAJourScrutins()
      return repondre(res, 200, resultat)
    } catch (e) {
      return repondre(res, 502, { erreur: `Mise à jour échouée : ${e.message}` })
    }
  }

  return repondre(res, 404, { erreur: 'Route inconnue' })
}

const PLAGE_MAJ = process.env.HEURE_MAJ_SCRUTINS || '03:30'

function planifierMajQuotidienne() {
  const planifierSuivante = () => {
    const [h, m] = PLAGE_MAJ.split(':').map(Number)
    const maintenant = new Date()
    const cible = new Date(maintenant)
    cible.setHours(h || 3, m || 30, 0, 0)
    if (cible <= maintenant) cible.setDate(cible.getDate() + 1)
    const delai = cible - maintenant
    setTimeout(async () => {
      try {
        const r = await mettreAJourScrutins()
        console.log(`✅ MAJ scrutins : ${r.scrutins} scrutins (${r.majLe})`)
      } catch (e) {
        console.error('❌ MAJ scrutins échouée :', e.message)
      }
      planifierSuivante()
    }, delai)
    console.log(`⏰ MAJ scrutins planifiée à ${PLAGE_MAJ} (dans ${Math.round(delai / 60000)} min)`)
  }
  planifierSuivante()
}

async function demarrer() {
  await initialiser()
  const serveur = http.createServer((req, res) => {
    route(req, res).catch((e) => {
      console.error('Erreur API :', e.message)
      if (!res.headersSent) repondre(res, 400, { erreur: e.message })
    })
  })
  serveur.listen(PORT, () => {
    console.log(`🚀 API WhoVoteWhat sur http://localhost:${PORT}`)
    if (!lireScrutins()) {
      console.log('ℹ️  Aucune donnée scrutins locale — première consolidation au démarrage.')
      mettreAJourScrutins()
        .then((r) => console.log(`✅ MAJ scrutins : ${r.scrutins} scrutins (${r.majLe})`))
        .catch((e) => console.error('❌ MAJ scrutins échouée :', e.message))
    }
    planifierMajQuotidienne()
  })
}

if (process.env.NODE_ENV !== 'test') {
  demarrer()
}
