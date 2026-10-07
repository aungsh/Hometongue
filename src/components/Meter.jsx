/** A thin progress bar. The track is a lighter step of the fill's colour. */
export default function Meter({ value, max, label, tone }) {
  const percent = max ? Math.round((value / max) * 100) : 0
  return (
    <div
      className={`meter${tone ? ` meter--${tone}` : ''}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <span className="meter__fill" style={{ width: `${percent}%` }} />
    </div>
  )
}
