// Lists every phrase to record, with the exact file name to save each clip as.
// Hand the output to your native speakers:  npm run audio:sheet
import { DIALECTS, PEOPLE } from '../src/data/catalog.js'
import { allMissions, getMission } from '../src/data/missions.js'
import { expectedPhraseKeys } from './lib/audio-manifest.mjs'

const only = process.argv[2] // optional: a dialect id, e.g. "hokkien"
const rows = expectedPhraseKeys(getMission, allMissions(), Object.keys(DIALECTS)).filter(
  (row) => !only || row.dialect === only,
)

let heading = ''
for (const row of rows) {
  if (row.dialect !== heading) {
    heading = row.dialect
    console.log(`\n## ${DIALECTS[heading].name}  →  public/audio/phrases/${heading}/`)
  }
  const speaker = row.from === 'you' ? 'learner line' : 'other person'
  console.log(`\n${row.missionId}-${row.line}.mp3  (${speaker}, ${PEOPLE[row.person].name})`)
  console.log(`  Chinese: ${row.zh}`)
  console.log(`  Spelled: ${row.say}`)
  console.log(`  English: ${row.en}`)
}
console.log(`\n${rows.length} clips. Aim for one clean take each, at a relaxed natural pace, under 6 seconds.`)
