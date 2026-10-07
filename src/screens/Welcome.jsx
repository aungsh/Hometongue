import { useNavigate } from '@/lib/useNavigate.js'
import { APP_NAME, DIALECTS } from '../data/catalog.js'
import Scene from '../components/Scene.jsx'
import Tile from '../components/Tile.jsx'

const CAST = [
  { sprite: 'cat', motion: 'walk', at: '0%', walk: 14, scale: 3 },
  { sprite: 'ahma', motion: 'wave', at: '14%' },
  { sprite: 'you', motion: 'walk', at: '40%', dialect: 'hokkien' },
  { sprite: 'uncle', motion: 'bob', at: '64%' },
  { sprite: 'auntie', motion: 'wave', at: '82%' },
]

const BUBBLES = ['hokkien', 'cantonese', 'teochew']

export default function Welcome() {
  const navigate = useNavigate()
  return (
    <div className="screen screen--onboarding screen--welcome">
      <Scene cast={CAST} height={250} className="welcome__scene">
        {BUBBLES.map((id) => (
          <span key={id} className={`speech speech--${id}`} data-dialect={id} aria-hidden="true">
            {DIALECTS[id].sample}
            <small>{DIALECTS[id].name}</small>
          </span>
        ))}
      </Scene>

      <main className="welcome">
        <p className="brand">
          {APP_NAME} <span lang="zh-Hans">家乡话</span>
        </p>
        <h1 className="display">You understand more than you think.</h1>
        <p className="lead">
          Turn the dialect you hear at home into words you actually say, one small real conversation at a time.
        </p>
        <ul className="value-list">
          <li>
            <Tile glyph="学" size="sm" />
            <span>
              <b>Learn one useful line</b> in Hokkien, Teochew or Cantonese
            </span>
          </li>
          <li>
            <Tile glyph="练" size="sm" tone="jade" />
            <span>
              <b>Practise privately</b>, with no scores and no pressure
            </span>
          </li>
          <li>
            <Tile glyph="讲" size="sm" tone="blue" />
            <span>
              <b>Use it with someone real</b>: Ah Ma, the kopi uncle, your neighbours
            </span>
          </li>
        </ul>
      </main>
      <div className="cta-bar">
        <button type="button" className="btn btn--primary btn--block" onClick={() => navigate('/onboarding/dialect')}>
          Get started
        </button>
      </div>
    </div>
  )
}
