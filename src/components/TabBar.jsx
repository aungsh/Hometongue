import Link from 'next/link'
import Tile from './Tile.jsx'

// 今 today · 任 tasks · 连 streak · 进 progress
const TABS = [
  { path: '/today', label: 'Today', glyph: '今' },
  { path: '/quests', label: 'Quests', glyph: '任' },
  { path: '/streak', label: 'Streak', glyph: '连' },
  { path: '/progress', label: 'Progress', glyph: '进' },
]

export const TAB_PATHS = TABS.map((tab) => tab.path)

export default function TabBar({ path }) {
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map(({ path: to, label, glyph }) => (
        <Link key={to} href={to} className="tabbar__tab" aria-current={path === to ? 'page' : undefined}>
          <Tile glyph={glyph} size="sm" tone={path === to ? 'accent' : 'ink'} />
          {label}
        </Link>
      ))}
    </nav>
  )
}
