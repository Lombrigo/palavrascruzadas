import { CELLS, COLS, ROWS, cellsOfWord, key, wordById } from '../lib/puzzle'
import type { Direction } from '../lib/puzzle'

interface Props {
  letters: Record<string, string>
  selected: { r: number; c: number; dir: Direction } | null
  wrong: Set<string>
  solvedWordIds: Set<string>
  onCellClick: (r: number, c: number) => void
}

export default function CrosswordGrid({
  letters,
  selected,
  wrong,
  solvedWordIds,
  onCellClick,
}: Props) {
  const activeCells = new Set<string>()
  let activeWordSolved = false
  if (selected) {
    const cell = CELLS[key(selected.r, selected.c)]
    const wid = cell?.words[selected.dir]
    if (wid) {
      const w = wordById(wid)
      cellsOfWord(w).forEach(([r, c]) => activeCells.add(key(r, c)))
      activeWordSolved = solvedWordIds.has(wid)
    }
  }

  const cells = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const k = key(r, c)
      const info = CELLS[k]
      if (!info) {
        cells.push(<div key={k} className="xw-cell xw-blocked" aria-hidden="true" />)
        continue
      }
      const letter = letters[k] ?? ''
      const isCurrent = selected && selected.r === r && selected.c === c
      const inActive = activeCells.has(k)
      const isWrong = wrong.has(k)
      const inSolvedWord =
        (info.words.across && solvedWordIds.has(info.words.across)) ||
        (info.words.down && solvedWordIds.has(info.words.down))

      const cls = [
        'xw-cell',
        'xw-open',
        inActive && !isCurrent ? 'xw-active' : '',
        isCurrent ? 'xw-current' : '',
        inSolvedWord ? 'xw-solved' : '',
        activeWordSolved && inActive ? 'xw-active-solved' : '',
        isWrong ? 'xw-wrong' : '',
      ]
        .filter(Boolean)
        .join(' ')

      cells.push(
        <button
          key={k}
          className={cls}
          onClick={() => onCellClick(r, c)}
          aria-label={`row ${r + 1} column ${c + 1}${info.number ? `, clue ${info.number}` : ''}`}
        >
          {info.number && <span className="xw-num">{info.number}</span>}
          <span className="xw-letter">{letter}</span>
          {isWrong && <span className="xw-slash" />}
        </button>,
      )
    }
  }

  return (
    <div className="xw-frame-wrap">
      <div className="xw-frame-tag">TARGET&nbsp;GRID</div>
      <div className="xw-frame">
        <div
          className="xw-grid"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
          role="grid"
          aria-label="Crossword grid"
        >
          {cells}
        </div>
      </div>
    </div>
  )
}
