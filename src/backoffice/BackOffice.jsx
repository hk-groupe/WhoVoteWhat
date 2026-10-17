import React from 'react'
import {
  chargerDonnees, sauvegarderDonnees, reinitialiserDonnees, exporterJSON, importerJSON,
  memoriserSession, sessionEnCours, oublieSession,
} from './store.mjs'
import {
  apiDisponible, connexionAdmin, deconnexionAdmin, chargerComptes, creerCompte, supprimerCompteApi,
  changerMotDePasse,
} from '../api/client.mjs'

const CANDIDAT_VIDE = { id: '', nom: '', parti: '', couleur: '#7b2ff7', site: '', programme: '', sourceLabel: '' }
const THEME_VIDE = { label: '', emoji: '📌' }
const INFO_VIDE = { titre: '', url: '' }

function QuestionVide(donnees) {
  const themeDefaut = Object.keys(donnees.themes)[0] || ''
  const positions = {}
  donnees.candidats.forEach((c) => { positions[c.id] = { position: 0, source: '' } })
  return { id: '', theme: themeDefaut, texte: '', info: '', positions }
}

export default function BackOffice({ onFermer }) {
  const [session, setSession] = React.useState(sessionEnCours())
  const [identifiant, setIdentifiant] = React.useState('')
  const [motDePasse, setMotDePasse] = React.useState('')
  const [erreur, setErreur] = React.useState('')

  const [donnees, setDonnees] = React.useState(null)
  const [onglet, setOnglet] = React.useState('candidats')
  const [message, setMessage] = React.useState('')
  const [apiHs, setApiHs] = React.useState(false)

  // Comptes (admin)
  const [comptes, setComptes] = React.useState([])
  const [nouveauCompte, setNouveauCompte] = React.useState({ identifiant: '', motDePasse: '', role: 'admin' })

  // Changement de mot de passe (sécurité du compte)
  const [mdp, setMdp] = React.useState({ ancien: '', nouveau: '', confirmation: '' })

  React.useEffect(() => {
    if (!session?.jeton) return
    chargerComptes(session.jeton).then(setComptes).catch(() => setComptes([]))
  }, [session?.jeton])

  React.useEffect(() => {
    chargerDonnees().then(setDonnees).catch(() => setDonnees(null))
    apiDisponible().then(setApiHs.bind(null, false)).catch(() => setApiHs(true))
  }, [])

  // ── Écrans d'édition ──
  const [candidatEdite, setCandidatEdite] = React.useState(null)
  const [questionEditee, setQuestionEditee] = React.useState(null)
  const [themeEdite, setThemeEdite] = React.useState(null)
  const [infoEditee, setInfoEditee] = React.useState(null)
  const [legendeEditee, setLegendeEditee] = React.useState(null)

  function persist(nouvelles) {
    setDonnees(nouvelles)
    if (session?.jeton) {
      sauvegarderDonnees(nouvelles, session.jeton).catch((e) => flash(`⚠️️ Sauvegarde serveur impossible : ${e.message}`))
    } else {
      flash('⚠️️ Backend injoignable — modification non partagée')
    }
  }

  function flash(texte) {
    setMessage(texte)
    setTimeout(() => setMessage(''), 2500)
  }

  // ── Connexion ──
  if (!session) {
    return (
      <section className="bo-login">
        <div className="bo-bloc">
          <h2>🔐 Back-office</h2>
          {erreur && <p className="bo-erreur">❌ {erreur}</p>}
          <label>
            Identifiant
            <input value={identifiant} onChange={(e) => setIdentifiant(e.target.value)} />
          </label>
          <label>
            Mot de passe
            <input type="password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} />
          </label>
          <div className="bo-actions">
            <button className="btn-principal" onClick={() => {
              connexionAdmin(identifiant, motDePasse)
                .then((s) => { memoriserSession(s.jeton, s.identifiant, s.role); setSession({ ...sessionEnCours() }); setErreur('') })
                .catch((e) => setErreur(e.message))
            }}>Se connecter</button>
            <button className="btn-principal" onClick={onFermer}>← Retour au quiz</button>
          </div>
          <p className="bo-note">Connexion au backend partagé. Compte par défaut : admin / admin — à changer après la première connexion.</p>
          {apiHs && (
            <p className="bo-erreur">🔌 Backend injoignable — démarrez-le avec la commande <code>npm run api</code> (terminal séparé), puis réessayez.</p>
          )}
        </div>
      </section>
    )
  }

  if (!donnees) {
    return (
      <section className="backoffice">
        <div className="bo-header">
          <h2>🛠️ Back-office</h2>
          <button className="btn-principal" onClick={onFermer}>← Retour au quiz</button>
        </div>
        <p className="bo-note">Chargement des données…</p>
        {apiHs && (
          <p className="bo-erreur">🔌 Backend injoignable — démarrez-le avec la commande <code>npm run api</code> (terminal séparé), puis rechargez la page.</p>
        )}
      </section>
    )
  }

  const estAdmin = session.role === 'admin'

  // ── CRUD Candidats ──
  function ajouterCandidat() { setCandidatEdite({ ...CANDIDAT_VIDE }) }
  function enregistrerCandidat() {
    if (!candidatEdite.id || !candidatEdite.nom) return flash('⚠️ id et nom obligatoires')
    const existant = donnees.candidats.find((c) => c.id === candidatEdite.id)
    const candidats = existant
      ? donnees.candidats.map((c) => (c.id === candidatEdite.id ? candidatEdite : c))
      : [...donnees.candidats, candidatEdite]
    persist({ ...donnees, candidats })
    setCandidatEdite(null)
    flash('✅ Candidat enregistré')
  }
  function supprimerCandidat(id) {
    if (!confirm(`Supprimer le candidat « ${id} » ? Ses positions seront perdues.`)) return
    persist({ ...donnees, candidats: donnees.candidats.filter((c) => c.id !== id) })
    flash('🗑️ Candidat supprimé')
  }

  // ── CRUD Légendes ──
  function enregistrerLegende() {
    if (!legendeEditee.id) return flash('⚠️ Candidat manquant')
    persist({ ...donnees, legendes: { ...donnees.legendes, [legendeEditee.id]: legendeEditee.texte } })
    setLegendeEditee(null)
    flash('✅ Légende enregistrée')
  }

  // ── CRUD Thèmes ──
  function ajouterTheme() { setThemeEdite({ cle: '', ...THEME_VIDE }) }
  function enregistrerTheme() {
    if (!themeEdite.cle || !themeEdite.label) return flash('⚠️ clé et label obligatoires')
    const themes = { ...donnees.themes, [themeEdite.cle]: { label: themeEdite.label, emoji: themeEdite.emoji } }
    persist({ ...donnees, themes })
    setThemeEdite(null)
    flash('✅ Thème enregistré')
  }
  function supprimerTheme(cle) {
    const utilise = donnees.questions.some((q) => q.theme === cle)
    if (utilise) return flash('⚠️ Impossible : des questions utilisent ce thème')
    if (!confirm(`Supprimer le thème « ${cle} » ?`)) return
    const themes = { ...donnees.themes }
    delete themes[cle]
    persist({ ...donnees, themes })
    flash('🗑️ Thème supprimé')
  }

  // ── CRUD Questions ──
  function ajouterQuestion() { setQuestionEditee(QuestionVide(donnees)) }
  function enregistrerQuestion() {
    if (!questionEditee.id || !questionEditee.texte) return flash('⚠️ id et texte obligatoires')
    const existante = donnees.questions.find((q) => q.id === questionEditee.id)
    const questions = existante
      ? donnees.questions.map((q) => (q.id === questionEditee.id ? questionEditee : q))
      : [...donnees.questions, questionEditee]
    persist({ ...donnees, questions })
    setQuestionEditee(null)
    flash('✅ Question enregistrée')
  }
  function supprimerQuestion(id) {
    if (!confirm(`Supprimer la question « ${id} » ?`)) return
    persist({ ...donnees, questions: donnees.questions.filter((q) => q.id !== id) })
    flash('🗑️ Question supprimée')
  }

  // ── CRUD Infos (sources) ──
  function ajouterInfo() { setInfoEditee({ cle: '', sources: [{ ...INFO_VIDE }] }) }
  function enregistrerInfo() {
    if (!infoEditee.cle) return flash('⚠️ clé obligatoire')
    const sources = infoEditee.sources.filter((s) => s.titre && s.url)
    if (sources.length === 0) return flash('⚠️ Au moins une source titre+url requise')
    persist({ ...donnees, infos: { ...donnees.infos, [infoEditee.cle]: sources } })
    setInfoEditee(null)
    flash('✅ Sources enregistrées')
  }
  function supprimerInfo(cle) {
    if (!confirm(`Supprimer les sources « ${cle} » ?`)) return
    const infos = { ...donnees.infos }
    delete infos[cle]
    persist({ ...donnees, infos })
    flash('🗑️ Sources supprimées')
  }

  function changerMdp() {
    if (!mdp.ancien || !mdp.nouveau) return flash('⚠️️ Ancien et nouveau mot de passe requis')
    if (mdp.nouveau !== mdp.confirmation) return flash('⚠️️ La confirmation ne correspond pas')
    if (mdp.nouveau.length < 8) return flash('⚠️️ Le mot de passe doit faire au moins 8 caractères')
    if (!session?.jeton) return flash('⚠️️ Backend injoignable')
    changerMotDePasse(session.jeton, mdp.ancien, mdp.nouveau)
      .then(() => {
        setMdp({ ancien: '', nouveau: '', confirmation: '' })
        flash('✅ Mot de passe modifié')
      })
      .catch((e) => flash(`❌ ${e.message}`))
  }

  // ── Comptes (admin) ──
  function ajouterCompte() {
    if (!nouveauCompte.identifiant || !nouveauCompte.motDePasse) return flash('⚠️ identifiant et mot de passe requis')
    if (!session?.jeton) return flash('⚠️ Backend injoignable')
    creerCompte(session.jeton, nouveauCompte)
      .then(() => chargerComptes(session.jeton))
      .then((liste) => { setComptes(liste); setNouveauCompte({ identifiant: '', motDePasse: '', role: 'admin' }); flash('✅ Compte créé') })
      .catch((e) => flash(`❌ ${e.message}`))
  }
  function supprimerCompte(ident) {
    if (ident === 'admin') return flash('⚠️ Le compte admin principal ne peut pas être supprimé')
    if (!confirm(`Supprimer le compte « ${ident} » ?`)) return
    if (!session?.jeton) return flash('⚠️ Backend injoignable')
    supprimerCompteApi(session.jeton, ident)
      .then(() => chargerComptes(session.jeton))
      .then(setComptes)
      .then(() => flash('🗑️ Compte supprimé'))
      .catch((e) => flash(`❌ ${e.message}`))
  }

  const onglets = [
    { id: 'candidats', label: '🎭 Candidats' },
    { id: 'questions', label: '❓ Questions' },
    { id: 'themes', label: '🗂️ Thèmes' },
    { id: 'infos', label: '🔗 Sources' },
  ]
  if (estAdmin) onglets.push({ id: 'comptes', label: '👥 Comptes' })

  return (
    <section className="backoffice">
      <div className="bo-header">
        <h2>🛠️ Back-office</h2>
        <div className="bo-actions">
          <span className="bo-user">{session.identifiant} ({session.role})</span>
          <button className="btn-principal" onClick={onFermer}>← Retour au quiz</button>
          <button className="btn-principal" onClick={() => {
            if (session?.jeton) deconnexionAdmin(session.jeton).catch(() => {})
            oublieSession()
            setSession(null)
          }}>Déconnexion</button>
        </div>
      </div>
      {message && <p className="bo-message">{message}</p>}
      {apiHs && (
        <p className="bo-erreur">🔌 Backend injoignable — les modifications ne seront pas partagées. Démarrez-le avec <code>npm run api</code>.</p>
      )}
      <nav className="bo-onglets">
        {onglets.map((o) => (
          <button key={o.id} className={`bo-onglet ${onglet === o.id ? 'actif' : ''}`} onClick={() => setOnglet(o.id)}>{o.label}</button>
        ))}
      </nav>

      {/* ── Candidats ── */}
      {onglet === 'candidats' && (
        <div className="bo-contenu">
          <button className="btn-principal" onClick={ajouterCandidat}>+ Ajouter un candidat</button>
          {candidatEdite && (
            <div className="bo-formulaire">
              <h3>{donnees.candidats.some((c) => c.id === candidatEdite.id) ? 'Modifier' : 'Nouveau'} candidat</h3>
              {['id', 'nom', 'parti', 'couleur', 'site', 'programme', 'sourceLabel'].map((champ) => (
                <label key={champ}>
                  {champ}
                  <input
                    type={champ === 'couleur' ? 'color' : 'text'}
                    value={candidatEdite[champ] || ''}
                    onChange={(e) => setCandidatEdite({ ...candidatEdite, [champ]: e.target.value })}
                  />
                </label>
              ))}
              <div className="bo-actions">
                <button className="btn-principal" onClick={enregistrerCandidat}>Enregistrer</button>
                <button className="btn-principal" onClick={() => setCandidatEdite(null)}>Annuler</button>
              </div>
            </div>
          )}
          <table className="bo-table">
            <thead><tr><th>id</th><th>Nom</th><th>Parti</th><th>Légende</th><th>Actions</th></tr></thead>
            <tbody>
              {donnees.candidats.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td><td>{c.nom}</td><td>{c.parti}</td>
                  <td>
                    <button className="bo-mini" onClick={() => setLegendeEditee({ id: c.id, texte: donnees.legendes[c.id] || '' })}>
                      {donnees.legendes[c.id] ? '✏️ Modifier' : '➕ Définir'}
                    </button>
                  </td>
                  <td>
                    <button className="bo-mini" onClick={() => setCandidatEdite({ ...c })}>✏️</button>
                    <button className="bo-mini danger" onClick={() => supprimerCandidat(c.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {legendeEditee && (
            <div className="bo-formulaire">
              <h3>Légende du résultat — {legendeEditee.id}</h3>
              <textarea
                rows={3}
                value={legendeEditee.texte}
                onChange={(e) => setLegendeEditee({ ...legendeEditee, texte: e.target.value })}
              />
              <div className="bo-actions">
                <button className="btn-principal" onClick={enregistrerLegende}>Enregistrer</button>
                <button className="btn-principal" onClick={() => setLegendeEditee(null)}>Annuler</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Questions ── */}
      {onglet === 'questions' && (
        <div className="bo-contenu">
          <button className="btn-principal" onClick={ajouterQuestion}>+ Ajouter une question</button>
          {questionEditee && (
            <div className="bo-formulaire">
              <h3>{donnees.questions.some((q) => q.id === questionEditee.id) ? 'Modifier' : 'Nouvelle'} question</h3>
              <label>id<input value={questionEditee.id} onChange={(e) => setQuestionEditee({ ...questionEditee, id: e.target.value })} /></label>
              <label>thème
                <select value={questionEditee.theme} onChange={(e) => setQuestionEditee({ ...questionEditee, theme: e.target.value })}>
                  {Object.entries(donnees.themes).map(([cle, t]) => <option key={cle} value={cle}>{t.emoji} {t.label}</option>)}
                </select>
              </label>
              <label>sources (clé INFOS, optionnel)
                <select value={questionEditee.info || ''} onChange={(e) => setQuestionEditee({ ...questionEditee, info: e.target.value })}>
                  <option value="">— aucune —</option>
                  {Object.keys(donnees.infos).map((cle) => <option key={cle} value={cle}>{cle}</option>)}
                </select>
              </label>
              <label>texte<textarea rows={3} value={questionEditee.texte} onChange={(e) => setQuestionEditee({ ...questionEditee, texte: e.target.value })} /></label>
              <h4>Positions par candidat (1 = pour, 0 = nuancé, -1 = contre)</h4>
              {donnees.candidats.map((c) => (
                <div key={c.id} className="bo-position">
                  <strong>{c.nom}</strong>
                  <select
                    value={questionEditee.positions[c.id]?.position ?? 0}
                    onChange={(e) => setQuestionEditee({
                      ...questionEditee,
                      positions: { ...questionEditee.positions, [c.id]: { ...(questionEditee.positions[c.id] || {}), position: Number(e.target.value) } },
                    })}
                  >
                    <option value={1}>👍 Pour</option>
                    <option value={0}>🤷 Nuancé</option>
                    <option value={-1}>👎 Contre</option>
                  </select>
                  <input
                    placeholder="Source (extrait du programme officiel)"
                    value={questionEditee.positions[c.id]?.source || ''}
                    onChange={(e) => setQuestionEditee({
                      ...questionEditee,
                      positions: { ...questionEditee.positions, [c.id]: { ...(questionEditee.positions[c.id] || { position: 0 }), source: e.target.value } },
                    })}
                  />
                </div>
              ))}
              <div className="bo-actions">
                <button className="btn-principal" onClick={enregistrerQuestion}>Enregistrer</button>
                <button className="btn-principal" onClick={() => setQuestionEditee(null)}>Annuler</button>
              </div>
            </div>
          )}
          <table className="bo-table">
            <thead><tr><th>id</th><th>Thème</th><th>Question</th><th>Actions</th></tr></thead>
            <tbody>
              {donnees.questions.map((q) => (
                <tr key={q.id}>
                  <td>{q.id}</td>
                  <td>{donnees.themes[q.theme]?.emoji} {donnees.themes[q.theme]?.label || q.theme}</td>
                  <td className="bo-cellule-texte">{q.texte}</td>
                  <td>
                    <button className="bo-mini" onClick={() => {
                      const positions = {}
                      donnees.candidats.forEach((c) => {
                        positions[c.id] = q.positions[c.id] || { position: 0, source: '' }
                      })
                      const infoCle = q.info && donnees.infos[q.info] ? q.info : (typeof q.info === 'string' ? q.info : '')
                      setQuestionEditee({ ...q, info: infoCle, positions })
                    }}>✏️</button>
                    <button className="bo-mini danger" onClick={() => supprimerQuestion(q.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Thèmes ── */}
      {onglet === 'themes' && (
        <div className="bo-contenu">
          <button className="btn-principal" onClick={ajouterTheme}>+ Ajouter un thème</button>
          {themeEdite && (
            <div className="bo-formulaire">
              <h3>Nouveau / modifier thème</h3>
              <label>clé (ex: economie)<input value={themeEdite.cle} onChange={(e) => setThemeEdite({ ...themeEdite, cle: e.target.value })} /></label>
              <label>label<input value={themeEdite.label} onChange={(e) => setThemeEdite({ ...themeEdite, label: e.target.value })} /></label>
              <label>emoji<input value={themeEdite.emoji} onChange={(e) => setThemeEdite({ ...themeEdite, emoji: e.target.value })} /></label>
              <div className="bo-actions">
                <button className="btn-principal" onClick={enregistrerTheme}>Enregistrer</button>
                <button className="btn-principal" onClick={() => setThemeEdite(null)}>Annuler</button>
              </div>
            </div>
          )}
          <table className="bo-table">
            <thead><tr><th>clé</th><th>Emoji</th><th>Label</th><th>Actions</th></tr></thead>
            <tbody>
              {Object.entries(donnees.themes).map(([cle, t]) => (
                <tr key={cle}>
                  <td>{cle}</td><td>{t.emoji}</td><td>{t.label}</td>
                  <td>
                    <button className="bo-mini" onClick={() => setThemeEdite({ cle, ...t })}>✏️</button>
                    <button className="bo-mini danger" onClick={() => supprimerTheme(cle)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Sources (INFOS) ── */}
      {onglet === 'infos' && (
        <div className="bo-contenu">
          <button className="btn-principal" onClick={ajouterInfo}>+ Ajouter un groupe de sources</button>
          {infoEditee && (
            <div className="bo-formulaire">
              <h3>Groupe de sources</h3>
              <label>clé (à sélectionner dans une question)<input value={infoEditee.cle} onChange={(e) => setInfoEditee({ ...infoEditee, cle: e.target.value })} /></label>
              {infoEditee.sources.map((s, i) => (
                <div key={i} className="bo-source">
                  <input placeholder="Titre" value={s.titre} onChange={(e) => {
                    const sources = [...infoEditee.sources]
                    sources[i] = { ...s, titre: e.target.value }
                    setInfoEditee({ ...infoEditee, sources })
                  }} />
                  <input placeholder="URL" value={s.url} onChange={(e) => {
                    const sources = [...infoEditee.sources]
                    sources[i] = { ...s, url: e.target.value }
                    setInfoEditee({ ...infoEditee, sources })
                  }} />
                  <button className="bo-mini danger" onClick={() => setInfoEditee({ ...infoEditee, sources: infoEditee.sources.filter((_, j) => j !== i) })}>🗑️</button>
                </div>
              ))}
              <button className="bo-mini" onClick={() => setInfoEditee({ ...infoEditee, sources: [...infoEditee.sources, { ...INFO_VIDE }] })}>+ Source</button>
              <div className="bo-actions">
                <button className="btn-principal" onClick={enregistrerInfo}>Enregistrer</button>
                <button className="btn-principal" onClick={() => setInfoEditee(null)}>Annuler</button>
              </div>
            </div>
          )}
          <table className="bo-table">
            <thead><tr><th>clé</th><th>Sources</th><th>Actions</th></tr></thead>
            <tbody>
              {Object.entries(donnees.infos).map(([cle, sources]) => (
                <tr key={cle}>
                  <td>{cle}</td>
                  <td className="bo-cellule-texte">
                    {sources.map((s) => <div key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.titre} ↗</a></div>)}
                  </td>
                  <td>
                    <button className="bo-mini" onClick={() => setInfoEditee({ cle, sources: sources.map((s) => ({ ...s })) })}>✏️</button>
                    <button className="bo-mini danger" onClick={() => supprimerInfo(cle)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Sécurité : changement de mot de passe ── */}
      <div className="bo-donnees">
        <h3>🔒 Sécurité du compte</h3>
        <p>Changez votre mot de passe ({session.identifiant}). Minimum 8 caractères — le compte par défaut « admin / admin » doit être changé dès la première connexion.</p>
        <div className="bo-formulaire">
          <label>
            Ancien mot de passe
            <input type="password" value={mdp.ancien} onChange={(e) => setMdp({ ...mdp, ancien: e.target.value })} />
          </label>
          <label>
            Nouveau mot de passe
            <input type="password" value={mdp.nouveau} onChange={(e) => setMdp({ ...mdp, nouveau: e.target.value })} />
          </label>
          <label>
            Confirmer le nouveau mot de passe
            <input type="password" value={mdp.confirmation} onChange={(e) => setMdp({ ...mdp, confirmation: e.target.value })} />
          </label>
          <div className="bo-actions">
            <button className="btn-principal" onClick={changerMdp}>Modifier le mot de passe</button>
          </div>
        </div>
      </div>

      {/* ── Comptes (admin) ── */}
      {onglet === 'comptes' && estAdmin && (
        <div className="bo-contenu">
          <div className="bo-formulaire">
            <h3>Nouveau compte</h3>
            <label>identifiant<input value={nouveauCompte.identifiant} onChange={(e) => setNouveauCompte({ ...nouveauCompte, identifiant: e.target.value })} /></label>
            <label>mot de passe<input type="password" value={nouveauCompte.motDePasse} onChange={(e) => setNouveauCompte({ ...nouveauCompte, motDePasse: e.target.value })} /></label>
            <label>role
              <select value={nouveauCompte.role} onChange={(e) => setNouveauCompte({ ...nouveauCompte, role: e.target.value })}>
                <option value="admin">admin</option>
                <option value="editeur">editeur</option>
              </select>
            </label>
            <button className="btn-principal" onClick={ajouterCompte}>+ Créer le compte</button>
          </div>
          <table className="bo-table">
            <thead><tr><th>Identifiant</th><th>Role</th><th>Actions</th></tr></thead>
            <tbody>
              {comptes.map((c) => (
                <tr key={c.identifiant}>
                  <td>{c.identifiant}</td><td>{c.role}</td>
                  <td><button className="bo-mini danger" onClick={() => supprimerCompte(c.identifiant)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Données : export / import / reset ── */}
      <div className="bo-donnees">
        <h3>📦 Données</h3>
        <p>Les modifications sont enregistrées sur le backend partagé : tous les utilisateurs les voient immédiatement, sans mise à jour de fichiers.</p>
        <div className="bo-actions">
          <button className="btn-principal" onClick={() => exporterJSON(donnees)}>⬇️ Exporter JSON</button>
          <label className="btn-principal bo-import">
            ⬆️ Importer JSON
            <input type="file" accept=".json" onChange={(e) => {
              if (!e.target.files[0]) return
              importerJSON(e.target.files[0],
                (d) => { persist(d); flash('✅ Import réussi') },
                () => flash('❌ Fichier JSON invalide'))
            }} />
          </label>
          <button className="btn-principal" onClick={() => {
            if (!confirm('Réinitialiser toutes les données vers celles du code source ?')) return
            if (!session?.jeton) return flash('⚠️ Backend injoignable')
            reinitialiserDonnees(session.jeton)
              .then((d) => { setDonnees(d); flash('♻️ Données réinitialisées') })
              .catch((e) => flash(`❌ ${e.message}`))
          }}>♻️ Réinitialiser</button>
        </div>
      </div>
    </section>
  )
}
