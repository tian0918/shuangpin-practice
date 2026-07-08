import { useState } from 'react'

export default function KeymapImage() {
  const [zoomed, setZoomed] = useState(false)

  return (
    <div
      className="keymap-container"
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
    >
      <img
        src="https://flypy.cc/help/assets/img/heup.webp"
        alt="小鹤双拼键位图"
        className={`keymap-image ${zoomed ? 'zoomed' : ''}`}
        style={{
          width: '100%',
          maxWidth: zoomed ? '600px' : '320px',
          cursor: 'zoom-in',
          transition: 'all 0.3s ease',
          borderRadius: '8px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          display: 'block',
        }}
      />
    </div>
  )
}
