'use client'

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'

export interface GeoGebraFrameRef {
  reload: () => void
}

interface GeoGebraFrameProps {
  isHacked?: boolean
}

const IFRAME_TOP_CROP = 110
const IFRAME_BOTTOM_CROP = 0
const IFRAME_TRANSLATE_Y = 8
const IFRAME_SCALE_Y = 1.02

export const GeoGebraFrame = forwardRef<GeoGebraFrameRef, GeoGebraFrameProps>(
  function GeoGebraFrame({ isHacked = false }, ref) {
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
        // Flash red effect
        const timer = setTimeout(() => {
          console.warn('[EXAM HACK] Modo examen comprometido - bypass detectado')
        }, 100)
        return () => clearTimeout(timer)
      }
    }, [isHacked])

      return (
      <div className={`relative w-full h-full overflow-hidden transition-all duration-300 ${
        isHacked ? 'ring-4 ring-red-500 ring-inset' : ''
      }`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-app-bg z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-primary-violet border-t-transparent rounded-full animate-spin" />
              <span className="text-text-secondary text-sm">Cargando calculadora...</span>
            </div>
          </div>
        )}
        
        {/* Hack overlay */}
        {isHacked && (
          <div className="absolute top-2 right-2 z-20 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">
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
            height: `calc(100% + ${IFRAME_TOP_CROP + IFRAME_BOTTOM_CROP}px)`,
            transform: `scaleY(${IFRAME_SCALE_Y})`,
            transformOrigin: 'top center'
          }}
          title="GeoGebra Calculadora Científica"
          allow="clipboard-write"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    )
  }
)
