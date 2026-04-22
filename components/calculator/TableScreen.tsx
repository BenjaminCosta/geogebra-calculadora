'use client'

import { Fragment, useState, useRef, useEffect } from 'react'
import { MoreVertical, Maximize2, Minimize2 } from 'lucide-react'

const xValues = [-2, -1, 0, 1, 2]

export function TableScreen() {
  const [notes, setNotes] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const tablaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  useEffect(() => {
    const el = tablaRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.intersectionRatio > 0.4) textareaRef.current?.blur() },
      { threshold: 0.4 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-white">

      {/* PAGE 1: Tabla */}
      <div ref={tablaRef} className="min-h-full flex flex-col">
      <div className="border-b border-[#ECECF1] px-6 py-4">
        <h2 className="text-[14px] font-semibold text-primary-violet">
          Definir funciones
        </h2>
      </div>

        <div className="flex-1 bg-white">
          <div className="grid grid-cols-3 border-l border-r border-[#E4E4EA]">
            <div className="flex items-center justify-center gap-1 border-b border-r border-[#DCDCE3] bg-[#EFEEF8] px-2 py-4">
              <span className="text-[16px] font-medium text-[#212121]">x</span>
              <MoreVertical className="h-4 w-4 text-[#6A6A73]" strokeWidth={2.2} />
            </div>
            <div className="flex items-center justify-center border-b border-r border-[#DCDCE3] bg-[#EFEEF8] px-2 py-4">
              <span className="text-[16px] font-medium text-[#212121]">f(x)</span>
            </div>
            <div className="flex items-center justify-center border-b border-[#DCDCE3] bg-[#EFEEF8] px-2 py-4">
              <span className="text-[16px] font-medium text-[#212121]">g(x)</span>
            </div>

            {xValues.map((value) => (
              <Fragment key={value}>
                <div className="flex items-center justify-center border-b border-r border-[#E4E4EA] bg-white px-2 py-3.5">
                  <span className="text-[15px] font-normal text-[#212121]">{value}</span>
                </div>
                <div className="border-b border-r border-[#E4E4EA] bg-white" />
                <div className="border-b border-[#E4E4EA] bg-white" />
              </Fragment>
            ))}

            <div className="h-12 border-r border-[#E4E4EA] bg-white" />
            <div className="h-12 border-r border-[#E4E4EA] bg-white" />
            <div className="h-12 bg-white" />
          </div>
        </div>

      </div>

      {/* PAGE 2: Procedimiento */}
      <div className="min-h-full flex flex-col border-t-[3px] border-[#ECECF1]">
        <div className="border-b border-[#ECECF1] px-6 py-4 flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-primary-violet">
            Procedimiento
          </h2>
          <button
            onPointerDown={e => { e.preventDefault(); toggleFullscreen() }}
            className="p-1 text-[#6A6A73] active:text-primary-violet"
            aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen
              ? <Minimize2 className="w-4 h-4" strokeWidth={2} />
              : <Maximize2 className="w-4 h-4" strokeWidth={2} />
            }
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Escribe aquí tus procedimientos… Ej: sin(30) = 0.5"
          className="flex-1 w-full min-h-[60dvh] px-6 py-4 text-[15px] text-[#212121] placeholder:text-[#C7C7CC] bg-white resize-none outline-none font-sans leading-[1.75]"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
      </div>

    </div>
  )
}
