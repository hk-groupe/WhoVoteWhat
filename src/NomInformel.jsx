import React from 'react'

// Affichage « parti d'abord » :
// « Renaissance · Gabriel Attal » — le parti identifie la famille politique en premier,
// suivi du nom complet du candidat.
export function NomInformel({ candidat }) {
  return (
    <span className="nom-informel">
      <strong className="parti-dabord">{candidat.parti}</strong>
      <span className="sep">·</span>
      <span className="candidat-informel">{candidat.nom}</span>
    </span>
  )
}
