interface Props {
  points?: number
  className?: string
}

/** Persona-style jagged starburst, drawn as an SVG polygon */
export default function Starburst({ points = 12, className = '' }: Props) {
  const cx = 50
  const cy = 50
  const pts: string[] = []
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI * i) / points - Math.PI / 2
    const radius = i % 2 === 0 ? 50 : 22 + (i % 4 === 1 ? 6 : 0)
    pts.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`)
  }
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <polygon points={pts.join(' ')} fill="currentColor" />
    </svg>
  )
}
