# Hometongue 家乡话

A mobile-first Next.js (App Router) web app that helps young adults who *understand* Hokkien, Teochew
or Cantonese start *using* it, through one low-pressure, real-life conversation mission a day.

There are no accounts and no database. Progress is saved in the browser's localStorage (with a
backup file you can save and load). Recordings stay in memory on the device and are never uploaded.
The only thing that leaves the device is text you type for the AI coach (a check-in note or a question),
and only if you turn the AI coach on (see below).

## Run it

Node.js 20.19+ or 22.12+ ([nodejs.org](https://nodejs.org), the LTS version is fine).

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # all tests (Vitest)
npm run build        # production build
npm run serve        # run the production build (after npm run build)
```

The `orch` launcher still works (`orch.cmd` on Windows, `sh orch.sh` on Mac/Linux, or `orch start | stop |
status | open | share | setup`). It runs `next dev` in the background and logs to `.orchestrator/server.log`.

**The mic only works on https pages or `localhost`.** Opening the app from a phone over plain
`http://192.168…` (orch "share") works for everything except recording. Deploy to https to test the mic on a phone.

## Missions

Each person (Ah Ma & Ah Gong, hawker uncles & aunties, relatives, neighbours) has three missions in
`src/data/missions.js` and `src/data/missionsLibrary.js`, in every dialect. They run in order, one per day
you complete: finish today's with a real conversation and tomorrow brings the next. Forgetting or finding no
chance keeps the same mission open. After the third it starts again.

## Real audio

Three kinds of sound, from most to least important:

1. **Native-speaker phrase clips** (the dialect lines). There is no good Hokkien or Teochew text-to-speech,
   so these are recordings. Run `npm run audio:sheet` for the list of 108 lines (with the exact file name for
   each), record them, and drop the files in `public/audio/phrases/<dialect>/`, named
   `<mission>-<line>.mp3`, e.g. `public/audio/phrases/hokkien/ask-eaten-1.mp3`. Then `npm run audio:manifest`
   (or just restart `npm run dev`). mp3, m4a, wav, ogg and webm are accepted. Until a clip exists its speaker
   button is switched off. Cantonese lines fall back to the phone's own Cantonese voice if it has one.
   Free shortcut (no keys): `pip install edge-tts`, then `npm run audio:dialect` generates all 36 Cantonese
   clips (`zh-HK-HiuMaanNeural` for you, `zh-HK-WanLungNeural` for them) plus the coach lines below.
   Hokkien + Teochew are skipped on purpose — a Mandarin voice would teach the wrong sounds.
2. **Coach voice** (Auntie Coach, Singlish). Scripted lines live in `src/data/coach.js`;
   `npm run audio:coach` turns them into mp3s with an ElevenLabs voice, or `npm run audio:dialect`
   makes them free with `en-SG-LunaNeural`. Without clips she uses the phone's English voice.
3. **Your own recording** in Practise, played back from memory.

`npm run audio:manifest` prints how many clips of each kind exist.

## AI coach (optional, needs keys)

With a language-model key and an ElevenLabs key set on the server, Auntie Coach becomes live:

- after a check-in she reacts to what you actually wrote, in Singlish, out loud;
- on Learn, an "Ask Auntie" box answers questions about that mission.

She only knows the mission's own phrases and culture note, never invents dialect words, and treats what
you type as data, not instructions. Without keys none of this appears: the scripted coach is used and the
Ask box is hidden. See `src/app/api/coach/route.js`.

1. `cp .env.example .env.local`.
2. **Language model**: set `LLM_API_KEY` and `LLM_MODEL` (and `LLM_BASE_URL` if not OpenAI). Any
   OpenAI-compatible chat API works.
3. **Voice**: in ElevenLabs, pick or design a Singaporean-sounding voice, then set `ELEVENLABS_API_KEY` and
   `ELEVENLABS_VOICE_ID`. Shared Voice Library voices need a paid ElevenLabs plan to work through the API.
4. Restart `npm run dev`. On your host, add the same variables to its environment settings.

Keys only ever live on the server. There are no accounts, so the route limits each visitor (12 replies per
10 minutes) and the server copy (1,500 a day), accepts only the app's own pages, and never takes a prompt
from the browser. That slows abuse but can't stop it: **also set a monthly spending limit with your AI
provider and in ElevenLabs.**

To pre-record the scripted lines too (so they sound right offline): `npm run audio:coach -- --dry-run`, then
`npm run audio:coach`. Edited lines are regenerated automatically; `--force` remakes all.

## Deploying

Any Next.js host works; Vercel is the simplest (import the repo). Add the environment variables above if you
want the AI coach. Commit `public/audio/` so the clips ship with the app.

## The journey

1. **Onboarding**: choose a dialect, then who you want to speak with (Ah Ma & Ah Gong, hawker uncles &
   aunties, relatives, neighbours). Change either later from the chip on Today.
2. **Today / Daily Mission**: one everyday conversation challenge. Its four app tiles turn face up as
   you finish each one.
3. **Mission hub**: four separate apps to open **in any order**. The hub marks one "Up next" and seals
   finished ones with 完.
   - **学 Learn** (phrasebook): a three-line mini conversation with Chinese characters, a "say it like"
     spelling, English and audio, a coach intro and a culture note.
   - **练 Practise** (mic studio): record yourself (up to 10 s), play it back, compare with the native
     clip, then rate it Shiok / Can lah / Aiyo. The coach answers. Recordings never leave the device.
     Leaving without a take doesn't mark it done.
   - **讲 Challenge** (pocket card): the phrase to carry, low-pressure reminders and "when's your chance?".
   - **记 Reflect** (diary): Natural 顺 / Awkward 尬 / Forgot phrase 忘 / No opportunity 等, with an
     optional note, then a celebration screen.
4. **Progress**: real conversations (Natural + Awkward), a Listener → Dialect keeper ladder, this week's
   conversations as stacked tiles, outcome mix, people and recent check-ins.

## Look and feel

Modern retro, light theme only: paper-cream background, mahjong tiles with brush characters (ivory
faces, jade backs; face-down tiles mean "not yet"), red seal stamps, abstract landscape art (sun, hills,
cloud scrolls, coins), and hand-made pixel characters that walk, wave and jump. Fonts: Pixelify Sans
(labels, numbers), Plus Jakarta Sans (reading), Ma Shan Zheng (brush characters), all from Google Fonts
with system fallbacks. The accent colour follows the dialect: red for Hokkien, jade for Teochew,
porcelain blue for Cantonese.

Plus **Weekly Quests** (computed from this week's activity) and **Your streak** (Invite shares a link; there are no
fake friends). Any reflection counts as a streak check-in, so honest "no opportunity" answers never
break a streak. "Forgot phrase" and "No opportunity" keep the mission open.

**Testing tools** (bottom of Progress): *Load a sample week* (development builds only) fills the past six
days; *Reset everything* erases progress and returns to onboarding.

## Content note

The phrases in `src/data/missions.js` are drafts and **must be checked by native speakers before real use**
(the Teochew most of all). The "say it like" spellings follow common Singapore usage (e.g. *jiak ba buay*)
and are not a formal romanisation. There is no automatic pronunciation scoring: no speech recogniser
handles Singapore Hokkien or Teochew, so Practise is record, compare, and rate yourself.

## Code map

```
orch.cmd, orch.sh       launchers (menu with no arguments, or orch start / stop / status …)
scripts/
  orchestrator.mjs      the orch commands and menu
  build-audio-manifest.mjs  scans public/audio → src/data/audioManifest.json (runs before dev/build)
  generate-coach-audio.mjs  coach lines → mp3 with ElevenLabs
  generate-dialect-audio.mjs  Cantonese + coach clips, free via Edge TTS (no key)
  recording-sheet.mjs       the list of phrases to record
  lib/                  helpers (tested)
src/
  app/                  Next.js routes: layout, manifest (PWA), (app)/ one folder per screen, api/coach
  screens/              the screens themselves; mission/ holds Learn, Practise, Challenge, Reflect, Done
  components/           Tile, Pixel, Art, Scene, AppScreen, AudioButton, CoachSay, …
  state/                reducer (all state changes, tested) and the localStorage provider
  lib/                  logic (streaks, quests, daily mission), audio, mic recorder, backup, share;
                        server/ holds the AI coach's prompt, model call, speech and rate limit
  data/                 dialects, people, missions, coach lines, quests, sprites
  styles.css            design tokens (accent follows the dialect) and all styles
public/audio/           phrases/<dialect>/ and coach/ clips
```

To add or edit a mission, change `src/data/missions.js` (and record the new clips). To change what the coach
says, edit `src/data/coach.js` and run `npm run audio:coach`. Rename the app via `APP_NAME` in
`src/data/catalog.js` and the metadata in `src/app/layout.jsx`.
