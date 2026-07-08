export default function ResultModal({
  correctCount, errorCount, accuracy, speed,
  elapsed, level, levelLabel, levelProgress, levelMax,
  errorRecords, onRestart, onDismiss,
}) {
  const fmtTime = (ms) => {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  const totalQ = correctCount + errorCount

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">练习结束</h2>

        <div className="modal-stats">
          <div className="modal-stat-row">
            <span className="modal-stat-label">完成题数</span>
            <span className="modal-stat-value">{totalQ}</span>
          </div>
          <div className="modal-stat-row">
            <span className="modal-stat-label">正确</span>
            <span className="modal-stat-value correct">{correctCount}</span>
          </div>
          <div className="modal-stat-row">
            <span className="modal-stat-label">错误</span>
            <span className="modal-stat-value error">{errorCount}</span>
          </div>
          <div className="modal-stat-row">
            <span className="modal-stat-label">正确率</span>
            <span className="modal-stat-value">{accuracy}%</span>
          </div>
          <div className="modal-stat-row">
            <span className="modal-stat-label">速度</span>
            <span className="modal-stat-value">{speed} 字/分</span>
          </div>
          <div className="modal-stat-row">
            <span className="modal-stat-label">用时</span>
            <span className="modal-stat-value">{fmtTime(elapsed)}</span>
          </div>
          <div className="modal-stat-row">
            <span className="modal-stat-label">最终等级</span>
            <span className="modal-stat-value">{levelLabel} Lv.{level}</span>
          </div>
        </div>

        {errorRecords.length > 0 && (
          <div className="modal-errors">
            <h3 className="modal-errors-title">错字记录 ({errorRecords.length})</h3>
            <div className="modal-errors-list">
              {errorRecords.map((rec, i) => (
                <div key={i} className="modal-error-item">
                  <span className="error-char">{rec.char}</span>
                  <span className="error-pinyin">{rec.pinyin}</span>
                  <span className="error-context">
                    {rec.content.length > 1 && (
                      <>{rec.content} · </>
                    )}
                    {rec.typeLabel || rec.type}
                  </span>
                  <span className="error-keys">
                    应为 {rec.expectedKey.toUpperCase()}
                  </span>
                  <span className="error-pressed">
                    按了 {rec.pressedKey.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button className="modal-btn modal-btn-secondary" onClick={onDismiss}>
            关闭
          </button>
          <button className="modal-btn" onClick={onRestart}>
            再来一局
          </button>
        </div>
      </div>
    </div>
  )
}
