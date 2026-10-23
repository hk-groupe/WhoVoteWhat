import React from 'react'
import { BadgeStatut, BadgeProgramme } from './Badges.jsx'
import { PROPOSITIONS_PROGRAMMES, SOURCES_PROGRAMMES } from './data/propositions-programmes.mjs'

// « Compose ton programme » :
// 1. L'intégralité des propositions extraites directement des programmes officiels
//    2027, affichées de manière ANONYME (sans candidat) et regroupées par thématique.
// 2. L'utilisateur compose librement son programme (aucune limite de sélection) ;
//    la taille moyenne des programmes officiels est donnée à titre de repère.
// 3. Comparatif : quelles propositions de son programme se retrouvent dans quel
//    programme de candidat, et lesquelles n'y figurent pas.

export default function ComposeProgramme({ donnees, onRetour }) {
  const candidats = donnees.candidats ?? []
  const themes = donnees.themes ?? {}
  const sourcesBase = donnees.sourcesBase ?? {}
  const legendes = donnees.legendes ?? {}

  // Propositions anonymes : aucune mention de candidat dans la liste.
  // Chaque entrée garde son intitulé exact (celui du programme d'origine),
  // son thème et son lien source — mais la liste ne révèle pas qui la propose.
  const propositions = Object.entries(PROPOSITIONS_PROGRAMMES).flatMap(([cid, props]) =>
    props.map((p, i) => ({
      id: `${cid}-${i}`,
      origine: cid,
      theme: p.theme,
      texte: p.texte,
      url: p.url,
    }))
  )

  const parCandidat = (cid) => propositions.filter((p) => p.origine === cid)

  // Couleur du badge de score : vert pour les plus hauts, rouge pour les plus bas,
  // dégradé arbitraire : >=60% vert, 40-59% vert-cyan, 25-39% ambre, <25% rouge.
  const couleurScore = (score) => {
    if (score >= 60) return '#2a9d3a'
    if (score >= 40) return '#0ea5a5'
    if (score >= 25) return '#e58a00'
    return '#d00000'
  }

  const candidatsAvecProgramme = Object.keys(PROPOSITIONS_PROGRAMMES)
  const tailles = candidatsAvecProgramme.map((cid) => parCandidat(cid).length)
  const budget = tailles.length
    ? Math.max(5, Math.round(tailles.reduce((a, b) => a + b, 0) / tailles.length))
    : 20

  const [choisies, setChoisies] = React.useState([])
  const [ecran, setEcran] = React.useState('selection')
  const [filtre, setFiltre] = React.useState('tous')

  const themesDisponibles = ['tous', ...Object.keys(themes), 'autres']
    .filter((th, i, arr) => arr.indexOf(th) === i)
    .filter((th) => th === 'tous' || th === 'autres' || propositions.some((p) => p.theme === th))

  const nbChoisies = choisies.length

  const basculer = (id) => {
    setChoisies((precedent) =>
      precedent.includes(id) ? precedent.filter((x) => x !== id) : [...precedent, id]
    )
  }

  const propositionsFiltrees = filtre === 'tous'
    ? propositions
    : propositions.filter((p) => p.theme === filtre)

  // Comparatif : pour chaque candidat, les propositions choisies par l'utilisateur
  // qui figurent dans son programme (texte exact), et celles qui n'y figurent pas.
  const comparatif = () => {
    if (nbChoisies === 0) return []
    return candidats.map((c) => {
      const propsCandidat = parCandidat(c.id)
      const textesProgramme = new Set(propsCandidat.map((p) => p.texte))
      const choisiesDetails = choisies
        .map((id) => propositions.find((p) => p.id === id))
        .filter(Boolean)
      const communes = choisiesDetails.filter((p) => textesProgramme.has(p.texte))
      const absentes = choisiesDetails.filter((p) => !textesProgramme.has(p.texte))
      const pourcentage = nbChoisies > 0 ? Math.round((communes.length / nbChoisies) * 100) : 0
      return { candidat: c, communes, absentes, tailleProgramme: propsCandidat.length, pourcentage, aProgramme: propsCandidat.length > 0 }
    }).sort((a, b) => b.pourcentage - a.pourcentage)
  }

  return (
    <section className="compose-programme">
      {ecran === 'selection' && (
        <>
          <div className="bloc">
            <h2>✍️ Compose ton programme</h2>
            <p>
              Voici <strong>l'intégralité des propositions extraites des programmes officiels 2027</strong>{' '}
              des candidats, avec les intitulés exacts tels qu'ils figurent dans chaque programme.
              Composez votre propre programme en choisissant vos mesures, puis comparez-le
              aux programmes des candidats. Chaque proposition renvoie directement à sa source dans le programme.
            </p>
            <p className="aide-nav">
              📏 Repère : les programmes officiels comptent en moyenne <strong>{budget} propositions</strong>.
              Vous pouvez sélectionner autant de propositions que vous voulez — le repère n'est pas une limite.
            </p>
            <div className="compose-filtres">
              {themesDisponibles.map((th) => {
                const nb = th === 'tous' ? propositions.length : propositions.filter((p) => p.theme === th).length
                const libelle = th === 'tous' ? 'Tous les thèmes' : th === 'autres' ? '🗂️ Autres' : `${themes[th]?.emoji ?? ''} ${themes[th]?.label ?? th}`
                return (
                  <button
                    key={th}
                    className={filtre === th ? 'filtre-theme actif' : 'filtre-theme'}
                    onClick={() => setFiltre(th)}
                  >
                    {libelle} ({nb})
                  </button>
                )
              })}
            </div>
          </div>
          <div className="compose-liste">
            {propositionsFiltrees.map((p) => {
              const estChoisie = choisies.includes(p.id)
              return (
                <div
                  key={p.id}
                  className={estChoisie ? 'compose-item coche' : 'compose-item'}
                  onClick={() => basculer(p.id)}
                  role="checkbox"
                  aria-checked={estChoisie}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      basculer(p.id)
                    }
                  }}
                >
                  <span className="compose-coche">{estChoisie ? '☑' : '☐'}</span>
                  <span className="compose-theme">{p.theme === 'autres' ? '🗂️ Autre' : `${themes[p.theme]?.emoji ?? ''} ${themes[p.theme]?.label ?? ''}`}</span>
                  <span className="compose-texte">{p.texte}</span>
                </div>
              )
            })}
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
          <div className="compose-compteur" role="status">
            <span className="compose-compteur-texte">
              <strong>{nbChoisies}</strong> proposition{nbChoisies > 1 ? 's' : ''} sélectionnée{nbChoisies > 1 ? 's' : ''}
              <span className="compose-compteur-repere">· moyenne : {budget}</span>
            </span>
            <button
              className="compose-compteur-btn"
              disabled={nbChoisies === 0}
              onClick={() => setEcran('comparatif')}
            >
              ✅ Valider mon programme
            </button>
          </div>
        </>
      )}

      {ecran === 'comparatif' && (
        <>
          <div className="bloc">
            <h2>📊 Votre programme face aux candidats</h2>
            <p>
              Votre programme compte <strong>{nbChoisies} propositions</strong> (taille moyenne des
              programmes : {budget}). Voici, pour chaque candidat, les propositions de votre
              programme qui <strong>figurent aussi dans le sien</strong>, et celles qui en sont absentes.
            </p>
          </div>
          {comparatif().filter((r) => r.aProgramme).map(({ candidat, communes, absentes, tailleProgramme, pourcentage, aProgramme }) => (
            <details key={candidat.id} className="details-candidat" style={{ borderColor: candidat.couleur }}>
              <summary className="resume-candidat">
                <span className="compose-score" style={{ background: couleurScore(pourcentage) }}>{pourcentage}% en commun</span>
                <span className="dot" style={{ background: candidat.couleur, margin: 0 }}></span>
                <strong>{candidat.parti}</strong>
                <em>{candidat.nom}</em>
                <BadgeStatut statut={candidat.statut} />
                <BadgeProgramme publie={!sourcesBase[candidat.id]} nom={candidat.nom} />
              </summary>
              <div className="contenu-candidat">
                <p className="synthese-candidat">{legendes[candidat.id]}</p>
                <p className="compose-resume">
                  {aProgramme ? (
                    <>Sur vos {nbChoisies} propositions : <strong>{communes.length} figurent aussi dans son programme</strong> · {absentes.length} absente{absentes.length > 1 ? 's' : ''} · son programme extrait compte {tailleProgramme} proposition{tailleProgramme > 1 ? 's' : ''}</>
                  ) : (
                    <>Son programme 2027 n'est pas encore extractible en ligne — comparaison non disponible pour l'instant.</>
                  )}
                </p>
                {aProgramme && communes.length > 0 && (
                  <details className="details-theme-candidat" open>
                    <summary>🤝 Propositions communes · {communes.length}</summary>
                    <ul className="positions-liste">
                      {communes.map((p) => (
                        <li key={p.id} className="position-item accord">
                          <span>✅</span> {p.texte}
                          <em className="source">— présente dans son programme{' '}
                            {p.url && <a href={p.url} target="_blank" rel="noreferrer">voir dans le programme ↗</a>}
                          </em>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                {aProgramme && absentes.length > 0 && (
                  <details className="details-theme-candidat">
                    <summary>⚠️ Absentes de son programme · {absentes.length}</summary>
                    <ul className="positions-liste">
                      {absentes.map((p) => (
                        <li key={p.id} className="position-item desaccord">
                          <span>➖</span> {p.texte}
                          <em className="source">— proposition issue du programme de {SOURCES_PROGRAMMES[p.origine]?.nom ?? p.origine}{' '}
                            {p.url && <a href={p.url} target="_blank" rel="noreferrer">voir la source ↗</a>}
                          </em>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </details>
          ))}
          {comparatif().some((r) => !r.aProgramme) && (
            <p className="avertissement-programme" role="note">
              ℹ️ Seuls les candidats dont le <strong>programme 2027 est publié et extractible en ligne</strong> sont
              affichés dans ce comparatif. Les autres candidats ne figurent pas ici car leur programme n'est pas encore
              publié au format consultable : la comparaison serait incomplète ou injuste. Ils apparaîtront
              automatiquement dès publication.
            </p>
          )}
          <div className="compose-actions">
            <button className="btn-principal" onClick={() => setEcran('selection')}>✍️ Modifier mon programme</button>
            <button className="retour" onClick={onRetour}>← Retour à l'accueil</button>
          </div>
        </>
      )}
    </section>
  )
}
