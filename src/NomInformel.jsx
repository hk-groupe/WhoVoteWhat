import React from 'react'

// Affichage "parti d'abord, candidat informel" :
// « Renaissance · Gabriel A. » — le parti identifie la famille politique,
// le candidat est rappelé de façon familière (prénom + initiale du nom).
export function NomInformel({ candidat, avecNomComplet = false }) {
  const prenom = candidat.nom.split(' ')[0]
  const nomFamille = candidat.nom.split(' ').slice(1).join(' ')
  return (
    <span className="nom-informel">
      <strong className="parti-dabord">{candidat.parti}</strong>
      <span className="sep">·</span>
      <span className="candidat-informel">{prenom} {nomFamille.charAt(0).toUpperCase()}.</span>
      {avecNomComplet && <span className="nom-complet">{candidat.nom}</span>}
    </span>
  )
}
