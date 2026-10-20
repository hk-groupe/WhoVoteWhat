import React from 'react'
import { STATUTS } from './data/programmes.mjs'

// Résumé le plus exhaustif possible des programmes :
// uniquement les propositions déclarées dans le programme du candidat.
// Une position "pour" correspond à un engagement publié par le candidat lui-même ;
// les étiquettes pour/contre du quiz ne sont volontairement pas affichées ici.
export default function Candidats({ donnees, onOuvrir }) {
  const candidats = donnees.candidats ?? []
  const themes = donnees.themes ?? {}
  const legendes = donnees.legendes ?? {}
  const questions = donnees.questions ?? []

  const engagementsParCandidat = (candidat) => {
    const parTheme = {}
    questions.forEach((q) => {
      const p = q.positions?.[candidat.id]
      if (!p || p.position !== 1 || !p.source) return
      if (!parTheme[q.theme]) parTheme[q.theme] = []
      parTheme[q.theme].push({ question: q, source: p.source })
    })
    return parTheme
  }

  return (
    <section className="candidats-page">
      <div className="bloc">
        <h2>👥 Les candidats</h2>
        <p>
          Tous les candidats déclarés dans l'application, avec un résumé aussi exhaustif que possible de leur
          programme : synthèse générale, puis <strong>leurs propositions, thème par thème</strong>. Chaque proposition
          listée est <strong>directement issue de leur programme officiel</strong> — nous ne montrons ici que ce que le
          candidat propose lui-même, sans étiquette « pour / contre ». Pour lire le détail complet, suivez le lien vers
          son programme officiel.
        </p>
      </div>
      {candidats.map((c) => {
        const parTheme = engagementsParCandidat(c)
        const nbEngagements = Object.values(parTheme).reduce((n, l) => n + l.length, 0)
        return (
          <details key={c.id} className="details-candidat" style={{ borderColor: c.couleur }}>
            <summary className="resume-candidat">
              <span className="dot" style={{ background: c.couleur, margin: 0 }}></span>
              <strong>{c.nom}</strong>
              <em>{c.parti}</em>
              {c.statut && c.statut !== 'declare' && STATUTS[c.statut] && (
                <em className="badge-statut">{STATUTS[c.statut].emoji} {STATUTS[c.statut].label}</em>
              )}
            </summary>
            <div className="contenu-candidat">
              <p className="synthese-candidat">{legendes[c.id]}</p>
              <p className="source">Synthèse établie à partir du <a href={c.programme} target="_blank" rel="noreferrer">programme officiel — {c.sourceLabel} ↗</a></p>
              <a className="lien-programme" href={c.programme} target="_blank" rel="noreferrer">
                📄 Lire le programme officiel complet ↗
              </a>
              <a className="lien-programme" href={c.site} target="_blank" rel="noreferrer">
                🌐 Site officiel du candidat ↗
              </a>
              {nbEngagements === 0 ? (
                <p>Aucune proposition issue de son programme n'est encore enregistrée pour ce candidat. Les positions du quiz pour ce candidat seront ajoutées à mesure que son programme officiel est publié.</p>
              ) : (
                <div className="points">
                  {Object.entries(parTheme).map(([theme, engagements]) => (
                    <details key={theme} className="details-theme-candidat">
                      <summary>{themes[theme]?.emoji} {themes[theme]?.label || theme} · {engagements.length} proposition{engagements.length > 1 ? 's' : ''}</summary>
                      <ul className="positions-liste">
                        {engagements.map(({ question, source }) => (
                          <li key={question.id} className="position-item">
                            {source}
                            <em className="source">— <a href={c.programme} target="_blank" rel="noreferrer">source : {c.sourceLabel || `programme officiel de ${c.nom}`} ↗</a></em>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </div>
              )}
              <button className="btn-principal" onClick={() => onOuvrir(c.nom)}>
                🎯 Tester ma compatibilité avec ce quiz
              </button>
            </div>
          </details>
        )
      })}
    </section>
  )
}
