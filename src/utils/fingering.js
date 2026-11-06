const HAND_LABELS = {
  left: '左手',
  right: '右手',
}

const FINGER_LABELS = {
  pinky: '小指',
  ring: '无名指',
  middle: '中指',
  index: '食指',
  thumb: '拇指',
}

const FINGER_GROUPS = [
  { hand: 'left', finger: 'pinky', keys: 'qaz' },
  { hand: 'left', finger: 'ring', keys: 'wsx' },
  { hand: 'left', finger: 'middle', keys: 'edc' },
  { hand: 'left', finger: 'index', keys: 'rftgvb' },
  { hand: 'right', finger: 'index', keys: 'yuhjnm' },
  { hand: 'right', finger: 'middle', keys: 'ik,' },
  { hand: 'right', finger: 'ring', keys: 'ol.' },
  { hand: 'right', finger: 'pinky', keys: "p[];'/" },
]

const FINGER_BY_KEY = new Map()

for (const { hand, finger, keys } of FINGER_GROUPS) {
  for (const key of keys) {
    FINGER_BY_KEY.set(key, [{ hand, finger }])
  }
}

FINGER_BY_KEY.set(' ', [
  { hand: 'left', finger: 'thumb' },
  { hand: 'right', finger: 'thumb' },
])

export function normalizeFingeringKey(rawKey) {
  if (typeof rawKey !== 'string') return null
  if (rawKey === ' ' || rawKey.toLowerCase() === 'spacebar' || rawKey.toLowerCase() === 'space') {
    return ' '
  }

  const key = rawKey.toLowerCase()
  return key.length === 1 && FINGER_BY_KEY.has(key) ? key : null
}

export function getFingeringForKey(rawKey) {
  const key = normalizeFingeringKey(rawKey)
  if (key === null) return null

  const targets = FINGER_BY_KEY.get(key)
  const label = targets.length === 2
    ? '双手拇指'
    : `${HAND_LABELS[targets[0].hand]}${FINGER_LABELS[targets[0].finger]}`

  return {
    key,
    displayKey: key === ' ' ? '空格' : key.toUpperCase(),
    label,
    targets,
  }
}
