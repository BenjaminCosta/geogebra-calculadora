'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { AppBar } from '@/components/calculator/AppBar'
import { Drawer } from '@/components/calculator/Drawer'
import type { GeoGebraFrameRef } from '@/components/calculator/GeoGebraFrame'
import { CustomCalculator } from '@/components/calculator/CustomCalculator'
import {
  StartExamModal,
  SecuritySetupModal,
  ExitExamModal,
  ExamDetailsModal,
} from '@/components/calculator/ExamModals'
import { BottomNavigation } from '@/components/calculator/BottomNavigation'
import { TableScreen } from '@/components/calculator/TableScreen'
import { SettingsScreen } from '@/components/calculator/SettingsScreen'
import { SplashScreen } from '@/components/calculator/SplashScreen'

type NavigationTab = 'algebra' | 'tabla'
type Screen = 'calculator' | 'settings'
const GEOGEBRA_HELP_URL = 'https://help.geogebra.org/hc/en-us'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTimeOfDay(date: Date): string {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export default function CalculatorPage() {
  // Navigation state
  const [activeNavTab, setActiveNavTab] = useState<NavigationTab>('algebra')
  const [activeScreen, setActiveScreen] = useState<Screen>('calculator')

  // Modal/Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Exam Mode state
  const [isExamMode, setIsExamMode] = useState(false)
  const [isScreenLocked, setIsScreenLocked] = useState(false)
  const [examSeconds, setExamSeconds] = useState(0)
  const [examStartTime, setExamStartTime] = useState<Date | null>(null)

  // Refs to avoid stale closures in event listeners
  const isExamModeRef = useRef(isExamMode)
  const isScreenLockedRef = useRef(isScreenLocked)
  useEffect(() => {
    isExamModeRef.current = isExamMode
    isScreenLockedRef.current = isScreenLocked
  }, [isExamMode, isScreenLocked])

  // Modal states
  const [showStartExamModal, setShowStartExamModal] = useState(false)
  const [showSecuritySetupModal, setShowSecuritySetupModal] = useState(false)
  const [showExitExamModal, setShowExitExamModal] = useState(false)
  const [showExamDetailsModal, setShowExamDetailsModal] = useState(false)
  const [examEndTime, setExamEndTime] = useState<Date | null>(null)

  // Keyboard visibility (hides JSX bottom nav while calc keyboard is open)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(true)

  // GeoGebra ref (kept null-safe for exam mode reload handlers)
  const geogebraRef = useRef<GeoGebraFrameRef>(null)

  // ── Dynamic theme-color (status bar nativo Android) ────────────────────────
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', isExamMode ? '#138A7E' : '#6C63FF')
    }
  }, [isExamMode])

  // ── Dynamic body bg — covers iOS safe-area gap at bottom ──────────────────
  // html/body always extend to physical screen edges on iOS.
  // By matching their bg to whatever element sits at the bottom,
  // any safe-area gap becomes invisible — no env() needed.
  useEffect(() => {
    const isKbShowing = activeScreen === 'calculator' && activeNavTab === 'algebra' && isKeyboardVisible
    const color = isKbShowing
      ? '#f3f2f7'
      : isExamMode ? '#138A7E' : '#ffffff'
    document.documentElement.style.backgroundColor = color
    document.body.style.backgroundColor = color
  }, [activeScreen, activeNavTab, isKeyboardVisible, isExamMode])

  // ── Exam timer ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isExamMode) return
    const interval = setInterval(() => setExamSeconds(prev => prev + 1), 1000)
    return () => clearInterval(interval)
  }, [isExamMode])

  // ── Back button trap ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isExamMode || !isScreenLocked) return
    history.pushState(null, '', window.location.href)
    const handler = () => {
      if (isExamModeRef.current && isScreenLockedRef.current) {
        history.pushState(null, '', window.location.href)
      }
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [isExamMode, isScreenLocked])

  // ── Wake Lock ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isExamMode || !isScreenLocked) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let wakeLock: any = null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(navigator as any).wakeLock?.request('screen')
      .then((wl: unknown) => { wakeLock = wl })
      .catch(() => {})
    return () => { wakeLock?.release() }
  }, [isExamMode, isScreenLocked])

  // ── Lock toggle (hidden: long press on ☰) ──────────────────────────────────
  const handleLockToggle = useCallback(() => {
    if (!isExamMode) return
    const newLocked = !isScreenLocked
    setIsScreenLocked(newLocked)
    if (newLocked) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
    }
  }, [isExamMode, isScreenLocked])

  // ── Exam flow ───────────────────────────────────────────────────────────────
  const handleStartExam = () => {
    setShowStartExamModal(false)
    setShowSecuritySetupModal(true)
  }

  const handleConfirmSecuritySetup = () => {
    setShowSecuritySetupModal(false)
    setIsExamMode(true)
    setIsScreenLocked(true)
    setExamSeconds(0)
    setExamStartTime(new Date())
    document.documentElement.requestFullscreen().catch(() => {})
    geogebraRef.current?.reload()
  }

  const handleEndExam = () => {
    setShowExitExamModal(false)
    setIsExamMode(false)
    setIsScreenLocked(false)
    setExamEndTime(new Date())
    setShowExamDetailsModal(true)
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }
  }

  const handleClearAll = () => {
    geogebraRef.current?.reload()
  }

  const handleExam = () => {
    setShowStartExamModal(true)
  }

  const handleExitExam = () => {
    setShowExitExamModal(true)
  }

  const handleExamRegistry = () => {
    if (isExamMode) {
      setExamEndTime(new Date())
      setShowExamDetailsModal(true)
    }
  }

  const handleProperties = () => {
    setIsDrawerOpen(false)
    setActiveScreen('settings')
  }

  const handleHelp = () => {
    window.open(GEOGEBRA_HELP_URL, '_blank', 'noopener,noreferrer')
  }

  const handleSettings = () => {
    setIsDrawerOpen(false)
    setActiveScreen('settings')
  }

  const handleCloseSettings = () => {
    setActiveScreen('calculator')
  }

  const handleTabChange = (tab: NavigationTab) => {
    setActiveNavTab(tab)
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-app-bg">
      <SplashScreen />
      {/* Status bar color overlay — shows through the translucent black status bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 pointer-events-none transition-colors duration-300 ${
          isExamMode ? 'bg-header-teal' : 'bg-white'
        }`}
        style={{ height: 'env(safe-area-inset-top)' }}
      />
      {activeScreen === 'settings' ? (
        <SettingsScreen onBack={handleCloseSettings} />
      ) : (
        <>
      <AppBar
        onMenuClick={() => setIsDrawerOpen(true)}
        onSettingsClick={handleSettings}
        onLockToggle={handleLockToggle}
        isExamMode={isExamMode}
      />

      {/* Main content — pb-14 reserves space for the fixed BottomNavigation */}
      {activeNavTab === 'algebra' ? (
        <main className={`flex-1 min-h-0 flex flex-col ${!isKeyboardVisible ? 'pb-14' : ''}`}>
          <CustomCalculator
            isExamMode={isExamMode}
            onKeyboardVisibilityChange={setIsKeyboardVisible}
          />
        </main>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col pb-14">
          <TableScreen />
        </div>
      )}

      <BottomNavigation
        activeTab={activeNavTab}
        onTabChange={handleTabChange}
        isExamMode={isExamMode}
        isHidden={activeNavTab === 'algebra' && isKeyboardVisible}
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onClearAll={handleClearAll}
        onExam={handleExam}
        onExitExam={handleExitExam}
        onExamRegistry={handleExamRegistry}
        onProperties={handleProperties}
        onHelp={handleHelp}
        isExamMode={isExamMode}
      />
        </>
      )}

      <StartExamModal
        isOpen={showStartExamModal}
        onClose={() => setShowStartExamModal(false)}
        onConfirm={handleStartExam}
      />

      <SecuritySetupModal
        isOpen={showSecuritySetupModal}
        onConfirm={handleConfirmSecuritySetup}
        onSkip={handleConfirmSecuritySetup}
      />

      <ExitExamModal
        isOpen={showExitExamModal}
        onClose={() => setShowExitExamModal(false)}
        onConfirm={handleEndExam}
      />

      <ExamDetailsModal
        isOpen={showExamDetailsModal}
        onClose={() => setShowExamDetailsModal(false)}
        duration={formatTime(examSeconds)}
        date={examStartTime ? formatDate(examStartTime) : ''}
        startTime={examStartTime ? formatTimeOfDay(examStartTime) : ''}
        endTime={examEndTime ? formatTimeOfDay(examEndTime) : ''}
      />
    </div>
  )
}
