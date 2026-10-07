// Turns the coach's lines (src/data/coach.js) into audio files with ElevenLabs.
//
//   npm run audio:coach                  make clips for new or edited lines
//   npm run audio:coach -- --dry-run     show what would be made (no key needed)
//   npm run audio:coach -- --force       remake everything
//   npm run audio:coach -- --only=forgot make only lines whose id starts with "forgot"
//
// Needs ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID in .env.local (see .env.example).
// This runs on your computer, once. The clips are ordinary files in public/audio/coach/,
// so the live app makes no speech calls and costs nothing to run.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { COACH_LINES } from '../src/data/coach.js'
import { planGeneration } from './lib/coach-audio.mjs'
import { speechConfig, synthesize } from '../src/lib/server/elevenLabs.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'public', 'audio', 'coach')
const LOCK_FILE = join(ROOT, 'scripts', 'coach-audio.lock.json')

/** Reads KEY=value lines from .env.local without overriding variables already set. */
function loadEnvFile(file) {
  if (!existsSync(file)) return
  for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(raw)
    if (!match || raw.trim().startsWith('#')) continue
    const value = match[2].replace(/^(['"])(.*)\1$/, '$2')
    if (process.env[match[1]] === undefined) process.env[match[1]] = value
  }
}
loadEnvFile(join(ROOT, '.env.local'))

const args = process.argv.slice(2)
const flag = (name) => args.includes(`--${name}`)
const option = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? null

const settings = speechConfig() ?? { voiceId: '(not set)' }
const dryRun = flag('dry-run')

const lock = existsSync(LOCK_FILE) ? JSON.parse(readFileSync(LOCK_FILE, 'utf8')) : {}
const plan = planGeneration(COACH_LINES, lock, settings, {
  hasFile: (id) => existsSync(join(OUT_DIR, `${id}.mp3`)),
  force: flag('force'),
  only: option('only'),
})
const todo = plan.filter((p) => p.generate)

console.log(`Voice id: ${settings.voiceId}${settings.model ? `, model: ${settings.model}` : ''}`)
console.log(`${plan.length} lines, ${todo.length} to make, ${plan.length - todo.length} already up to date.`)

if (dryRun || todo.length === 0) {
  if (dryRun) for (const { id, text } of todo) console.log(`  would make ${id}: ${text}`)
  process.exit(0)
}

if (!speechConfig()) {
  console.error('\nMissing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID.')
  console.error('Copy .env.example to .env.local and fill them in (see the README, "Coach voice").')
  process.exit(1)
}

mkdirSync(OUT_DIR, { recursive: true })
let made = 0

for (const { id, text, hash } of todo) {
  try {
    const mp3 = await synthesize(text, settings)
    writeFileSync(join(OUT_DIR, `${id}.mp3`), mp3)
  } catch (error) {
    console.error(`\n${id}: ${error.message}. ${error.detail ?? ''}`)
    if (error.status === 401) console.error('Check ELEVENLABS_API_KEY in .env.local.')
    if (error.status === 402 || error.status === 403) {
      console.error('This usually means your plan can’t use this voice through the API (library voices need a paid plan).')
    }
    if (error.status === 404 || error.status === 422) console.error(`Check that ELEVENLABS_VOICE_ID "${settings.voiceId}" is right.`)
    break // stop on the first failure; finished lines are kept and the next run resumes
  }
  lock[id] = hash
  made += 1
  console.log(`  made ${id}`)
  writeFileSync(LOCK_FILE, `${JSON.stringify(lock, null, 2)}\n`)
}

console.log(`\nMade ${made} of ${todo.length} clips.`)
spawnSync(process.execPath, [join(ROOT, 'scripts', 'build-audio-manifest.mjs')], { stdio: 'inherit' })
process.exit(made === todo.length ? 0 : 1)
