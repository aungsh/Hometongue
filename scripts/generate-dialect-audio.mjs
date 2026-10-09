// Generates free offline audio with Microsoft Edge TTS (no API key needed).
//
//   npm run audio:dialect              Cantonese phrases + Coach lines that are missing
//   npm run audio:dialect -- --dry-run show what would be made (no network)
//   npm run audio:dialect -- --force   remake everything
//   npm run audio:dialect -- --only=cantonese   only phrase clips
//   npm run audio:dialect -- --only=coach       only coach clips
//
// Voices (override with --cantonese-voice= / --coach-voice= / --them-voice=):
//   Cantonese "you" lines  zh-HK-HiuMaanNeural (female, clear)
//   Cantonese "them" lines zh-HK-WanLungNeural (male, so dialogue feels real)
//   Coach (Auntie)         en-SG-LunaNeural (Singaporean female)
//
// Hokkien + Teochew are deliberately SKIPPED: there is no good TTS for them, and
// reading them with a Mandarin voice would teach the wrong sounds (see
// src/lib/audioSources.js). Record those with a native speaker:
//   npm run audio:sheet   (list of 108 lines with exact file names)
//
// Needs once:  pip install edge-tts
// Clips are ordinary mp3s in public/audio/, so the live app costs nothing to run.
// After generating, this script rebuilds src/data/audioManifest.json.
//
import { existsSync, mkdirSync } from 'node:fs'
import { readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { COACH_LINES } from '../src/data/coach.js'
import { DIALECTS } from '../src/data/catalog.js'
import { allMissions, getMission } from '../src/data/missions.js'
import { expectedPhraseKeys } from './lib/audio-manifest.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PHRASES_DIR = join(ROOT, 'public', 'audio', 'phrases')
const COACH_DIR = join(ROOT, 'public', 'audio', 'coach')

const EXTENSIONS = ['mp3', 'm4a', 'wav', 'ogg', 'webm']
const hasAny = (dir, base) => EXTENSIONS.some((ext) => existsSync(join(dir, `${base}.${ext}`)))

const args = process.argv.slice(2)
const flag = (name) => args.includes(`--${name}`)
const option = (name, fallback = null) => {
  const found = args.find((a) => a.startsWith(`--${name}=`))
  return found ? found.split('=').slice(1).join('=') : fallback
}

const only = option('only', null) // cantonese | coach | null
const force = flag('force')
const dryRun = flag('dry-run') || flag('check')

const YOU_VOICE = option('cantonese-voice', 'zh-HK-HiuMaanNeural')
const THEM_VOICE = option('them-voice', 'zh-HK-WanLungNeural')
const COACH_VOICE = option('coach-voice', 'en-SG-LunaNeural')

function edgeTtsAvailable() {
  const probe = spawnSync('python3', ['-m', 'edge_tts', '--help'], { stdio: 'ignore' })
  return probe.status === 0
}

function synthesize(text, voice, outFile) {
  mkdirSync(dirname(outFile), { recursive: true })
  const result = spawnSync(
    'python3',
    ['-m', 'edge_tts', '--voice', voice, '--text', text, '--write-media', outFile],
    { stdio: 'pipe', encoding: 'utf8' },
  )
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || '').trim().slice(0, 500)
    throw new Error(`edge-tts failed for ${outFile}${detail ? `: ${detail}` : ''}`)
  }
}

// ---- plan ----
const allKeys = expectedPhraseKeys(getMission, allMissions(), Object.keys(DIALECTS))
const cantoneseKeys = allKeys.filter((k) => k.dialect === 'cantonese')

const phraseJobs = cantoneseKeys
  .map((k) => {
    const base = `${k.missionId}-${k.line}`
    const outFile = join(PHRASES_DIR, 'cantonese', `${base}.mp3`)
    const exists = hasAny(join(PHRASES_DIR, 'cantonese'), base)
    // "them" lines get a different voice so the mini-dialogue has two speakers.
    const voice = k.from === 'them' ? THEM_VOICE : YOU_VOICE
    return { ...k, base, outFile, voice, text: k.zh, generate: force || !exists }
  })
  .filter((job) => !only || only === 'cantonese')

const coachJobs = Object.entries(COACH_LINES)
  .map(([id, text]) => ({
    id,
    text,
    outFile: join(COACH_DIR, `${id}.mp3`),
    voice: COACH_VOICE,
    generate: force || !existsSync(join(COACH_DIR, `${id}.mp3`)),
  }))
  .filter(() => !only || only === 'coach')

const todoPhrases = phraseJobs.filter((j) => j.generate)
const todoCoach = coachJobs.filter((j) => j.generate)

console.log(`Cantonese phrases: ${phraseJobs.length} total, ${todoPhrases.length} to make (${YOU_VOICE} for you, ${THEM_VOICE} for them)`)
console.log(`Coach lines:      ${coachJobs.length} total, ${todoCoach.length} to make (${COACH_VOICE})`)
console.log('Hokkien + Teochew: skipped (no TTS — record with a native speaker, see npm run audio:sheet)')

if (dryRun || (todoPhrases.length === 0 && todoCoach.length === 0)) {
  if (dryRun) {
    for (const j of todoPhrases) console.log(`  would make cantonese/${j.base}.mp3: ${j.text}`)
    for (const j of todoCoach) console.log(`  would make coach/${j.id}.mp3`)
  } else {
    console.log('\nEverything is up to date.')
  }
  process.exit(0)
}

if (!edgeTtsAvailable()) {
  console.error('\nedge-tts is not installed.')
  console.error('Install it once with:  pip install edge-tts')
  console.error('Then run this command again. (--dry-run needs no install)')
  process.exit(1)
}

let made = 0
const total = todoPhrases.length + todoCoach.length

for (const job of todoPhrases) {
  try {
    synthesize(job.text, job.voice, job.outFile)
    made += 1
    console.log(`  made cantonese/${job.base}.mp3 (${made}/${total})`)
  } catch (error) {
    console.error(`\n${job.base}: ${error.message}`)
    console.error('Check your network (Edge TTS needs internet), then run again — finished clips are kept.')
    break
  }
}

if (made === todoPhrases.length) {
  for (const job of todoCoach) {
    try {
      synthesize(job.text, job.voice, job.outFile)
      made += 1
      console.log(`  made coach/${job.id}.mp3 (${made}/${total})`)
    } catch (error) {
      console.error(`\n${job.id}: ${error.message}`)
      console.error('Check your network (Edge TTS needs internet), then run again — finished clips are kept.')
      break
    }
  }
}

console.log(`\nMade ${made} of ${total} clips.`)
spawnSync(process.execPath, [join(ROOT, 'scripts', 'build-audio-manifest.mjs')], { stdio: 'inherit' })
process.exit(made === total ? 0 : 1)
