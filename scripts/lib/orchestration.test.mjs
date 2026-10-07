import { describe, it, expect, afterEach } from 'vitest'
import { createServer as createHttpServer } from 'node:http'
import { createServer as createNetServer } from 'node:net'
import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  browserCommand,
  checkNode,
  needsInstall,
  isPortInUse,
  findFreePort,
  isAlive,
  lanUrls,
  lastLines,
  readState,
  writeState,
  clearState,
  waitFor,
  isOurServer,
} from './orchestration.mjs'

const servers = []
afterEach(async () => {
  await Promise.all(servers.splice(0).map((s) => new Promise((resolve) => s.close(resolve))))
})

/** A TCP server on a free port, closed after each test. */
function listen(server, port = 0) {
  servers.push(server)
  return new Promise((resolve) => server.listen(port, 'localhost', () => resolve(server.address().port)))
}

describe('checkNode', () => {
  it.each([
    ['v24.13.0', true],
    ['v22.12.0', true],
    ['v22.11.0', false],
    ['v21.7.3', false],
    ['v20.19.0', true],
    ['v20.18.1', false],
    ['v18.20.4', false],
  ])("^20.19.0 || >=22.12.0 rule: %s → %s", (version, ok) => {
    expect(checkNode(version).ok).toBe(ok)
  })
})

describe('needsInstall', () => {
  const MINUTE = 60_000

  it('installs when node_modules is missing', () => {
    expect(needsInstall({ hasNodeModules: false, lockMtimeMs: 0, installedMtimeMs: undefined })).toBe(true)
  })

  it("installs when npm's install record is missing", () => {
    expect(needsInstall({ hasNodeModules: true, lockMtimeMs: 0, installedMtimeMs: undefined })).toBe(true)
  })

  it('installs when the lockfile changed after the last install', () => {
    expect(needsInstall({ hasNodeModules: true, lockMtimeMs: 10 * MINUTE, installedMtimeMs: 0 })).toBe(true)
  })

  it('skips when the install is newer than the lockfile', () => {
    expect(needsInstall({ hasNodeModules: true, lockMtimeMs: 0, installedMtimeMs: MINUTE })).toBe(false)
  })

  it('treats a lockfile written in the same moment as the install as up to date', () => {
    expect(needsInstall({ hasNodeModules: true, lockMtimeMs: 500, installedMtimeMs: 0 })).toBe(false)
  })

  it('skips when there is no lockfile but an install exists', () => {
    expect(needsInstall({ hasNodeModules: true, lockMtimeMs: undefined, installedMtimeMs: 0 })).toBe(false)
  })
})

describe('ports', () => {
  it('sees a port with a listener as in use, and free once closed', async () => {
    const server = createNetServer()
    const port = await listen(server)
    expect(await isPortInUse(port)).toBe(true)
    servers.pop()
    await new Promise((resolve) => server.close(resolve))
    expect(await isPortInUse(port)).toBe(false)
  })

  it('skips a busy starting port', async () => {
    const busy = await listen(createNetServer())
    const port = await findFreePort(busy)
    expect(port).toBeGreaterThan(busy)
    expect(await isPortInUse(port)).toBe(false)
  })

  it('gives up after the allowed number of attempts', async () => {
    const busy = await listen(createNetServer())
    await expect(findFreePort(busy, 1)).rejects.toThrow(/No free port/)
  })
})

describe('isAlive', () => {
  it('is true for a running process', () => {
    expect(isAlive(process.pid)).toBe(true)
  })

  it('is false once a process has exited', async () => {
    const child = spawn(process.execPath, ['-e', ''])
    await new Promise((resolve) => child.on('exit', resolve))
    expect(isAlive(child.pid)).toBe(false)
  })
})

describe('lanUrls', () => {
  it('lists external IPv4 addresses only', () => {
    const interfaces = {
      'Wi-Fi': [
        { family: 'IPv4', address: '192.168.1.23', internal: false },
        { family: 'IPv6', address: 'fe80::1', internal: false },
      ],
      Ethernet: [{ family: 4, address: '10.0.0.5', internal: false }],
      Loopback: [{ family: 'IPv4', address: '127.0.0.1', internal: true }],
    }
    expect(lanUrls(5173, interfaces)).toEqual(['http://192.168.1.23:5173/', 'http://10.0.0.5:5173/'])
  })

  it('leaves out virtual adapters a phone cannot reach', () => {
    const interfaces = {
      Ethernet: [{ family: 'IPv4', address: '192.168.0.6', internal: false }],
      'vEthernet (WSL (Hyper-V firewall))': [{ family: 'IPv4', address: '172.30.64.1', internal: false }],
      docker0: [{ family: 'IPv4', address: '172.17.0.1', internal: false }],
    }
    expect(lanUrls(5173, interfaces)).toEqual(['http://192.168.0.6:5173/'])
  })

  it('falls back to every external address when all of them look virtual', () => {
    const interfaces = { 'vEthernet (Default Switch)': [{ family: 'IPv4', address: '172.24.96.1', internal: false }] }
    expect(lanUrls(5173, interfaces)).toEqual(['http://172.24.96.1:5173/'])
  })
})

describe('browserCommand', () => {
  const url = 'http://localhost:5173/'

  it('on Windows, gives `start` an empty title so the quoted URL is not taken as the title', () => {
    const { command, args, options } = browserCommand('win32', url)
    expect(command).toBe('cmd')
    expect(args.at(-1)).toBe('start "" "http://localhost:5173/"')
    expect(options.windowsVerbatimArguments).toBe(true)
  })

  it('uses open on macOS and xdg-open on Linux', () => {
    expect(browserCommand('darwin', url)).toMatchObject({ command: 'open', args: [url] })
    expect(browserCommand('linux', url)).toMatchObject({ command: 'xdg-open', args: [url] })
  })
})

describe('lastLines', () => {
  it('returns the last lines, ignoring a trailing newline', () => {
    expect(lastLines('a\nb\nc\nd\n', 2)).toEqual(['c', 'd'])
  })
})

describe('state file', () => {
  const dir = mkdtempSync(join(tmpdir(), 'orchestrator-'))
  const file = join(dir, 'nested', 'state.json')

  it('round-trips a saved state, creating folders as needed', () => {
    writeState(file, { pid: 123, port: 5173, url: 'http://localhost:5173/' })
    expect(readState(file)).toEqual({ pid: 123, port: 5173, url: 'http://localhost:5173/' })
  })

  it('reads nothing once cleared', () => {
    clearState(file)
    expect(existsSync(file)).toBe(false)
    expect(readState(file)).toBeNull()
  })

  it.each([['not json'], ['null'], ['{"port":5173}']])('ignores an unusable record: %s', (text) => {
    const bad = join(dir, 'bad.json')
    writeFileSync(bad, text)
    expect(readState(bad)).toBeNull()
  })
})

describe('waitFor', () => {
  it('resolves true as soon as the check passes', async () => {
    let calls = 0
    expect(await waitFor(() => ++calls === 3, { timeoutMs: 1000, intervalMs: 5 })).toBe(true)
    expect(calls).toBe(3)
  })

  it('resolves false when time runs out', async () => {
    expect(await waitFor(() => false, { timeoutMs: 30, intervalMs: 5 })).toBe(false)
  })
})

describe('isOurServer', () => {
  const serve = (body) => listen(createHttpServer((req, res) => res.end(body)))

  it('recognises the app by its page marker', async () => {
    const port = await serve('<html><title>Hometongue</title></html>')
    expect(await isOurServer(`http://localhost:${port}/`, '<title>Hometongue</title>')).toBe(true)
  })

  it('rejects a different app on the same address', async () => {
    const port = await serve('<html><title>Something else</title></html>')
    expect(await isOurServer(`http://localhost:${port}/`, '<title>Hometongue</title>')).toBe(false)
  })

  it('is false when nothing is listening', async () => {
    const port = await listen(createNetServer())
    await new Promise((resolve) => servers.pop().close(resolve))
    expect(await isOurServer(`http://localhost:${port}/`, '<title>Hometongue</title>')).toBe(false)
  })
})
