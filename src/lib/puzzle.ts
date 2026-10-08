export type Direction = 'across' | 'down'

export interface WordDef {
  id: string
  number: number
  answer: string
  clue: string
  row: number
  col: number
  dir: Direction
}

export interface CellInfo {
  letter: string
  number?: number
  words: { across?: string; down?: string }
}

export const ROWS = 9
export const COLS = 8

// Grid layout (verified crossings):
// · · S H I F T ·
// · · C · · · · S
// · · R · · · · E
// S H O R T C U T
// E · L · · · · U
// R · L · · · · P
// V · · · · · · ·
// E · · · · · · ·
// R A M · · · · ·
export const WORDS: WordDef[] = [
  {
    id: 'shift',
    number: 1,
    answer: 'SHIFT',
    clue: 'A keyboard key you hold to type capital letters or the symbols above the number keys.',
    row: 0,
    col: 2,
    dir: 'across',
  },
  {
    id: 'shortcut',
    number: 3,
    answer: 'SHORTCUT',
    clue: 'A keyboard command, such as Ctrl + C, that lets you do something without opening a menu.',
    row: 3,
    col: 0,
    dir: 'across',
  },
  {
    id: 'ram',
    number: 4,
    answer: 'RAM',
    clue: "The computer's temporary working memory. Its contents are lost when the power is turned off.",
    row: 8,
    col: 0,
    dir: 'across',
  },
  {
    id: 'scroll',
    number: 1,
    answer: 'SCROLL',
    clue: 'To move a page up or down to see content that is outside the screen.',
    row: 0,
    col: 2,
    dir: 'down',
  },
  {
    id: 'setup',
    number: 2,
    answer: 'SETUP',
    clue: 'Installing and configuring a program before you can use it. (Two words.)',
    row: 1,
    col: 7,
    dir: 'down',
  },
  {
    id: 'server',
    number: 3,
    answer: 'SERVER',
    clue: 'A computer that stores data and provides services to other computers on a network.',
    row: 3,
    col: 0,
    dir: 'down',
  },
]

export const key = (r: number, c: number) => `${r},${c}`

// Build the cell map: letter + word membership + clue start numbers
export const CELLS: Record<string, CellInfo> = {}
for (const w of WORDS) {
  const dr = w.dir === 'down' ? 1 : 0
  const dc = w.dir === 'across' ? 1 : 0
  for (let i = 0; i < w.answer.length; i++) {
    const r = w.row + dr * i
    const c = w.col + dc * i
    const k = key(r, c)
    if (!CELLS[k]) CELLS[k] = { letter: w.answer[i], words: {} }
    CELLS[k].words[w.dir] = w.id
    if (i === 0) CELLS[k].number = w.number
  }
}

export function cellsOfWord(w: WordDef): [number, number][] {
  const dr = w.dir === 'down' ? 1 : 0
  const dc = w.dir === 'across' ? 1 : 0
  return w.answer.split('').map((_, i) => [w.row + dr * i, w.col + dc * i] as [number, number])
}

export const wordById = (id: string) => WORDS.find((w) => w.id === id)!

export function isWordSolved(w: WordDef, letters: Record<string, string>): boolean {
  return cellsOfWord(w).every(([r, c]) => letters[key(r, c)] === CELLS[key(r, c)].letter)
}

export function isWordFilled(w: WordDef, letters: Record<string, string>): boolean {
  return cellsOfWord(w).every(([r, c]) => !!letters[key(r, c)])
}

// Ordered list of all playable cells for arrow-key / tab navigation
export const CELL_KEYS = Object.keys(CELLS)
  .map((k) => k.split(',').map(Number) as [number, number])
  .sort((a, b) => a[0] - b[0] || a[1] - b[1])
