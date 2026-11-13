import React from 'react'
import { STATUTS } from './data/programmes.mjs'

export const PROGRAMME_PUBLIE = { emoji: '📄', label: 'Programme publié', couleur: '#0096c7' }
export const PROGRAMME_NON_PUBLIE = { emoji: '📄', label: 'Programme non publié', couleur: '#d00000' }

export function BadgeStatut({ statut }) {
  const s = STATUTS[statut]
  if (!s) return null
  return (
    <span className="infobulle" tabIndex={0}>
      <em className="badge-statut" style={{ background: s.couleur }}>{s.emoji} {s.label}</em>
      <span className="infobulle-texte" role="tooltip" style={{ background: s.couleur }}>{s.aide}</span>
    </span>
  )
}

export function BadgeProgramme({ publie, nom }) {
  const p = publie ? PROGRAMME_PUBLIE : PROGRAMME_NON_PUBLIE
  return (
    <span className="infobulle" tabIndex={0}>
      <em className="badge-statut" style={{ background: p.couleur }}>{p.emoji} {p.label}</em>
      <span className="infobulle-texte" role="tooltip" style={{ background: p.couleur }}>
        {publie
          ? `${nom} a publié son programme de campagne : les propositions affichées sont directement issues de son programme officiel.`
          : `${nom} n'a pas encore publié son programme de campagne 2027. Les propositions affichées s'appuient sur son ancien programme ou ses prises de position publiques.`}
      </span>
    </span>
  )
}
