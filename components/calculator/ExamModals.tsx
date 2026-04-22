'use client'

import { useState, useEffect } from 'react'

interface StartExamModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function StartExamModal({ isOpen, onClose, onConfirm }: StartExamModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="start-exam-title"
      >
        {/* Header */}
        <div className="bg-header-teal px-6 py-4">
          <h2 id="start-exam-title" className="text-white text-lg font-medium">
            Preparar Modo Examen
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-text-primary leading-relaxed">
            Se borrarán todos los cálculos actuales. ¿Deseas continuar?
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-text-secondary font-medium hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-lg bg-primary-violet text-white font-medium hover:bg-primary-violet-dark transition-colors"
          >
            Comenzar Examen
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Security Setup Modal ────────────────────────────────────────────────────

interface SecuritySetupModalProps {
  isOpen: boolean
  onConfirm: () => void
  onSkip: () => void
}

type Platform = 'android' | 'ios' | 'other'

const PLATFORM_CONTENT: Record<Platform, { title: string; steps: string[] }> = {
  android: {
    title: 'Anclar pantalla en Android',
    steps: [
      'Ajustes → Seguridad → Fijar pantalla (o "Anclado de pantalla")',
      'Activá la función y habilitá "Pedir PIN para desanclar"',
      'Presioná el botón de Recientes (cuadrado)',
      'Tocá el ícono de esta app en la card → "Fijar"',
    ],
  },
  ios: {
    title: 'Acceso Guiado en iOS',
    steps: [
      'Ajustes → Accesibilidad → Acceso Guiado',
      'Activá "Acceso Guiado" y configurá un código',
      'Volvé a esta app',
      'Triple clic en botón lateral (o inicio) → tocá "Iniciar"',
    ],
  },
  other: {
    title: 'Pantalla completa',
    steps: [
      'Presioná F11 (o el botón de pantalla completa del navegador)',
      'Mantené esta ventana en primer plano durante el examen',
    ],
  },
}

export function SecuritySetupModal({ isOpen, onConfirm, onSkip }: SecuritySetupModalProps) {
  const [platform, setPlatform] = useState<Platform>('other')

  useEffect(() => {
    const ua = navigator.userAgent
    if (/android/i.test(ua)) setPlatform('android')
    else if (/ipad|iphone|ipod/i.test(ua)) setPlatform('ios')
    else setPlatform('other')
  }, [])

  if (!isOpen) return null

  const content = PLATFORM_CONTENT[platform]

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="security-setup-title"
      >
        {/* Header */}
        <div className="bg-header-teal px-6 py-4">
          <p className="text-white/80 text-xs mb-0.5">Paso de seguridad</p>
          <h2 id="security-setup-title" className="text-white text-lg font-medium">
            {content.title}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-text-secondary text-sm mb-4">
            Para que el examen sea seguro, anclá la pantalla ahora:
          </p>
          <ol className="space-y-3">
            {content.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-text-primary leading-snug">
                <span className="shrink-0 w-6 h-6 rounded-full bg-header-teal text-white text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex justify-end gap-3">
          <button
            onClick={onSkip}
            className="px-5 py-2 rounded-lg text-text-secondary font-medium hover:bg-gray-100 transition-colors"
          >
            Omitir
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-lg bg-primary-violet text-white font-medium hover:bg-primary-violet-dark transition-colors"
          >
            Ya lo activé
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Return To Exam Modal ────────────────────────────────────────────────────

interface ReturnToExamModalProps {
  isOpen: boolean
  onReturn: () => void
}

export function ReturnToExamModal({ isOpen, onReturn }: ReturnToExamModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="return-exam-title"
      >
        {/* Header */}
        <div className="bg-orange-500 px-6 py-4">
          <h2 id="return-exam-title" className="text-white text-lg font-medium">
            ¡Saliste del examen!
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-text-primary leading-relaxed">
            Se registró una salida de pantalla completa. Volvé al examen inmediatamente.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex justify-end">
          <button
            onClick={onReturn}
            className="px-6 py-2.5 rounded-full bg-primary-violet text-white font-medium hover:bg-primary-violet-dark transition-colors"
          >
            Volver al examen
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Exit Exam Modal ─────────────────────────────────────────────────────────

interface ExitExamModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ExitExamModal({ isOpen, onClose, onConfirm }: ExitExamModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-exam-title"
      >
        {/* Body - simple centered text */}
        <div className="px-6 py-6">
          <p id="exit-exam-title" className="text-text-primary text-base leading-relaxed">
            ¿Estás seguro que quieres salir del modo Examen?
          </p>
        </div>

        {/* Footer - matching screenshot: Cancela (text) + Salir (purple pill) */}
        <div className="px-6 pb-6 flex justify-center items-center gap-6">
          <button
            onClick={onClose}
            className="text-text-secondary font-medium hover:text-text-primary transition-colors"
          >
            Cancela
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 rounded-full bg-primary-violet text-white font-medium hover:bg-primary-violet-dark transition-colors"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Exam Details Modal ──────────────────────────────────────────────────────

interface ExamDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  duration: string
  date: string
  startTime: string
  endTime: string
  wasHacked?: boolean
  fullscreenExits?: number
  visibilityWarnings?: number
}

export function ExamDetailsModal({
  isOpen,
  onClose,
  duration,
  date,
  startTime,
  endTime,
  wasHacked = false,
  fullscreenExits = 0,
  visibilityWarnings = 0,
}: ExamDetailsModalProps) {
  if (!isOpen) return null

  const isCompromised = wasHacked || fullscreenExits > 0

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exam-details-title"
      >
        {/* Header */}
        <div className={`px-5 py-4 ${isCompromised ? 'bg-red-500' : 'bg-header-teal'}`}>
          <p className="text-white/90 text-sm">GeoGebra Calc. Científica</p>
          <h2 id="exam-details-title" className="text-white text-xl font-bold">
            Examen: {isCompromised ? 'COMPROMETIDO' : 'OK'}
          </h2>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          <p className="text-text-primary text-base mb-5">
            Muestra esta pantalla a tu profesor
          </p>

          <div className="mb-3">
            <p className="text-text-secondary text-sm">Duración</p>
            <p className="text-text-primary text-lg font-medium">{duration}</p>
          </div>

          <div className="mb-3">
            <p className="text-text-secondary text-sm">Fecha</p>
            <p className="text-text-primary text-lg font-medium">{date}</p>
          </div>

          <div className="mb-3">
            <p className="text-text-secondary text-sm">Hora de inicio</p>
            <p className="text-text-primary text-lg font-medium">{startTime}</p>
          </div>

          <div className="mb-3">
            <p className="text-text-secondary text-sm">Hora de finalización</p>
            <p className="text-text-primary text-lg font-medium">{endTime}</p>
          </div>

          {/* Security events */}
          {(fullscreenExits > 0 || visibilityWarnings > 0 || wasHacked) && (
            <div className="mt-4 pt-3 border-t border-border space-y-1.5">
              {wasHacked && (
                <p className="text-red-500 text-sm font-medium">
                  ⚠ Bypass detectado ({wasHacked ? 1 : 0} vez)
                </p>
              )}
              {fullscreenExits > 0 && (
                <p className="text-red-500 text-sm font-medium">
                  ⚠ Salidas de pantalla completa: {fullscreenExits}
                </p>
              )}
              {visibilityWarnings > 0 && (
                <p className="text-orange-500 text-sm font-medium">
                  ⚠ Cambios de app detectados: {visibilityWarnings}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-2.5 rounded-full bg-primary-violet text-white font-medium hover:bg-primary-violet-dark transition-colors"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  )
}
