// Extraction des propositions directement depuis les programmes officiels 2027.
// Ce script alimente src/data/propositions-programmes.mjs (jeu de données dédié
// à la fonctionnalité « Compose ton programme »).
// Usage : node scripts/extraire-propositions.mjs

import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const DOSSIER = path.resolve('src/data')

const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' }

async function html(url) {
  const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(30000), headers: UA })
  if (!res.ok) throw new Error(`${res.status} sur ${url}`)
  return res.text()
}

const THEMES_MOTS_CLES = [
  ['retraite', 'retraites'], ['pension', 'retraites'], ['cotisation', 'retraites'],
  ['smic', 'economie'], ['salaire', 'economie'], ['impot', 'economie'], ['imposition', 'economie'],
  ['fiscal', 'economie'], ['taxe', 'economie'], ['entreprise', 'economie'], ['chomage', 'economie'],
  ['travail', 'economie'], ['emploi', 'economie'], ['economie', 'economie'], ['pme', 'economie'],
  ['budget', 'economie'], ['dette', 'economie'], ['deficit', 'economie'], ['charge', 'economie'],
  ['constitution', 'institutions'], ['institution', 'institutions'], ['parlement', 'institutions'],
  ['depute', 'institutions'], ['senateur', 'institutions'], ['senat', 'institutions'],
  ['referendum', 'institutions'], ['vote', 'institutions'], ['election', 'institutions'],
  ['president', 'institutions'], ['democratie', 'institutions'], ['maire', 'institutions'],
  ['commune', 'institutions'], ['metropole', 'institutions'], ['prefet', 'institutions'],
  ['elu', 'institutions'], ['collectivite', 'institutions'], ['service public', 'institutions'],
  ['immigration', 'immigration'], ['etranger', 'immigration'], ['asile', 'immigration'],
  ['sejour', 'immigration'], ['nationalite', 'immigration'], ['frontiere', 'immigration'],
  ['securite', 'securite'], ['justice', 'securite'], ['penal', 'securite'], ['police', 'securite'],
  ['prison', 'securite'], ['juge', 'securite'], ['magistrat', 'securite'], ['crime', 'securite'],
  ['delit', 'securite'], ['narco', 'securite'], ['condamn', 'securite'], ['peine', 'securite'],
  ['armee', 'securite'], ['defense', 'securite'], ['militaire', 'securite'],
  ['climat', 'ecologie'], ['ecologie', 'ecologie'], ['energie', 'ecologie'], ['nucleaire', 'ecologie'],
  ['eolien', 'ecologie'], ['biodiversite', 'ecologie'], ['agriculture', 'ecologie'], ['agricole', 'ecologie'],
  ['pesticide', 'ecologie'], ['eau', 'ecologie'], ['foret', 'ecologie'], ['carbone', 'ecologie'],
  ['emission', 'ecologie'], ['renov', 'ecologie'], ['logement', 'ecologie'], ['pollu', 'ecologie'],
  ['dechet', 'ecologie'], ['rechauffement', 'ecologie'],
  ['ecole', 'education'], ['education', 'education'], ['eleve', 'education'], ['enseignant', 'education'],
  ['enseignement', 'education'], ['universite', 'education'], ['etudiant', 'education'],
  ['college', 'education'], ['lycee', 'education'], ['parcoursup', 'education'],
  ['jeune', 'education'], ['enfant', 'education'], ['stage', 'education'], ['formation', 'education'],
  ['creche', 'education'], ['famille', 'education'],
  ['europe', 'europe'], ['europeen', 'europe'], ['bruxelles', 'europe'], ['union europeenne', 'europe'],
  ['ue ', 'europe'], ['international', 'europe'], ['diplomat', 'europe'], ['ukraine', 'europe'],
  ['otan', 'europe'], ['mondial', 'europe'],
  ['numerique', 'numerique'], ['intelligence artificielle', 'numerique'], [' ia ', 'numerique'],
  ['donnee', 'numerique'], ['digital', 'numerique'], ['reseau social', 'numerique'],
  ['plateforme', 'numerique'], ['cyber', 'numerique'], ['internet', 'numerique'], ['tech', 'numerique'],
  ['religion', 'religion'], ['religieux', 'religion'], ['laique', 'religion'], ['laicite', 'religion'],
  ['culte', 'religion'], ['islam', 'religion'], ['imam', 'religion'], ['signe religieux', 'religion'],
]

const normaliser = (s) =>
  String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

function classifierTheme(texte) {
  const t = ' ' + normaliser(texte) + ' '
  for (const [mot, theme] of THEMES_MOTS_CLES) {
    if (t.includes(' ' + mot + ' ') || t.includes(mot)) return theme
  }
  return 'autres'
}

const sansBalises = (s) =>
  s.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&#039;|&apos;/g, "'").replace(/&amp;/g, '&').replace(/&laquo;|&raquo;/g, '"')
    .replace(/\s+/g, ' ').trim()

// —— Glucksmann : JSON-LD structuré (59 engagements avec ancres) ——
async function glucksmann() {
  const t = await html('https://www.wikiglucksmann.fr/programme.html')
  const blocs = [...t.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1])
  for (const b of blocs) {
    try {
      const data = JSON.parse(b)
      if (data.itemListElement?.length && data.name?.includes('Engagements')) {
        return data.itemListElement.map((e) => ({
          texte: sansBalises(e.name),
          theme: classifierTheme(e.name),
          url: e.url,
        }))
      }
    } catch {}
  }
  return []
}

// —— Attal : pages des 6 chantiers, titres de sections avec ancres ——
async function attal() {
  const chantiers = [
    ['education', 'Éducation'],
    ['travail-salaires', 'Travail & salaires'],
    ['frontieres', 'Frontières'],
    ['intelligence-artificielle', 'Intelligence artificielle'],
    ['dette-de-letat', 'Dette de l\'État'],
    ['dette-ecologique', 'Dette écologique'],
  ]
  const propositions = []
  for (const [slug] of chantiers) {
    const t = await html(`https://attalpresident.fr/programme/${slug}`)
    const titres = [...t.matchAll(/<h[23][^>]*id="([a-z0-9-]+)"[^>]*>([\s\S]*?)<\/h[23]>/gi)]
    for (const [, id, titre] of titres) {
      const texte = sansBalises(titre)
      if (texte.length > 10 && !/chantier-voisins|rejoindre-app|pied-/i.test(id)) {
        propositions.push({ texte, theme: classifierTheme(texte), url: `https://attalpresident.fr/programme/${slug}#${id}` })
      }
    }
  }
  return propositions
}

// —— Philippe : 4 priorités, mesures en <li> ——
async function philippe() {
  const priorites = [
    ['pour-une-france-plus-sure', 'Sécurité, justice, défense'],
    ['pour-une-france-plus-attentive-a-ses-enfants', 'Éducation, enfance, familles'],
    ['pour-une-france-plus-prospere', 'Économie, impôts, comptes publics'],
    ['pour-une-france-plus-conquerante', 'Technologie, écologie, Europe'],
  ]
  const propositions = []
  for (const [slug] of priorites) {
    const t = await html(`https://www.edouardphilippe.fr/priorites/${slug}`)
    const lis = [...t.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map((m) => sansBalises(m[1]))
      .filter((s) => s.length > 40 && s.length < 400 && /[a-zà-ÿ]/.test(s.slice(0, 20)))
    for (const texte of lis) propositions.push({ texte, theme: classifierTheme(texte), url: `https://www.edouardphilippe.fr/priorites/${slug}` })
  }
  return propositions
}

// —— Mélenchon : plans thématiques et d'investissement publiés (mesures en <li>) ——
async function melenchon() {
  const plans = [
    ['https://melenchon2027.fr/programme/plans-thematiques/ruralite/', 'Ruralités'],
    ['https://melenchon2027.fr/programme/plans-investissement/automobile/', 'Automobile'],
    ['https://melenchon2027.fr/programme/plans-investissement/btp-logement/', 'BTP et logement'],
  ]
  const propositions = []
  for (const [url] of plans) {
    const t = await html(url)
    const lis = [...t.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map((m) => sansBalises(m[1]))
      .filter((s) => s.length > 40 && s.length < 350 && !/Mélenchon 2027|Aller au contenu|Programme Fermer/i.test(s))
    for (const texte of lis) propositions.push({ texte, theme: classifierTheme(texte), url })
  }
  return propositions
}

const CANDIDATS = {
  glucksmann: { nom: 'Raphaël Glucksmann', sourceLabel: 'WikiGlucksmann — programme 2027 (engagements sourcés)' },
  attal: { nom: 'Gabriel Attal', sourceLabel: 'attalpresident.fr — les chantiers capitaux' },
  philippe: { nom: 'Édouard Philippe', sourceLabel: 'edouardphilippe.fr — les priorités' },
  melenchon: { nom: 'Jean-Luc Mélenchon', sourceLabel: 'melenchon2027.fr — plans thématiques et d\'investissement' },
}


const [gl, at, ph, me] = await Promise.all([glucksmann(), attal(), philippe(), melenchon()])
const donnees = {
  glucksmann: gl,
  attal: at,
  philippe: ph,
  melenchon: me,
}

let total = 0
for (const [id, props] of Object.entries(donnees)) {
  console.log(`${CANDIDATS[id].nom} : ${props.length} propositions extraites`)
  total += props.length
}
console.log('Total :', total)

const sortie = `// Jeu de données dédié à « Compose ton programme ».
// Propositions extraites DIRECTEMENT des programmes officiels 2027 des candidats,
// avec l'intitulé exact tel qu'il figure dans le programme (duplicatas conservés)
// et le lien direct (ancre quand disponible) vers la proposition.
// Régénérer : node scripts/extraire-propositions.mjs
// Source : ${new Date().toISOString().slice(0, 10)}

export const PROPOSITIONS_PROGRAMMES = ${JSON.stringify(donnees, null, 2)}

export const SOURCES_PROGRAMMES = ${JSON.stringify(CANDIDATS, null, 2)}
`

await mkdir(DOSSIER, { recursive: true })
await writeFile(path.join(DOSSIER, 'propositions-programmes.mjs'), sortie)
console.log('Écrit : src/data/propositions-programmes.mjs')
