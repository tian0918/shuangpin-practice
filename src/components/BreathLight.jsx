import { useMemo } from 'react'

function getBaseColor(acc) {
  if (acc < 50) return '#ff4444'
  if (acc < 70) return '#ff8844'
  if (acc < 85) return '#ffcc00'
  if (acc < 95) return '#44cc44'
  return '#44dddd'
}

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255
  let g = parseInt(hex.slice(3, 5), 16) / 255
  let b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [h * 360, s * 100, l * 100]
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = n => {
    const k = (n + h / 30) % 12
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
  }
  const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0')
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
}

function generateStops(baseHex, count) {
  if (count <= 1) return [baseHex, baseHex]
  const [h, s, l] = hexToHsl(baseHex)
  const stops = [baseHex]
  if (count === 2) {
    stops.push(hslToHex(h + 30, Math.min(s + 20, 100), Math.min(l + 15, 90)))
  } else if (count === 3) {
    stops.push(hslToHex(h + 40, s + 10, l + 10))
    stops.push(hslToHex(h + 80, s + 20, l + 5))
  } else {
    stops.push(hslToHex(h + 60, s + 10, l + 5))
    stops.push(hslToHex(h + 120, s + 20, l))
    stops.push(hslToHex(h + 180, s + 10, l + 5))
  }
  stops.push(baseHex)
  return stops
}

function getColorCount(speed) {
  if (speed < 5) return 1
  if (speed < 15) return 2
  if (speed < 30) return 3
  return 4
}

function getSpinDuration(speed) {
  if (speed < 5) return '12s'
  if (speed < 15) return '6s'
  if (speed < 30) return '3s'
  if (speed < 45) return '1.5s'
  return '0.8s'
}

function getBreatheDuration(speed) {
  if (speed < 5) return '4s'
  if (speed < 15) return '3s'
  if (speed < 30) return '2s'
  return '1.2s'
}

export default function BreathLight({ accuracy, speed, isFlashing, theme }) {
  const baseColor = useMemo(() => getBaseColor(accuracy), [accuracy])
  const colorCount = useMemo(() => getColorCount(speed), [speed])
  const stops = useMemo(() => generateStops(baseColor, colorCount), [baseColor, colorCount])
  const spinDur = useMemo(() => getSpinDuration(speed), [speed])
  const breatheDur = useMemo(() => getBreatheDuration(speed), [speed])
  const isLight = theme === 'light'

  const breatheMin = useMemo(() => isLight ? 0.35 : 0.15, [isLight])
  const breatheMax = useMemo(() => isLight ? 0.8 : 0.55, [isLight])
  const flashColor = useMemo(
    () => accuracy < 50 ? '#ff4444' : isLight ? '#ff8888' : '#ffffff',
    [accuracy, isLight],
  )

  const gradient = `conic-gradient(from var(--angle), ${stops.join(', ')})`

  return (
    <>
      <div
        className="breath-border"
        style={{
          background: gradient,
          animation: isFlashing
            ? 'none'
            : `spin ${spinDur} linear infinite, breathe ${breatheDur} ease-in-out infinite`,
          opacity: isFlashing ? 1 : undefined,
          boxShadow: isFlashing ? `inset 0 0 40px ${flashColor}, 0 0 40px ${flashColor}` : undefined,
          '--breathe-min': breatheMin,
          '--breathe-max': breatheMax,
        }}
      />
      <style>{`
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        .breath-border {
          position: fixed;
          inset: -4px;
          pointer-events: none;
          z-index: 9999;
          padding: 8px;
          transition: opacity 0.2s;
          -webkit-mask: linear-gradient(black, black) content-box, linear-gradient(black, black);
          -webkit-mask-composite: xor;
          mask: linear-gradient(black, black) content-box, linear-gradient(black, black);
          mask-composite: exclude;
        }
        @keyframes spin {
          to { --angle: 360deg; }
        }
        @keyframes breathe {
          0%, 100% { opacity: var(--breathe-min, 0.15); }
          50% { opacity: var(--breathe-max, 0.6); }
        }
      `}</style>
    </>
  )
}
