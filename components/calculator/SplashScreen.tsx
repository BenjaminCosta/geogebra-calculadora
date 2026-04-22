'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

export function SplashScreen() {
  const [fading, setFading] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 900)
    const removeTimer = setTimeout(() => setGone(true), 1400)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (gone) return null

  return (
    <div
      className={`fixed inset-0 z-999 flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <Image
        src="/icons/original_icon.webp"
        alt="Calculadora"
        width={120}
        height={120}
        className="mb-8"
        priority
      />
      <Image
        src="/icons/geo-icon.svg"
        alt="GeoGebra"
        width={210}
        height={60}
        priority
      />
    </div>
  )
}
