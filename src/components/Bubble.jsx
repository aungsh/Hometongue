import AudioButton from './AudioButton.jsx'
import Pixel from './Pixel.jsx'

/** One line of a mission's mini conversation, with the speaker's pixel character. */
export default function Bubble({ line, source, partner, partnerSprite, lang }) {
  const mine = line.from === 'you'
  return (
    <div className={`bubble-row ${mine ? 'bubble-row--you' : 'bubble-row--them'}`}>
      <span className="bubble-row__avatar">
        <Pixel sprite={mine ? 'you' : partnerSprite} scale={2} motion="bob" />
      </span>
      <div className={`bubble ${mine ? 'bubble--you' : 'bubble--them'}`}>
        <div className="bubble__text">
          <span className="bubble__who">{mine ? 'You' : partner}</span>
          <p className="bubble__say">{line.say}</p>
          <p className="bubble__zh" lang={lang}>
            {line.zh}
          </p>
          <p className="bubble__en">{line.en}</p>
        </div>
        <AudioButton source={source} label={`Play “${line.say}”`} />
      </div>
    </div>
  )
}
