// Scans public/audio and writes src/data/audioManifest.json, which tells the app which clips exist.
// Run automatically before `dev` and `build`; run it yourself after adding recordings:
//
//   npm run audio:manifest
//
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildManifest, expectedPhraseKeys } from './lib/audio-manifest.mjs'
import { DIALECTS } from '../src/data/catalog.js'
import { allMissions, getMission } from '../src/data/missions.js'
import { COACH_LINES } from '../src/data/coach.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const AUDIO = join(ROOT, 'public', 'audio')
const OUT = join(ROOT, 'src', 'data', 'audioManifest.json')

const list = (dir) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((file) => !file.startsWith('.') && statSync(join(dir, file)).isFile())
        .map((file) => ({ file, mtimeMs: statSync(join(dir, file)).mtimeMs }))
    : []

const found = {
  phrases: Object.keys(DIALECTS).flatMap((dialect) =>
    list(join(AUDIO, 'phrases', dialect)).map((entry) => ({ dialect, ...entry })),
  ),
  coach: list(join(AUDIO, 'coach')),
}
const manifest = buildManifest(found)

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, `${JSON.stringify(manifest, null, 2)}\n`)

if (!process.argv.includes('--quiet')) {
  const expected = expectedPhraseKeys(getMission, allMissions(), Object.keys(DIALECTS))
  console.log('Audio coverage')
  for (const dialect of Object.keys(DIALECTS)) {
    const all = expected.filter((e) => e.dialect === dialect)
    const have = all.filter((e) => manifest.phrases[e.key])
    console.log(`  ${DIALECTS[dialect].name.padEnd(10)} phrase clips ${have.length}/${all.length}`)
  }
  const coachIds = Object.keys(COACH_LINES)
  const coachHave = coachIds.filter((id) => manifest.coach[id])
  console.log(`  Coach voice    clips ${coachHave.length}/${coachIds.length}` + (coachHave.length === 0 ? '  (npm run audio:coach)' : ''))
  const strays = Object.keys(manifest.coach).filter((id) => !(id in COACH_LINES))
  if (strays.length) console.log(`  Unused coach clips (no matching line): ${strays.join(', ')}`)
}
