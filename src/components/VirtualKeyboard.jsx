import { KEYBOARD_ROWS } from '../data/xiaoheMapping'
import FingeringGuide from './FingeringGuide'

export default function VirtualKeyboard({ inputMode = 'shuangpin', question, keyIndex, lastFeedback, onKeyClick }) {
  const isFullPinyin = inputMode === 'fullPinyin'
  const expectedKey = question?.keys?.[keyIndex]?.toLowerCase()
  const isExpectedKeyLetter = /^[a-z]$/.test(expectedKey || '')

  const getKeyClass = (k) => {
    let cls = 'vk-key'
    if (k.disabled) cls += ' disabled'
    if (k.punct) cls += ' vk-punct'
    if (k.wide) cls += ' vk-wide'
    if (lastFeedback) {
      const lowerK = k.key
      if (lastFeedback.status === 'correct' && lowerK === lastFeedback.key.toLowerCase()) {
        cls += ' feedback-correct'
      }
      if (lastFeedback.status === 'wrong' && lowerK === lastFeedback.pressed?.toLowerCase()) {
        cls += ' feedback-wrong'
      }
    }

    if (expectedKey && k.key === expectedKey) {
      cls += ' target'
    }

    if (question && k.key !== expectedKey && question.keys.slice(0, keyIndex).includes(k.key)) {
      cls += ' used'
    }

    return cls
  }

  const handleClick = (k) => {
    if (k.disabled) return
    onKeyClick(k.key)
  }

  return (
    <div className="virtual-keyboard">
      <div className="keyboard-header">
        <div>
          <span className="keyboard-title">{isFullPinyin ? '全拼键盘' : '小鹤键位'}</span>
          <span className="keyboard-hint">
            {isFullPinyin ? '按完整拼音顺序输入' : '键帽下方为韵母'}
          </span>
        </div>
        <span className="keyboard-target-label">
          目标键 <strong>
            <span>{expectedKey?.toUpperCase() || '—'}</span>
            {isExpectedKeyLetter && (
              <span className="keyboard-target-lowercase">{expectedKey}</span>
            )}
          </strong>
        </span>
      </div>
      <FingeringGuide
        activeKey={expectedKey}
        animationKey={`${question?.content || 'loading'}-${keyIndex}`}
      />
      <div className="keyboard-scroll">
        <div className="keyboard-layout">
          {KEYBOARD_ROWS.map((row, ri) => (
            <div className={`vk-row ${ri === 3 ? 'vk-row-space' : ''}`} key={ri}>
              {row.map((k) => (
                <button
                  type="button"
                  aria-label={/^[a-z]$/.test(k.key)
                    ? `按键 ${k.labelTop}，小写 ${k.key}`
                    : `按键 ${k.labelTop}`}
                  key={k.key}
                  className={getKeyClass(k)}
                  onClick={() => handleClick(k)}
                >
                  <span className="vk-key-top">
                    <span>{k.labelTop}</span>
                    {/^[a-z]$/.test(k.key) && (
                      <span className="vk-key-lowercase">{k.key}</span>
                    )}
                  </span>
                  {!isFullPinyin && k.labelBottom && !k.wide && (
                    <span className="vk-key-bottom">{k.labelBottom}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
