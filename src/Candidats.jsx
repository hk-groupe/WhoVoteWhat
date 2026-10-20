import React from 'react'

// Résumé le plus exhaustif possible des programmes :
// pour chaque candidat, la synthèse générale (issues des données du site)
// puis toutes ses positions, thème par thème, avec la citation exacte de sa source officielle.
export default function Candidats({ donnees, onOuvrir }) {
  const candidats = donnees.candidats ?? []
  const themes = donnees.themes ?? {}
  const legendes = donnees.legendes ?? {}
  const questions = donnees.questions ?? []

  const positionsParCandidat = (candidat) => {
    const parTheme = {}
    questions.forEach((q) => {
      const p = q.positions?.[candidat.id]
      if (!p || p.position === undefined) return
      if (!parTheme[q.theme]) parTheme[q.theme] = []
      parTheme[q.theme].push({ question: q, position: p })
    })
    return parTheme
  }

  const labelPosition = (pos) =>
    pos === 1 ? '✅ Pour' : pos === -1 ? '❌ Contre' : '➖ Nuancé'

  return (
    <section className="candidats-page">
      <div className="bloc">
        <h2>👥 Les candidats</h2>
        <p>
          Tous les candidats déclarés dans l'application, avec un résumé aussi exhaustif que possible de leur programme :
          synthèse générale, puis <strong>toutes leurs positions thème par thème</strong>, chacune issue de leurs
          publications officielles. Cliquez sur un candidat pour dérouler le détail complet.
        </p>
      </div>
      {candidats.map((c) => {
        const parTheme = positionsParCandidat(c)
        return (
          <details key={c.id} className="details-candidat" style={{ borderColor: c.couleur }}>
            <summary className="resume-candidat">
              <span className="dot" style={{ background: c.couleur, margin: 0 }}></span>
              <strong>{c.nom}</strong>
              <em>{c.parti}</em>
            </summary>
            <div className="contenu-candidat">
              <p className="synthese-candidat">{legendes[c.id]}</p>
              <a className="lien-programme" href={c.programme} target="_blank" rel="noreferrer">
                📄 Lire le programme officiel complet ↗
              </a>
              <a className="lien-programme" href={c.site} target="_blank" rel="noreferrer">
                🌐 Site officiel du candidat ↗
              </a>
              <div className="points">
                {Object.entries(parTheme).map(([theme, positions]) => (
                  <details key={theme} className="details-theme-candidat">
                    <summary>{themes[theme]?.emoji} {themes[theme]?.label || theme} · {positions.length} propositions</summary>
                    <ul className="positions-liste">
                      {positions.map(({ question, position }) => (
                        <li key={question.id} className="position-item">
                          <span className="badge-position">{labelPosition(position.position)}</span>{' '}
                          {question.texte}
                          <em className="source">— {position.source}</em>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
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
