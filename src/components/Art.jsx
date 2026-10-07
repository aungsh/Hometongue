import { useId } from 'react'

// Abstract compositions in the spirit of Chinese landscape and ornament: a red sun,
// layered hills and waves, auspicious cloud scrolls and old coins. Colours come from CSS.

function Cloud({ x, y, scale = 1 }) {
  return (
    <g className="art__cloud" transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0 18a10 10 0 0 1 16-10a14 14 0 0 1 26 2a10 10 0 0 1 6 16H5a8 8 0 0 1-5-8z" />
      <path d="M22 12a5 5 0 1 1 5 5" />
    </g>
  )
}

function Coin({ x, y, scale = 1 }) {
  return (
    <g className="art__coin" transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle r="12" />
      <rect x="-4" y="-4" width="8" height="8" />
    </g>
  )
}

function DotGrid({ x, y, width, height }) {
  const id = useId()
  return (
    <>
      <defs>
        <pattern id={id} width="9" height="9" patternUnits="userSpaceOnUse">
          <rect width="2" height="2" className="art__dot" />
        </pattern>
      </defs>
      <rect x={x} y={y} width={width} height={height} fill={`url(#${id})`} />
    </>
  )
}

const VARIANTS = {
  // Sun over hills and sea: welcome and scene backdrops.
  hero: (
    <svg viewBox="0 0 360 230" preserveAspectRatio="xMidYMax slice">
      <DotGrid x={14} y={22} width={118} height={76} />
      <circle className="art__halo" cx="258" cy="86" r="76" />
      <circle className="art__sun" cx="258" cy="86" r="60" />
      <Cloud x={146} y={36} scale={1.3} />
      <Cloud x={292} y={128} scale={0.9} />
      <Coin x={60} y={130} />
      <path className="art__hill art__hill--3" d="M0 168L44 132L82 152L130 100L176 150L220 122L268 162L312 128L360 160V230H0Z" />
      <path className="art__hill art__hill--2" d="M0 192L60 156L108 182L160 146L214 186L270 156L328 184L360 172V230H0Z" />
      <path className="art__hill art__hill--1" d="M0 206Q45 192 90 204T180 202T270 200T360 204V230H0Z" />
      <path className="art__waves" d="M14 218q8-6 16 0t16 0M122 222q8-6 16 0t16 0M248 216q8-6 16 0t16 0" />
    </svg>
  ),
  // Light lines over a coloured card (drawn in the card's text colour):
  // a moon in the top corner and waves along the bottom edge.
  card: (
    <>
      <svg className="art__corner" viewBox="0 0 120 120">
        <circle className="art__ring" cx="64" cy="56" r="44" />
        <circle className="art__disc" cx="64" cy="56" r="26" />
      </svg>
      <svg className="art__base" viewBox="0 0 360 60" preserveAspectRatio="xMidYMax slice">
        <path
          className="art__lines"
          d="M0 22q20-12 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0M20 42q20-12 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0"
        />
      </svg>
    </>
  ),
  // Sunburst for celebrations.
  burst: (
    <svg viewBox="-110 -110 220 220">
      <g className="art__rays">
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} d="M0 0L-7-110L7-110Z" transform={`rotate(${i * 22.5})`} />
        ))}
      </g>
      <circle className="art__halo" r="52" />
      <circle className="art__sun" r="38" />
      <Cloud x={-92} y={40} scale={1.1} />
      <Cloud x={40} y={-84} scale={0.9} />
    </svg>
  ),
}

/** Decorative abstract artwork; `variant` is hero, card or burst. */
export default function Art({ variant = 'hero', className = '' }) {
  return (
    <div className={`art art--${variant} ${className}`} aria-hidden="true">
      {VARIANTS[variant]}
    </div>
  )
}
