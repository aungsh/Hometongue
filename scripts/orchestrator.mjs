#!/usr/bin/env node
// `orch`: start and stop the prototype from one place. Most people use it through the
// launchers (double-click orch.cmd on Windows, or `sh orch.sh`), which open a simple menu.
//   (no command)  key-press menu
//   start         launch the dev server in the background and wait until it answers
//   stop (end)    shut the server down and clean up
//   status        report whether it is running and where
//   open          open the running app in the browser
//   share         restart it so phones on the same Wi-Fi can open it
//   setup (init)  check Node, install dependencies when needed, run the tests
// The run record and server log live in .orchestrator/ (git-ignored).

import { spawn, spawnSync } from 'node:child_process'
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readFileSync, statSync } from 'node:fs'
import { networkInterfaces } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  browserCommand,
  checkNode,
  clearState,
  findFreePort,
  isAlive,
  isOurServer,
  lanUrls,
  lastLines,
  needsInstall,
  readState,
  waitFor,
  writeState,
} from './lib/orchestration.mjs'
import { MENU, menuChoice, renderMenu } from './lib/menu.mjs'
import { CTRL_C, createInput } from './lib/input.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const RUN_DIR = join(ROOT, '.orchestrator')
const STATE_FILE = join(RUN_DIR, 'state.json')
const LOG_FILE = join(RUN_DIR, 'server.log')
const VITE_BIN = join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js')
const VITEST_BIN = join(ROOT, 'node_modules', 'vitest', 'vitest.mjs')
const PAGE_MARKER = '<title>Hometongue</title>'
const FIRST_PORT = 5173
const START_TIMEOUT_MS = 30_000
const STOP_TIMEOUT_MS = 5_000

const say = (message) => console.log(`[hometongue] ${message}`)

// Inside the menu, "run orch stop" style hints are noise: the menu has those options.
let inMenu = false
const hint = (message) => {
  if (!inMenu) say(message)
}

const mtime = (file) => (existsSync(file) ? statSync(file).mtimeMs : undefined)

function dependenciesNeedInstall() {
  return needsInstall({
    hasNodeModules: existsSync(join(ROOT, 'node_modules')),
    lockMtimeMs: mtime(join(ROOT, 'package-lock.json')),
    installedMtimeMs: mtime(join(ROOT, 'node_modules', '.package-lock.json')),
  })
}

/** Runs npm, reusing the npm that launched this script when there is one. */
function runNpm(args) {
  const npmCli = process.env.npm_execpath
  const result = npmCli?.endsWith('.js')
    ? spawnSync(process.execPath, [npmCli, ...args], { cwd: ROOT, stdio: 'inherit' })
    : spawnSync('npm', args, { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' })
  return result.status === 0
}

/** The server from the run record, but only if it is alive and really serving this app. */
async function runningServer() {
  const state = readState(STATE_FILE)
  if (state && isAlive(state.pid) && (await isOurServer(state.url, PAGE_MARKER))) return state
  return null
}

function printAddresses(state) {
  say(`Address: ${state.url}`)
  if (!state.host) return
  for (const url of lanUrls(state.port, networkInterfaces())) say(`On a phone on the same Wi-Fi: ${url}`)
}

/** Opens the default browser. BROWSER=none (the usual convention) only prints the address. */
function openInBrowser(url) {
  if (process.env.BROWSER === 'none') {
    say(`Open ${url} in your browser.`)
    return
  }
  const { command, args, options } = browserCommand(process.platform, url)
  const child = spawn(command, args, { ...options, stdio: 'ignore', detached: true, windowsHide: true })
  child.on('error', () => say(`Couldn't open a browser. Go to ${url}`))
  child.unref()
  say(`Opening ${url} in your browser…`)
}

function killTree(pid, force) {
  if (process.platform === 'win32') {
    // /T takes the whole process tree; /F is needed for processes without a window.
    spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' })
    return
  }
  // Started detached, the server leads its own process group, so signal the whole group.
  const signal = force ? 'SIGKILL' : 'SIGTERM'
  try {
    process.kill(-pid, signal)
  } catch {
    try {
      process.kill(pid, signal)
    } catch {
      // Already gone.
    }
  }
}

/** Node check plus dependency install when needed. Shared by setup and start. */
async function prepare() {
  const node = checkNode(process.version)
  say(node.message)
  if (!node.ok) return false

  if (!dependenciesNeedInstall()) {
    say('Dependencies are up to date.')
    return true
  }
  if (await runningServer()) {
    say('The app is running, so dependencies cannot be reinstalled. Stop it first.')
    return false
  }
  const useCi = existsSync(join(ROOT, 'package-lock.json'))
  say(useCi ? 'Installing dependencies from package-lock.json (npm ci)…' : 'Installing dependencies (npm install)…')
  if (runNpm([useCi ? 'ci' : 'install'])) return true
  say('Installing dependencies failed. See the npm output above.')
  return false
}

async function setup({ runTests }) {
  if (!(await prepare())) return false
  if (runTests) {
    say('Running the tests…')
    const tests = spawnSync(process.execPath, [VITEST_BIN, 'run'], { cwd: ROOT, stdio: 'inherit' })
    if (tests.status !== 0) {
      say('Tests failed. Fix them before starting the app.')
      return false
    }
  }
  say('Set up and ready.')
  hint('Start the app with: orch start')
  return true
}

async function start({ open, host }) {
  const running = await runningServer()
  if (running) {
    say(`Already running (pid ${running.pid}).`)
    printAddresses(running)
    if (open) openInBrowser(running.url)
    return true
  }
  if (!(await prepare())) return false

  const port = await findFreePort(FIRST_PORT)
  if (port !== FIRST_PORT) say(`Port ${FIRST_PORT} is busy, so using ${port}.`)

  mkdirSync(RUN_DIR, { recursive: true })
  appendFileSync(LOG_FILE, `\n=== ${new Date().toISOString()} starting on port ${port} ===\n`)
  const logFd = openSync(LOG_FILE, 'a')
  const args = [VITE_BIN, '--port', String(port), '--strictPort']
  if (host) args.push('--host')
  const server = spawn(process.execPath, args, {
    cwd: ROOT,
    // Plain text in the log file: Vite colours its output on Windows even when it isn't a terminal.
    env: { ...process.env, NO_COLOR: '1' },
    detached: true,
    stdio: ['ignore', logFd, logFd],
    windowsHide: true,
  })
  server.unref()
  closeSync(logFd)

  const state = { pid: server.pid, port, url: `http://localhost:${port}/`, host, startedAt: new Date().toISOString() }
  writeState(STATE_FILE, state)
  say(`Starting the app (pid ${server.pid})…`)

  await waitFor(async () => !isAlive(server.pid) || (await isOurServer(state.url, PAGE_MARKER)), {
    timeoutMs: START_TIMEOUT_MS,
    intervalMs: 300,
  })
  if (isAlive(server.pid) && (await isOurServer(state.url, PAGE_MARKER))) {
    say('Hometongue is running.')
    printAddresses(state)
    if (open) openInBrowser(state.url)
    hint('Stop it with: orch stop')
    return true
  }

  const reason = isAlive(server.pid) ? `didn't answer within ${START_TIMEOUT_MS / 1000}s` : 'exited while starting'
  say(`The app ${reason}. Last lines of .orchestrator/server.log:`)
  for (const line of lastLines(readFileSync(LOG_FILE, 'utf8'), 15)) console.log(`  ${line}`)
  killTree(server.pid, true)
  clearState(STATE_FILE)
  return false
}

async function stop({ force }) {
  const state = readState(STATE_FILE)
  if (!state || !isAlive(state.pid)) {
    clearState(STATE_FILE)
    say('Not running.')
    return true
  }
  if (!force && !(await isOurServer(state.url, PAGE_MARKER))) {
    say(`Process ${state.pid} is running but isn't serving Hometongue at ${state.url}, so it was left alone.`)
    say('If you are sure it is the app (for example, it has hung), run: orch stop --force')
    return false
  }

  killTree(state.pid, false)
  let stopped = await waitFor(() => !isAlive(state.pid), { timeoutMs: STOP_TIMEOUT_MS, intervalMs: 100 })
  if (!stopped) {
    killTree(state.pid, true)
    stopped = await waitFor(() => !isAlive(state.pid), { timeoutMs: STOP_TIMEOUT_MS, intervalMs: 100 })
  }
  if (!stopped) {
    say(`Couldn't stop process ${state.pid}.`)
    return false
  }
  clearState(STATE_FILE)
  say('Stopped.')
  return true
}

async function status() {
  const running = await runningServer()
  if (!running) {
    say('Not running.')
    hint('Start it with: orch start')
    return true
  }
  say(`Running since ${new Date(running.startedAt).toLocaleString()} (pid ${running.pid}).`)
  printAddresses(running)
  return true
}

async function openApp() {
  const running = await runningServer()
  if (!running) {
    say('The app is not running yet. Start it first.')
    return false
  }
  openInBrowser(running.url)
  return true
}

/** Makes the app reachable from phones on the same Wi-Fi, restarting it if needed. */
async function share() {
  const running = await runningServer()
  if (running?.host) {
    printAddresses(running)
    return true
  }
  if (running) {
    say('Restarting so phones on your Wi-Fi can open it…')
    if (!(await stop({ force: false }))) return false
  }
  if (!(await start({ open: false, host: true }))) return false
  say('The phone must be on the same Wi-Fi as this computer.')
  if (process.platform === 'win32') say('If Windows asks whether Node.js may use the network, allow private networks.')
  return true
}

const STYLE = (() => {
  const color = process.stdout.isTTY && !('NO_COLOR' in process.env)
  const paint = (code) => (text) => (color ? `\x1b[${code}m${text}\x1b[0m` : text)
  return { bold: paint('1'), dim: paint('2'), green: paint('32') }
})()

const MENU_ACTIONS = {
  start: () => start({ open: true, host: false }),
  stop: () => stop({ force: false }),
  open: () => openApp(),
  share: () => share(),
  setup: () => setup({ runTests: true }),
}

async function quit(input) {
  if (!(await runningServer())) {
    say('Bye!')
    return
  }
  process.stdout.write(' Hometongue is still running. Stop it as well? (y/N) ')
  const answer = (await input.key()).toLowerCase()
  console.log(answer === 'y' ? 'yes' : 'no')
  if (answer === 'y') await stop({ force: false })
  else say('It keeps running in the background. Run orch again to stop it.')
}

async function menu() {
  inMenu = true
  const input = createInput(process.stdin)
  try {
    for (;;) {
      const running = await runningServer()
      if (process.stdout.isTTY) console.clear()
      const phones = running?.host ? lanUrls(running.port, networkInterfaces()) : []
      process.stdout.write(renderMenu({ running: Boolean(running), url: running?.url, lanUrls: phones }, STYLE))

      const key = await input.key()
      if (key === CTRL_C) return true
      const action = menuChoice(key)
      if (!action) continue
      console.log(`${key.toUpperCase()}\n\n ${MENU.find((item) => item.action === action).label}\n`)
      if (action === 'quit') {
        await quit(input)
        return true
      }

      await MENU_ACTIONS[action]()
      process.stdout.write('\n Press any key to go back to the menu… ')
      if ((await input.key()) === CTRL_C) return true
    }
  } finally {
    input.close()
  }
}

const USAGE = `Hometongue launcher

  orch            open the menu (or just double-click orch.cmd)
  orch start      start the app in the background
                    --open   also open it in your browser
                    --host   also serve it on your Wi-Fi, for phones
  orch stop       stop the app
                    --force  stop the recorded process even if it doesn't look like the app
  orch status     is it running, and where?
  orch open       open the running app in your browser
  orch share      restart it so phones on the same Wi-Fi can open it
  orch setup      check Node, install dependencies if needed, run the tests
                    --skip-tests

Windows: run these in the project folder (in PowerShell type .\\orch start).
Mac/Linux: sh orch.sh start. The npm scripts work too: npm start, npm stop.`

const COMMANDS = {
  menu: { options: [], run: () => menu() },
  start: { options: ['--open', '--host'], run: (f) => start({ open: f.has('--open'), host: f.has('--host') }) },
  stop: { options: ['--force'], run: (f) => stop({ force: f.has('--force') }) },
  status: { options: [], run: () => status() },
  open: { options: [], run: () => openApp() },
  share: { options: [], run: () => share() },
  setup: { options: ['--skip-tests'], run: (f) => setup({ runTests: !f.has('--skip-tests') }) },
}
// Lifecycle names work too: init = setup, end = stop.
COMMANDS.init = COMMANDS.setup
COMMANDS.end = COMMANDS.stop

const [name = 'menu', ...flags] = process.argv.slice(2)
const command = COMMANDS[name]
const unknown = command ? flags.filter((flag) => !command.options.includes(flag)) : []

if (['help', '--help', '-h'].includes(name)) {
  console.log(USAGE)
} else if (!command || unknown.length) {
  say(command ? `Unknown option for ${name}: ${unknown.join(' ')}` : `Unknown command: ${name}`)
  console.log(USAGE)
  process.exitCode = 1
} else {
  try {
    process.exitCode = (await command.run(new Set(flags))) ? 0 : 1
  } catch (error) {
    say(error.message)
    process.exitCode = 1
  }
}
