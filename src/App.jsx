import React from 'react'
import { chargerDonnees } from './backoffice/store.mjs'
import BackOffice from './backoffice/BackOffice.jsx'
import RecapVotes from './RecapVotes.jsx'
import Candidats from './Candidats.jsx'
import Calendrier from './Calendrier.jsx'
import ComposeProgramme from './ComposeProgramme.jsx'
import { BadgeStatut, BadgeProgramme } from './Badges.jsx'
import { NomInformel } from './NomInformel.jsx'

const NAV = [
  { id: 'accueil', label: 'Accueil', emoji: '🏠' },
  { id: 'quiz-config', label: 'Le quiz', emoji: '🎯' },
  { id: 'compose-programme', label: 'Compose ton programme', emoji: '✍️' },
  { id: 'recap-votes', label: 'Que votent-ils ?', emoji: '🗳️' },
  { id: 'candidats', label: 'Les candidats', emoji: '👥' },
  { id: 'calendrier', label: 'Le calendrier', emoji: '📅' },
  { id: 'transparence', label: 'Notre transparence', emoji: '🔍' },
]

function Navigation({ ecran, naviguer }) {
  const [ouvert, setOuvert] = React.useState(false)
  return (
    <nav className="nav" aria-label="Navigation principale">
      <button
        className={ouvert ? 'burger ouvert' : 'burger'}
        aria-expanded={ouvert}
        aria-label="Menu"
        onClick={() => setOuvert(!ouvert)}
      >
        <span></span><span></span><span></span>
      </button>
      {ouvert && (
        <ul className="menu-nav">
          {NAV.map((item) => (
            <li key={item.id}>
              <button
                className={ecran === item.id ? 'lien-nav actif' : 'lien-nav'}
                onClick={() => { setOuvert(false); naviguer(item.id) }}
              >
                {item.emoji} {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  )
}

const NB_MIN = 10
const NB_MAX = 100

function bornageNb(valeur) {
  const n = Number.parseInt(valeur, 10)
  if (!Number.isFinite(n)) return NB_MIN
  return Math.min(NB_MAX, Math.max(NB_MIN, n))
}

function melanger(liste) {
  const copie = [...liste]
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]]
  }
  return copie
}

// Tirage aléatoire équilibré : répartit le nombre de questions au prorata des thèmes
function tirerQuestions(toutes, nb) {
  const parTheme = {}
  toutes.forEach((q) => {
    if (!parTheme[q.theme]) parTheme[q.theme] = []
    parTheme[q.theme].push(q)
  })
  const themes = melanger(Object.keys(parTheme))
  const choisi = []
  let idx = 0
  while (choisi.length < nb && idx < themes.length * toutes.length) {
    const theme = themes[idx % themes.length]
    const pool = parTheme[theme]
    const dejaPris = choisi.filter(q => q.theme === theme).length
    if (dejaPris < pool.length) {
      choisi.push(pool[dejaPris])
    }
    idx++
  }
  return melanger(choisi)
}

export default function App() {
  const [ecran, setEcran] = React.useState('accueil')
  const [donnees, setDonnees] = React.useState(null)

  React.useEffect(() => {
    chargerDonnees().then(setDonnees).catch(() => setDonnees({}))
  }, [])
  const [nbQuestions, setNbQuestions] = React.useState(20)
  const [saisieNb, setSaisieNb] = React.useState('20')

  function majSaisieNb(valeur) {
    setSaisieNb(valeur)
    const nettoyee = valeur.replace(/\D/g, '').slice(0, 3)
    if (nettoyee === '') return
    setNbQuestions(bornageNb(nettoyee))
  }
  const [questions, setQuestions] = React.useState([])
  const [qIndex, setQIndex] = React.useState(0)
  const [reponses, setReponses] = React.useState({})
  const question = questions[qIndex]



  function demarrer() {
    setQuestions(tirerQuestions(donnees.questions ?? [], nbQuestions))
    setQIndex(0)
    setReponses({})
    setEcran('quiz')
  }

  function choisir(valeur) {
    setReponses({ ...reponses, [question.id]: valeur })
    if (qIndex < questions.length - 1) setQIndex(qIndex + 1)
    else setEcran('resultat')
  }

  function recommencer() {
    setReponses({})
    setQIndex(0)
    setEcran('quiz-config')
  }

  function naviguer(cible) {
    setEcran(cible)
  }

  function calculerScores() {
    return candidats.map((c) => {
      let total = 0, max = 0, detail = {}
      questions.forEach((q) => {
        const rep = reponses[q.id]
        if (rep === undefined || rep === 0) return
        const pos = q.positions[c.id]?.position
        if (pos === undefined || pos === 0) return
        max += Math.abs(rep)
        if (pos === rep) total += Math.abs(rep)
        else total -= Math.abs(rep)
        detail[q.id] = pos === rep ? 'accord' : 'desaccord'
      })
      const score = max === 0 ? 50 : Math.round(50 + (total / max) * 50)
      return { candidat: c, score, detail, nbAccords: Object.values(detail).filter(d => d === 'accord').length }
    }).sort((a, b) => b.score - a.score)
  }

  if (!donnees) {
    return (
      <div className="app">
        <header className="header">
          <span className="logo">🗳️</span>
          <h1>Qui Vote<span className="accent"> Quoi</span></h1>
          <p className="tagline">Chargement…</p>
        </header>
      </div>
    )
  }

  const candidats = donnees.candidats ?? []
  const themes = donnees.themes ?? {}
  const legendes = donnees.legendes ?? {}

  if (ecran === 'backoffice') {
    return (
      <div className="app">
        <header className="header">
          <span className="logo">🗳️</span>
          <h1>Qui Vote<span className="accent"> Quoi</span></h1>
          <p className="tagline">Back-office de gestion du contenu 🛠️</p>
        </header>
        <BackOffice onFermer={() => setEcran('accueil')} />
        <footer className="footer">
          <p>Site indépendant, non partisan. Positions extraites des programmes officiels des candidats à l'élection présidentielle 2027.</p>
        </footer>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="barre-titre">
          <span className="logo">🗳️</span>
          <h1>Qui Vote<span className="accent"> Quoi</span></h1>
          <Navigation ecran={ecran} naviguer={naviguer} />
        </div>

        {ecran === 'quiz-config' && (
          <p className="tagline">Trouvez le candidat 2027 qui vous ressemble, en quelques questions simples 🚀</p>
        )}
      </header>

      {ecran === 'accueil' && (
        <section className="accueil">
          <div className="bloc">
            <h2>Bienvenue 👋</h2>
            <p>Découvrez les sections du site pour mieux comprendre les programmes et les votes de vos élus :</p>
            <ul className="points">
              <li>🎯 <strong>Le quiz</strong> — configurez et lancez votre quiz pour trouver le candidat qui vous ressemble</li>
              <li>✍️ <strong>Compose ton programme</strong> — piochez parmi toutes les propositions des programmes 2027, puis comparez votre programme à celui des candidats : points communs et divergences</li>
              <li>🗳️ <strong>Que votent-ils ?</strong> — le récap des votes : qui a voté quoi à l'Assemblée</li>
              <li>👥 <strong>Les candidats</strong> — la liste des candidats déclarés avec le résumé de leur programme</li>
              <li>📅 <strong>Le calendrier</strong> — toutes les élections à venir, en France et en Europe</li>
              <li>🔍 <strong>Notre transparence</strong> — comment ce site fonctionne, sources et méthode</li>
            </ul>
            <p className="aide-nav">Ouvrez le menu burger ☰ en haut de la page pour naviguer entre les sections.</p>
            <div className="accueil-actions">
              <button className="btn-principal" onClick={() => naviguer('quiz-config')}>🚀 Commencer le quiz</button>
              <button className="btn-principal btn-secondaire" onClick={() => naviguer('compose-programme')}>✍️ Compose ton programme</button>
            </div>
          </div>
          <div className="bloc disclaimer" role="note">
            <h3>⚠️ Avertissement</h3>
            <p><strong>QuiVoteQuoi est un projet indépendant de vulgarisation à but strictement informatif.</strong> Les contenus proposés — quiz d'affinité, récapitulatif des votes et positions des candidats — sont établis à partir de sources officielles, mais ne constituent <strong>ni un conseil de vote</strong>, ni une recommandation, ni un soutien à un candidat ou à une formation politique, et ne se substituent en aucun cas à la recherche et à la lecture intégrale des programmes électoraux et des textes officiels.</p>
            <p>L'application a pour seul objet de vous aider à <strong>y voir plus clair</strong> dans l'offre politique et à orienter votre propre réflexion. Les synthèses et scores présentés résultent d'un traitement simplifié d'informations publiques : ils ne reflètent pas l'exhaustivité ni la complexité des programmes et ne sauraient engager la responsabilité de leurs auteurs. En utilisant ce site, vous reconnaissez que vos choix électoraux relèvent de votre seule et entière responsabilité.</p>
          </div>
          <button className="retour" onClick={() => setEcran('backoffice')}>🛠️ Back-office (admin)</button>
        </section>
      )}
      {ecran === 'quiz-config' && (
        <section className="accueil">
          <div className="bloc">
            <h2>Ce sont vos idées qui comptent 🎯</h2>
            <p>Répondez à des questions sur les vraies propositions des candidats à la présidentielle 2027. Chaque position est issue des <strong>sites officiels</strong> des candidats et de leurs programmes publiés.</p>
            <ul className="points">
              <li>✅ 100 % sourcé : programmes officiels uniquement</li>
              <li>🎲 À chaque quiz : des questions différentes, tirées au hasard</li>
              <li>🔗 Des liens « En savoir plus » pour comprendre chaque sujet</li>
              <li>🔒 Anonyme, aucune donnée collectée</li>
            </ul>
            <div className="choix-nb">
              <p className="choix-nb-label">Combien de questions voulez-vous répondre ?</p>
              <div className="champ-nb">
                <input
                  type="text"
                  inputMode="numeric"
                  className="saisie-nb"
                  value={saisieNb}
                  min={NB_MIN}
                  max={NB_MAX}
                  aria-label="Nombre de questions"
                  onChange={(e) => majSaisieNb(e.target.value)}
                  onBlur={(e) => { setNbQuestions(bornageNb(e.target.value)); setSaisieNb(String(bornageNb(e.target.value))) }}
                />
                <span className="saisie-nb-aide">entre {NB_MIN} et {NB_MAX} questions</span>
              </div>
            </div>
            <button className="btn-principal" onClick={demarrer}>C'est parti ! 🔥</button>
          </div>
          <button className="retour" onClick={() => setEcran('accueil')}>← Retour à l'accueil</button>
        </section>
      )}
      {ecran === 'recap-votes' && <RecapVotes onRetour={() => setEcran('accueil')} />}
      {ecran === 'compose-programme' && donnees && <ComposeProgramme donnees={donnees} onRetour={() => setEcran('accueil')} />}
      {ecran === 'candidats' && <Candidats donnees={donnees} onOuvrir={() => naviguer('quiz-config')} />}
      {ecran === 'calendrier' && <Calendrier />}
      {ecran === 'transparence' && (
        <section className="transparence">
          <div className="bloc">
            <h2>🔍 Transparence</h2>
            <p>Cette page explique <strong>comment ce site fonctionne</strong>, d'où viennent les questions et les positions, et comment il a été construit. Nous n'avons rien à cacher : tout est vérifiable.</p>
          </div>

          <div className="bloc">
            <h3>🎲 Comment fonctionne le site</h3>
            <p>Le site pose des questions sur des propositions concrètes issues des programmes des candidats. Vous répondez <em>d'accord</em>, <em>mitigé / je ne sais pas</em> ou <em>pas d'accord</em>. Chaque candidat a une position (<em>pour</em>, <em>nuancé</em>, <em>contre</em>) sur chaque question, extraite de ses propres publications.</p>
            <p><strong>Calcul du score :</strong> un accord avec la position d'un candidat rapporte +1, un désaccord −1. Les réponses « mitigé » et les positions « nuancées » sont neutralisées (elles ne comptent ni pour ni contre). Le score final, normalisé de 0 à 100 %, reflète votre proximité avec chaque programme.</p>
            <p><strong>Aucune donnée personnelle collectée :</strong> le quiz tourne entièrement dans votre navigateur et vos réponses ne quittent jamais votre appareil. Le site s'appuie désormais sur un backend uniquement pour distribuer le contenu édité et les scrutins consolidés chaque jour — jamais pour vous suivre.</p>
          </div>

          <div className="bloc">
            <h3>❓ Comment les questions sont choisies</h3>
            <p>Les questions portent sur des <strong>propositions réelles et vérifiables</strong> : chaque énoncé correspond à un engagement publié par au moins un candidat. Elles couvrent tous les grands thèmes de campagne (économie, retraites, institutions, immigration, sécurité, écologie, éducation, Europe).</p>
            <p>À chaque quiz, les questions sont <strong>tirées au hasard de façon équilibrée entre les thèmes</strong>, afin de ne pas avantager un sujet. Aucune question n'est formulée pour favoriser un candidat : elles décrivent une proposition, jamais une personne ou un parti.</p>
          </div>

          <div className="bloc">
            <h3>📚 Comment les sources sont obtenues</h3>
            <p>Toutes les positions proviennent <strong>exclusivement de sources officielles</strong> :</p>
            <ul className="points">
              <li>📄 Les programmes et sites de campagne officiels des candidats</li>
              <li>🏛️ Les professions de foi publiées par le <a href="https://programme-candidats.interieur.gouv.fr/" target="_blank" rel="noreferrer">ministère de l'Intérieur ↗</a></li>
              <li>🗳️ Les analyses officielles des scrutins publics de l'Assemblée nationale — <a href="https://www.assemblee-nationale.fr/dyn/17/scrutins" target="_blank" rel="noreferrer">assemblee-nationale.fr/dyn/17/scrutins ↗</a> — pour la rubrique « Récap des votes »</li>
              <li>📖 Des fiches institutionnelles pour les liens « En savoir plus » — liste complète ci-dessous :</li>
            </ul>
            <ul className="sources-infos-liste">
              {Object.values(donnees.infos ?? {}).flat().map((info) => (
                <li key={info.url}>
                  <a href={info.url} target="_blank" rel="noreferrer">{info.titre} ↗</a>
                </li>
              ))}
            </ul>
            <p>La position de chaque candidat est accompagnée de la <strong>citation exacte de son programme</strong> — vous la retrouvez dans les résultats, question par question. Lorsqu'un candidat n'a pas pris position ou s'est exprimé avec nuance, il est classé « nuancé » plutôt que d'interpréter son silence.</p>
            <p><strong>Candidats sans programme 2027 publié :</strong> pour les candidats qui n'ont pas encore publié leur programme de campagne 2027, les positions reposent sur <strong>leur ancien programme (principalement 2022) ou leurs prises de position publiques</strong> (discours, interviews, votes à l'Assemblée). C'est indiqué par un bandeau « ⚠️ » sur chaque fiche, la mention « ancien programme » ou « prise de position publique » à côté de chaque position, et le lien vers la source documentaire correspondante. Ces positions seront remplacées par le programme officiel dès sa publication.</p>
          </div>

          <div className="bloc">
            <h3>📊 Les positions de chaque candidat, question par question</h3>
            <p>L'intégralité des positions utilisées par le quiz, consultable librement :</p>
            {(donnees.questions ?? []).map((q) => (
              <details key={q.id} className="details-transparence">
                <summary>{themes[q.theme]?.emoji} {q.texte}</summary>
                <ul className="positions-liste">
                  {candidats.map((c) => {
                    const p = q.positions[c.id]
                    if (!p) return null
                    return (
                      <li key={c.id} className="position-item">
                        <span className="dot" style={{ background: c.couleur, display: 'inline-block', width: 12, height: 12, margin: '0 6px 0 0', verticalAlign: 'middle' }}></span>
                        <strong>{c.nom}</strong> — {p.position === 1 ? '✅ Pour' : p.position === -1 ? '❌ Contre' : '➖ Nuancé'}
                        {p.base === 'ancien_programme' && <span className="src-label"> · ancien programme</span>}
                        {p.base === 'prise_de_parole' && <span className="src-label"> · prise de position publique</span>}
                        <em className="source">— <a href={(p.base && (donnees.sourcesBase ?? {})[c.id]) ? donnees.sourcesBase[c.id].url : c.programme} target="_blank" rel="noreferrer">{p.source}</a> <span className="src-label">(source : {p.base && (donnees.sourcesBase ?? {})[c.id] ? donnees.sourcesBase[c.id].label : c.sourceLabel || c.parti})</span></em>
                      </li>
                    )
                  })}
                </ul>
              </details>
            ))}
          </div>

          <div className="bloc">
            <h3>🗳️ Comment la rubrique « Récap des votes » est construite</h3>
            <p>La rubrique « Récap des votes » présente les scrutins publics de l'Assemblée nationale (17e législature). Les chiffres affichés — résultat du scrutin, votants, suffrages exprimés et répartition pour / contre / abstention de chaque groupe parlementaire — sont <strong>recopiés tels quels depuis l'open data officielle des scrutins de l'Assemblée nationale</strong> (data.assemblee-nationale.fr, Licence Ouverte 2.0), sans interprétation ni recalcul. Chaque fiche renvoie vers la page officielle « Analyse du scrutin » correspondante.</p>
            <p><strong>Ce que nous affichons :</strong> pour chaque scrutin, un badge « adopté » ou « rejeté » conforme au résultat officiel, la synthèse du vote (votants, suffrages exprimés, majorité requise) et, pour chaque groupe, le décompte officiel des voix. La « position » affichée par groupe correspond à la position majoritaire des voix exprimées du groupe sur ce scrutin — quand les voix sont partagées, le groupe est classé « mixte » plutôt que rangé arbitrairement d'un côté.</p>
            <p><strong>Limites assumées :</strong> le site affiche une fenêtre glissante de douze mois de scrutins (les 20 derniers et des votes de référence par thème), pas l'intégralité de la législature. Les « non-votants » (présidents de séance, absents) ne sont pas comptés dans les jauges. Les couleurs associées aux groupes sont purement indicatives. Chaque fiche comporte un lien direct vers la page officielle de l'Assemblée nationale pour vérifier et aller plus loin.</p>
            <p><strong>Mise à jour quotidienne :</strong> chaque nuit, un travail automatisé télécharge l'open data officielle des scrutins publiée par l'Assemblée nationale (data.assemblee-nationale.fr, Licence Ouverte 2.0) et consolide les décomptes par groupe. Les chiffres affichés restent recopiés tels quels depuis la source officielle, sans interprétation ni recalcul.</p>
          </div>

          <div className="bloc">
            <h3>🤖 Comment ce site a été développé</h3>
            <p>Ce site a été développé en <strong>vibe coding</strong> : une méthode où l'on décrit les fonctionnalités en langage naturel et où l'IA génère et itère sur le code, sous revue humaine. Le modèle d'IA utilisé est <strong>GLM (zai-glm-5-3)</strong>, piloté par l'agent <strong>Vibe Code</strong> de Mistral AI.</p>
            <p>La stack technique est volontairement simple et auditable : React 19 + Vite côté client, et un backend Node sans dépendance (API de contenu partagée + consolidation quotidienne de l'open data officielle des scrutins).</p>
          </div>

          <div className="bloc">
            <h3>🔓 Un code libre et consultable par tous</h3>
            <p>Le code de ce site est <strong>en accès libre</strong> : chacun peut le consulter, vérifier comment les scores sont calculés, corriger une position ou proposer une amélioration. La transparence est aussi dans le code, pas seulement dans les données.</p>
            <p>
              <a className="lien-repo" href="https://github.com/hk-groupe/WhoVoteWhat" target="_blank" rel="noreferrer">
                📁 Consulter le dépôt Git (lien temporaire) ↗
              </a>
            </p>
          </div>

          <button className="btn-principal" onClick={() => setEcran('accueil')}>← Retour à l'accueil</button>
        </section>
      )}

      {ecran === 'quiz' && question && (
        <section className="quiz">
          <div className="progression">
            <span>Question {qIndex + 1} / {questions.length}</span>
            <span>{themes[question.theme]?.emoji} {themes[question.theme]?.label || question.theme}</span>
          </div>
          <div className="barre">
            <div className="remplie" style={{ width: `${((qIndex) / questions.length) * 100}%` }}></div>
          </div>
          <h2 className="question-texte">{question.texte}</h2>
          {(() => {
            const infosQuestion = Array.isArray(question.info)
              ? question.info
              : (typeof question.info === 'string' && donnees.infos[question.info]) || []
            if (infosQuestion.length === 0) return null
            return (
              <p className="en-savoir-plus">
                <span className="en-savoir-plus-label">💡 En savoir plus :</span>{' '}
                {infosQuestion.map((info) => (
                  <React.Fragment key={info.url}>
                    <a href={info.url} target="_blank" rel="noreferrer">{info.titre} ↗</a>{' '}
                  </React.Fragment>
                ))}
              </p>
            )
          })()}
          <div className="choix">
            <button className="btn-choix pour" onClick={() => choisir(1)}>👍 Tout à fait d'accord</button>
            <button className="btn-choix mitigee" onClick={() => choisir(0)}>🤷 Je ne sais pas / mitigé</button>
            <button className="btn-choix contre" onClick={() => choisir(-1)}>👎 Pas d'accord</button>
          </div>
          {qIndex > 0 && <button className="retour" onClick={() => setQIndex(qIndex - 1)}>← Retour</button>}
        </section>
      )}

      {ecran === 'resultat' && (() => {
        const scores = calculerScores()
        const gagnant = scores[0]
        const sourcesBase = donnees.sourcesBase ?? {}
        const categorie = (c) => {
          if (c.statut === 'officiel') return sourcesBase[c.id] ? 'officiel-programme-non-publie' : 'officiel-programme-publie'
          if (c.statut === 'declare' || c.statut === 'conditionnelle') return 'declare-non-officiel'
          return 'autres'
        }
        const CATEGORIES = [
          { id: 'officiel-programme-publie', titre: 'Candidats officiellement déclarés · programme diffusé' },
          { id: 'officiel-programme-non-publie', titre: 'Candidats officiellement déclarés · programme non diffusé' },
          { id: 'declare-non-officiel', titre: 'Candidats déclarés mais pas encore officiels · programme diffusé ou non' },
          { id: 'autres', titre: 'Les autres candidats' },
        ]
        const rangGlobal = new Map(scores.map((s, i) => [s.candidat.id, i + 1]))
        return (
          <section className="resultat">
            {(donnees.sourcesBase ?? {})[gagnant.candidat.id] && (
              <p className="avertissement-programme" role="note">
                ⚠️ {gagnant.candidat.nom} n'a pas encore publié son programme de campagne 2027. Les positions
                utilisées ici sont basées sur <strong>son ancien programme ou ses prises de position publiques</strong> :
                <a href={donnees.sourcesBase[gagnant.candidat.id].url} target="_blank" rel="noreferrer"> {donnees.sourcesBase[gagnant.candidat.id].label} ↗</a>. Elles seront remplacées par son programme officiel dès sa publication.
              </p>
            )}
            <div className="carte-gagnant" style={{ background: gagnant.candidat.couleur }}>
              <span className="medaille">🏆</span>
              <h2>Le programme le plus proche de vos idées :</h2>
              <p className="parti-gagnant"><strong>{gagnant.candidat.parti}</strong></p>
              <p className="candidat-informel-gagnant">{gagnant.candidat.nom}</p>
              <p className="score-gagnant">{gagnant.score} % de compatibilité</p>
              <p className="resume">{legendes[gagnant.candidat.id]}</p>
              {gagnant.candidat.statut === 'conditionnelle' && (
                <p className="resume">❓ Candidature conditionnelle : la participation de ce candidat à l'élection n'est pas encore confirmée.</p>
              )}
            </div>
            <h3>📊 Tous vos scores</h3>
            {CATEGORIES.map((cat) => {
              const scoresCat = scores.filter((s) => categorie(s.candidat) === cat.id)
              if (scoresCat.length === 0) return null
              return (
                <div key={cat.id} className="categorie-classement">
                  <h4>{cat.titre}</h4>
                  <div className="classement">
                    {scoresCat.map((s) => (
                      <div key={s.candidat.id} className="ligne-score">
                        <span className="rang">#{rangGlobal.get(s.candidat.id)}</span>
                        <span className="nom"><NomInformel candidat={s.candidat} /></span>
                        <span className="badges-ligne">
                          <BadgeStatut statut={s.candidat.statut} />
                          <BadgeProgramme publie={!sourcesBase[s.candidat.id]} nom={s.candidat.nom} />
                        </span>
                        <div className="jauge"><div style={{ width: `${s.score}%`, background: s.candidat.couleur }}></div></div>
                        <span className="pct">{s.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            <details className="explications">
              <summary>🔍 Voir les accords / désaccords par candidat</summary>
              {scores.map((s) => (
                <div key={s.candidat.id} className="explication-candidat">
                  <h4>
                    <NomInformel candidat={s.candidat} /> · {s.nbAccords} accords
                    <span className="badges-ligne">
                      <BadgeStatut statut={s.candidat.statut} />
                      <BadgeProgramme publie={!sourcesBase[s.candidat.id]} nom={s.candidat.nom} />
                    </span>
                  </h4>
                  {(donnees.sourcesBase ?? {})[s.candidat.id] && (
                    <p className="avertissement-programme" role="note">
                      ⚠️ Programme 2027 non publié : positions basées sur l'ancien programme ou des prises de position publiques — <a href={donnees.sourcesBase[s.candidat.id].url} target="_blank" rel="noreferrer">{donnees.sourcesBase[s.candidat.id].label} ↗</a>
                    </p>
                  )}
                  <ul>
                    {questions.filter(q => reponses[q.id] !== undefined && reponses[q.id] !== 0 && q.positions[s.candidat.id] && q.positions[s.candidat.id].position !== 0).map(q => {
                      const p = q.positions[s.candidat.id]
                      const accord = p.position === reponses[q.id]
                      const lienSource = (donnees.sourcesBase ?? {})[s.candidat.id] && p.base
                        ? donnees.sourcesBase[s.candidat.id].url
                        : s.candidat.programme
                      return (
                        <li key={q.id} className={accord ? 'accord' : 'desaccord'}>
                          <span>{accord ? '✅' : '❌'}</span> {q.texte}
                          <em className="source">— Position : {p.source}{p.base === 'ancien_programme' ? ' (ancien programme)' : p.base === 'prise_de_parole' ? ' (prise de position publique)' : ''} · <a href={lienSource} target="_blank" rel="noreferrer">Source : {p.base && (donnees.sourcesBase ?? {})[s.candidat.id] ? donnees.sourcesBase[s.candidat.id].label : s.candidat.sourceLabel || s.candidat.nom} ↗</a></em>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </details>
            <div className="sources-note">
              📚 Sources officielles : {candidats.map(c => <a key={c.id} href={c.programme} target="_blank" rel="noreferrer">{c.nom.split(' ')[0]} ↗</a>)}
            </div>
            <button className="btn-principal" onClick={recommencer}>🔄 Refaire le quiz</button>
          </section>
        )
      })()}

      <footer className="footer">
        <p>Site indépendant, non partisan. Positions extraites des programmes officiels des candidats à l'élection présidentielle 2027.</p>
        <p>Références : programme-candidats.interieur.gouv.fr · melenchon2027.fr · edouardphilippe.fr · attalpresident.fr · rassemblementnational.fr · place-publique.eu</p>
      </footer>
    </div>
  )
}
