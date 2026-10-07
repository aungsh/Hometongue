# Hometongue: dialect missions (clickable prototype)

A mobile-first React + Vite prototype for a Singapore Chinese dialect heritage project. It helps young
adults who *understand* Hokkien, Teochew or Cantonese start *using* it, through one low-pressure,
real-life conversation mission a day.

Everything is mock data and simulated interaction: no backend, accounts, APIs, microphone access or
voice processing. Progress is saved in the browser's localStorage only.

## Run it: `orch`

You only need [Node.js](https://nodejs.org) (20.19+ or 22.12+; the LTS version is fine).

**Easiest:** double-click **`orch.cmd`** in this folder (Windows). A menu opens:

```
 Hometongue · dialect missions
 ─────────────────────────────
 ○ Not running

   1  Start the app (opens your browser)
   2  Stop the app
   3  Open in browser
   4  Share on Wi-Fi (test on a phone)
   5  Set up / repair
   Q  Quit
```

Press **1** to start and **2** to stop. The first start installs everything it needs. If you quit while
the app is running, orch asks whether to stop it too. On Mac or Linux, run `sh orch.sh` for the same menu.

**From a terminal** in this folder (in PowerShell, type `.\orch` instead of `orch`):

```bash
orch start       # start the app in the background (--open: open your browser, --host: share on Wi-Fi)
orch stop        # stop it
orch status      # is it running, and where?
orch open        # open the running app in your browser
orch share       # restart it so phones on the same Wi-Fi can open it
orch setup       # check Node, install dependencies if needed, run the tests
```

The same commands work through npm (`npm start`, `npm stop`, `npm run status`, `npm run setup`,
`npm run orch` for the menu), or directly with `node scripts/orchestrator.mjs <command>`.

- Start moves to the next free port if 5173 is taken, and only reports "running" once the app actually
  answers. Starting twice just tells you where it already is.
- Stop only stops a process that is really serving this app. If the app has hung: `orch stop --force`.
- "Share on Wi-Fi": the phone must be on the same network. Windows may ask whether Node.js can use the
  network; allow private networks.
- The run record and the server log live in `.orchestrator/`. Check `server.log` if start-up fails.

For development with output in the terminal, the plain scripts still work:

```bash
npm run dev      # Vite in the foreground (Ctrl+C to stop)
npm test         # all tests (Vitest)
npm run build    # static build in dist/ (serve with `npm run preview` or any static host)
```

On a desktop browser the app shows as a phone-width column; use your browser's device toolbar for a
true phone viewport.

## The journey

1. **Onboarding**: choose a dialect, then who you want to speak with (Ah Ma & Ah Gong, hawker uncles &
   aunties, relatives, neighbours). Change either later from the chip on Today.
2. **Today / Daily Mission**: one everyday conversation challenge. Its four app tiles turn face up as
   you finish each one.
3. **Mission hub**: four separate apps to open **in any order**. The hub marks one "Up next" and seals
   finished ones with 完.
   - **学 Learn** (phrasebook): a three-line mini conversation with Chinese characters, a "say it like"
     spelling, English and placeholder audio, plus a culture note.
   - **练 Practise** (mic studio): tap the mic for a simulated 4-second take. Gentle simulated feedback can
     be switched off. Leaving without a take doesn't mark it done.
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

Plus **Weekly Quests** (computed from this week's activity) and **Friends & streaks** (mock friends,
Cheer/Nudge). Any reflection counts as a streak check-in, so honest "no opportunity" answers never
break a streak. "Forgot phrase" and "No opportunity" keep the mission open.

**Prototype controls** (bottom of Progress): *Load a sample week* fills the past six days so Progress,
Quests and Friends look lived-in; *Reset prototype* returns to onboarding.

## Content note

The phrases in `src/data/missions.js` are placeholders written for this demo. **They must be checked by
native speakers before any real use** (the Teochew most of all). The "say it like" spellings follow
common Singapore usage (e.g. *jiak ba buay*) and are not a formal romanisation. Audio buttons are
placeholders for native-speaker recordings.

## Code map

```
orch.cmd, orch.sh       launchers: menu with no arguments, or orch start / stop / status …
scripts/
  orchestrator.mjs      the orch commands and menu (no extra dependencies)
  lib/orchestration.mjs Node and install checks, ports, processes, browser (tested)
  lib/menu.mjs          menu text and key mapping (tested)
  lib/input.mjs         single key presses in a terminal, lines when piped (tested)
src/
  App.jsx               routes + onboarding guard
  router.js             tiny hash router (#/today, #/mission/learn, …)
  state/reducer.js      all state changes (tested)
  state/AppState.jsx    context, localStorage persistence, toasts
  lib/logic.js          streaks, weekly numbers, quests, mission steps (tested)
  lib/pixel.js          turns pixel-art grids into outlined SVG shapes (tested)
  data/                 dialects, people, quests, missions, friends, sample week, pixel sprites
  components/           Tile (mahjong), Pixel (sprites), Art (abstract art), Scene, AppScreen, …
  screens/              onboarding, Today, MissionHub, mission/ apps, Quests, Friends, Progress
  styles.css            design tokens (accent follows the dialect) and all styles
```

To add or edit a mission, change `src/data/missions.js`. Each person has one mission with `lines` and
`tips` for every dialect. Rename the app via `APP_NAME` in `src/data/catalog.js` and `<title>` in
`index.html`.
