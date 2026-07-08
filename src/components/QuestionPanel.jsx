export default function QuestionPanel({ question, keyIndex, charIndex, lastFeedback, paused }) {
  if (!question) return null

  const isMulti = question.chars && question.chars.length > 1

  let keyStart = 0
  const charKeyRanges = question.chars.map(ch => {
    const start = keyStart
    keyStart += ch.keys.length
    return { start, end: keyStart - 1 }
  })

  return (
    <div className="question-panel">
      <div className="question-header">
        <span className="type-badge">{question.typeLabel}</span>
      </div>

      <div className="question-main">
        {isMulti ? (
          <>
            <div className="chars-row">
              {question.chars.map((ch, ci) => {
                const range = charKeyRanges[ci]
                const isActive = keyIndex >= range.start && keyIndex <= range.end
                const isDone = keyIndex > range.end
                let cls = 'char-unit'
                if (isDone) cls += ' done'
                if (isActive && !paused) cls += ' active'
                if (isActive && paused) cls += ' error'
                return (
                  <span key={ci} className={cls}>
                    {ch.char}
                  </span>
                )
              })}
            </div>
            <div className="pinyins-row">
              {question.chars.map((ch, ci) => {
                const range = charKeyRanges[ci]
                const isActive = keyIndex >= range.start && keyIndex <= range.end
                return (
                  <span key={ci} className={`pinyin-unit ${isActive ? 'active-pinyin' : ''}`}>
                    {ch.pinyin}
                  </span>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <div className="pinyin-display">{question.pinyin}</div>
            <div className="char-display">{question.content}</div>
          </>
        )}
      </div>

      <div className="keys-row">
        {question.keys.map((k, i) => {
          let cls = 'key-chip'
          if (i < keyIndex) cls += ' done'
          else if (i === keyIndex && paused) cls += ' error'
          else if (i === keyIndex) cls += ' active'

          let fb = ''
          if (lastFeedback && i === keyIndex) {
            fb = lastFeedback.status === 'correct' ? ' correct' : ' wrong'
          }

          const ci = question.chars.findIndex((_, idx) => {
            const range = charKeyRanges[idx]
            return i >= range.start && i <= range.end
          })

          return (
            <span key={i} className={`${cls}${fb} char-group-${ci}`}>
              {k.toUpperCase()}
            </span>
          )
        })}
      </div>

      {paused && (
        <div className="error-hint">
          正确按键: {question.keys[keyIndex]?.toUpperCase()}
        </div>
      )}
    </div>
  )
}
