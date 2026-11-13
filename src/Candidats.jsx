import React from 'react'
import { BadgeStatut, BadgeProgramme } from './Badges.jsx'
import LegendeLabels from './LegendeLabels.jsx'

// Résumé le plus exhaustif possible des programmes :
// uniquement les propositions déclarées dans le programme du candidat.
// Une position "pour" correspond à un engagement publié par le candidat lui-même ;
// les étiquettes pour/contre du quiz ne sont volontairement pas affichées ici.
export default function Candidats({ donnees, onOuvrir }) {
  const candidats = donnees.candidats ?? []
  const themes = donnees.themes ?? {}
  const legendes = donnees.legendes ?? {}
  const questions = donnees.questions ?? []

  const sourcesBase = donnees.sourcesBase ?? {}

  const engagementsParCandidat = (candidat) => {
    const parTheme = {}
    questions.forEach((q) => {
      const p = q.positions?.[candidat.id]
      if (!p || p.position !== 1 || !p.source) return
      if (!parTheme[q.theme]) parTheme[q.theme] = []
      parTheme[q.theme].push({ question: q, position: p })
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
      <LegendeLabels />
      {candidats.map((c) => {
        const parTheme = engagementsParCandidat(c)
        const nbEngagements = Object.values(parTheme).reduce((n, l) => n + l.length, 0)
        return (
          <details key={c.id} className="details-candidat" style={{ borderColor: c.couleur }}>
            <summary className="resume-candidat">
              <span className="dot" style={{ background: c.couleur, margin: 0 }}></span>
              <strong>{c.parti}</strong>
              <em>{c.nom}</em>
              <BadgeStatut statut={c.statut} />
              <BadgeProgramme publie={!sourcesBase[c.id]} nom={c.nom} />
            </summary>
            <div className="contenu-candidat">
              <p className="synthese-candidat">{legendes[c.id]}</p>
              {sourcesBase[c.id] && (
                <p className="avertissement-programme" role="note">
                  ⚠️ {c.nom} n'a pas encore publié son programme de campagne 2027. Les propositions ci-dessous sont
                  basées sur <strong>son ancien programme ou ses prises de position publiques</strong>, toujours avec
                  source : <a href={sourcesBase[c.id].url} target="_blank" rel="noreferrer">{sourcesBase[c.id].label} ↗</a>.
                  Elles seront remplacées par son programme officiel dès sa publication.
                </p>
              )}
              <p className="source">Synthèse établie à partir du <a href={c.programme} target="_blank" rel="noreferrer">programme officiel — {c.sourceLabel} ↗</a></p>
              <a className="lien-programme" href={c.programme} target="_blank" rel="noreferrer">
                📄 Lire le programme officiel complet ↗
              </a>
              <a className="lien-programme" href={c.site} target="_blank" rel="noreferrer">
                🌐 Site officiel du candidat ↗
              </a>
              {nbEngagements === 0 ? (
                <p>Aucune proposition issue de son programme n'est encore enregistrée pour ce candidat. {sourcesBase[c.id] ? 'Ses positions publiques seront ajoutées dès que possible, en attendant son programme 2027.' : 'Les positions du quiz pour ce candidat seront ajoutées à mesure que son programme officiel est publié.'}</p>
              ) : (
                <div className="points">
                  {Object.entries(parTheme).map(([theme, engagements]) => (
                    <details key={theme} className="details-theme-candidat">
                      <summary>{themes[theme]?.emoji} {themes[theme]?.label || theme} · {engagements.length} proposition{engagements.length > 1 ? 's' : ''}</summary>
                      <ul className="positions-liste">
                        {engagements.map(({ question, position }) => {
                          const lien = position.base && sourcesBase[c.id] ? sourcesBase[c.id].url : c.programme
                          const labelSource = position.base && sourcesBase[c.id] ? sourcesBase[c.id].label : (c.sourceLabel || `programme officiel de ${c.nom}`)
                          return (
                            <li key={question.id} className="position-item">
                              {position.source}
                              {position.base === 'ancien_programme' && <em className="src-label"> · ancien programme</em>}
                              {position.base === 'prise_de_parole' && <em className="src-label"> · prise de position publique</em>}
                              <em className="source">— <a href={lien} target="_blank" rel="noreferrer">source : {labelSource} ↗</a></em>
                            </li>
                          )
                        })}
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
