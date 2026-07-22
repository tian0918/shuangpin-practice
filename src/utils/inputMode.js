import { FULL_PINYIN_MAP } from '../data/generatedFullPinyin.js'

export const INPUT_MODES = {
  SHUANGPIN: 'shuangpin',
  FULL_PINYIN: 'fullPinyin',
}

export function normalizeFullPinyin(value) {
  return value
    .toLowerCase()
    .replaceAll('ü', 'v')
    .replaceAll('u:', 'v')
    .replace(/[^a-z]/g, '')
}

export function applyInputMode(question, inputMode) {
  if (!question || inputMode === INPUT_MODES.SHUANGPIN) return question

  const generatedPinyin = FULL_PINYIN_MAP[question.content] ?? []
  const chars = question.chars.map((char, index) => {
    const fullPinyin = generatedPinyin[index] || normalizeFullPinyin(char.inputPinyin || char.pinyin)
    return {
      ...char,
      inputPinyin: fullPinyin,
      keys: [...fullPinyin],
    }
  })

  return {
    ...question,
    pinyin: chars.map(char => char.pinyin).join(' '),
    keys: chars.flatMap(char => char.keys),
    chars,
  }
}
