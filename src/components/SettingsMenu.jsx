import { useEffect, useRef, useState } from 'react'

const OPTIONS = [
  { key: 'breathLight', label: '呼吸灯', description: '显示屏幕边缘的练习反馈' },
  { key: 'showVirtualKeyboard', label: '小鹤键位图', description: '显示主界面下方的虚拟键盘' },
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
