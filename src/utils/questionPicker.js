export function pickQuestion(pool, errorMap, level, history) {
  const candidates = pool.filter(q =>
    q.level <= level && (
      history.length === 0 ||
      !history.slice(-8).some(h => h.pinyin === q.pinyin)
    )
  )

  if (candidates.length === 0) {
    const fallback = pool.filter(q => q.level <= level)
    if (fallback.length === 0) return pool[Math.floor(Math.random() * pool.length)]
    return fallback[Math.floor(Math.random() * fallback.length)]
  }

  const weights = candidates.map(q => {
    const base = 1
    const errorWeight = (errorMap[q.pinyin] || 0) * 3
    return base + errorWeight
  })

  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * totalWeight

  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i]
    if (r <= 0) return candidates[i]
  }

  return candidates[candidates.length - 1]
}
