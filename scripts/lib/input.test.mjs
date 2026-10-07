import { describe, it, expect } from 'vitest'
import { PassThrough } from 'node:stream'
import { createInput, CTRL_C } from './input.mjs'

/** A stand-in for a terminal's stdin that records raw-mode switches. */
function fakeTerminal() {
  const stream = new PassThrough()
  stream.isTTY = true
  stream.rawModes = []
  stream.setRawMode = (on) => {
    stream.rawModes.push(on)
    return stream
  }
  return stream
}

describe('createInput in a terminal', () => {
  it('returns a single key press without Enter, and leaves raw mode afterwards', async () => {
    const terminal = fakeTerminal()
    const input = createInput(terminal)
    const pressed = input.key()
    terminal.write('1')
    expect(await pressed).toBe('1')
    expect(terminal.rawModes).toEqual([true, false])
    input.close()
  })

  it('turns Ctrl+C into the quit signal', async () => {
    const terminal = fakeTerminal()
    const input = createInput(terminal)
    const pressed = input.key()
    terminal.write('\u0003')
    expect(await pressed).toBe(CTRL_C)
    input.close()
  })
})

describe('createInput with piped input', () => {
  it('reads one trimmed line per key press, and ends like Ctrl+C', async () => {
    const pipe = new PassThrough()
    const input = createInput(pipe)
    pipe.end('1\n  q \n')
    expect(await input.key()).toBe('1')
    expect(await input.key()).toBe('q')
    expect(await input.key()).toBe(CTRL_C)
    input.close()
  })
})
