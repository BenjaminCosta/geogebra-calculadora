'use client'

import Image from 'next/image'
import type { ReactNode } from 'react'
import { X, FileText } from 'lucide-react'

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
  type MenuItem = {
    id: string
    label: string
    action: (() => void) | undefined
    icon: ReactNode
  }

  // Normal mode menu items
  const normalMenuItems: MenuItem[] = [
    {
      id: 'clear',
      icon: <Image src="/icons/cross.svg" alt="Borrar todo" width={24} height={24} className="w-6 h-6" />,
      label: 'Borrar todo',
      action: onClearAll,
    },
    {
      id: 'exam',
      icon: <Image src="/icons/examen.svg" alt="Examen" width={24} height={24} className="w-6 h-6" />,
      label: 'Examen',
      action: onExam,
    },
    {
      id: 'properties',
      icon: <Image src="/icons/ajustes.svg" alt="Propiedades" width={24} height={24} className="w-6 h-6" />,
      label: 'Propiedades',
      action: onProperties,
    },
    {
      id: 'help',
      icon: <Image src="/icons/faq.svg" alt="Ayuda y comentarios" width={24} height={24} className="w-6 h-6" />,
      label: 'Ayuda & Comentarios',
      action: onHelp,
    },
  ]

  // Exam mode menu items - matching the screenshot exactly
  const examMenuItems: MenuItem[] = [
    { id: 'clear', icon: <X className="w-6 h-6 text-icon-gray" />, label: 'Borrar todo', action: onClearAll },
    { id: 'exam-registry', icon: <FileText className="w-6 h-6 text-icon-gray" />, label: 'Registro de Examen', action: onExamRegistry },
    { id: 'exit-exam', icon: <Image src="/icons/examen.svg" alt="Abandonar modo Examen" width={24} height={24} className="w-6 h-6" />, label: 'Abandonar modo Examen', action: onExitExam },
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
        className={`fixed top-0 bottom-0 left-0 w-4/5 max-w-xs bg-white z-50 shadow-xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        {/* Header - always white with title */}
        <div
          style={{
            paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)',
            paddingBottom: '0.75rem',
          }}
          className="flex items-center justify-between px-4 border-b border-border bg-white"
        >
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
              {item.icon}
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
