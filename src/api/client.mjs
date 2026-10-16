// Client API — backend partagé par tous les utilisateurs.
// En son absence, le site continue de fonctionner avec les données du code source.

const URL_API = import.meta.env?.VITE_API_URL ?? ''

async function requete(chemin, options = {}) {
  const reponse = await fetch(`${URL_API}${chemin}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options,
  })
  const donnees = await reponse.json().catch(() => null)
  if (!reponse.ok) {
    throw new Error(donnees?.erreur ?? `Erreur API (${reponse.status})`)
  }
  return donnees
}

export const apiDisponible = () =>
  fetch(`${URL_API}/sante`, { signal: AbortSignal.timeout(2000) })
    .then((r) => r.ok)
    .catch(() => false)

export const chargerContenu = () => requete('/api/contenu')

export const sauvegarderContenu = (contenu, jeton) =>
  requete('/api/admin/contenu', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${jeton}` },
    body: JSON.stringify(contenu),
  })

export const reinitialiserContenu = (jeton) =>
  requete('/api/admin/contenu/reinitialiser', {
    method: 'POST',
    headers: { Authorization: `Bearer ${jeton}` },
  })

export const connexionAdmin = (identifiant, motDePasse) =>
  requete('/api/admin/connexion', {
    method: 'POST',
    body: JSON.stringify({ identifiant, motDePasse }),
  })

export const deconnexionAdmin = (jeton) =>
  requete('/api/admin/deconnexion', {
    method: 'POST',
    headers: { Authorization: `Bearer ${jeton}` },
  })

export const chargerComptes = (jeton) =>
  requete('/api/admin/comptes', { headers: { Authorization: `Bearer ${jeton}` } })

export const creerCompte = (jeton, compte) =>
  requete('/api/admin/comptes', {
    method: 'POST',
    headers: { Authorization: `Bearer ${jeton}` },
    body: JSON.stringify(compte),
  })

export const supprimerCompteApi = (jeton, identifiant) =>
  requete(`/api/admin/comptes/${encodeURIComponent(identifiant)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${jeton}` },
  })

export const changerMotDePasse = (jeton, ancien, nouveau) =>
  requete('/api/admin/mot-de-passe', {
    method: 'POST',
    headers: { Authorization: `Bearer ${jeton}` },
    body: JSON.stringify({ ancien, nouveau }),
  })

export const lancerMajScrutins = (jeton) =>
  requete('/api/admin/scrutins/maj', {
    method: 'POST',
    headers: { Authorization: `Bearer ${jeton}` },
  })

export const etatScrutins = () =>
  fetch(`${URL_API}/api/scrutins/etat`, { signal: AbortSignal.timeout(2000) })
    .then((r) => r.json())
    .catch(() => null)

export const chargerScrutins = () =>
  fetch(`${URL_API}/api/scrutins`, { signal: AbortSignal.timeout(5000) })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)
