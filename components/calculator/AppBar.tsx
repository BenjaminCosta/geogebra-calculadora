'use client'

import { useRef } from 'react'
import { Menu, Settings } from 'lucide-react'

interface AppBarProps {
  onMenuClick: () => void
  onSettingsClick: () => void
  onLockToggle?: () => void
  isExamMode?: boolean
}

export function AppBar({
  onMenuClick,
  onSettingsClick,
  onLockToggle,
  isExamMode = false,
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
  }

  const handleMenuClick = () => {
    if (!didLongPress.current) {
      onMenuClick()
    }
    didLongPress.current = false
  }

  const handleMenuPointerLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  return (
    <header
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
      className="flex items-center justify-between px-4 py-3 bg-white shadow-sm"
    >
      <button
        onPointerDown={handleMenuPointerDown}
        onPointerUp={handleMenuPointerUp}
        onPointerLeave={handleMenuPointerLeave}
        onClick={handleMenuClick}
        className="p-2 -ml-2 rounded-full transition-colors select-none hover:bg-gray-100 active:bg-gray-200"
        aria-label="Abrir menú"
      >
        <Menu className="w-6 h-6 text-icon-gray" />
      </button>

      <button
        onClick={onSettingsClick}
        className="p-2 -mr-2 rounded-full transition-colors hover:bg-gray-100 active:bg-gray-200"
        aria-label="Configuración"
      >
        <Settings className="w-6 h-6 text-icon-gray" />
      </button>
    </header>
  )
}
