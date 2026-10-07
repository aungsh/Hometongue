import { ArrowLeft, X } from 'lucide-react'
import { useNavigate } from '@/lib/useNavigate.js'
import { appById } from '../data/catalog.js'
import Tile from './Tile.jsx'

/** Layout for one of the mission's four apps: back to the mission, app name, sticky actions. */
export default function AppScreen({ app, footer, children }) {
  const navigate = useNavigate()
  const meta = appById(app)
  return (
    <div className="screen screen--app">
      <header className="app-head">
        <button type="button" className="icon-btn" onClick={() => navigate('/mission')} aria-label="Back to mission">
          <ArrowLeft size={22} aria-hidden="true" />
        </button>
        <div className="app-head__title">
          <Tile glyph={meta.glyph} size="sm" tone="accent" />
          <div>
            <p className="app-head__name">{meta.name}</p>
            <p className="app-head__sub">{meta.sub}</p>
          </div>
        </div>
        <button type="button" className="icon-btn" onClick={() => navigate('/today')} aria-label="Close mission">
          <X size={22} aria-hidden="true" />
        </button>
      </header>
      <main className="app-body">{children}</main>
      {footer && <div className="cta-bar">{footer}</div>}
    </div>
  )
}
