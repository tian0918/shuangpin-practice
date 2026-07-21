import { useEffect, useCallback, useRef, useState } from 'react'
import useGameLogic from './hooks/useGameLogic'
import BreathLight from './components/BreathLight'
import QuestionPanel from './components/QuestionPanel'
import StatsPanel from './components/StatsPanel'
import VirtualKeyboard from './components/VirtualKeyboard'
import ResultModal from './components/ResultModal'
import SettingsMenu from './components/SettingsMenu'
import { INPUT_MODES } from './utils/inputMode'
import './App.css'

function getInitialTheme() {
  try { return localStorage.getItem('shuangpin-theme') || 'dark' } catch { return 'dark' }
}

const DEFAULT_SETTINGS = {
  inputMode: INPUT_MODES.SHUANGPIN,
  breathLight: true,
  showVirtualKeyboard: true,
  showKeySequence: true,
}

function getInitialSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('shuangpin-settings'))
    return { ...DEFAULT_SETTINGS, ...saved }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme)
  const [settings, setSettings] = useState(getInitialSettings)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('shuangpin-theme', theme) } catch {}
  }, [theme])

  useEffect(() => {
    try { localStorage.setItem('shuangpin-settings', JSON.stringify(settings)) } catch {}
  }, [settings])

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }, [])

  const updateSetting = useCallback((name, value) => {
    setSettings(current => ({ ...current, [name]: value }))
  }, [])

  const {
    question, keyIndex, correctCount, errorCount, completedQuestions, completedChars,
    accuracy, speed, elapsed, level, levelLabel,
    levelProgress, levelMax, lastFeedback, isFlashing,
    handleKey, restart, finished, finish, dismissResult, errorRecords,
  } = useGameLogic(settings.inputMode)

  const previousInputModeRef = useRef(settings.inputMode)
  useEffect(() => {
    if (previousInputModeRef.current === settings.inputMode) return
    previousInputModeRef.current = settings.inputMode
    restart()
  }, [settings.inputMode, restart])

  const isFullPinyin = settings.inputMode === INPUT_MODES.FULL_PINYIN
  const title = isFullPinyin ? '全拼练习' : '小鹤双拼练习'
  const modeLabel = isFullPinyin ? '全拼模式' : '双拼模式'

  const onKeyDown = useCallback((e) => {
    if (e.repeat || finished) return
    if (e.target instanceof Element && e.target.closest('button, input')) return
    const key = e.key.toLowerCase()
    if (key.length === 1 && /^[a-z;,'\.\/\[\] ]$/.test(key)) {
      e.preventDefault()
      handleKey(key)
    }
  }, [handleKey, finished])

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  if (finished) {
    return (
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">{title}</h1>
          <span className="app-subtitle">{modeLabel}</span>
          <div className="header-right">
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️ 浅色' : '🌙 深色'}
            </button>
            <SettingsMenu settings={settings} onChange={updateSetting} />
          </div>
        </header>
        <ResultModal
          correctCount={correctCount}
          errorCount={errorCount}
          completedQuestions={completedQuestions}
          completedChars={completedChars}
          accuracy={accuracy}
          speed={speed}
          elapsed={elapsed}
          level={level}
          levelLabel={levelLabel}
          errorRecords={errorRecords}
          onRestart={restart}
          onDismiss={dismissResult}
        />
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">{title}</h1>
        <span className="app-subtitle">{modeLabel}</span>
        <div className="header-right">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ 浅色' : '🌙 深色'}
          </button>
          <SettingsMenu settings={settings} onChange={updateSetting} />
        </div>
      </header>

      {settings.breathLight && (
        <BreathLight accuracy={accuracy} speed={speed} isFlashing={isFlashing} theme={theme} />
      )}

      <main className="app-main">
        <section className="center-section">
          <div className="top-area">
            <QuestionPanel
              question={question}
              keyIndex={keyIndex}
              lastFeedback={lastFeedback}
              showKeySequence={settings.showKeySequence}
            />
            <StatsPanel
              correctCount={correctCount}
              errorCount={errorCount}
              completedQuestions={completedQuestions}
              completedChars={completedChars}
              accuracy={accuracy}
              speed={speed}
              elapsed={elapsed}
              level={level}
              levelLabel={levelLabel}
              levelProgress={levelProgress}
              levelMax={levelMax}
              onRestart={restart}
              onFinish={finish}
            />
          </div>

          {settings.showVirtualKeyboard && (
            <VirtualKeyboard
              inputMode={settings.inputMode}
              question={question}
              keyIndex={keyIndex}
              lastFeedback={lastFeedback}
              onKeyClick={handleKey}
            />
          )}
        </section>
      </main>
    </div>
  )
}
