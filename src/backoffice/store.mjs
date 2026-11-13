// Store back-office : le backend sert désormais la version partagée des données.
// Repli : si le backend n'est pas joignable, on retombe sur les données du code source
// (programmes.mjs), exportables/importables en JSON comme avant.
import { CANDIDATS, THEMES, QUESTIONS, INFOS, RESULTATS_LEGEND } from '../data/programmes.mjs'
import { fusionnerPositions, SOURCES_BASE } from '../data/positions-complements.mjs'
import * as api from '../api/client.mjs'

const CLE_SESSION = 'votons-session'

export const BASE = {
  candidats: CANDIDATS,
  legendes: RESULTATS_LEGEND,
  themes: THEMES,
  questions: fusionnerPositions(JSON.parse(JSON.stringify(QUESTIONS))),
  infos: INFOS,
  sourcesBase: SOURCES_BASE,
}

export const donneesDefaut = () => JSON.parse(JSON.stringify(BASE))

export async function chargerDonnees() {
  try {
    return await api.chargerContenu()
  } catch {
    return donneesDefaut()
  }
}

export async function sauvegarderDonnees(donnees, jeton) {
  return api.sauvegarderContenu(donnees, jeton)
}

export async function reinitialiserDonnees(jeton) {
  return api.reinitialiserContenu(jeton)
}

export function exporterJSON(donnees) {
  const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'votons-donnees.json'
  a.click()
  URL.revokeObjectURL(url)
}

export function importerJSON(fichier, succes, erreur) {
  const lecteur = new FileReader()
  lecteur.onload = () => {
    try {
      const donnees = JSON.parse(lecteur.result)
      if (!donnees.candidats || !donnees.questions) throw new Error('Structure invalide')
      succes(donnees)
    } catch (e) {
      erreur(e)
    }
  }
  lecteur.readAsText(fichier)
}

// ── Session ──
export function memoriserSession(jeton, identifiant, role) {
  localStorage.setItem(CLE_SESSION, JSON.stringify({ jeton, identifiant, role }))
}

export function sessionEnCours() {
  try {
    const brut = localStorage.getItem(CLE_SESSION)
    return brut ? JSON.parse(brut) : null
  } catch {
    return null
  }
}

export function oublieSession() {
  localStorage.removeItem(CLE_SESSION)
}
