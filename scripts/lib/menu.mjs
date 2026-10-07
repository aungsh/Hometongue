// The interactive menu shown by `orch` with no command: what it lists and which key does what.

export const MENU = [
  { key: '1', action: 'start', label: 'Start the app (opens your browser)' },
  { key: '2', action: 'stop', label: 'Stop the app' },
  { key: '3', action: 'open', label: 'Open in browser' },
  { key: '4', action: 'share', label: 'Share on Wi-Fi (test on a phone)' },
  { key: '5', action: 'setup', label: 'Set up / repair' },
  { key: 'Q', action: 'quit', label: 'Quit' },
]

/** The action for a pressed key, or null for keys the menu doesn't use. */
export function menuChoice(key) {
  const pressed = String(key).trim().toUpperCase()
  return MENU.find((item) => item.key === pressed)?.action ?? null
}

const PLAIN = { bold: (text) => text, dim: (text) => text, green: (text) => text }

/** The menu screen for the current status. `style` adds colour in a terminal. */
export function renderMenu({ running, url, lanUrls = [] }, style = PLAIN) {
  return [
    '',
    style.bold(' Hometongue · dialect missions'),
    style.dim(` ${'─'.repeat(29)}`),
    running ? style.green(` ● Running at ${url}`) : style.dim(' ○ Not running'),
    ...lanUrls.map((link) => `   Phones on the same Wi-Fi: ${link}`),
    '',
    ...MENU.map((item) => `   ${style.bold(item.key)}  ${item.label}`),
    '',
    ' Press a key: ',
  ].join('\n')
}
