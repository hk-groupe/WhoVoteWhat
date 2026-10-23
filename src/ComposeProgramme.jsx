import React from 'react'
import { BadgeStatut, BadgeProgramme } from './Badges.jsx'

// « Compose ton programme » :
// 1. Toutes les propositions issues des programmes 2027, sans distinction de candidat,
//    regroupées par thématique.
// 2. L'utilisateur compose son programme en respectant un budget de propositions
//    calé sur la taille moyenne des programmes officiels publiés.
// 3. Comparatif : points communs et divergences avec chaque programme de candidat.

export default function ComposeProgramme({ donnees, onRetour }) {
  const candidats = donnees.candidats ?? []
  const themes = donnees.themes ?? {}
  const questions = donnees.questions ?? []
  const sourcesBase = donnees.sourcesBase ?? {}
  const legendes = donnees.legendes ?? {}

  // Toutes les propositions « pour » (position === 1) issues des programmes,
  // sans distinction de candidat : une proposition = un texte de question unique.
  // Les questions étant neutres, elles servent d'intitulé de proposition.
  const propositions = questions
    .filter((q) => Object.values(q.positions ?? {}).some((p) => p.position === 1))
    .map((q) => ({
      id: q.id,
      theme: q.theme,
      texte: q.texte,
      // Quels candidats proposent exactement cette mesure (pour comparatif)
      pour: Object.entries(q.positions ?? {})
        .filter(([, p]) => p.position === 1)
        .map(([cid]) => cid),
      nuance: Object.entries(q.positions ?? {})
        .filter(([, p]) => p.position === 0)
        .map(([cid]) => cid),
    }))

  // Budget : moyenne du nombre de propositions par programme officiel publié.
  // Les programmes « non publiés » (sourcesBase) sont exclus du calcul de référence.
  const candidatsProgrammePublie = candidats.filter((c) => !sourcesBase[c.id])
  const taillesProgrammes = candidatsProgrammePublie.map(
    (c) => questions.filter((q) => q.positions?.[c.id]?.position === 1).length
  )
  const budget = taillesProgrammes.length
    ? Math.max(5, Math.round(taillesProgrammes.reduce((a, b) => a + b, 0) / taillesProgrammes.length))
    : 20

  const [choisies, setChoisies] = React.useState([])
  const [ecran, setEcran] = React.useState('selection')
  const [filtreTheme, setFiltreTheme] = React.useState('tous')

  const nbChoisies = choisies.length
  const restant = budget - nbChoisies
  const depasse = restant < 0

  const basculer = (id) => {
    setChoisies((precedent) =>
      precedent.includes(id) ? precedent.filter((x) => x !== id) : precedent
    )
  }

  const propositionsFiltrees = filtreTheme === 'tous'
    ? propositions
    : propositions.filter((p) => p.theme === filtreTheme)

  const propositionsParTheme = Object.entries(themes).map(([id, t]) => ({
    id,
    ...t,
    items: propositions.filter((p) => p.theme === id),
  }))

  // Comparatif avec chaque candidat
  const comparatif = () => {
    if (nbChoisies === 0) return []
    return candidats
      .map((c) => {
        const communs = choisies.filter((id) => {
          const p = propositions.find((x) => x.id === id)
          return p && p.pour.includes(c.id)
        })
        const divergents = choisies.filter((id) => {
          const p = propositions.find((x) => x.id === id)
          return p && !p.pour.includes(c.id)
        })
        const programmeCandidat = questions.filter((q) => q.positions?.[c.id]?.position === 1).length
        const pourcentage = nbChoisies > 0 ? Math.round((communs.length / nbChoisies) * 100) : 0
        return { candidat: c, communs, divergents, programmeCandidat, pourcentage }
      })
      .sort((a, b) => b.pourcentage - a.pourcentage)
  }

  const propositionParId = (id) => propositions.find((p) => p.id === id)

  return (
    <section className="compose-programme">
      {ecran === 'selection' && (
        <>
          <div className="bloc">
            <h2>✍️ Compose ton programme</h2>
            <p>
              Voici <strong>toutes les propositions issues des programmes officiels pour 2027</strong>, sans
              distinction de parti ou de candidat, regroupées par thématique. Composez votre propre programme en
              choisissant vos mesures, puis comparez-le aux programmes des candidats.
            </p>
            <p className="aide-nav">
              🎯 Budget : <strong>{nbChoisies} / {budget} propositions</strong>{' '}
              {depasse
                ? <span className="depasse">— vous avez dépassé le budget !</span>
                : restant === 0
                  ? <span className="complet">— budget atteint</span>
                  : <span className="restant">— il vous reste {restant} proposition{restant > 1 ? 's' : ''}</span>}
              <br />
              <em>Le budget correspond à la moyenne du nombre de propositions des programmes officiels publiés.</em>
            </p>
            <div className="compose-filtres">
              <button
                className={filtreTheme === 'tous' ? 'filtre-theme actif' : 'filtre-theme'}
                onClick={() => setFiltreTheme('tous')}
              >
                Tous les thèmes ({propositions.length})
              </button>
              {propositionsParTheme.filter((t) => t.items.length > 0).map((t) => (
                <button
                  key={t.id}
                  className={filtreTheme === t.id ? 'filtre-theme actif' : 'filtre-theme'}
                  onClick={() => setFiltreTheme(t.id)}
                >
                  {t.emoji} {t.label} ({t.items.length})
                </button>
              ))}
            </div>
          </div>
          <div className="compose-liste">
            {propositionsFiltrees.map((p) => (
              <label key={p.id} className={depasse && !choisies.includes(p.id) ? 'compose-item bloque' : 'compose-item'}>
                <input
                  type="checkbox"
                  checked={choisies.includes(p.id)}
                  onChange={() => basculer(p.id)}
                  disabled={depasse && !choisies.includes(p.id)}
                />
                <span className="compose-theme">{themes[p.theme]?.emoji} {themes[p.theme]?.label}</span>
                <span className="compose-texte">{p.texte}</span>
              </label>
            ))}
          </div>
          <div className="compose-actions">
            <button
              className="btn-principal"
              disabled={nbChoisies === 0}
              onClick={() => setEcran('comparatif')}
            >
              🔄 Comparer aux programmes des candidats
            </button>
            <button className="retour" onClick={onRetour}>← Retour à l'accueil</button>
          </div>
        </>
      )}

      {ecran === 'comparatif' && (
        <>
          <div className="bloc">
            <h2>📊 Votre programme face aux candidats</h2>
            <p>
              Votre programme compte <strong>{nbChoisies} propositions</strong> (budget moyen : {budget}).
              Voici, pour chaque candidat, les <strong>points communs</strong> et les{' '}
              <strong>divergences</strong> entre votre programme et le sien.
            </p>
          </div>
          {comparatif().map(({ candidat, communs, divergents, programmeCandidat, pourcentage }) => (
            <details key={candidat.id} className="details-candidat" style={{ borderColor: candidat.couleur }}>
              <summary className="resume-candidat">
                <span className="dot" style={{ background: candidat.couleur, margin: 0 }}></span>
                <strong>{candidat.parti}</strong>
                <em>{candidat.nom}</em>
                <BadgeStatut statut={candidat.statut} />
                <BadgeProgramme publie={!sourcesBase[candidat.id]} nom={candidat.nom} />
                <span className="compose-score">{pourcentage}% en commun</span>
              </summary>
              <div className="contenu-candidat">
                <p className="synthese-candidat">{legendes[candidat.id]}</p>
                <p className="compose-resume">
                  Sur vos {nbChoisies} propositions : <strong>{communs.length} en commun</strong> ·{' '}
                  {divergents.length} divergente{divergents.length > 1 ? 's' : ''} · son programme compte{' '}
                  {programmeCandidat} proposition{programmeCandidat > 1 ? 's' : ''}
                </p>
                {communs.length > 0 && (
                  <details className="details-theme-candidat" open>
                    <summary>🤝 Points communs · {communs.length}</summary>
                    <ul className="positions-liste">
                      {communs.map((id) => {
                        const p = propositionParId(id)
                        return (
                          <li key={id} className="position-item accord">
                            <span>✅</span> {p.texte}
                            <em className="source">— proposition présente dans son programme</em>
                          </li>
                        )
                      })}
                    </ul>
                  </details>
                )}
                {divergents.length > 0 && (
                  <details className="details-theme-candidat">
                    <summary>⚠️ Divergences · {divergents.length}</summary>
                    <ul className="positions-liste">
                      {divergents.map((id) => {
                        const p = propositionParId(id)
                        const nuance = p.nuance.includes(candidat.id)
                        return (
                          <li key={id} className={nuance ? 'position-item' : 'position-item desaccord'}>
                            <span>{nuance ? '➖' : '❌'}</span> {p.texte}
                            <em className="source">
                              — {nuance
                                ? `position nuancée (${questions.find((q) => q.id === id).positions[candidat.id].source})`
                                : `absente de son programme (${questions.find((q) => q.id === id).positions[candidat.id]?.source ?? 'pas de position publiée'})`}
                            </em>
                          </li>
                        )
                      })}
                    </ul>
                  </details>
                )}
              </div>
            </details>
          ))}
          <div className="compose-actions">
            <button className="btn-principal" onClick={() => setEcran('selection')}>✍️ Modifier mon programme</button>
            <button className="retour" onClick={onRetour}>← Retour à l'accueil</button>
          </div>
        </>
      )}
    </section>
  )
}
