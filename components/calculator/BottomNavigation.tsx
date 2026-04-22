'use client'

import { Calculator, Table } from 'lucide-react'

type Tab = 'algebra' | 'tabla'

interface BottomNavigationProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  disabled?: boolean
  isExamMode?: boolean
  isHidden?: boolean
}

export function BottomNavigation({
  activeTab,
  onTabChange,
  disabled = false,
  isExamMode = false,
  isHidden = false,
}: BottomNavigationProps) {
  return (
    <nav
      aria-hidden={isHidden}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      className={`shrink-0 transition-colors duration-300 ${
        isHidden ? 'hidden' : ''
      } ${
        isExamMode ? 'bg-header-teal' : 'bg-white border-t border-border'
      }`}
    >
      <div className="h-14 flex items-center justify-around">
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
      </div>
    </nav>
  )
}
