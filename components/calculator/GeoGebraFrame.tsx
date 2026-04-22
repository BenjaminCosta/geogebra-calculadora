'use client'

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'

export interface GeoGebraFrameRef {
  reload: () => void
}

interface GeoGebraFrameProps {
  isHacked?: boolean
  bottomCrop?: number
}

const IFRAME_TOP_CROP = 100
const IFRAME_TRANSLATE_Y = 0

export const GeoGebraFrame = forwardRef<GeoGebraFrameRef, GeoGebraFrameProps>(
  function GeoGebraFrame({ isHacked = false, bottomCrop = 0 }, ref) {
    const [isLoading, setIsLoading] = useState(true)
    const [key, setKey] = useState(0)
    const iframeRef = useRef<HTMLIFrameElement>(null)

    useImperativeHandle(ref, () => ({
      reload: () => {
        setIsLoading(true)
        setKey(prev => prev + 1)
      }
    }))

    useEffect(() => {
      if (isHacked) {
        const timer = setTimeout(() => {
          console.warn('[EXAM HACK] Modo examen comprometido - bypass detectado')
        }, 100)
        return () => clearTimeout(timer)
      }
    }, [isHacked])

    return (
      <div
        className={`relative h-full w-full overflow-hidden transition-all duration-300 ${
          isHacked ? 'ring-4 ring-red-500 ring-inset' : ''
        }`}
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-app-bg">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-violet border-t-transparent" />
              <span className="text-sm text-text-secondary">Cargando calculadora...</span>
            </div>
          </div>
        )}

        {isHacked && (
          <div className="absolute right-2 top-2 z-20 rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white animate-pulse">
            BYPASS ACTIVO
          </div>
        )}

        <iframe
          key={key}
          ref={iframeRef}
          src="https://www.geogebra.org/scientific?embed=true&showMenuBar=false&showFullscreenButton=false"
          className={`absolute left-0 w-full border-0 bg-white ${isHacked ? 'opacity-90' : ''}`}
          style={{
            top: `-${IFRAME_TOP_CROP - IFRAME_TRANSLATE_Y}px`,
            height: `calc(100% + ${IFRAME_TOP_CROP + bottomCrop}px)`,
          }}
          title="GeoGebra Calculadora Científica"
          allow="clipboard-write"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    )
  }
)
