// Store back-office : persistance localStorage + import/export JSON
// Les données de base (programmes.mjs) servent de valeurs par défaut.

import { CANDIDATS, THEMES, QUESTIONS, INFOS, RESULTATS_LEGEND } from '../data/programmes.mjs'

const CLE_STORE = 'voteclair-backoffice'
const CLE_SESSION = 'voteclair-session'

const BASE = {
  candidats: CANDIDATS,
  legendes: RESULTATS_LEGEND,
  themes: THEMES,
  questions: QUESTIONS,
  infos: INFOS,
}

export function chargerDonnees() {
  try {
    const brut = localStorage.getItem(CLE_STORE)
    if (!brut) return JSON.parse(JSON.stringify(BASE))
    const stockees = JSON.parse(brut)
    return {
      candidats: stockees.candidats ?? BASE.candidats,
      legendes: stockees.legendes ?? BASE.legendes,
      themes: stockees.themes ?? BASE.themes,
      questions: stockees.questions ?? BASE.questions,
      infos: stockees.infos ?? BASE.infos,
    }
  } catch {
    return JSON.parse(JSON.stringify(BASE))
  }
}

export function sauvegarderDonnees(donnees) {
  localStorage.setItem(CLE_STORE, JSON.stringify(donnees))
}

export function reinitialiserDonnees() {
  localStorage.removeItem(CLE_STORE)
}

export function exporterJSON(donnees) {
  const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'voteclair-donnees.json'
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

// ── Comptes utilisateurs ──
// Compte admin par défaut : admin / admin (à changer en production !)
const COMPTES_DEFAUT = [
  { identifiant: 'admin', motDePasse: 'admin', role: 'admin' },
]

export function chargerComptes() {
  try {
    const brut = localStorage.getItem('voteclair-comptes')
    if (!brut) {
      localStorage.setItem('voteclair-comptes', JSON.stringify(COMPTES_DEFAUT))
      return COMPTES_DEFAUT
    }
    return JSON.parse(brut)
  } catch {
    return COMPTES_DEFAUT
  }
}

export function sauvegarderComptes(comptes) {
  localStorage.setItem('voteclair-comptes', JSON.stringify(comptes))
}

export function connexion(identifiant, motDePasse) {
  const comptes = chargerComptes()
  const compte = comptes.find((c) => c.identifiant === identifiant && c.motDePasse === motDePasse)
  if (!compte) return null
  const session = { identifiant: compte.identifiant, role: compte.role, debut: Date.now() }
  localStorage.setItem(CLE_SESSION, JSON.stringify(session))
  return session
}

export function sessionEnCours() {
  try {
    const brut = localStorage.getItem(CLE_SESSION)
    return brut ? JSON.parse(brut) : null
  } catch {
    return null
  }
}

export function deconnexion() {
  localStorage.removeItem(CLE_SESSION)
}
