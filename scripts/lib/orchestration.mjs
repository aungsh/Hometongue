// Helpers for scripts/orchestrator.mjs: environment checks, ports, processes and run state.
import { connect } from 'node:net'
import { get } from 'node:http'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

/** Vite 8 supports Node ^20.19.0 || >=22.12.0. */
export function checkNode(version) {
  const [major, minor] = version.replace(/^v/, '').split('.').map(Number)
  const ok = (major === 20 && minor >= 19) || (major === 22 && minor >= 12) || major > 22
  return {
    ok,
    message: ok
      ? `Node ${version} is supported.`
      : `Node ${version} isn't supported by Vite 8. Install Node 20.19+ or 22.12+ and try again.`,
  }
}

// npm records each install in node_modules/.package-lock.json a few milliseconds after it
// writes package-lock.json, so allow a moment of slack before calling the lockfile newer.
const SAME_INSTALL_MS = 1000

/** Whether dependencies need (re)installing, from what's on disk. */
export function needsInstall({ hasNodeModules, lockMtimeMs, installedMtimeMs }) {
  if (!hasNodeModules || installedMtimeMs === undefined) return true
  if (lockMtimeMs === undefined) return false
  return lockMtimeMs > installedMtimeMs + SAME_INSTALL_MS
}

/** True when something accepts connections on host:port. */
export function isPortInUse(port, host = 'localhost') {
  return new Promise((resolve) => {
    const socket = connect({ port, host })
    const finish = (inUse) => {
      socket.destroy()
      resolve(inUse)
    }
    socket.once('connect', () => finish(true))
    socket.once('error', () => finish(false))
    socket.setTimeout(1000, () => finish(false))
  })
}

/** The first port from `start` that nothing is listening on. */
export async function findFreePort(start, attempts = 20) {
  for (let port = start; port < start + attempts; port += 1) {
    if (!(await isPortInUse(port))) return port
  }
  throw new Error(`No free port between ${start} and ${start + attempts - 1}`)
}

/** Whether a process with this id exists (EPERM means it exists but belongs to someone else). */
export function isAlive(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return error.code === 'EPERM'
  }
}

// Hyper-V/WSL, Docker and VM adapters, which a phone on the Wi-Fi can't reach.
const VIRTUAL_ADAPTER = /^(vEthernet|VirtualBox|VMware|vboxnet|docker|br-|veth|virbr)/i

/** Addresses other devices on the same network can use, from os.networkInterfaces(). */
export function lanUrls(port, interfaces) {
  const external = Object.entries(interfaces).flatMap(([name, addresses]) =>
    addresses
      .filter((a) => (a.family === 'IPv4' || a.family === 4) && !a.internal)
      .map((a) => ({ name, url: `http://${a.address}:${port}/` })),
  )
  const physical = external.filter((a) => !VIRTUAL_ADAPTER.test(a.name))
  return (physical.length ? physical : external).map((a) => a.url)
}

export function lastLines(text, count) {
  return text.replace(/(\r?\n)+$/, '').split(/\r?\n/).slice(-count)
}

/** The saved run record, or null when missing, unreadable or incomplete. */
export function readState(file) {
  try {
    const state = JSON.parse(readFileSync(file, 'utf8'))
    return state && Number.isInteger(state.pid) && typeof state.url === 'string' ? state : null
  } catch {
    return null
  }
}

export function writeState(file, state) {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`)
}

export function clearState(file) {
  rmSync(file, { force: true })
}

/** Polls `check` until it returns true (→ true) or time runs out (→ false). */
export async function waitFor(check, { timeoutMs, intervalMs }) {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    if (await check()) return true
    if (Date.now() >= deadline) return false
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
}

/**
 * True when `url` serves a page containing `marker`. Used before stopping anything,
 * so a recycled process id or another app on the port is never touched.
 */
export function isOurServer(url, marker, timeoutMs = 2000) {
  return new Promise((resolve) => {
    const request = get(url, { agent: false, timeout: timeoutMs }, (response) => {
      let body = ''
      response.setEncoding('utf8')
      response.on('data', (chunk) => {
        body += chunk
        if (body.length > 100_000) response.destroy()
      })
      response.on('end', () => resolve(body.includes(marker)))
      response.on('close', () => resolve(body.includes(marker)))
    })
    request.on('timeout', () => request.destroy())
    request.on('error', () => resolve(false))
  })
}

/** How to open `url` in the default browser on each platform. */
export function browserCommand(platform, url) {
  if (platform === 'win32') {
    // `start` treats its first quoted argument as a window title, hence the empty "".
    return { command: 'cmd', args: ['/d', '/c', `start "" "${url}"`], options: { windowsVerbatimArguments: true } }
  }
  if (platform === 'darwin') return { command: 'open', args: [url], options: {} }
  return { command: 'xdg-open', args: [url], options: {} }
}
