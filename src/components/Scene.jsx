import Art from './Art.jsx'
import Pixel from './Pixel.jsx'

/**
 * Abstract artwork with pixel characters standing or walking on the ground line.
 * Each cast member: { sprite, motion, at (left %), walk (seconds to cross), flip, delay, scale, dialect }.
 */
export default function Scene({ cast = [], height = 180, art = 'hero', className = '', children }) {
  return (
    <div className={`scene ${className}`} style={{ '--scene-h': `${height}px` }}>
      <Art variant={art} />
      <div className="scene__ground">
        {cast.map((actor, i) => (
          <span
            key={`${actor.sprite}-${i}`}
            className={`scene__actor${actor.walk ? ' is-walking' : ''}`}
            data-dialect={actor.dialect}
            style={{
              left: actor.at,
              '--walk-time': actor.walk ? `${actor.walk}s` : undefined,
              animationDelay: actor.delay,
            }}
          >
            <Pixel sprite={actor.sprite} motion={actor.motion} flip={actor.flip} scale={actor.scale ?? 4} />
          </span>
        ))}
      </div>
      {children}
    </div>
  )
}
