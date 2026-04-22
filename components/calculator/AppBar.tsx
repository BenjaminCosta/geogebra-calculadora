'use client'

import { useRef } from 'react'
import { Menu, Settings, Lock, LockOpen } from 'lucide-react'

interface AppBarProps {
  onMenuClick: () => void
  onSettingsClick: () => void
  onLockToggle?: () => void
  isExamMode?: boolean
  examTime?: string
  onTimerClick?: () => void
  isHacked?: boolean
  isScreenLocked?: boolean
}

export function AppBar({
  onMenuClick,
  onSettingsClick,
  onLockToggle,
  isExamMode = false,
  examTime = '00:00',
  onTimerClick,
  isHacked = false,
  isScreenLocked = false,
}: AppBarProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)

  const handleMenuPointerDown = () => {
    didLongPress.current = false
    if (isExamMode && onLockToggle) {
      longPressTimer.current = setTimeout(() => {
        didLongPress.current = true
        longPressTimer.current = null
        onLockToggle()
      }, 700)
    }
  }

  const handleMenuPointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    if (!didLongPress.current) {
      onMenuClick()
    }
  }

  const handleMenuPointerLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  return (
    <header
      className={`flex items-center justify-between px-4 py-3 shadow-sm transition-colors duration-300 ${
        isHacked ? 'bg-red-600' : isExamMode ? 'bg-header-teal' : 'bg-white'
      }`}
    >
      <button
        onPointerDown={handleMenuPointerDown}
        onPointerUp={handleMenuPointerUp}
        onPointerLeave={handleMenuPointerLeave}
        className={`p-2 -ml-2 rounded-full transition-colors select-none ${
          isExamMode
            ? 'hover:bg-white/10 active:bg-white/20'
            : 'hover:bg-gray-100 active:bg-gray-200'
        }`}
        aria-label="Abrir menú"
      >
        <Menu className={`w-6 h-6 ${isExamMode ? 'text-white' : 'text-icon-gray'}`} />
      </button>

      {/* Exam Timer Display */}
      {isExamMode && (
        <button
          onClick={onTimerClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
          aria-label="Contador de examen"
        >
          {isScreenLocked ? (
            <Lock className="w-4 h-4 text-white" />
          ) : (
            <LockOpen className="w-4 h-4 text-white/60" />
          )}
          <span className="text-white font-medium text-lg font-mono tracking-wider">
            {examTime}
          </span>
        </button>
      )}

      <button
        onClick={onSettingsClick}
        disabled={isExamMode}
        className={`p-2 -mr-2 rounded-full transition-colors ${
          isExamMode
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-100 active:bg-gray-200'
        }`}
        aria-label="Configuración"
      >
        <Settings className={`w-6 h-6 ${isExamMode ? 'text-white' : 'text-icon-gray'}`} />
      </button>
    </header>
  )
}
