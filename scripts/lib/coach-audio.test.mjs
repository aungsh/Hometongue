import { describe, expect, it } from 'vitest'
import { lineHash, planGeneration } from './coach-audio.mjs'
import { buildManifest, expectedPhraseKeys } from './audio-manifest.mjs'
import { COACH_CATEGORIES, COACH_LINES, pickCoachLine, todayCategory } from '../../src/data/coach.js'
import { coachSource, phraseSource, pickVoice } from '../../src/lib/audioSources.js'
import { DIALECTS } from '../../src/data/catalog.js'
import { allMissions, getMission } from '../../src/data/missions.js'

const settings = { voiceId: 'voice-a', model: undefined, speed: undefined }

describe('planGeneration', () => {
  const lines = { 'a-1': 'one', 'a-2': 'two', 'b-1': 'three' }
  const hashes = Object.fromEntries(Object.entries(lines).map(([id, text]) => [id, lineHash(text, settings)]))
  const base = { hasFile: () => true }
  const ids = (plan) => plan.filter((p) => p.generate).map((p) => p.id)

  it('skips lines that are already made with the same text and voice', () => {
    expect(ids(planGeneration(lines, hashes, settings, base))).toEqual([])
  })

  it('remakes a line whose text changed', () => {
    const lock = { ...hashes, 'a-2': lineHash('old text', settings) }
    expect(ids(planGeneration(lines, lock, settings, base))).toEqual(['a-2'])
  })

  it('remakes everything when the voice changes', () => {
    const other = { ...settings, voiceId: 'voice-b' }
    expect(ids(planGeneration(lines, hashes, other, base))).toHaveLength(3)
  })

  it('makes a line whose file was deleted', () => {
    expect(ids(planGeneration(lines, hashes, settings, { hasFile: (id) => id !== 'b-1' }))).toEqual(['b-1'])
  })

  it('honours --force and --only', () => {
    expect(ids(planGeneration(lines, hashes, settings, { ...base, force: true }))).toHaveLength(3)
    expect(ids(planGeneration(lines, hashes, settings, { ...base, force: true, only: 'a-' }))).toEqual(['a-1', 'a-2'])
  })
})

describe('buildManifest', () => {
  it('maps phrase files to keys and adds a cache-busting version', () => {
    const manifest = buildManifest({
      phrases: [{ dialect: 'hokkien', file: 'ask-eaten-1.mp3', mtimeMs: 5000 }],
      coach: [{ file: 'forgot-1.mp3', mtimeMs: 7000 }],
    })
    expect(manifest.phrases['hokkien/ask-eaten-1']).toBe('/audio/phrases/hokkien/ask-eaten-1.mp3?v=5')
    expect(manifest.coach['forgot-1']).toBe('/audio/coach/forgot-1.mp3?v=7')
  })

  it('ignores files that do not follow the naming convention', () => {
    const manifest = buildManifest({
      phrases: [
        { dialect: 'hokkien', file: 'Grandparents 1.mp3', mtimeMs: 1 },
        { dialect: 'hokkien', file: 'notes.txt', mtimeMs: 1 },
      ],
      coach: [{ file: 'readme.md', mtimeMs: 1 }],
    })
    expect(manifest).toEqual({ phrases: {}, coach: {} })
  })

  it('prefers mp3 when a line has clips in two formats, whatever order files come in', () => {
    const files = [
      { dialect: 'teochew', file: 'return-tray-2.wav', mtimeMs: 1000 },
      { dialect: 'teochew', file: 'return-tray-2.mp3', mtimeMs: 1000 },
    ]
    for (const phrases of [files, [...files].reverse()]) {
      expect(buildManifest({ phrases, coach: [] }).phrases['teochew/return-tray-2']).toContain('.mp3')
    }
  })
})

describe('expectedPhraseKeys', () => {
  const keys = expectedPhraseKeys(getMission, allMissions(), Object.keys(DIALECTS))

  it('covers every line of every mission in every dialect', () => {
    expect(keys).toHaveLength(3 * 12 * 3)
    expect(new Set(keys.map((k) => k.key)).size).toBe(keys.length)
  })

  it('uses 1-based line numbers', () => {
    expect(keys[0].key).toBe('hokkien/ask-eaten-1')
  })
})

describe('coach lines', () => {
  it('has lines for every category the app asks for', () => {
    for (const category of COACH_CATEGORIES) expect(() => pickCoachLine(category, 'x')).not.toThrow()
  })

  it('uses ids that are safe as file names', () => {
    for (const id of Object.keys(COACH_LINES)) expect(id).toMatch(/^[a-z0-9-]+$/)
  })

  it('gives the same line for the same seed, and only lines from that category', () => {
    expect(pickCoachLine('forgot', 'abc')).toEqual(pickCoachLine('forgot', 'abc'))
    expect(pickCoachLine('forgot', 'abc').id).toMatch(/^forgot-\d+$/)
    expect(pickCoachLine('streak', 'abc').id).toMatch(/^streak-\d+$/) // not streak-high-*
  })

  it('chooses what to say on Today', () => {
    expect(todayCategory({ missionDone: true, streak: 9 })).toBe('rest')
    expect(todayCategory({ missionDone: false, streak: 0 })).toBe('start')
    expect(todayCategory({ missionDone: false, streak: 2 })).toBe('streak')
    expect(todayCategory({ missionDone: false, streak: 3 })).toBe('streak-high')
  })
})

describe('audio sources', () => {
  const manifest = { phrases: { 'hokkien/order-kopi-1': '/audio/phrases/hokkien/order-kopi-1.mp3?v=1' }, coach: {} }

  it('uses the recorded clip when there is one', () => {
    expect(phraseSource('hokkien', 'order-kopi', 0, 'x', manifest).src).toBe('/audio/phrases/hokkien/order-kopi-1.mp3?v=1')
  })

  it('never falls back to a phone voice for Hokkien or Teochew', () => {
    expect(phraseSource('hokkien', 'order-kopi', 1, 'x', manifest)).toEqual({ src: null, speech: null })
    expect(phraseSource('teochew', 'order-kopi', 0, 'x', manifest).speech).toBeNull()
  })

  it('lets Cantonese fall back to a Cantonese phone voice', () => {
    expect(phraseSource('cantonese', 'order-kopi', 0, '食咗饭未呀', manifest).speech.langs).toContain('zh-HK')
  })

  it('gives the coach a phone-voice fallback, preferring Singapore English', () => {
    const source = coachSource('forgot-1', 'Aiyo', manifest)
    expect(source.src).toBeNull()
    expect(source.speech.langs[0]).toBe('en-SG')
  })

  it('picks the first voice that matches, in priority order', () => {
    const voices = [{ lang: 'en_GB' }, { lang: 'en-US' }, { lang: 'zh-HK' }]
    expect(pickVoice(voices, ['en-SG', 'en-GB', 'en-US'])).toBe(voices[0])
    expect(pickVoice(voices, ['yue-HK', 'zh-HK'])).toBe(voices[2])
    expect(pickVoice(voices, ['ja-JP'])).toBeNull()
  })
})
