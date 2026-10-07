// Pixel sprites are rows of characters, one character per pixel ('.' is empty).

/** Adds a one-pixel `ink` outline around the filled pixels, growing the grid by one on every side. */
export function outline(rows, ink = 'k') {
  const at = (x, y) => rows[y - 1]?.[x - 1] ?? '.'
  const filled = (x, y) => at(x, y) !== '.'
  return Array.from({ length: rows.length + 2 }, (_, y) =>
    Array.from({ length: rows[0].length + 2 }, (_, x) => {
      if (filled(x, y)) return at(x, y)
      return filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1) ? ink : '.'
    }).join(''),
  )
}

/** One SVG path per colour, built from unit squares, in order of first appearance. */
export function spritePaths(rows, palette) {
  const byColor = new Map()
  rows.forEach((row, y) => {
    ;[...row].forEach((char, x) => {
      const color = palette[char]
      if (color) byColor.set(color, `${byColor.get(color) ?? ''}M${x} ${y}h1v1h-1z`)
    })
  })
  return [...byColor].map(([color, d]) => ({ color, d }))
}
