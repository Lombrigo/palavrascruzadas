import { WORDS } from '../lib/puzzle'
import type { Direction } from '../lib/puzzle'

interface Props {
  activeWordId: string | null
  solvedWordIds: Set<string>
  onClueClick: (wordId: string) => void
}

function ClueGroup({
  dir,
  tilt,
  activeWordId,
  solvedWordIds,
  onClueClick,
}: {
  dir: Direction
  tilt: string
} & Omit<Props, never>) {
  const words = WORDS.filter((w) => w.dir === dir).sort((a, b) => a.number - b.number)
  return (
    <section className={`clue-wrap ${tilt}`}>
      <header className="clue-tab">
        <span className="clue-tab-text">{dir === 'across' ? 'ACROSS' : 'DOWN'}</span>
      </header>
      <div className="clue-panel">
        <ul className="clue-list">
          {words.map((w) => {
            const solved = solvedWordIds.has(w.id)
            const active = activeWordId === w.id
            return (
              <li key={w.id}>
                <button
                  className={`clue-item ${active ? 'clue-active' : ''} ${solved ? 'clue-solved' : ''}`}
                  onClick={() => onClueClick(w.id)}
                >
                  <span className="clue-num">{w.number}</span>
                  <span className="clue-text">{w.clue}</span>
                  {solved && <span className="clue-done">★</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export default function CluePanel(props: Props) {
  return (
    <div className="clue-stack">
      <ClueGroup dir="across" tilt="tilt-l" {...props} />
      <ClueGroup dir="down" tilt="tilt-r" {...props} />
    </div>
  )
}
