import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'

const run = promisify(execFile)

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

export async function decompresser(zip, dossier) {
  await rm(dossier, { recursive: true, force: true })
  await mkdir(dossier, { recursive: true })
  await run('unzip', ['-q', '-o', zip, '-d', dossier], { maxBuffer: 64 << 20 })
}

export async function fichiersJson(dossier) {
  const { stdout } = await run('find', [dossier, '-name', '*.json', '-type', 'f'], { maxBuffer: 64 << 20 })
  return stdout.split('\n').filter(Boolean)
}

export const lireJson = async (f) => JSON.parse(await readFile(f, 'utf8'))

export const enTableau = (v) => (v == null ? [] : Array.isArray(v) ? v : [v])

export const entier = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
