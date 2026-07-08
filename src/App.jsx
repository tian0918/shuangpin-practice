import { useEffect, useCallback, useState } from 'react'
import useGameLogic from './hooks/useGameLogic'
import BreathLight from './components/BreathLight'
import QuestionPanel from './components/QuestionPanel'
import StatsPanel from './components/StatsPanel'
import VirtualKeyboard from './components/VirtualKeyboard'
import ResultModal from './components/ResultModal'
import './App.css'

function getInitialTheme() {
  try { return localStorage.getItem('shuangpin-theme') || 'dark' } catch { return 'dark' }
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('shuangpin-theme', theme) } catch {}
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }, [])

  const {
    question, keyIndex, correctCount, errorCount,
    accuracy, speed, elapsed, level, levelLabel,
    levelProgress, levelMax, lastFeedback, isFlashing,
    handleKey, restart, paused, finished, finish, dismissResult, errorRecords,
  } = useGameLogic()

  const onKeyDown = useCallback((e) => {
    if (e.repeat || finished) return
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
          <h1 className="app-title">小鹤双拼练习</h1>
          <span className="app-subtitle">双拼模式</span>
          <div className="header-right">
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️ 浅色' : '🌙 深色'}
            </button>
          </div>
        </header>
        <ResultModal
          correctCount={correctCount}
          errorCount={errorCount}
          accuracy={accuracy}
          speed={speed}
          elapsed={elapsed}
          level={level}
          levelLabel={levelLabel}
          levelProgress={levelProgress}
          levelMax={levelMax}
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
        <h1 className="app-title">小鹤双拼练习</h1>
        <span className="app-subtitle">双拼模式</span>
        <div className="header-right">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ 浅色' : '🌙 深色'}
          </button>
        </div>
      </header>

      <BreathLight accuracy={accuracy} speed={speed} isFlashing={isFlashing} theme={theme} />

      <main className="app-main">
        <section className="center-section">
          <div className="top-area">
            <QuestionPanel
              question={question}
              keyIndex={keyIndex}
              charIndex={0}
              lastFeedback={lastFeedback}
              paused={paused}
            />
            <StatsPanel
              correctCount={correctCount}
              errorCount={errorCount}
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

          <VirtualKeyboard
            question={question}
            keyIndex={keyIndex}
            lastFeedback={lastFeedback}
            onKeyClick={handleKey}
            paused={paused}
          />
        </section>
      </main>
    </div>
  )
}
