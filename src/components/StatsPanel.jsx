export default function StatsPanel({
  correctCount, errorCount, accuracy, speed,
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
      <div className="stats-header">统计</div>

      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">正确</span>
          <span className="stat-value correct">{correctCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">错误</span>
          <span className="stat-value error">{errorCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">正确率</span>
          <span className="stat-value">
            <span className="stat-num">{accuracy}</span>
            <span className="stat-unit">%</span>
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">速度</span>
          <span className="stat-value">
            <span className="stat-num">{speed}</span>
            <span className="stat-unit">字/分</span>
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">用时</span>
          <span className="stat-value">{fmtTime(elapsed)}</span>
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

      <button className="restart-btn" onClick={onFinish}>
        结束本局
      </button>
      <button className="restart-btn secondary" onClick={onRestart}>
        重新开始
      </button>
    </div>
  )
}
