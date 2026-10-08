import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CrosswordGrid from '../components/CrosswordGrid'
import CluePanel from '../components/CluePanel'
import VictoryOverlay from '../components/VictoryOverlay'
import Starburst from '../components/Starburst'
import {
  CELLS,
  WORDS,
  cellsOfWord,
  isWordSolved,
  key,
  wordById,
} from '../lib/puzzle'
import type { Direction } from '../lib/puzzle'
import '../App.css'

interface Sel {
  r: number
  c: number
  dir: Direction
}

export default function Home() {
  const [letters, setLetters] = useState<Record<string, string>>({})
  const [sel, setSel] = useState<Sel | null>({ r: 0, c: 2, dir: 'across' })
  const [wrong, setWrong] = useState<Set<string>>(new Set())
  const [won, setWon] = useState(false)
  const [status, setStatus] = useState('TAP A SQUARE AND START STEALING WORDS.')
  const inputRef = useRef<HTMLInputElement>(null)

  const solvedWordIds = useMemo(() => {
    const s = new Set<string>()
    for (const w of WORDS) if (isWordSolved(w, letters)) s.add(w.id)
    return s
  }, [letters])

  const activeWordId = useMemo(() => {
    if (!sel) return null
    return CELLS[key(sel.r, sel.c)]?.words[sel.dir] ?? null
  }, [sel])

  // Win detection
  useEffect(() => {
    if (won) return
    const allCorrect = Object.entries(CELLS).every(([k, info]) => letters[k] === info.letter)
    if (allCorrect && Object.keys(CELLS).length > 0) {
      const t = setTimeout(() => setWon(true), 450)
      return () => clearTimeout(t)
    }
  }, [letters, won])

  const focusInput = useCallback(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  const clearWrongAt = useCallback((k: string) => {
    setWrong((prev) => {
      if (!prev.has(k)) return prev
      const next = new Set(prev)
      next.delete(k)
      return next
    })
  }, [])

  const enterLetter = useCallback(
    (ch: string) => {
      if (!sel || won) return
      const k = key(sel.r, sel.c)
      setLetters((prev) => ({ ...prev, [k]: ch }))
      clearWrongAt(k)
      // advance within the active word
      const wid = CELLS[k]?.words[sel.dir]
      if (wid) {
        const w = wordById(wid)
        const cells = cellsOfWord(w)
        const idx = cells.findIndex(([r, c]) => r === sel.r && c === sel.c)
        if (idx >= 0 && idx < cells.length - 1) {
          const [nr, nc] = cells[idx + 1]
          setSel({ r: nr, c: nc, dir: sel.dir })
        }
      }
    },
    [sel, won, clearWrongAt],
  )

  const erase = useCallback(() => {
    if (!sel || won) return
    const k = key(sel.r, sel.c)
    if (letters[k]) {
      setLetters((prev) => {
        const next = { ...prev }
        delete next[k]
        return next
      })
      clearWrongAt(k)
      return
    }
    // move back one cell in the word and erase there
    const wid = CELLS[k]?.words[sel.dir]
    if (wid) {
      const w = wordById(wid)
      const cells = cellsOfWord(w)
      const idx = cells.findIndex(([r, c]) => r === sel.r && c === sel.c)
      if (idx > 0) {
        const [pr, pc] = cells[idx - 1]
        const pk = key(pr, pc)
        setLetters((prev) => {
          const next = { ...prev }
          delete next[pk]
          return next
        })
        clearWrongAt(pk)
        setSel({ r: pr, c: pc, dir: sel.dir })
      }
    }
  }, [sel, letters, won, clearWrongAt])

  const move = useCallback(
    (dr: number, dc: number) => {
      if (!sel) return
      let r = sel.r + dr
      let c = sel.c + dc
      while (r >= 0 && r < 99 && c >= 0 && c < 99) {
        const info = CELLS[key(r, c)]
        if (info) {
          const dir: Direction = info.words[sel.dir]
            ? sel.dir
            : info.words.across
              ? 'across'
              : 'down'
          setSel({ r, c, dir })
          return
        }
        r += dr
        c += dc
      }
    },
    [sel],
  )

  const toggleDir = useCallback(() => {
    if (!sel) return
    const info = CELLS[key(sel.r, sel.c)]
    if (!info) return
    const other: Direction = sel.dir === 'across' ? 'down' : 'across'
    if (info.words[other]) setSel({ ...sel, dir: other })
  }, [sel])

  const onCellClick = useCallback(
    (r: number, c: number) => {
      const info = CELLS[key(r, c)]
      if (!info) return
      if (sel && sel.r === r && sel.c === c) {
        toggleDir()
      } else {
        const dir: Direction =
          sel && info.words[sel.dir] ? sel.dir : info.words.across ? 'across' : 'down'
        setSel({ r, c, dir })
      }
      focusInput()
    },
    [sel, toggleDir, focusInput],
  )

  const onClueClick = useCallback(
    (wordId: string) => {
      const w = wordById(wordId)
      setSel({ r: w.row, c: w.col, dir: w.dir })
      setStatus(`TARGET LOCKED: ${w.number} ${w.dir.toUpperCase()}`)
      focusInput()
    },
    [focusInput],
  )

  // Hidden input drives both desktop and mobile keyboards
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!sel) return
    const v = e.target.value.toUpperCase()
    const prev = (letters[key(sel.r, sel.c)] ?? '').toUpperCase()
    if (v.length > prev.length) {
      const ch = v.slice(-1)
      if (/^[A-Z]$/.test(ch)) enterLetter(ch)
      else e.target.value = prev // swallow invalid char
    } else if (v.length < prev.length) {
      erase()
    }
  }

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!sel) return
    switch (e.key) {
      case 'Backspace':
        if (!letters[key(sel.r, sel.c)]) {
          e.preventDefault()
          erase()
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        move(-1, 0)
        break
      case 'ArrowDown':
        e.preventDefault()
        move(1, 0)
        break
      case 'ArrowLeft':
        e.preventDefault()
        move(0, -1)
        break
      case 'ArrowRight':
        e.preventDefault()
        move(0, 1)
        break
      case ' ':
      case 'Enter':
        e.preventDefault()
        toggleDir()
        break
    }
  }

  const check = () => {
    const bad = new Set<string>()
    let filled = 0
    for (const [k, info] of Object.entries(CELLS)) {
      const l = letters[k]
      if (l) {
        filled++
        if (l !== info.letter) bad.add(k)
      }
    }
    setWrong(bad)
    if (bad.size === 0) {
      setStatus(
        filled === Object.keys(CELLS).length
          ? 'FLAWLESS. THE GRID IS YOURS.'
          : 'NO MISTAKES SO FAR. KEEP GOING.',
      )
    } else {
      setStatus(`${bad.size} WRONG ${bad.size === 1 ? 'LETTER' : 'LETTERS'} MARKED IN RED.`)
    }
    focusInput()
  }

  const reset = useCallback(() => {
    setLetters({})
    setWrong(new Set())
    setWon(false)
    setSel({ r: 0, c: 2, dir: 'across' })
    setStatus('TAP A SQUARE AND START STEALING WORDS.')
    focusInput()
  }, [focusInput])

  const totalCells = Object.keys(CELLS).length
  const filledCells = Object.keys(letters).filter((k) => letters[k]).length

  return (
    <div className="p5-page">
      {/* top marquee */}
      <div className="p5-marquee" aria-hidden="true">
        <div className="p5-marquee-track">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i}>TAKE YOUR TIME ★&nbsp;</span>
          ))}
        </div>
      </div>

      {/* background decor */}
      <div className="p5-bg-band" aria-hidden="true" />
      <div className="p5-bg-dots" aria-hidden="true" />
      <Starburst points={12} className="p5-bg-star s1" />
      <Starburst points={9} className="p5-bg-star s2" />

      <header className="p5-header">
        <div className="p5-title-block">
          <div className="p5-title-ribbon">
            <span className="p5-title-ghost">PHANTOM</span>
            <h1 className="p5-title">PHANTOM GRID</h1>
          </div>
          <p className="p5-subtitle">— CROSSWORD HEIST: 6 COMPUTING KEYWORDS TO STEAL —</p>
        </div>
        <div className="p5-badge" aria-hidden="true">
          <Starburst points={12} className="p5-badge-star" />
          <span className="p5-badge-text">
            {solvedWordIds.size}/6<br />
            FOUND
          </span>
        </div>
      </header>

      <main className="p5-main">
        <section className="p5-board-col">
          <CrosswordGrid
            letters={letters}
            selected={sel}
            wrong={wrong}
            solvedWordIds={solvedWordIds}
            onCellClick={onCellClick}
          />

          <div className="p5-controls">
            <button className="p5-btn p5-btn-red" onClick={check}>
              CHECK
            </button>
            <button className="p5-btn p5-btn-ghost" onClick={reset}>
              RESET
            </button>
          </div>

          <div className="p5-status-row">
            <p className="p5-status">{status}</p>
            <p className="p5-progress">
              {filledCells}/{totalCells} CELLS
            </p>
          </div>
        </section>

        <aside className="p5-clues-col">
          <CluePanel
            activeWordId={activeWordId}
            solvedWordIds={solvedWordIds}
            onClueClick={onClueClick}
          />
        </aside>
      </main>

      <footer className="p5-footer">
        <span>SPACE / ENTER — SWITCH DIRECTION</span>
        <span className="p5-footer-star">★</span>
        <span>ARROWS — MOVE</span>
      </footer>

      {/* keyboard capture */}
      <input
        ref={inputRef}
        className="xw-hidden-input"
        value={sel ? (letters[key(sel.r, sel.c)] ?? '') : ''}
        onChange={onInputChange}
        onKeyDown={onInputKeyDown}
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Type letters for the selected cell"
      />

      {won && <VictoryOverlay onReplay={reset} />}
    </div>
  )
}
