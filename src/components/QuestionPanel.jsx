export default function QuestionPanel({ question, keyIndex, lastFeedback, showKeySequence = true }) {
  if (!question) return null

  const isMulti = question.chars && question.chars.length > 1
  const activeCharIndex = question.chars.findIndex((_, index) => {
    const previousKeys = question.chars
      .slice(0, index)
      .reduce((total, char) => total + char.keys.length, 0)
    return keyIndex >= previousKeys && keyIndex < previousKeys + question.chars[index].keys.length
  })

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
        <span className="question-progress">
          第 {Math.max(1, activeCharIndex + 1)} / {question.chars.length} 字
        </span>
      </div>

      <div className="question-main">
        {isMulti ? (
          <>
            <div className="syllables-row">
              {question.chars.map((ch, ci) => {
                const range = charKeyRanges[ci]
                const isActive = keyIndex >= range.start && keyIndex <= range.end
                const isDone = keyIndex > range.end
                let cls = 'syllable-unit'
                if (isDone) cls += ' done'
                if (isActive) cls += ' active'
                return (
                  <span key={ci} className={cls}>
                    <span className="pinyin-unit">{ch.pinyin}</span>
                    <span className="char-unit">{ch.char}</span>
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

      {showKeySequence && <div className="key-sequence">
        <span className="key-sequence-label">按键序列</span>
        <div className="keys-row">
          {question.keys.map((k, i) => {
          let cls = 'key-chip'
          if (i < keyIndex) cls += ' done'
          else if (i === keyIndex) cls += ' active'

          let fb = ''
          if (lastFeedback && i === lastFeedback.keyIndex) {
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
      </div>}
    </div>
  )
}
