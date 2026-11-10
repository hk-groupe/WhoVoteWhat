// Mise à jour quotidienne de toutes les données du site.
// À lancer via cron : node scripts/maj-quotidienne.mjs
//
// Ce que le script met à jour automatiquement :
//   1. Scrutins de l'Assemblée nationale (open data) → server/data/
//   2. Propositions extraites des programmes officiels → src/data/propositions-programmes.mjs
//   3. Vérification des URLs des programmes des candidats (404 / redirections)
//   4. Contrôle de cohérence : nouveaux candidats du code absents du contenu persisté
//
// Ce qui reste éditorial (pas d'API publique fiable) :
//   - statuts des candidatures (déclaré / officiel / conditionnel)
//   - positions sur les questions du quiz, prises de parole
//   → le script les SIGNALE dans le rapport, un humain les met à jour via le back-office.
//
// Sortie : exit 0 si tout est OK, exit 1 si au moins une étape échoue
// (cron enverra le rapport par e-mail si configuré).
// Option --commit : commite les fichiers régénérés s'ils ont changé (pour déployer via git pull).

import { writeFile, readFile, access } from 'node:fs/promises'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const jour = new Date().toISOString()

const rapport = {
  date: jour,
  scrutins: null,
  propositions: null,
  urlsProgrammes: [],
  candidatsAbsentsDuContenu: [],
  erreurs: [],
}
let echec = false

const section = (titre) => console.log(`\n=== ${titre} ===`)

// —— 1. Scrutins (Assemblée nationale) ——
section('Scrutins — Assemblée nationale')
try {
  const { mettreAJourScrutins } = await import(pathToFileURL(path.join(RACINE, 'server/scrutins.mjs')).href)
  const r = await mettreAJourScrutins()
  rapport.scrutins = { nb: r.scrutins, majLe: r.majLe, statut: 'ok' }
  console.log(`✅ ${r.scrutins} scrutins consolidés (dernière mise à jour : ${r.majLe})`)
} catch (e) {
  rapport.scrutins = { statut: 'erreur', message: e.message }
  rapport.erreurs.push(`scrutins: ${e.message}`)
  echec = true
  console.error('❌ Scrutins :', e.message)
}

// —— 2. Propositions des programmes officiels ——
section('Propositions — programmes officiels')
try {
  const avant = await readFile(path.join(RACINE, 'src/data/propositions-programmes.mjs'), 'utf8')
  const { execFileSync } = await import('node:child_process')
  const sortie = execFileSync(process.execPath, [path.join(RACINE, 'scripts/extraire-propositions.mjs')], { encoding: 'utf8' })
  console.log(sortie.trim())
  const apres = await readFile(path.join(RACINE, 'src/data/propositions-programmes.mjs'), 'utf8')
  rapport.propositions = { statut: 'ok', change: avant !== apres }
  console.log(avant !== apres ? '📝 Fichier propositions-programmes.mjs modifié' : '✔️ Aucun changement dans les propositions')
} catch (e) {
  rapport.propositions = { statut: 'erreur', message: e.message }
  rapport.erreurs.push(`propositions: ${e.message}`)
  echec = true
  console.error('❌ Propositions :', e.message)
}

// —— 3. Vérification des URLs des programmes des candidats ——
section('Vérification des URLs des programmes')
try {
  const { CANDIDATS } = await import(pathToFileURL(path.join(RACINE, 'src/data/programmes.mjs')).href)
  const { SOURCES_BASE } = await import(pathToFileURL(path.join(RACINE, 'src/data/positions-complements.mjs')).href)
  const urls = new Map()
  for (const c of CANDIDATS) {
    if (c.programme) urls.set(`${c.nom} (programme)`, c.programme)
    if (SOURCES_BASE[c.id]?.url) urls.set(`${c.nom} (source base)`, SOURCES_BASE[c.id].url)
  }
  for (const [label, url] of urls) {
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(20000),
        headers: { 'user-agent': 'Mozilla/5.0 Chrome/124.0' },
      })
      // Une redirection n'est signalée que si la destination diffère réellement
      // (www → apex ou slash final = bénin, domaine différent = programmes déplacé)
      const normaliser = (u) => {
        try {
          const o = new URL(u)
          return `${o.protocol}//${o.hostname.replace(/^www\./, '')}${o.pathname.replace(/\/$/, '')}`
        } catch { return u }
      }
      const ok = res.ok && (normaliser(res.url) === normaliser(url) || res.url === url)
      rapport.urlsProgrammes.push({ label, url, statut: res.status, ok, urlFinale: res.url })
      if (!ok) {
        console.warn(`⚠️  ${label} : HTTP ${res.status} → ${res.url} (programme déplacé ?)`)
      } else {
        console.log(`✅ ${label} : ${res.status}${res.url !== url ? ' (redirection bénigne)' : ''}`)
      }
    } catch (e) {
      rapport.urlsProgrammes.push({ label, url, statut: 'inaccessible', ok: false, erreur: e.message })
      console.warn(`⚠️  ${label} : inaccessible (${e.cause?.code ?? e.message})`)
    }
  }
  const urlsKO = rapport.urlsProgrammes.filter((u) => !u.ok)
  if (urlsKO.length > 0) {
    rapport.erreurs.push(`${urlsKO.length} URL(s) de programme en échec — vérifier si les programmes ont changé`)
    echec = true
  }
} catch (e) {
  rapport.erreurs.push(`urls: ${e.message}`)
  console.error('❌ Vérification des URLs :', e.message)
}

// —— 4. Cohérence : candidats du code absents du contenu persisté ——
section('Cohérence candidats / contenu')
try {
  const { CANDIDATS } = await import(pathToFileURL(path.join(RACINE, 'src/data/programmes.mjs')).href)
  const fichierContenu = path.join(RACINE, 'server/data/contenu.json')
  let idsContenu = new Set()
  try {
    await access(fichierContenu)
    const contenu = JSON.parse(await readFile(fichierContenu, 'utf8'))
    idsContenu = new Set((contenu.contenu?.candidats ?? contenu.candidats ?? []).map((c) => c.id))
  } catch {
    console.log('ℹ️ Pas de contenu.json local — contrôle de cohérence sauté (normal en dev)')
  }
  if (idsContenu.size > 0) {
    const absents = CANDIDATS.filter((c) => !idsContenu.has(c.id))
    rapport.candidatsAbsentsDuContenu = absents.map((c) => c.nom)
    if (absents.length > 0) {
      console.warn(`⚠️  ${absents.length} candidat(s) du code absents du contenu persisté : ${absents.map((c) => c.nom).join(', ')}`)
      console.warn('   → ils seront servis quand même (fusion automatique), mais leurs données back-office seront à compléter.')
    } else {
      console.log('✅ Tous les candidats du code sont présents dans le contenu persisté')
    }
  }
} catch (e) {
  rapport.erreurs.push(`cohérence: ${e.message}`)
  console.error('❌ Cohérence :', e.message)
}

// —— 5. Écriture du rapport ——
try {
  const dossierRapports = path.join(RACINE, 'server/data')
  await writeFile(path.join(dossierRapports, 'rapport-maj.json'), JSON.stringify(rapport, null, 2))
  console.log(`\n📄 Rapport : server/data/rapport-maj.json`)
} catch (e) {
  console.error('⚠️ Impossible d\'écrire le rapport :', e.message)
}

// —— 6. Option --commit : commiter les fichiers régénérés ——
if (process.argv.includes('--commit')) {
  section('Git (option --commit)')
  try {
    const modifie = execSync('git status --porcelain', { cwd: RACINE, encoding: 'utf8' })
    if (modifie.trim()) {
      execSync('git add server/data src/data/propositions-programmes.mjs', { cwd: RACINE })
      execSync(`git commit -m "chore(donnees): mise a jour quotidienne automatique (${jour.slice(0, 10)})"`, { cwd: RACINE })
      console.log('✅ Changements commités (faire `git push` pour déployer)')
    } else {
      console.log('✔️ Rien à commiter')
    }
  } catch (e) {
    console.error('⚠️ Git :', e.message)
  }
}

console.log(`\n${echec ? '❌' : '✅'} Mise à jour ${echec ? 'terminée avec des erreurs' : 'terminée sans erreur'}`)
process.exit(echec ? 1 : 0)
