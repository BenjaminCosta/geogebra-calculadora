'use client'

import { X, Trash2, Clock, SlidersHorizontal, HelpCircle, FileText, Unlock } from 'lucide-react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  onClearAll: () => void
  onExam: () => void
  onExitExam?: () => void
  onExamRegistry?: () => void
  onProperties: () => void
  onHelp: () => void
  isExamMode?: boolean
}

export function Drawer({ 
  isOpen, 
  onClose, 
  onClearAll, 
  onExam,
  onExitExam,
  onExamRegistry,
  onProperties, 
  onHelp,
  isExamMode = false
}: DrawerProps) {
  // Normal mode menu items
  const normalMenuItems = [
    { id: 'clear', icon: Trash2, label: 'Borrar todo', action: onClearAll },
    { id: 'exam', icon: Clock, label: 'Examen', action: onExam },
    { id: 'properties', icon: SlidersHorizontal, label: 'Propiedades', action: onProperties },
    { id: 'help', icon: HelpCircle, label: 'Ayuda & Comentarios', action: onHelp },
  ]

  // Exam mode menu items - matching the screenshot exactly
  const examMenuItems = [
    { id: 'clear', icon: X, label: 'Borrar todo', action: onClearAll },
    { id: 'exam-registry', icon: FileText, label: 'Registro de Examen', action: onExamRegistry },
    { id: 'exit-exam', icon: Unlock, label: 'Abandonar modo Examen', action: onExitExam },
  ]

  const menuItems = isExamMode ? examMenuItems : normalMenuItems

  const handleItemClick = (action: (() => void) | undefined) => {
    if (!action) return
    action()
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-4/5 max-w-xs bg-white z-50 shadow-xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        {/* Header - always white with title */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-border bg-white">
          <h2 className="text-lg font-medium text-text-primary">
            GeoGebra Calc. Científica
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full transition-colors hover:bg-gray-100"
            aria-label="Cerrar menú"
          >
              <X className="w-5 h-5 text-icon-gray" />
          </button>
        </div>

        {/* Menu items */}
        <nav className="py-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.action)}
              className="flex items-center gap-4 w-full px-4 py-3.5 transition-colors hover:bg-gray-100 active:bg-gray-200"
            >
              <item.icon className="w-6 h-6 text-icon-gray" />
              <span className="font-normal text-text-primary">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  )
}
