import { KEYBOARD_ROWS } from '../data/xiaoheMapping'

export default function VirtualKeyboard({ question, keyIndex, lastFeedback, onKeyClick, paused }) {
  const expectedKey = question?.keys?.[keyIndex]?.toLowerCase()

  const getKeyClass = (k) => {
    let cls = 'vk-key'
    if (k.disabled) cls += ' disabled'
    if (k.punct) cls += ' vk-punct'
    if (k.wide) cls += ' vk-wide'
    if (paused) return cls

    if (lastFeedback) {
      const lowerK = k.key
      if (lastFeedback.status === 'correct' && lowerK === lastFeedback.key.toLowerCase()) {
        cls += ' feedback-correct'
      }
      if (lastFeedback.status === 'wrong' && lowerK === lastFeedback.pressed?.toLowerCase()) {
        cls += ' feedback-wrong'
      }
    }

    if (expectedKey && k.key === expectedKey && !lastFeedback && !k.punct) {
      cls += ' target'
    }

    if (question && question.keys.includes(k.key) && !lastFeedback && !k.punct) {
      const idx = question.keys.indexOf(k.key)
      if (idx < keyIndex) cls += ' used'
    }

    return cls
  }

  const handleClick = (k) => {
    if (k.disabled || paused) return
    onKeyClick(k.key)
  }

  return (
    <div className="virtual-keyboard">
      {KEYBOARD_ROWS.map((row, ri) => (
        <div className={`vk-row ${ri === 3 ? 'vk-row-space' : ''}`} key={ri}>
          {row.map((k) => (
            <button
              key={k.key}
              className={getKeyClass(k)}
              onClick={() => handleClick(k)}
            >
              <span className="vk-key-top">{k.labelTop}</span>
              {k.labelBottom && !k.wide && (
                <span className="vk-key-bottom">{k.labelBottom}</span>
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
