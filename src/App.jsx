import React from 'react'
import { CANDIDATS, THEMES, QUESTIONS, RESULTATS_LEGEND } from './data/programmes.mjs'

const OPTIONS_NB = [10, 15, 20, 25, 30, 35, 40]

function melanger(liste) {
  const copie = [...liste]
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]]
  }
  return copie
}

// Tirage aléatoire équilibré : répartit le nombre de questions au prorata des 8 thèmes
function tirerQuestions(nb) {
  const parTheme = {}
  QUESTIONS.forEach((q) => {
    if (!parTheme[q.theme]) parTheme[q.theme] = []
    parTheme[q.theme].push(q)
  })
  const themes = melanger(Object.keys(parTheme))
  const choisi = []
  let idx = 0
  while (choisi.length < nb) {
    const theme = themes[idx % themes.length]
    const pool = parTheme[theme]
    const dejaPris = choisi.filter(q => q.theme === theme).length
    if (dejaPris < pool.length) {
      choisi.push(pool[dejaPris])
    }
    idx++
    if (idx >= themes.length * QUESTIONS.length) break
  }
  return melanger(choisi)
}

export default function App() {
  const [ecran, setEcran] = React.useState('accueil')
  const [nbQuestions, setNbQuestions] = React.useState(20)
  const [questions, setQuestions] = React.useState([])
  const [qIndex, setQIndex] = React.useState(0)
  const [reponses, setReponses] = React.useState({})
  const question = questions[qIndex]

  function demarrer() {
    setQuestions(tirerQuestions(nbQuestions))
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
    setEcran('accueil')
  }

  function calculerScores() {
    return CANDIDATS.map((c) => {
      let total = 0, max = 0, detail = {}
      questions.forEach((q) => {
        const rep = reponses[q.id]
        if (rep === undefined || rep === 0) return
        const pos = q.positions[c.id].position
        if (pos === 0) return
        max += Math.abs(rep)
        if (pos === rep) total += Math.abs(rep)
        else total -= Math.abs(rep)
        detail[q.id] = pos === rep ? 'accord' : 'desaccord'
      })
      const score = max === 0 ? 50 : Math.round(50 + (total / max) * 50)
      return { candidat: c, score, detail, nbAccords: Object.values(detail).filter(d => d === 'accord').length }
    }).sort((a, b) => b.score - a.score)
  }

  return (
    <div className="app">
      <header className="header">
        <span className="logo">🗳️</span>
        <h1>Vote<span className="accent">Clair</span></h1>
        <p className="tagline">Trouvez le candidat 2027 qui vous ressemble, en quelques questions simples 🚀</p>
      </header>

      {ecran === 'accueil' && (
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
              <div className="boutons-nb">
                {OPTIONS_NB.map((n) => (
                  <button
                    key={n}
                    className={`btn-nb ${n === nbQuestions ? 'actif' : ''}`}
                    onClick={() => setNbQuestions(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn-principal" onClick={demarrer}>C'est parti ! 🔥</button>
          </div>
          <div className="candidats-apercu">
            {CANDIDATS.map((c) => (
              <div key={c.id} className="carte-candidat" style={{ borderColor: c.couleur }}>
                <span className="dot" style={{ background: c.couleur }}></span>
                <strong>{c.nom}</strong>
                <em>{c.parti}</em>
                <a className="lien-programme" href={c.programme} target="_blank" rel="noreferrer">📄 Programme officiel ↗</a>
              </div>
            ))}
          </div>
        </section>
      )}

      {ecran === 'quiz' && question && (
        <section className="quiz">
          <div className="progression">
            <span>Question {qIndex + 1} / {questions.length}</span>
            <span>{THEMES[question.theme].emoji} {THEMES[question.theme].label}</span>
          </div>
          <div className="barre">
            <div className="remplie" style={{ width: `${((qIndex) / questions.length) * 100}%` }}></div>
          </div>
          <h2 className="question-texte">{question.texte}</h2>
          {question.info && (
            <p className="en-savoir-plus">
              <span className="en-savoir-plus-label">💡 En savoir plus :</span>{' '}
              {question.info.map((info) => (
                <React.Fragment key={info.url}>
                  <a href={info.url} target="_blank" rel="noreferrer">{info.titre} ↗</a>{' '}
                </React.Fragment>
              ))}
            </p>
          )}
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
        return (
          <section className="resultat">
            <div className="carte-gagnant" style={{ background: gagnant.candidat.couleur }}>
              <span className="medaille">🏆</span>
              <h2>Votre candidat le plus proche :<br />{gagnant.candidat.nom}</h2>
              <p className="parti">{gagnant.candidat.parti}</p>
              <p className="score-gagnant">{gagnant.score} % de compatibilité</p>
              <p className="resume">{RESULTATS_LEGEND[gagnant.candidat.id]}</p>
            </div>
            <h3>📊 Tous vos scores</h3>
            <div className="classement">
              {scores.map((s, i) => (
                <div key={s.candidat.id} className="ligne-score">
                  <span className="rang">#{i + 1}</span>
                  <span className="nom">{s.candidat.nom}</span>
                  <div className="jauge"><div style={{ width: `${s.score}%`, background: s.candidat.couleur }}></div></div>
                  <span className="pct">{s.score}%</span>
                </div>
              ))}
            </div>
            <details className="explications">
              <summary>🔍 Voir les accords / désaccords par candidat</summary>
              {scores.map((s) => (
                <div key={s.candidat.id} className="explication-candidat">
                  <h4>{s.candidat.nom} · {s.nbAccords} accords</h4>
                  <ul>
                    {questions.filter(q => reponses[q.id] !== undefined && reponses[q.id] !== 0 && q.positions[s.candidat.id].position !== 0).map(q => {
                      const accord = q.positions[s.candidat.id].position === reponses[q.id]
                      return (
                        <li key={q.id} className={accord ? 'accord' : 'desaccord'}>
                          <span>{accord ? '✅' : '❌'}</span> {q.texte}
                          <em className="source">— Position : {q.positions[s.candidat.id].source}</em>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </details>
            <div className="sources-note">
              📚 Sources officielles : {CANDIDATS.map(c => <a key={c.id} href={c.programme} target="_blank" rel="noreferrer">{c.nom.split(' ')[0]} ↗</a>)}
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
