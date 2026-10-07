/**
 * A mahjong tile with a brush character. `down` shows the jade back instead.
 * Sizes: xs, sm, md, lg. Tones colour the character: accent, red, jade, blue, ink.
 */
export default function Tile({ glyph, size = 'md', tone = 'red', down = false, label, className = '' }) {
  return (
    <span
      className={`mj mj--${size} mj--${tone}${down ? ' is-down' : ''} ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {!down && <span className="mj__glyph">{glyph}</span>}
    </span>
  )
}

/** A red seal stamp (印章) with one character. */
export function Seal({ glyph, className = '' }) {
  return (
    <span className={`seal ${className}`} aria-hidden="true">
      {glyph}
    </span>
  )
}
