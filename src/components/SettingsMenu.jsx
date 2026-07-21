import { useEffect, useRef, useState } from 'react'
import { INPUT_MODES } from '../utils/inputMode'

const INPUT_MODE_OPTIONS = [
  { value: INPUT_MODES.SHUANGPIN, label: '小鹤双拼', description: '每个音节使用两个按键' },
  { value: INPUT_MODES.FULL_PINYIN, label: '全拼', description: '输入完整的无声调拼音' },
]

const OPTIONS = [
  { key: 'breathLight', label: '呼吸灯', description: '显示屏幕边缘的练习反馈' },
  { key: 'showVirtualKeyboard', label: '虚拟键盘', description: '显示主界面下方的按键提示' },
  { key: 'showKeySequence', label: '按键序列', description: '在题目下方显示完整按键' },
]

export default function SettingsMenu({ settings, onChange }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const closeOnOutsideClick = event => {
      if (!menuRef.current?.contains(event.target)) setOpen(false)
    }
    const closeOnEscape = event => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div className="settings-menu" ref={menuRef}>
      <button
        type="button"
        className={`settings-trigger ${open ? 'active' : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(value => !value)}
      >
        <span aria-hidden="true">⚙</span>
        <span>设置</span>
      </button>

      {open && (
        <div className="settings-popover" role="dialog" aria-label="练习设置">
          <div className="settings-popover-header">
            <strong>练习设置</strong>
            <span>自动保存</span>
          </div>
          <fieldset className="input-mode-setting">
            <legend>输入模式</legend>
            <div className="input-mode-options">
              {INPUT_MODE_OPTIONS.map(option => (
                <label
                  className={`input-mode-option ${settings.inputMode === option.value ? 'active' : ''}`}
                  key={option.value}
                >
                  <input
                    type="radio"
                    name="inputMode"
                    value={option.value}
                    checked={settings.inputMode === option.value}
                    onChange={event => onChange('inputMode', event.target.value)}
                  />
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="settings-options">
            {OPTIONS.map(option => (
              <label className="setting-option" key={option.key}>
                <span className="setting-copy">
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </span>
                <input
                  type="checkbox"
                  checked={settings[option.key]}
                  onChange={event => onChange(option.key, event.target.checked)}
                />
                <span className="setting-switch" aria-hidden="true" />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
