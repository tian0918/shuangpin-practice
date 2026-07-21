export default function StatsPanel({
  correctCount, errorCount, completedQuestions, completedChars, accuracy, speed,
  elapsed, level, levelLabel, levelProgress, levelMax,
  onRestart, onFinish,
}) {
  const fmtTime = (ms) => {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  const levelPct = levelMax === Infinity ? 100 : Math.min(100, Math.round((levelProgress / levelMax) * 100))

  return (
    <div className="stats-panel">
      <div className="stats-header">本局表现</div>

      <div className="stats-primary">
        <div className="primary-stat">
          <span className="stat-label">正确率</span>
          <span className="primary-stat-value">{accuracy}<small>%</small></span>
        </div>
        <div className="primary-stat speed-stat">
          <span className="stat-label">速度</span>
          <span className="primary-stat-value">{speed}<small>字/分</small></span>
        </div>
      </div>

      <div className="stats-grid stats-secondary">
        <div className="stat-item">
          <span className="stat-label">完成题数</span>
          <span className="stat-value">{completedQuestions}<small> 题</small></span>
        </div>
        <div className="stat-item">
          <span className="stat-label">完成字数</span>
          <span className="stat-value">{completedChars}<small> 字</small></span>
        </div>
        <div className="stat-item">
          <span className="stat-label">用时</span>
          <span className="stat-value">{fmtTime(elapsed)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">按键</span>
          <span className="stat-value keystroke-summary">
            <span className="correct">{correctCount}</span>
            <span className="stat-divider"> / </span>
            <span className="error">{errorCount}</span>
          </span>
        </div>
      </div>

      <div className="level-section">
        <div className="level-header">
          <span className="level-badge">{levelLabel}</span>
          <span className="level-label">Lv.{level}</span>
        </div>
        {levelMax < Infinity && (
          <div className="level-bar-container">
            <div className="level-bar" style={{ width: `${levelPct}%` }} />
            <span className="level-bar-text">{levelProgress}/{levelMax}</span>
          </div>
        )}
      </div>

      <div className="stats-actions">
        <button className="restart-btn" onClick={onFinish}>
          结束本局
        </button>
        <button className="restart-btn secondary" onClick={onRestart}>
          重新开始
        </button>
      </div>
    </div>
  )
}
