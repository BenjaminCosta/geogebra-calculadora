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
  asin: x => Math.asin(x) / DEG,
  acos: x => Math.acos(x) / DEG,
  atan: x => Math.atan(x) / DEG,
  ln:   x => Math.log(x),
  log:  x => Math.log10(x),
  sqrt: x => Math.sqrt(x),
  abs:  x => Math.abs(x),
  round: x => Math.round(x),
}

function evalExpr(display: string, ans: number): string {
  const s = display
    .replace(/×/g, '*').replace(/÷/g, '/')
    .replace(/−/g, '-').replace(/π/g, 'pi')
    .replace(/√\(/g, 'sqrt(')
    .replace(/%/g, '/100').trim()
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
    <img
      src="data:image/svg+xml;base64,PHN2ZyBpZD0iZnJhY3Rpb24iIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDI0IDI0Ij48dGl0bGU+ZnJhY3Rpb248L3RpdGxlPjxyZWN0IHg9IjciIHdpZHRoPSIyIiBoZWlnaHQ9IjIiLz48cmVjdCB4PSIxMSIgd2lkdGg9IjIiIGhlaWdodD0iMiIvPjxyZWN0IHg9IjE1IiB3aWR0aD0iMiIgaGVpZ2h0PSIyIi8+PHJlY3QgeD0iMTUiIHk9IjQiIHdpZHRoPSIyIiBoZWlnaHQ9IjIiLz48cmVjdCB4PSI3IiB5PSI0IiB3aWR0aD0iMiIgaGVpZ2h0PSIyIi8+PHJlY3QgeD0iNyIgeT0iOCIgd2lkdGg9IjIiIGhlaWdodD0iMiIvPjxyZWN0IHg9IjExIiB5PSI4IiB3aWR0aD0iMiIgaGVpZ2h0PSIyIi8+PHJlY3QgeD0iMTUiIHk9IjgiIHdpZHRoPSIyIiBoZWlnaHQ9IjIiLz48cmVjdCB4PSI3IiB5PSIxNCIgd2lkdGg9IjIiIGhlaWdodD0iMiIvPjxyZWN0IHg9IjExIiB5PSIxNCIgd2lkdGg9IjIiIGhlaWdodD0iMiIvPjxyZWN0IHg9IjE1IiB5PSIxNCIgd2lkdGg9IjIiIGhlaWdodD0iMiIvPjxyZWN0IHg9IjE1IiB5PSIxOCIgd2lkdGg9IjIiIGhlaWdodD0iMiIvPjxyZWN0IHg9IjciIHk9IjE4IiB3aWR0aD0iMiIgaGVpZ2h0PSIyIi8+PHJlY3QgeD0iNyIgeT0iMjIiIHdpZHRoPSIyIiBoZWlnaHQ9IjIiLz48cmVjdCB4PSIxMSIgeT0iMjIiIHdpZHRoPSIyIiBoZWlnaHQ9IjIiLz48cmVjdCB4PSIxNSIgeT0iMjIiIHdpZHRoPSIyIiBoZWlnaHQ9IjIiLz48cmVjdCB4PSI0IiB5PSIxMSIgd2lkdGg9IjE2IiBoZWlnaHQ9IjIiLz48L3N2Zz4="
      alt="Fracción"
      className="h-6 w-6 object-contain"
    />
  )
}

function IconTable() {
  return (
    <img
      src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSI+PGcgZmlsbD0iIzI1MjUyNSIgPjxwYXRoIGQ9Ik0xMyAyaDIuMDAxVi0uMDAxSDEzVjJabTQgMGgyVi0uMDAxaC0yVjJabTQgMGgyVi0uMDAxaC0yVjJabTAgNGgyVjRoLTJ2MlptLTggMGgyVjRoLTJ2MlptMCA0aDJWOGgtMnYyWm00IDBoMlY4aC0ydjJabTQgMGgyVjhoLTJ2MlptLTggNmgydi0yaC0ydjJabTQgMGgydi0yaC0ydjJabTQgMGgydi0yaC0ydjJabTAgNGgydi0yaC0ydjJabS04IDBoMnYtMmgtMnYyWm0wIDRoMi4wMDF2LTJIMTN2MlptNCAwaDJ2LTJoLTJ2MlptNCAwaDJ2LTJoLTJ2MlptLTktMTFoMTJ2LTJIMTJ2MlpNMCA5aDIuMDAxVjYuOTk5SDBWOVptNCAwaDJWNi45OTlINFY5Wm00IDBoMlY2Ljk5OUg4VjlabTAgNGgydi0ySDh2MlptLTggMGgydi0ySDB2MlptMCA0aDJ2LTJIMHYyWm00IDBoMnYtMkg0djJabTQgMGgydi0ySDh2MloiLz48L2c+PC9zdmc+"
      alt="Tabla"
      className="h-6 w-6 object-contain"
    />
  )
}

function IconCellSel() {
  return (
    <img
      src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iIzAwMCIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTkgNEg1djJoMTRWNFpNNSAxMC4wMDFoMlY4SDV2Mi4wMDFabTQgMGgydi0ySDl2MlptNiAwaC0ydi0yaDJ2MlptMiAwaDJ2LTJoLTJ2MlptLTEwIDRINXYtMmgydjJabTEwIDhoMi4wMDF2LTJIMTd2MlptMi00aC0ydi0yaDJ2MlptLTItNGgydi0yaC0ydjJabS0xMCA0SDVWMTZoMnYyLjAwMVptLTIgNGgydi0ySDV2MlptNi4wMDEgMEg5di0yaDIuMDAxdjJabTEuOTk5IDBoMnYtMmgtMnYyWiIgY2xpcC1ydWxlPSJldmVub2RkIi8+PC9zdmc+"
      alt="Selección"
      className="h-6 w-6 object-contain"
    />
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

// ─── Extra icons for f(x) and ABC tabs ─────────────────────────────────────
function IconAbsPipe() {
  return (
    <span className="inline-flex items-center gap-0.5">
      <span className="text-[13px] font-medium">|</span>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <rect x="0.75" y="0.75" width="8.5" height="8.5" rx="1"
          stroke="currentColor" strokeWidth="1.15" strokeDasharray="1.8 1.2"/>
      </svg>
      <span className="text-[13px] font-medium">|</span>
    </span>
  )
}

function IconEPow() {
  return (
    <span className="inline-flex items-baseline gap-px">
      <span className="text-[13px] font-medium italic">e</span>
      <svg width="9" height="9" viewBox="0 0 9 9" fill="none" style={{ marginBottom: 5 }}>
        <rect x="0.5" y="0.5" width="8" height="8" rx="1"
          stroke="currentColor" strokeWidth="1.1" strokeDasharray="1.8 1.2"/>
      </svg>
    </span>
  )
}

function Icon10Pow() {
  return (
    <span className="inline-flex items-baseline gap-px">
      <span className="text-[12px] font-medium">10</span>
      <svg width="9" height="9" viewBox="0 0 9 9" fill="none" style={{ marginBottom: 5 }}>
        <rect x="0.5" y="0.5" width="8" height="8" rx="1"
          stroke="currentColor" strokeWidth="1.1" strokeDasharray="1.8 1.2"/>
      </svg>
    </span>
  )
}

function IconNRoot() {
  return (
    <span className="inline-flex items-end gap-px">
      <span className="text-[9px] font-bold" style={{ marginBottom: 8 }}>n</span>
      <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
        <path d="M1 9 L3.5 13 L7 1.5 H12"
          stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="1.5" x2="19" y2="1.5"
          stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <rect x="12.5" y="4" width="6" height="6.5" rx="1"
          stroke="currentColor" strokeWidth="1.1" strokeDasharray="1.6 1.1"/>
      </svg>
    </span>
  )
}

function IconLogX() {
  return (
    <span className="inline-flex items-baseline gap-px">
      <span className="text-[11px] font-medium">log</span>
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ marginBottom: -2 }}>
        <rect x="0.5" y="0.5" width="7" height="7" rx="0.8"
          stroke="currentColor" strokeWidth="1.1" strokeDasharray="1.6 1.1"/>
      </svg>
    </span>
  )
}

function IconShift() {
  return (
    <svg width="16" height="15" viewBox="0 0 16 15" fill="none">
      <path d="M8 1.5L14.5 8H11V13.5H5V8H1.5L8 1.5Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}

function IconFxDots() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      {[0,1,2].flatMap(r => [0,1,2].map(c => (
        <rect key={r * 3 + c}
          x={0.5 + c * 5.25} y={0.5 + r * 5.25}
          width="4.25" height="4.25" rx="0.7"
          stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1"/>
      )))}
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
    { id: 'ekey',  label: <span className="italic">e</span>, action: { type: 'insert', text: 'e' } },
    { id: 'pct',   label: '%',                      action: { type: 'insert', text: '%' } },
    { id: '1',     label: '1',                      action: { type: 'insert', text: '1' } },
    { id: '2',     label: '2',                      action: { type: 'insert', text: '2' } },
    { id: '3',     label: '3',                      action: { type: 'insert', text: '3' } },
    { id: 'comma', label: ',',                      action: { type: 'insert', text: ',' } },
    { id: 'back',  label: <IconBackspace />,        action: { type: 'backspace' },         variant: 'gray' },
  ],
  [
    { id: 'ans',   label: 'ans',                    action: { type: 'insert', text: 'ans' }, variant: 'gray' },
    { id: 'pow',   label: '^',                      action: { type: 'insert', text: '^' } },
    { id: 'lpar',  label: '(',                      action: { type: 'insert', text: '(' } },
    { id: 'rpar',  label: ')',                      action: { type: 'insert', text: ')' } },
    { id: '0',     label: '0',                      action: { type: 'insert', text: '0' } },
    { id: 'dot',   label: '.',                      action: { type: 'insert', text: '.' } },
    { id: 'arrl',  label: <IconArrowL />,           action: { type: 'arrowLeft' },           variant: 'gray' },
    { id: 'arrr',  label: <IconArrowR />,           action: { type: 'arrowRight' },          variant: 'gray' },
    { id: 'enter', label: <IconEnter />,            action: { type: 'enter' },               variant: 'gray' },
  ],
]

// ─── f(x) tab rows (4 left | gap | 3 right) ──────────────────────────────
const ROWS_FX: KeyDef[][] = [
  [
    { id: 'fx-deg',   label: '°',                                                    action: { type: 'insert', text: '°' } },
    { id: 'fx-p1',    label: "'",                                                    action: { type: 'insert', text: "'" } },
    { id: 'fx-p2',    label: '"',                                                    action: { type: 'insert', text: '"' } },
    { id: 'fx-dots',  label: <IconFxDots />,                                         action: { type: 'insert', text: '' }, disabled: true },
    { id: 'fx-mean',  label: <span className="text-[11px]">mean</span>,              action: { type: 'insert', text: 'mean(' }, disabled: true },
    { id: 'fx-std',   label: <span className="text-[10px]">stdev</span>,             action: { type: 'insert', text: 'stdev(' }, disabled: true },
    { id: 'fx-stdp',  label: <span className="text-[9px]">stdevp</span>,             action: { type: 'insert', text: 'stdevp(' }, disabled: true },
  ],
  [
    { id: 'fx-asin',  label: <span className="text-[11px]">sen<sup>-1</sup></span>,  action: { type: 'insert', text: 'asin(' } },
    { id: 'fx-acos',  label: <span className="text-[11px]">cos<sup>-1</sup></span>,  action: { type: 'insert', text: 'acos(' } },
    { id: 'fx-atan',  label: <span className="text-[11px]">tg<sup>-1</sup></span>,   action: { type: 'insert', text: 'atan(' } },
    { id: 'fx-logx',  label: <IconLogX />,                                           action: { type: 'insert', text: 'log(' } },
    { id: 'fx-npr',   label: <span><sup>n</sup>P<sub>r</sub></span>,                 action: { type: 'insert', text: 'nPr(' }, disabled: true },
    { id: 'fx-ncr',   label: <span><sup>n</sup>C<sub>r</sub></span>,                 action: { type: 'insert', text: 'nCr(' }, disabled: true },
    { id: 'fx-fact',  label: '!',                                                    action: { type: 'insert', text: '!' } },
  ],
  [
    { id: 'fx-e',     label: 'e',             action: { type: 'insert', text: 'e' } },
    { id: 'fx-epow',  label: <IconEPow />,    action: { type: 'insert', text: 'e^(' } },
    { id: 'fx-10pow', label: <Icon10Pow />,   action: { type: 'insert', text: '10^(' } },
    { id: 'fx-nroot', label: <IconNRoot />,   action: { type: 'insert', text: 'sqrt(' } },
    { id: 'fx-rand',  label: <span className="text-[11px]">rand</span>,  action: { type: 'insert', text: 'rand()' }, disabled: true },
    { id: 'fx-rnd',   label: <span className="text-[11px]">round</span>, action: { type: 'insert', text: 'round(' } },
    { id: 'fx-mad',   label: <span className="text-[11px]">mad</span>,   action: { type: 'insert', text: 'mad(' }, disabled: true },
  ],
  [
    { id: 'fx-lcurl', label: '{',             action: { type: 'insert', text: '{' } },
    { id: 'fx-rcurl', label: '}',             action: { type: 'insert', text: '}' } },
    { id: 'fx-abs',   label: <IconAbsPipe />, action: { type: 'insert', text: 'abs(' } },
    { id: 'fx-pct',   label: '%',             action: { type: 'insert', text: '%' } },
    { id: 'fx-arrl',  label: <IconArrowL />,  action: { type: 'arrowLeft' },  variant: 'gray' },
    { id: 'fx-arrr',  label: <IconArrowR />,  action: { type: 'arrowRight' }, variant: 'gray' },
    { id: 'fx-entr',  label: <IconEnter />,   action: { type: 'enter' },      variant: 'gray' },
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
  const [caps, setCaps] = useState(false)

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
  const kbBg      = 'bg-[#f3f2f7]'
  const pillOn    = 'bg-[#6C63FF] text-[#1C1C1E]'
  const pillOff   = 'text-[#3C3C43]'
  const closeCol  = 'text-[#3C3C43]'
  const keyWhite  = 'bg-white text-[#1C1C1E]'
  const keyGray   = 'bg-[#d1d0d6] text-[#1C1C1E]'

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
        className="flex-1 min-h-0 bg-white overflow-y-auto"
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

          {/* 123 tab: 4 scientific | gap | 5 numeric */}
          {tab === '123' && (
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
          )}

          {/* f(x) tab: 4 scientific | gap | 3 function */}
          {tab === 'f(x)' && (
            <div className="flex flex-col gap-1.25 px-1.25 pb-1.25">
              {ROWS_FX.map((row, ri) => (
                <div key={ri} className="flex gap-1.25">
                  <div className="grid grid-cols-4 gap-1.25" style={{ flex: 4 }}>
                    {row.slice(0, 4).map(key => (
                      <CalcKey key={key.id} def={key} onAction={handleAction}
                        white={keyWhite} gray={keyGray} />
                    ))}
                  </div>
                  <div className="w-1.25 shrink-0" />
                  <div className="grid grid-cols-3 gap-1.25" style={{ flex: 3 }}>
                    {row.slice(4).map(key => (
                      <CalcKey key={key.id} def={key} onAction={handleAction}
                        white={keyWhite} gray={keyGray} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ABC tab */}
          {tab === 'ABC' && (
            <div className="flex flex-col gap-1.25 px-1.25 pb-1.25">
              {['abcdefghij', 'klmnopqrst'].map((letters, ri) => (
                <div key={ri} className="flex gap-1.25">
                  {letters.split('').map(ch => (
                    <button key={ch}
                      onPointerDown={e => { e.preventDefault(); handleAction({ type: 'insert', text: caps ? ch.toUpperCase() : ch }) }}
                      className={`flex-1 h-13 rounded-xl flex items-center justify-center text-[15px] font-medium shadow-[0_1px_0px_rgba(0,0,0,0.3)] active:opacity-60 touch-none ${keyWhite}`}>
                      {caps ? ch.toUpperCase() : ch}
                    </button>
                  ))}
                </div>
              ))}
              <div className="flex gap-1.25">
                {['u','v','w','x','y','z','´','ï','ñ','ü'].map(ch => (
                  <button key={ch}
                    onPointerDown={e => { e.preventDefault(); handleAction({ type: 'insert', text: caps ? ch.toUpperCase() : ch }) }}
                    className={`flex-1 h-13 rounded-xl flex items-center justify-center text-[15px] font-medium shadow-[0_1px_0px_rgba(0,0,0,0.3)] active:opacity-60 touch-none ${keyWhite}`}>
                    {caps ? ch.toUpperCase() : ch}
                  </button>
                ))}
                <button
                  onPointerDown={e => { e.preventDefault(); handleAction({ type: 'backspace' }) }}
                  className={`flex-1 h-13 rounded-xl flex items-center justify-center shadow-[0_1px_0px_rgba(0,0,0,0.3)] active:opacity-60 touch-none ${keyGray}`}>
                  <IconBackspace />
                </button>
              </div>
              <div className="flex gap-1.25">
                <button
                  onPointerDown={e => { e.preventDefault(); setCaps(c => !c) }}
                  className={`flex-1 h-13 rounded-xl flex items-center justify-center shadow-[0_1px_0px_rgba(0,0,0,0.3)] active:opacity-60 touch-none ${caps ? 'bg-[#6C63FF] text-white' : keyGray}`}>
                  <IconShift />
                </button>
                {['=', ',', "'"].map(ch => (
                  <button key={ch}
                    onPointerDown={e => { e.preventDefault(); handleAction({ type: 'insert', text: ch }) }}
                    className={`flex-1 h-13 rounded-xl flex items-center justify-center text-[15px] font-medium shadow-[0_1px_0px_rgba(0,0,0,0.3)] active:opacity-60 touch-none ${keyWhite}`}>
                    {ch}
                  </button>
                ))}
                <button
                  onPointerDown={e => { e.preventDefault(); handleAction({ type: 'insert', text: ' ' }) }}
                  className={`flex-3 h-13 rounded-xl shadow-[0_1px_0px_rgba(0,0,0,0.3)] active:opacity-60 touch-none ${keyWhite}`} />
                <button
                  onPointerDown={e => { e.preventDefault(); handleAction({ type: 'arrowLeft' }) }}
                  className={`flex-1 h-13 rounded-xl flex items-center justify-center shadow-[0_1px_0px_rgba(0,0,0,0.3)] active:opacity-60 touch-none ${keyGray}`}>
                  <IconArrowL />
                </button>
                <button
                  onPointerDown={e => { e.preventDefault(); handleAction({ type: 'arrowRight' }) }}
                  className={`flex-1 h-13 rounded-xl flex items-center justify-center shadow-[0_1px_0px_rgba(0,0,0,0.3)] active:opacity-60 touch-none ${keyGray}`}>
                  <IconArrowR />
                </button>
                <button
                  onPointerDown={e => { e.preventDefault(); handleAction({ type: 'enter' }) }}
                  className={`flex-1 h-13 rounded-xl flex items-center justify-center shadow-[0_1px_0px_rgba(0,0,0,0.3)] active:opacity-60 touch-none ${keyGray}`}>
                  <IconEnter />
                </button>
              </div>
            </div>
          )}
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
      className={`
        h-13 rounded-xl flex items-center justify-center
        text-[15px] font-medium
        shadow-[0_1px_0px_rgba(0,0,0,0.3)]
        active:opacity-60 touch-none transition-opacity
        ${def.variant === 'gray' ? gray : white}
      `}
    >
      {def.label}
    </button>
  )
}
