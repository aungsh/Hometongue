import { useMemo } from 'react'
import { SPRITES } from '../data/sprites.js'
import { outline, spritePaths } from '../lib/pixel.js'

const OUTLINE = '#241914'

/**
 * A pixel-art character from data/sprites.js.
 * `motion`: still, walk, wave, bob, jump or talk. `flip` mirrors it to face the other way.
 */
export default function Pixel({ sprite, scale = 4, motion = 'still', flip = false, label }) {
  const { palette, frames } = SPRITES[sprite]
  const drawn = useMemo(
    () => frames.map((frame) => spritePaths(outline(frame), { ...palette, k: OUTLINE })),
    [frames, palette],
  )
  const width = frames[0][0].length + 2
  const height = frames[0].length + 2

  return (
    <span
      className={`pixel pixel--${motion}${flip ? ' is-flipped' : ''}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg viewBox={`0 0 ${width} ${height}`} width={width * scale} height={height * scale} shapeRendering="crispEdges">
        {drawn.map((paths, i) => (
          <g key={i} className={`pixel__frame pixel__frame--${i}`}>
            {paths.map(({ color, d }) => (
              <path key={color} d={d} style={{ fill: color }} />
            ))}
          </g>
        ))}
      </svg>
    </span>
  )
}
