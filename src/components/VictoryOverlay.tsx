import { useEffect, useState } from 'react'
import Starburst from './Starburst'

interface Props {
  onReplay: () => void
}

const STRIPS = Array.from({ length: 36 }, (_, i) => ({
  left: (i * 137.5) % 100,
  delay: (i % 12) * 0.09,
  duration: 2.6 + (i % 5) * 0.5,
  color: i % 3 === 0 ? '#e60012' : i % 3 === 1 ? '#ffffff' : '#1a1a1a',
  width: 6 + (i % 4) * 4,
  rotate: (i * 53) % 360,
}))

export default function VictoryOverlay({ onReplay }: Props) {
  const [stage, setStage] = useState(0)
  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 120)
    const t2 = setTimeout(() => setStage(2), 700)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <div className="win-overlay" role="dialog" aria-label="Puzzle complete">
      {STRIPS.map((s, i) => (
        <span
          key={i}
          className="win-strip"
          style={{
            left: `${s.left}%`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            background: s.color,
            width: s.width,
            transform: `rotate(${s.rotate}deg)`,
          }}
        />
      ))}
      <div className={`win-burst-wrap ${stage >= 1 ? 'win-burst-in' : ''}`}>
        <Starburst points={14} className="win-burst" />
        <div className="win-text">
          <span className="win-all">ALL</span>
          <span className="win-clear">CLEAR!</span>
        </div>
      </div>
      <p className={`win-sub ${stage >= 2 ? 'win-sub-in' : ''}`}>
        6 / 6 KEYWORDS SEIZED — THE GRID IS YOURS
      </p>
      <button
        className={`p5-btn p5-btn-white win-replay ${stage >= 2 ? 'win-sub-in' : ''}`}
        onClick={onReplay}
      >
        RUN IT BACK
      </button>
    </div>
  )
}
