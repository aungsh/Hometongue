import { createInterface, emitKeypressEvents } from 'node:readline'

export const CTRL_C = '\u0003'

/**
 * Reads menu keys. In a terminal each key press counts on its own (no Enter needed);
 * with piped input (scripts, tests) each line counts as one key. End of input acts as Ctrl+C.
 */
export function createInput(stdin) {
  if (stdin.isTTY) {
    emitKeypressEvents(stdin)
    return {
      key: () =>
        new Promise((resolve) => {
          stdin.setRawMode(true)
          stdin.resume()
          stdin.once('keypress', (text, key) => {
            stdin.setRawMode(false)
            stdin.pause()
            resolve(key?.ctrl && key.name === 'c' ? CTRL_C : (text ?? ''))
          })
        }),
      close: () => stdin.pause(),
    }
  }

  const lines = createInterface({ input: stdin })
  const next = lines[Symbol.asyncIterator]()
  return {
    key: async () => {
      const { value, done } = await next.next()
      return done ? CTRL_C : value.trim()
    },
    close: () => lines.close(),
  }
}
