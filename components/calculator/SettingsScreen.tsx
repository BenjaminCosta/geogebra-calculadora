'use client'

import { ArrowLeft } from 'lucide-react'

interface SettingsScreenProps {
  onBack: () => void
}

const settingsItems = [
  { title: 'Idioma', value: 'Spanish / Español' },
  { title: 'Redondeo', value: '13 cifras decimales' },
  { title: 'Unidad angular', value: 'Grados' },
  { title: 'Tamaño de letra', value: '16 pt' },
]

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  return (
    <div className="flex flex-col h-dvh bg-[#F5F5F5]">
      <header className="relative flex items-center justify-center px-6 py-4">
        <button
          onClick={onBack}
          className="absolute left-6 w-11 h-11 rounded-full bg-[#EDEDED] flex items-center justify-center"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>

        <h1 className="text-2xl leading-none font-medium text-text-primary">General</h1>
      </header>

      <main className="px-8 pt-5">
        {settingsItems.map((item) => (
          <section key={item.title} className="mb-9">
            <h2 className="text-[16px] font-normal leading-tight text-text-primary">{item.title}</h2>
            <p className="mt-1 text-[14px] leading-tight text-text-secondary">{item.value}</p>
          </section>
        ))}
      </main>
    </div>
  )
}
