import { DIALECTS, PEOPLE } from '../data/catalog.js'
import Pixel from './Pixel.jsx'
import Tile, { Seal } from './Tile.jsx'

function Choice({ name, value, checked, onChange, mark, title, detail, extra, dialect }) {
  return (
    <label className="choice tile-card" data-dialect={dialect}>
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} />
      <span className="choice__mark">{mark}</span>
      <span className="choice__body">
        <span className="choice__title">{title}</span>
        <span className="choice__detail">{detail}</span>
        {extra}
      </span>
      <Seal glyph="选" className="choice__seal" />
    </label>
  )
}

export function DialectPicker({ value, onChange }) {
  return (
    <fieldset className="choices">
      <legend className="sr-only">Dialect</legend>
      {Object.values(DIALECTS).map((d) => (
        <Choice
          key={d.id}
          name="dialect"
          value={d.id}
          dialect={d.id}
          checked={value === d.id}
          onChange={onChange}
          mark={<Tile glyph={d.zh.charAt(0)} size="lg" tone="accent" />}
          title={
            <>
              {d.name}{' '}
              <span className="choice__zh" lang={d.lang}>
                {d.zh}
              </span>
            </>
          }
          detail={d.blurb}
          extra={
            <span className="choice__sample">
              “{d.sample}” <span>Have you eaten?</span>
            </span>
          }
        />
      ))}
    </fieldset>
  )
}

export function PersonPicker({ value, onChange }) {
  return (
    <fieldset className="choices">
      <legend className="sr-only">Who you want to talk with</legend>
      {Object.values(PEOPLE).map((p) => (
        <Choice
          key={p.id}
          name="person"
          value={p.id}
          checked={value === p.id}
          onChange={onChange}
          mark={
            <span className="choice__window">
              <Pixel sprite={p.sprite} scale={3} motion={value === p.id ? 'wave' : 'still'} />
            </span>
          }
          title={p.name}
          detail={p.detail}
        />
      ))}
    </fieldset>
  )
}
