import { pinyinToKeys } from '../data/xiaoheMapping.js'

export const RANDOM_POEM_TYPES = ['五言绝句', '七言绝句', '五言律诗']

const randomPoemParams = new URLSearchParams()
RANDOM_POEM_TYPES.forEach(type => randomPoemParams.append('type', type))

const poemApiBase = import.meta.env?.PROD
  ? 'https://billy-unflowery-eliana.ngrok-free.dev/api/v1'
  : '/poem-api'

export const RANDOM_POEM_API = `${poemApiBase}/poems/random?${randomPoemParams}`

function normalizeSyllable(value) {
  return String(value ?? '')
    .toLowerCase()
    .replaceAll('ü', 'v')
    .replaceAll('u:', 'v')
    .replace(/[^a-z]/g, '')
}

function getHanText(value) {
  return String(value ?? '').match(/\p{Script=Han}/gu)?.join('') ?? ''
}

function splitPoemLine(value) {
  const result = []
  let current = ''

  for (const symbol of String(value ?? '').replace(/\s+/g, '')) {
    current += symbol
    if (/[，。！？；,!?;]/u.test(symbol)) {
      result.push(current)
      current = ''
    }
  }

  if (current) result.push(current)
  return result.filter(line => /\p{Script=Han}/u.test(line))
}

export async function poemToQuestions(poem) {
  if (!poem || !Array.isArray(poem.content)) {
    throw new Error('诗词接口返回了无效数据')
  }

  const lines = poem.content
    .map(value => ({ content: getHanText(value), displayLines: splitPoemLine(value) }))
    .filter(line => line.content)
  if (lines.length === 0) throw new Error('诗词内容为空')

  const sourceParts = [poem.dynasty?.name, poem.author?.name, poem.title].filter(Boolean)
  const sourceLabel = sourceParts.join(' · ')
  const typeLabel = poem.type?.name || poem.type?.category || '诗词'
  const { pinyin } = await import('pinyin')

  return lines.map(({ content, displayLines }, lineIndex) => {
    const inputSyllables = pinyin(content, { style: 'normal', segment: true })
      .map(result => normalizeSyllable(result[0]))
    const displaySyllables = pinyin(content, { style: 'tone', segment: true })
      .map(result => String(result[0] ?? ''))

    if (
      inputSyllables.length !== [...content].length ||
      displaySyllables.length !== [...content].length ||
      inputSyllables.some(value => !value) ||
      displaySyllables.some(value => !value)
    ) {
      throw new Error(`无法生成诗句拼音：${content}`)
    }

    const chars = [...content].map((char, index) => {
      const inputPinyin = inputSyllables[index]
      const keys = pinyinToKeys(inputPinyin)
      if (!keys?.length || keys.some(key => !/^[a-z]$/.test(key))) {
        throw new Error(`无法生成「${char}」的双拼按键`)
      }
      return { char, pinyin: displaySyllables[index], inputPinyin, keys }
    })

    return {
      content,
      type: 'poem',
      typeLabel,
      pinyin: chars.map(char => char.pinyin).join(' '),
      keys: chars.flatMap(char => char.keys),
      chars,
      level: 4,
      sourceLabel,
      poemId: poem.id,
      lineIndex,
      lineCount: lines.length,
      displayLines,
    }
  })
}

export async function fetchRandomPoemQuestions() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(RANDOM_POEM_API, {
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`诗词接口请求失败：${response.status}`)
    return await poemToQuestions(await response.json())
  } finally {
    clearTimeout(timeout)
  }
}
