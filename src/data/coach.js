// The coach: a kopitiam-auntie persona who teaches, teases and cheers in Singlish.
//
// Every line is written out here (nothing is generated at runtime), so you control exactly
// what she says. Keep the teasing affectionate. She scolds the *situation*, never shames the
// learner for how they speak.
//
// Audio: `npm run audio:coach` turns each line into public/audio/coach/<id>.mp3.
// Until then (or if the clip is missing) the app falls back to the phone's own voice.

export const COACH_NAME = 'Auntie Coach'

// Ids are "<category>-<n>" and double as file names, so use only a-z, 0-9 and "-".
export const COACH_LINES = {
  'learn-1': 'Okay, listen properly ah. Hear first, then say out loud. Don’t shy, nobody judging you.',
  'learn-2': 'Today’s phrase very easy one. Play it, then copy my mouth. Ready or not?',
  'learn-3': 'Aiyo, understand only cannot. Must speak also! Come, we start small small.',

  'shiok-1': 'Wah, not bad leh! Your Ah Ma will be so proud. Steady lah.',
  'shiok-2': 'Shiok! That one sounds real. Now go say it to a real person, don’t waste.',
  'shiok-3': 'Can can can! See, you got it. I never doubt you one.',

  'canlah-1': 'Can lah, not bad. One more time, then it’ll be even smoother.',
  'canlah-2': 'Okay okay, halfway there. Listen to the real one again, then try again.',
  'canlah-3': 'Not bad, not bad. Slow down a bit and don’t swallow the words.',

  'aiyo-1': 'Aiyo, never mind lah. Listen again, then try again. Everybody starts like this.',
  'aiyo-2': 'Hmm, like that ah? Never mind, we go again. I got all day.',
  'aiyo-3': 'Don’t give up hor. Play the real one first, copy slowly, then try again.',

  'natural-1': 'Wah, you really talked to them! I’m so proud of you, you know or not?',
  'natural-2': 'Steady lah! That’s how it starts. Tomorrow do again, don’t chiong then stop.',
  'natural-3': 'Shiok! Real conversation, not just practice. Go tell your family.',

  'awkward-1': 'Awkward only, so what? At least you opened your mouth. Better than nothing.',
  'awkward-2': 'Eh, everybody also awkward the first time. You tried, that’s what counts.',
  'awkward-3': 'Aiyo, a bit shy never mind. Next time will be smoother, trust me.',

  'forgot-1': 'Aiyo! Blank again? Must look at the pocket card before you go, hor.',
  'forgot-2': 'Forgot already? Tsk tsk. Never mind, take a peek at the card and try again.',
  'forgot-3': 'You this one, really. Okay lah, I not angry. But practise once more before you go!',

  'nochance-1': 'No chance? Then make one lah! Call Ah Ma also can, not so hard.',
  'nochance-2': 'Okay, the mission still here. Don’t wait too long, later you forget again.',
  'nochance-3': 'Never mind, we wait. But you must try one time, hor? Promise?',

  'start-1': 'Eh, how come you never come? Come, one small conversation only, can?',
  'start-2': 'Streak not started yet leh. Today a good day, you think so?',
  'start-3': 'Still here ah? Good. Today we start fresh. Open the mission, go go go.',

  'streak-1': 'Nice, you got a streak going. Don’t break it hor, I watching you.',
  'streak-2': 'Day by day lah. Keep going, don’t let the streak die.',

  'streak-high-1': 'Wah, streak so long already! You really serious ah. Steady!',
  'streak-high-2': 'You so kiasu for dialect, I like. Keep it up, don’t slack.',
  'streak-high-3': 'Not bad, not bad. Your Ah Ma will be shocked when you talk to her.',

  'rest-1': 'Today’s mission done already. Go rest, come back tomorrow.',
  'rest-2': 'Good job today. Tomorrow a new one, don’t forget to come.',
}

/** Categories a screen can ask for. Each is a prefix of the line ids above. */
export const COACH_CATEGORIES = [
  'learn',
  'shiok',
  'canlah',
  'aiyo',
  'natural',
  'awkward',
  'forgot',
  'nochance',
  'start',
  'streak',
  'streak-high',
  'rest',
]

const idsFor = (category) =>
  Object.keys(COACH_LINES).filter((id) => id.startsWith(`${category}-`) && /^\d+$/.test(id.slice(category.length + 1)))

// A small, stable hash so the same screen shows the same line until something changes.
function hash(text) {
  let h = 0
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) >>> 0
  return h
}

/** Picks a line for a category. The same seed always gives the same line. */
export function pickCoachLine(category, seed = '') {
  const ids = idsFor(category)
  if (ids.length === 0) throw new Error(`No coach lines for category "${category}"`)
  const id = ids[hash(`${category}:${seed}`) % ids.length]
  return { id, text: COACH_LINES[id] }
}

/** The coach's category for a self-rating after a practice take. */
export const RATING_CATEGORY = { shiok: 'shiok', canlah: 'canlah', aiyo: 'aiyo' }

/** The coach's category for how a real-life check-in went. */
export const OUTCOME_CATEGORY = {
  natural: 'natural',
  awkward: 'awkward',
  forgot: 'forgot',
  'no-chance': 'nochance',
}

/** What the coach says on the Today screen. */
export function todayCategory({ missionDone, streak }) {
  if (missionDone) return 'rest'
  if (streak === 0) return 'start'
  return streak >= 3 ? 'streak-high' : 'streak'
}
