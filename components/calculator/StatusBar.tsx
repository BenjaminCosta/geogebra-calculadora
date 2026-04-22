'use client'

import { Plane, BatteryMedium, BellOff } from 'lucide-react'

interface StatusBarProps {
  time?: string
  inverted?: boolean
}

export function StatusBar({ time = '9:55', inverted = false }: StatusBarProps) {
  return (
    <div
      className={`flex items-center justify-between px-5 h-14 ${
        inverted ? 'bg-[#F5F5F5]' : 'bg-[#9E9E9E]'
      }`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-2">
        <span
          className={`text-[20px] leading-none font-semibold ${
            inverted ? 'text-black' : 'text-white'
          }`}
        >
          {time}
        </span>
        <BellOff className={`w-5 h-5 ${inverted ? 'text-black' : 'text-white'}`} />
      </div>

      <div className="flex items-center gap-3">
        <Plane className={`w-5 h-5 ${inverted ? 'text-black' : 'text-white'}`} />
        <BatteryMedium className={`w-6 h-6 ${inverted ? 'text-black' : 'text-white'}`} />
      </div>
    </div>
  )
}
