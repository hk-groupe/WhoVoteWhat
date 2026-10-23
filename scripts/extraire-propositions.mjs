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
        propositions.push({ texte, url: `https://attalpresident.fr/programme/${slug}#${id}` })
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
    for (const texte of lis) propositions.push({ texte, url: `https://www.edouardphilippe.fr/priorites/${slug}` })
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
    for (const texte of lis) propositions.push({ texte, url })
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
