'use client'

import { Calculator, Table } from 'lucide-react'

type Tab = 'algebra' | 'tabla'

interface BottomNavigationProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  disabled?: boolean
  isExamMode?: boolean
}

export function BottomNavigation({
  activeTab,
  onTabChange,
  disabled = false,
  isExamMode = false,
}: BottomNavigationProps) {
  return (
    <nav
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.5rem)',
      }}
      className={`relative z-30 shrink-0 flex min-h-16 items-center justify-around pt-2 transition-colors duration-300 ${
        isExamMode ? 'bg-header-teal' : 'bg-white border-t border-border'
      }`}
    >
      <button
        onClick={() => !disabled && onTabChange('algebra')}
        disabled={disabled}
        className={`flex flex-col items-center gap-1 px-6 py-1 transition-colors ${
          disabled ? 'cursor-not-allowed' : ''
        } ${
          activeTab === 'algebra'
            ? isExamMode ? 'text-white' : 'text-primary-violet'
            : isExamMode ? 'text-white/60' : 'text-text-muted'
        }`}
        aria-label="Álgebra"
      >
        <Calculator className="w-6 h-6" />
        <span className="text-xs font-medium">Álgebra</span>
      </button>

      <button
        onClick={() => !disabled && onTabChange('tabla')}
        disabled={disabled}
        className={`flex flex-col items-center gap-1 px-6 py-1 transition-colors ${
          disabled ? 'cursor-not-allowed' : ''
        } ${
          activeTab === 'tabla'
            ? isExamMode ? 'text-white' : 'text-primary-violet'
            : isExamMode ? 'text-white/60' : 'text-text-muted'
        }`}
        aria-label="Tabla"
      >
        <Table className="w-6 h-6" />
        <span className="text-xs font-medium">Tabla</span>
      </button>
    </nav>
  )
}
