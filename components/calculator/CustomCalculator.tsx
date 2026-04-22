'use client'

import { useState, useCallback, useRef } from 'react'
import { X, MoreVertical } from 'lucide-react'
import type { ReactNode } from 'react'

// ─── Safe recursive-descent math parser ───────────────────────────────────
const DEG = Math.PI / 180

class MathParser {
  private pos = 0
  constructor(
    private readonly s: string,
    private readonly vars: Record<string, number>,
    private readonly fns: Record<string, (n: number) => number>,
  ) {}

  parse(): number {
    const v = this.expr()
    this.ws()
    if (this.pos < this.s.length) throw new Error('Token inesperado')
    return v
  }

  private ws() { while (this.s[this.pos] === ' ') this.pos++ }
  private peek() { this.ws(); return this.s[this.pos] }
  private eat(ch: string) {
    this.ws()
    if (this.s[this.pos] !== ch) throw new Error(`Se esperaba ${ch}`)
    this.pos++
  }

  private expr(): number { return this.addSub() }

  private addSub(): number {
    let v = this.mulDiv()
    for (;;) {
      const c = this.peek()
      if (c === '+') { this.pos++; v += this.mulDiv() }
      else if (c === '-') { this.pos++; v -= this.mulDiv() }
      else break
    }
    return v
  }

  private mulDiv(): number {
    let v = this.power()
    for (;;) {
      const c = this.peek()
      if (c === '*') { this.pos++; v *= this.power() }
      else if (c === '/') { this.pos++; v /= this.power() }
      else break
    }
    return v
  }

  private power(): number {
    const b = this.unary()
    if (this.peek() === '^') { this.pos++; return Math.pow(b, this.unary()) }
    return b
  }

  private unary(): number {
    const c = this.peek()
    if (c === '-') { this.pos++; return -this.unary() }
    if (c === '+') { this.pos++; return this.unary() }
    return this.atom()
  }

  private atom(): number {
    const c = this.peek()
    if (!c) throw new Error('Fin inesperado')
    if (c === '(') {
      this.pos++
      const v = this.expr()
      this.eat(')')
      return v
    }
    if (c >= '0' && c <= '9' || c === '.') {
      let n = ''
      while (/[\d.]/.test(this.s[this.pos] ?? '')) n += this.s[this.pos++]
      return parseFloat(n)
    }
    if (/[a-z_]/i.test(c)) {
      let name = ''
      while (/\w/.test(this.s[this.pos] ?? '')) name += this.s[this.pos++]
      if (name in this.vars) return this.vars[name]
      if (name in this.fns) {
        this.eat('(')
        const arg = this.expr()
        this.eat(')')
        return this.fns[name](arg)
      }
      throw new Error(`Desconocido: ${name}`)
    }
    throw new Error(`Inesperado: ${c}`)
  }
}

const MATH_FNS: Record<string, (x: number) => number> = {
  sin:  x => Math.sin(x * DEG),
  cos:  x => Math.cos(x * DEG),
  tg:   x => Math.tan(x * DEG),
  tan:  x => Math.tan(x * DEG),
  ln:   x => Math.log(x),
  log:  x => Math.log10(x),
  sqrt: x => Math.sqrt(x),
  abs:  x => Math.abs(x),
}

function evalExpr(display: string, ans: number): string {
  const s = display
    .replace(/×/g, '*').replace(/÷/g, '/')
    .replace(/−/g, '-').replace(/π/g, 'pi')
    .replace(/√\(/g, 'sqrt(').trim()
  if (!s) return ''
  try {
    const v = new MathParser(s, { pi: Math.PI, e: Math.E, ans }, MATH_FNS).parse()
    if (!Number.isFinite(v) || Number.isNaN(v)) return 'Error'
    if (v === Math.trunc(v) && Math.abs(v) < 1e14) return String(Math.trunc(v))
    return parseFloat(v.toPrecision(12)).toString()
  } catch {
    return 'Error'
  }
}

// ─── Icons ────────────────────────────────────────────────────────────────

function IconBoxSup({ sup }: { sup: string }) {
  return (
    <span className="relative inline-flex items-end gap-px">
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="mb-px">
        <rect x="1" y="1" width="11" height="11" rx="1.5"
          stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 2" />
      </svg>
      <span className="text-[9px] font-bold leading-none" style={{ marginBottom: 8 }}>{sup}</span>
    </span>
  )
}

function IconSqrt() {
  return (
    <svg width="26" height="18" viewBox="0 0 26 18" fill="none">
      <path d="M1 10 L4.5 16 L9 1.5 H15"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="15" y1="1.5" x2="25" y2="1.5"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="15.5" y="4.5" width="9" height="9" rx="1.2"
        stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 1.5" />
    </svg>
  )
}

function IconFraction() {
  return (
    <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
      <rect x="1" y="1" width="16" height="8" rx="1.2"
        stroke="currentColor" strokeWidth="1.3" strokeDasharray="2.5 1.5" />
      <rect x="1" y="11" width="16" height="2" rx="1" fill="currentColor" />
      <rect x="1" y="15" width="16" height="6" rx="1.2"
        stroke="currentColor" strokeWidth="1.3" strokeDasharray="2.5 1.5" />
    </svg>
  )
}

function IconTable() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
      {([0, 1] as const).flatMap(r =>
        ([0, 1, 2] as const).map(c => (
          <rect key={`${r}${c}`}
            x={1 + c * 6.5} y={1 + r * 6}
            width="5.5" height="5" rx="0.8"
            stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 1.5" />
        ))
      )}
    </svg>
  )
}

function IconCellSel() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="0.8"
        fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="1" width="6" height="6" rx="0.8"
        stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 1.5" />
      <rect x="1" y="9" width="6" height="6" rx="0.8"
        stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 1.5" />
      <rect x="9" y="9" width="6" height="6" rx="0.8"
        stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 1.5" />
    </svg>
  )
}

function IconBackspace() {
  return (
    <svg width="24" height="17" viewBox="0 0 24 17" fill="none">
      <path d="M9.5 1H22.5C23.05 1 23.5 1.45 23.5 2V15C23.5 15.55 23.05 16 22.5 16H9.5L1.5 8.5L9.5 1Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 5.5L19.5 11.5M19.5 5.5L14 11.5"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconArrowL() {
  return (
    <svg width="9" height="15" viewBox="0 0 9 15" fill="none">
      <path d="M7.5 1.5L2 7.5L7.5 13.5"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconArrowR() {
  return (
    <svg width="9" height="15" viewBox="0 0 9 15" fill="none">
      <path d="M1.5 1.5L7 7.5L1.5 13.5"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconEnter() {
  return (
    <svg width="21" height="16" viewBox="0 0 21 16" fill="none">
      <path d="M19.5 2V7C19.5 8.1 18.6 9 17.5 9H2"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5.5 5L1.5 9L5.5 13"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Key types & layout ───────────────────────────────────────────────────
type KeyVariant = 'white' | 'gray'
type KeyAction =
  | { type: 'insert'; text: string }
  | { type: 'backspace' }
  | { type: 'enter' }
  | { type: 'arrowLeft' }
  | { type: 'arrowRight' }

interface KeyDef {
  id: string
  label: ReactNode
  action: KeyAction
  variant?: KeyVariant
  disabled?: boolean
}

// Each row: 4 scientific keys | 5 numeric/operator keys
const ROWS: KeyDef[][] = [
  [
    { id: 'sq2',   label: <IconBoxSup sup="2" />,   action: { type: 'insert', text: '^2' } },
    { id: 'sqn',   label: <IconBoxSup sup="n" />,   action: { type: 'insert', text: '^' } },
    { id: 'sqinv', label: <IconBoxSup sup="⁻¹" />,  action: { type: 'insert', text: '^(-1)' } },
    { id: 'sqrt',  label: <IconSqrt />,             action: { type: 'insert', text: '√(' } },
    { id: '7',     label: '7',                      action: { type: 'insert', text: '7' } },
    { id: '8',     label: '8',                      action: { type: 'insert', text: '8' } },
    { id: '9',     label: '9',                      action: { type: 'insert', text: '9' } },
    { id: 'mul',   label: '×',                      action: { type: 'insert', text: '×' } },
    { id: 'div',   label: '÷',                      action: { type: 'insert', text: '÷' } },
  ],
  [
    { id: 'sin',   label: 'sen',                    action: { type: 'insert', text: 'sin(' } },
    { id: 'cos',   label: 'cos',                    action: { type: 'insert', text: 'cos(' } },
    { id: 'tg',    label: 'tg',                     action: { type: 'insert', text: 'tg(' } },
    { id: 'pi',    label: 'π',                      action: { type: 'insert', text: 'π' } },
    { id: '4',     label: '4',                      action: { type: 'insert', text: '4' } },
    { id: '5',     label: '5',                      action: { type: 'insert', text: '5' } },
    { id: '6',     label: '6',                      action: { type: 'insert', text: '6' } },
    { id: 'plus',  label: '+',                      action: { type: 'insert', text: '+' } },
    { id: 'minus', label: '−',                      action: { type: 'insert', text: '-' } },
  ],
  [
    { id: 'ln',    label: 'ln',                     action: { type: 'insert', text: 'ln(' } },
    { id: 'log',   label: <span className="text-[11px] leading-none">log<sub>10</sub></span>, action: { type: 'insert', text: 'log(' } },
    { id: 'mat22', label: <IconFraction />,         action: { type: 'insert', text: '' }, disabled: true },
    { id: 'mat23', label: <IconTable />,             action: { type: 'insert', text: '' }, disabled: true },
    { id: '1',     label: '1',                      action: { type: 'insert', text: '1' } },
    { id: '2',     label: '2',                      action: { type: 'insert', text: '2' } },
    { id: '3',     label: '3',                      action: { type: 'insert', text: '3' } },
    { id: 'csel',  label: <IconCellSel />,          action: { type: 'insert', text: '' }, variant: 'gray', disabled: true },
    { id: 'back',  label: <IconBackspace />,        action: { type: 'backspace' },         variant: 'gray' },
  ],
  [
    { id: 'ans',   label: 'ans',                    action: { type: 'insert', text: 'ans' }, variant: 'gray' },
    { id: 'comma', label: ',',                      action: { type: 'insert', text: ',' } },
    { id: 'lpar',  label: '(',                      action: { type: 'insert', text: '(' } },
    { id: 'rpar',  label: ')',                      action: { type: 'insert', text: ')' } },
    { id: '0',     label: '0',                      action: { type: 'insert', text: '0' } },
    { id: 'dot',   label: '.',                      action: { type: 'insert', text: '.' } },
    { id: 'arrl',  label: <IconArrowL />,           action: { type: 'arrowLeft' },           variant: 'gray' },
    { id: 'arrr',  label: <IconArrowR />,           action: { type: 'arrowRight' },          variant: 'gray' },
    { id: 'enter', label: <IconEnter />,            action: { type: 'enter' },               variant: 'gray' },
  ],
]

// ─── Component ────────────────────────────────────────────────────────────
interface HistoryLine { id: number; expr: string; result: string }
interface CalcState { expr: string; cursor: number }
type KbTab = '123' | 'f(x)' | 'ABC'

interface Props {
  isExamMode?: boolean
  onKeyboardVisibilityChange?: (v: boolean) => void
}

export function CustomCalculator({ isExamMode = false, onKeyboardVisibilityChange }: Props) {
  const [tab, setTab] = useState<KbTab>('123')
  const [kbOpen, setKbOpen] = useState(true)
  const [{ expr, cursor }, setCalc] = useState<CalcState>({ expr: '', cursor: 0 })
  const [history, setHistory] = useState<HistoryLine[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(1)
  // Refs so the memoized handler always reads fresh values without re-creating
  const stateRef = useRef({ expr: '', cursor: 0, ans: 0 })

  function toggleKb(v: boolean) {
    setKbOpen(v)
    onKeyboardVisibilityChange?.(v)
  }

  const handleAction = useCallback((action: KeyAction) => {
    if (action.type === 'enter') {
      const { expr: e, ans } = stateRef.current
      if (!e.trim()) return
      const result = evalExpr(e, ans)
      const id = nextId.current++
      if (result !== 'Error') {
        const n = parseFloat(result)
        if (!isNaN(n)) stateRef.current.ans = n
      }
      stateRef.current.expr = ''
      stateRef.current.cursor = 0
      setHistory(h => [...h, { id, expr: e, result }])
      setCalc({ expr: '', cursor: 0 })
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
      })
      return
    }

    setCalc(prev => {
      const { expr: e, cursor: c } = prev
      let next: CalcState
      switch (action.type) {
        case 'insert': {
          if (!action.text) return prev
          next = { expr: e.slice(0, c) + action.text + e.slice(c), cursor: c + action.text.length }
          break
        }
        case 'backspace':
          if (!c) return prev
          next = { expr: e.slice(0, c - 1) + e.slice(c), cursor: c - 1 }
          break
        case 'arrowLeft':
          next = { expr: e, cursor: Math.max(0, c - 1) }
          break
        case 'arrowRight':
          next = { expr: e, cursor: Math.min(e.length, c + 1) }
          break
        default:
          return prev
      }
      stateRef.current.expr = next.expr
      stateRef.current.cursor = next.cursor
      return next
    })
  }, []) // safe — reads/writes stateRef only

  // ── Theming ──────────────────────────────────────────────────────────────
  const kbBg      = isExamMode ? 'bg-[#138A7E]' : 'bg-[#C8C8CE]'
  const pillOn    = isExamMode ? 'bg-white text-[#138A7E]' : 'bg-[#6C63FF] text-white'
  const pillOff   = isExamMode ? 'text-white/80' : 'text-[#3C3C43]'
  const closeCol  = isExamMode ? 'text-white/80' : 'text-[#3C3C43]'
  const keyWhite  = isExamMode ? 'bg-[#1aA896] text-white' : 'bg-white text-[#1C1C1E]'
  const keyGray   = isExamMode ? 'bg-[#0D7A6F] text-white' : 'bg-[#D1D0D7] text-[#1C1C1E]'

  const currentId = nextId.current

  // Live result — recomputed on every expr change
  const liveResult = (() => {
    if (!expr.trim()) return ''
    const r = evalExpr(expr, stateRef.current.ans)
    return r === 'Error' ? '' : r
  })()

  return (
    <div className="flex flex-col h-full select-none">

      {/* ── Input / History area ──────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 bg-[#F3F3F6] overflow-y-auto"
      >
        <div className="pt-2 pb-6">

          {/* History */}
          {history.map(line => (
            <div key={line.id}>
              <div className="flex items-start gap-2 px-4 py-3">
                <span className="text-[#9E9E9E] text-[15px] w-8 shrink-0 tabular-nums mt-px">{line.id})</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] text-[#212121] leading-normal break-all">
                    {line.expr.replace(/×/g, ' · ').replace(/÷/g, ' ÷ ')}
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-[#9E9E9E] text-[15px]">=</span>
                    <span className={`text-[15px] ${line.result === 'Error' ? 'text-red-500' : 'text-[#212121]'}`}>
                      {line.result}
                    </span>
                  </div>
                </div>
                <button className="p-1 -mr-1 text-[#BBBBC4] shrink-0" aria-label="Opciones">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <div className="h-px bg-[#E0E0E6] mx-4" />
            </div>
          ))}

          {/* Active line with inline blinking cursor */}
          <div className="flex items-baseline gap-2 px-4 pt-3">
            <span className="text-[#9E9E9E] text-[15px] w-8 shrink-0 tabular-nums">{currentId})</span>
            <div className="flex-1">
              <div
                className="flex flex-wrap items-center min-h-7 text-[15px] text-[#212121] font-light leading-snug cursor-text"
                onClick={() => !kbOpen && toggleKb(true)}
              >
                <span className="whitespace-pre-wrap break-all">{expr.slice(0, cursor)}</span>
                <span className="inline-block w-0.5 h-5 bg-[#6C63FF] cursor-blink align-middle mx-px shrink-0" />
                <span className="whitespace-pre-wrap break-all">{expr.slice(cursor)}</span>
              </div>
              {liveResult !== '' && (
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-[#9E9E9E] text-[15px]">=</span>
                  <span className="text-[#212121] text-[15px]">{liveResult}</span>
                </div>
              )}
              <div className="h-px bg-[#E0E0E0] mt-1" />
            </div>
          </div>

        </div>
      </div>

      {/* ── Keyboard ─────────────────────────────────────────────────── */}
      {kbOpen && (
        <div
          className={`shrink-0 ${kbBg} transition-colors duration-300`}
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {/* Tab bar */}
          <div className="flex items-center px-3 pt-2 pb-1.5">
            {(['123', 'f(x)', 'ABC'] as const).map(t => (
              <button
                key={t}
                onPointerDown={e => { e.preventDefault(); setTab(t) }}
                className={`mr-3 px-4 py-1.5 rounded-full text-[14px] font-medium transition-colors ${
                  tab === t ? pillOn : pillOff
                }`}
              >
                {t}
              </button>
            ))}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); toggleKb(false) }}
              className={`ml-auto p-1.5 active:opacity-60 ${closeCol}`}
              aria-label="Cerrar teclado"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 4 scientific keys | gap | 5 numeric keys per row */}
          <div className="flex flex-col gap-1.25 px-1.25 pb-1.25">
            {ROWS.map((row, ri) => (
              <div key={ri} className="flex gap-1.25">
                <div className="grid grid-cols-4 gap-1.25" style={{ flex: 4 }}>
                  {row.slice(0, 4).map(key => (
                    <CalcKey key={key.id} def={key} onAction={handleAction}
                      white={keyWhite} gray={keyGray} />
                  ))}
                </div>
                <div className="w-1.25 shrink-0" />
                <div className="grid grid-cols-5 gap-1.25" style={{ flex: 5 }}>
                  {row.slice(4).map(key => (
                    <CalcKey key={key.id} def={key} onAction={handleAction}
                      white={keyWhite} gray={keyGray} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Key button ───────────────────────────────────────────────────────────
function CalcKey({
  def, onAction, white, gray,
}: {
  def: KeyDef
  onAction: (a: KeyAction) => void
  white: string
  gray: string
}) {
  return (
    <button
      onPointerDown={e => { e.preventDefault(); if (!def.disabled) onAction(def.action) }}
      disabled={def.disabled}
      className={`
        h-13 rounded-xl flex items-center justify-center
        text-[15px] font-medium
        shadow-[0_1px_0px_rgba(0,0,0,0.3)]
        active:opacity-60 touch-none transition-opacity
        disabled:opacity-40
        ${def.variant === 'gray' ? gray : white}
      `}
    >
      {def.label}
    </button>
  )
}

