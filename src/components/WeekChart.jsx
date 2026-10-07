import { plural } from '../lib/format.js'
import { WEEKDAY_GLYPHS } from '../data/catalog.js'
import Tile from './Tile.jsx'

const FULL_DAY = new Intl.DateTimeFormat('en-SG', { weekday: 'short', day: 'numeric', month: 'short' })
const WEEKDAY = new Intl.DateTimeFormat('en-SG', { weekday: 'short' })
const MAX_TILES = 4

/**
 * Real conversations per day, Monday to Sunday, as stacks of tiles (one tile per conversation).
 * Hover or focus a day for its tooltip; the table below carries every value too.
 */
export default function WeekChart({ days }) {
  // Room for the busiest day's stack (at least two tiles, at most MAX_TILES).
  const rows = Math.min(MAX_TILES, Math.max(2, ...days.map((d) => d.conversations)))
  return (
    <figure className="chart">
      <ul className="chart__plot" style={{ '--rows': rows }}>
        {days.map((d, i) => (
          <li
            key={d.key}
            className={`chart__col${d.isToday ? ' is-today' : ''}`}
            tabIndex={0}
            aria-label={`${FULL_DAY.format(d.date)}: ${plural(d.conversations, 'real conversation')}`}
          >
            {d.conversations > 0 && <span className="chart__value">{d.conversations}</span>}
            <span className="chart__stack">
              {Array.from({ length: Math.min(d.conversations, MAX_TILES) }, (_, n) => (
                <Tile key={n} glyph={WEEKDAY_GLYPHS[i]} size="xs" tone="accent" />
              ))}
            </span>
            <span className="chart__tip" aria-hidden="true">
              <b>{plural(d.conversations, 'conversation')}</b> {FULL_DAY.format(d.date)}
            </span>
          </li>
        ))}
      </ul>
      <div className="chart__axis" aria-hidden="true">
        {days.map((d) => (
          <span key={d.key} className={d.isToday ? 'is-today' : undefined}>
            {d.isToday ? 'Today' : WEEKDAY.format(d.date)}
          </span>
        ))}
      </div>
      <details className="chart__table">
        <summary>View as table</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">Checked in</th>
              <th scope="col">Real conversations</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.key}>
                <td>{FULL_DAY.format(d.date)}</td>
                <td>{d.isFuture ? '–' : d.checkedIn ? 'Yes' : 'No'}</td>
                <td>{d.conversations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}
