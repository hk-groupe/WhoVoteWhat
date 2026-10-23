import React from 'react'
import { STATUTS } from './data/programmes.mjs'
import { BadgeProgramme } from './Badges.jsx'

// Légende des labels : rappelle la signification des badges de statut
// et de publication du programme. À afficher partout où les badges apparaissent.
export default function LegendeLabels() {
  return (
    <div className="bloc legende-statuts">
      <h3>🔑 Légende des labels</h3>
      <ul>
        {Object.values(STATUTS).map((s) => (
          <li key={s.label}>
            <span className="infobulle" tabIndex={0}>
              <em className="badge-statut" style={{ background: s.couleur }}>{s.emoji} {s.label}</em>
              <span className="infobulle-texte" role="tooltip" style={{ background: s.couleur }}>{s.aide}</span>
            </span>
          </li>
        ))}
        <li><BadgeProgramme publie nom="Le candidat" /></li>
        <li><BadgeProgramme publie={false} nom="Le candidat" /></li>
      </ul>
    </div>
  )
}
