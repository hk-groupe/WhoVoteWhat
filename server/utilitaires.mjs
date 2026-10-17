import { readdir, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { inflateRawSync } from 'node:zlib'
import path from 'node:path'

export async function telecharger(url, destination) {
  const reponse = await fetch(url, {
    headers: { 'User-Agent': 'WhoVoteWhat/1.0 (https://github.com/hk-groupe/WhoVoteWhat)' },
  })
  if (!reponse.ok) throw new Error(`Téléchargement échoué : ${reponse.status} ${url}`)
  const octets = Buffer.from(await reponse.arrayBuffer())
  if (octets.length < 1024) throw new Error(`Archive suspecte (${octets.length} octets) : ${url}`)
  await mkdir(path.dirname(destination), { recursive: true })
  await writeFile(destination, octets)
  return octets.length
}

// Décompression zip en pur Node (zlib natif) — aucun binaire système requis.
const SIGNATURE_EOCD = 0x06054b50
const SIGNATURE_CENTRALE = 0x02014b50

function parcourirEntreesCentrales(zip) {
  const fin = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]))
  if (fin < 0) throw new Error('Archive zip invalide : fin de répertoire central introuvable')
  const eocd = zip.subarray(fin, fin + 22)
  if (eocd.readUInt32LE(0) !== SIGNATURE_EOCD) throw new Error('Archive zip invalide')
  let nbEntrees = eocd.readUInt16LE(10)
  let offset = eocd.readUInt32LE(16)
  if (nbEntrees === 0xffff || offset === 0xffffffff) {
    throw new Error('Archive zip64 non prise en charge')
  }
  const entrees = []
  while (nbEntrees-- > 0) {
    if (zip.readUInt32LE(offset) !== SIGNATURE_CENTRALE) throw new Error('Archive zip invalide : entrée de répertoire')
    const nomLongueur = zip.readUInt16LE(offset + 28)
    const extraLongueur = zip.readUInt16LE(offset + 30)
    const commentaireLongueur = zip.readUInt16LE(offset + 32)
    const methode = zip.readUInt16LE(offset + 10)
    const tailleCompressee = zip.readUInt32LE(offset + 20)
    const tailleBrute = zip.readUInt32LE(offset + 24)
    const nom = zip.subarray(offset + 46, offset + 46 + nomLongueur).toString('utf8')
    const offsetLocal = zip.readUInt32LE(offset + 42)
    entrees.push({ nom, methode, tailleCompressee, tailleBrute, offsetLocal })
    offset += 46 + nomLongueur + extraLongueur + commentaireLongueur
  }
  return entrees
}

function extraireEntree(zip, entree) {
  if (zip.readUInt32LE(entree.offsetLocal) !== 0x04034b50) throw new Error('Archive zip invalide : en-tête local')
  const nomLongueur = zip.readUInt16LE(entree.offsetLocal + 26)
  const extraLongueur = zip.readUInt16LE(entree.offsetLocal + 28)
  const debut = entree.offsetLocal + 30 + nomLongueur + extraLongueur
  const brut = zip.subarray(debut, debut + entree.tailleCompressee)
  if (entree.methode === 0) return brut
  if (entree.methode === 8) return inflateRawSync(brut)
  throw new Error(`Méthode de compression zip non gérée : ${entree.methode}`)
}

export async function decompresser(zip, dossier) {
  await rm(dossier, { recursive: true, force: true })
  await mkdir(dossier, { recursive: true })
  const archive = await readFile(zip)
  let extraits = 0
  for (const entree of parcourirEntreesCentrales(archive)) {
    if (entree.nom.endsWith('/')) continue
    const cible = path.join(dossier, entree.nom.split('/').join(path.sep))
    if (!cible.startsWith(dossier)) throw new Error(`Chemin zip suspect : ${entree.nom}`)
    await mkdir(path.dirname(cible), { recursive: true })
    await writeFile(cible, extraireEntree(archive, entree))
    extraits++
  }
  if (extraits === 0) throw new Error('Archive zip vide ou illisible')
  return extraits
}

export async function fichiersJson(dossier) {
  const resultat = []
  const parcourir = async (courant) => {
    const entrees = await readdir(courant, { withFileTypes: true })
    for (const e of entrees) {
      const chemin = path.join(courant, e.name)
      if (e.isDirectory()) await parcourir(chemin)
      else if (e.isFile() && e.name.endsWith('.json')) resultat.push(chemin)
    }
  }
  await parcourir(dossier)
  return resultat.sort()
}

export const lireJson = async (f) => JSON.parse(await readFile(f, 'utf8'))

export const enTableau = (v) => (v == null ? [] : Array.isArray(v) ? v : [v])

export const entier = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
