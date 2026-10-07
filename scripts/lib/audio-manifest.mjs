// Builds the list of audio files the app can play. Pure, so it can be tested.
//
// Native-speaker clips:  public/audio/phrases/<dialect>/<missionId>-<line>.<ext>   (line is 1, 2 or 3)
// Coach clips:           public/audio/coach/<lineId>.mp3

const EXTENSIONS = ['mp3', 'm4a', 'wav', 'ogg', 'webm']
const PHRASE_FILE = new RegExp(`^([a-z0-9-]+)-(\\d+)\\.(${EXTENSIONS.join('|')})$`)
const COACH_FILE = /^([a-z0-9-]+)\.mp3$/

/**
 * @param {{ phrases: { dialect: string, file: string, mtimeMs: number }[],
 *           coach: { file: string, mtimeMs: number }[] }} found
 * @returns {{ phrases: Record<string, string>, coach: Record<string, string> }}
 *   phrases are keyed "<dialect>/<missionId>-<line>", coach clips by line id. Values are URLs.
 */
export function buildManifest(found) {
  const version = (mtimeMs) => Math.floor(mtimeMs / 1000)
  const phrases = {}
  const coach = {}

  // Sort first so that when a line has clips in two formats, the result never depends on disk order.
  const sorted = [...found.phrases].sort((a, b) => a.file.localeCompare(b.file))
  for (const { dialect, file, mtimeMs } of sorted) {
    const match = PHRASE_FILE.exec(file)
    if (!match) continue
    const key = `${dialect}/${match[1]}-${match[2]}`
    // Earlier entries in EXTENSIONS win, so an mp3 beats a wav of the same line.
    const current = phrases[key]
    const rank = (url) => EXTENSIONS.indexOf(url.split('?')[0].split('.').pop())
    const url = `/audio/phrases/${dialect}/${file}?v=${version(mtimeMs)}`
    if (!current || rank(url) < rank(current)) phrases[key] = url
  }

  for (const { file, mtimeMs } of [...found.coach].sort((a, b) => a.file.localeCompare(b.file))) {
    const match = COACH_FILE.exec(file)
    if (match) coach[match[1]] = `/audio/coach/${file}?v=${version(mtimeMs)}`
  }

  return { phrases, coach }
}

/** Every phrase clip the app could play, as "<dialect>/<missionId>-<line>" keys with the text to record. */
export function expectedPhraseKeys(getMission, missions, dialects) {
  const keys = []
  for (const dialect of dialects) {
    for (const { person, id } of missions) {
      getMission(person, dialect, id).lines.forEach((line, i) => {
        keys.push({ key: `${dialect}/${id}-${i + 1}`, dialect, person, missionId: id, line: i + 1, ...line })
      })
    }
  }
  return keys
}
