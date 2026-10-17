import React from 'react'
import {
  SCRUTINS,
  GROUPES,
  THEMES_VOTES,
  SOURCE_SCRUTINS,
  DATE_MAJ_SCRUTINS,
  LEGISLATURE,
} from './data/scrutins.mjs'
import { chargerScrutins } from './api/client.mjs'

function normaliser(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

// Format attendu côté composants : { groupes: {CODE: {nom, couleur}}, scrutins: [{numero, date, seance, intitule, theme, description?, adopte, votants, exprimes, majorite, groupes: {CODE: {pour, contre, abstention}}}], majLe }

function JaugeVote({ pour, contre, abstention }) {
  const total = pour + contre + abstention
  if (total === 0) return <div className="rv-jauge rv-jauge-vide">Aucun vote exprimé</div>
  return (
    <div className="rv-jauge" title={`Pour : ${pour} · Contre : ${contre} · Abstention : ${abstention}`}>
      <span className="rv-seg rv-pour" style={{ width: `${(pour / total) * 100}%` }}></span>
      <span className="rv-seg rv-contre" style={{ width: `${(contre / total) * 100}%` }}></span>
      <span className="rv-seg rv-abst" style={{ width: `${(abstention / total) * 100}%` }}></span>
    </div>
  )
}

function LigneGroupe({ code, pour, contre, abstention, groupes = GROUPES }) {
  const g = groupes[code]
  if (!g) return null
  const total = pour + contre + abstention
  let position = '—'
  if (total > 0) {
    if (pour > contre && pour > abstention) position = '✅ Pour'
    else if (contre > pour && contre > abstention) position = '❌ Contre'
    else if (abstention >= pour && abstention >= contre) position = '🤷 Abstention'
    else position = '➖ Mixte'
  }
  return (
    <li className="rv-ligne-groupe">
      <span className="rv-dot-groupe" style={{ background: g.couleur }}></span>
      <span className="rv-nom-groupe">{g.nom}</span>
      <JaugeVote pour={pour} contre={contre} abstention={abstention} />
      <span className="rv-position-groupe">{position}</span>
    </li>
  )
}

function CarteScrutin({ scrutin, groupes }) {
  const url = `${SOURCE_SCRUTINS}/${scrutin.numero}`
  return (
    <details className="rv-carte" data-numero={scrutin.numero}>
      <summary>
        <span className={`rv-badge ${scrutin.adopte ? 'adopte' : 'rejete'}`}>
          {scrutin.adopte ? '✅ Adopté' : '❌ Rejeté'}
        </span>
        <span className="rv-titre">
          <strong>Scrutin n°{scrutin.numero}</strong> — {scrutin.intitule}
        </span>
        <span className="rv-meta">
          {THEMES_VOTES[scrutin.theme]?.emoji} {new Date(scrutin.date).toLocaleDateString('fr-FR')}
        </span>
      </summary>
      {scrutin.description && <p className="rv-description">💡 {scrutin.description}</p>}
      <p className="rv-synthese">
        {scrutin.seance} · {scrutin.votants} votants · {scrutin.exprimes} suffrages exprimés ·
        majorité requise : {scrutin.majorite}
      </p>
      <ul className="rv-groupes">
        {Object.entries(scrutin.groupes).map(([code, v]) => (
          <LigneGroupe key={code} code={code} pour={v.pour} contre={v.contre} abstention={v.abstention} groupes={groupes} />
        ))}
      </ul>
      <a className="rv-lien-an" href={url} target="_blank" rel="noreferrer">
        🏛️ Voir l'analyse officielle du scrutin n°{scrutin.numero} sur le site de l'Assemblée nationale ↗
      </a>
    </details>
  )
}

function SectionDerniers({ scrutins, groupes }) {
  const derniers = [...scrutins].sort((a, b) => b.numero - a.numero).slice(0, 20)
  return (
    <div className="bloc">
      <h3>🕒 Les 20 derniers votes</h3>
      <p>Les 20 scrutins publics les plus récents de la {LEGISLATURE} législature, avec leur résultat et le détail par groupe.</p>
      <div className="rv-liste">
        {derniers.map((s) => <CarteScrutin key={s.numero} scrutin={s} groupes={groupes} />)}
      </div>
    </div>
  )
}

function LigneThemeParti({ theme, scrutins, codeGroupe }) {
  const t = THEMES_VOTES[theme] ?? { emoji: '📌', label: theme }
  const cumul = scrutins.reduce(
    (acc, s) => {
      const g = s.groupes[codeGroupe]
      if (g) {
        acc.pour += g.pour
        acc.contre += g.contre
        acc.abstention += g.abstention
      }
      return acc
    },
    { pour: 0, contre: 0, abstention: 0 },
  )
  if (cumul.pour + cumul.contre + cumul.abstention === 0) return null
  let tendance = '➖ Mixte'
  const { pour, contre, abstention } = cumul
  if (pour > contre && pour > abstention) tendance = '✅ Plutôt pour'
  else if (contre > pour && contre > abstention) tendance = '❌ Plutôt contre'
  else if (abstention >= pour && abstention >= contre) tendance = "🤷 S'abstenir"
  return (
    <li className="rv-ligne-theme">
      <span className="rv-theme-label">{t.emoji} {t.label}</span>
      <JaugeVote pour={pour} contre={contre} abstention={abstention} />
      <span className="rv-position-groupe">{tendance}</span>
    </li>
  )
}

function SectionParParti({ scrutins, groupes }) {
  return (
    <div className="bloc">
      <h3>🧭 Par parti politique, thème par thème</h3>
      <p>
        Pour chaque groupe parlementaire, sa position cumulée sur les scrutins de référence, thème par
        thème : en faveur, contre ou abstention. C'est l'action réelle des partis au Palais-Bourbon,
        pas leurs communiqués.
      </p>
      <div className="rv-liste">
        {Object.entries(groupes).map(([code, g]) => {
          const themes = Object.entries(THEMES_VOTES).filter(([id]) =>
            scrutins.some((s) => s.theme === id && s.groupes[code]),
          )
          if (themes.length === 0) return null
          return (
            <details key={code} className="rv-carte rv-partie">
              <summary>
                <span className="rv-dot-groupe" style={{ background: g.couleur }}></span>
                <span className="rv-titre"><strong>{g.nom}</strong></span>
              </summary>
              <ul className="rv-themes-partie">
                {themes.map(([id]) => (
                  <LigneThemeParti
                    key={id}
                    theme={id}
                    codeGroupe={code}
                    groupes={groupes}
                    scrutins={scrutins.filter((s) => s.theme === id)}
                  />
                ))}
              </ul>
              <div className="rv-scrutins-theme">
                {scrutins.filter((s) => s.groupes[code]).slice(0, 30).map((s) => (
                  <CarteScrutin key={s.numero} scrutin={s} groupes={groupes} />
                ))}
              </div>
            </details>
          )
        })}
      </div>
    </div>
  )
}

function SectionRecherche({ scrutins, groupes }) {
  const [requete, setRequete] = React.useState('')
  const q = normaliser(requete.trim())
  const resultats = q
    ? scrutins.filter((s) =>
        normaliser(`${s.intitule} ${s.numero} ${s.seance}`).includes(q),
      )
    : []
  return (
    <div className="bloc">
      <h3>🔎 Rechercher un vote</h3>
      <p>Recherchez par mot-clé ou numéro de scrutin (ex. : « finances », « 2107 », « aide à mourir »).</p>
      <input
        className="rv-recherche"
        type="search"
        placeholder="🔎 Mot-clé ou numéro de scrutin…"
        value={requete}
        onChange={(e) => setRequete(e.target.value)}
      />
      {q && (
        <p className="rv-compte">
          {resultats.length === 0
            ? 'Aucun scrutin ne correspond à votre recherche.'
            : `${resultats.length} scrutin${resultats.length > 1 ? 's' : ''} trouvé${resultats.length > 1 ? 's' : ''} :`}
        </p>
      )}
      <div className="rv-liste">
        {resultats.slice(0, 50).map((s) => <CarteScrutin key={s.numero} scrutin={s} groupes={groupes} />)}
      </div>
    </div>
  )
}

export default function RecapVotes({ onRetour }) {
  const [scrutins, setScrutins] = React.useState(SCRUTINS)
  const [groupes, setGroupes] = React.useState(GROUPES)
  const [maj, setMaj] = React.useState(null)
  const [chargement, setChargement] = React.useState(true)

  React.useEffect(() => {
    let annule = false
    chargerScrutins().then((donnees) => {
      if (annule) return
      if (donnees && Array.isArray(donnees.scrutins) && donnees.scrutins.length > 0) {
        setScrutins(donnees.scrutins)
        if (donnees.groupes) setGroupes({ ...GROUPES, ...donnees.groupes })
        setMaj(donnees.majLe ? new Date(donnees.majLe) : null)
      }
      setChargement(false)
    })
    return () => { annule = true }
  }, [])

  const dateMaj = maj
    ? maj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : DATE_MAJ_SCRUTINS

  return (
    <section className="recap-votes">
      <div className="bloc">
        <h2>🗳️ Récap des votes</h2>
        <p>
          Qui a voté quoi à l'Assemblée nationale, groupe par groupe. Toutes les données proviennent
          exclusivement de l'<strong>open data officiel des scrutins publics</strong> publié par
          l'Assemblée nationale ({LEGISLATURE} législature). Dernière mise à jour : {dateMaj}.
        </p>
        <ul className="points">
          <li>✅ Résultat officiel de chaque scrutin : adopté ou rejeté</li>
          <li>🧭 Position de chaque groupe politique : pour, contre, abstention</li>
          <li>🏛️ Lien direct vers la source officielle pour chaque vote</li>
          {chargement
            ? <li>⏳ Récupération des derniers scrutins publiés…</li>
            : maj && <li>🔄 Mise à jour quotidienne automatique depuis l'open data de l'Assemblée nationale</li>}
        </ul>
      </div>
      <SectionDerniers scrutins={scrutins} groupes={groupes} />
      <SectionParParti scrutins={scrutins} groupes={groupes} />
      <SectionRecherche scrutins={scrutins} groupes={groupes} />
      <button className="btn-principal" onClick={onRetour}>
        ← Retour à l'accueil
      </button>
    </section>
  )
}
