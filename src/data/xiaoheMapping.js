export const INITIAL_MAP = {
  b: 'b', p: 'p', m: 'm', f: 'f',
  d: 'd', t: 't', n: 'n', l: 'l',
  g: 'g', k: 'k', h: 'h', j: 'j', q: 'q', x: 'x',
  r: 'r', z: 'z', c: 'c', s: 's', y: 'y', w: 'w',
  zh: 'v', ch: 'i', sh: 'u',
}

export const FINAL_MAP = {
  a: 'a', o: 'o', uo: 'o', e: 'e', i: 'i', u: 'u',
  iu: 'q', ei: 'w', uan: 'r',
  ue: 't', ve: 't',
  un: 'y', vn: 'y',
  ie: 'p',
  ong: 's', iong: 's',
  ai: 'd', en: 'f', eng: 'g', ang: 'h', an: 'j',
  ing: 'k', uai: 'k',
  iang: 'l', uang: 'l',
  ou: 'z', ia: 'x', ua: 'x', ao: 'c',
  ui: 'v', v: 'v',
  in: 'b', iao: 'n', ian: 'm',
}

export function pinyinToKeys(pinyin) {
  const specialFinals = ['iu', 'ei', 'uan', 'ue', 've', 'un', 'vn', 'ie',
    'iong', 'ong', 'ai', 'en', 'eng', 'ang', 'an',
    'ing', 'uai', 'iang', 'uang', 'ou', 'ia', 'ua', 'ao',
    'ui', 'in', 'iao', 'ian', 'uo', 've']

  if (pinyin === 'a') return ['a', 'a']
  if (pinyin === 'o') return ['o', 'o']
  if (pinyin === 'e') return ['e', 'e']

  if (pinyin === 'er') return ['e', 'r']

  const zeroInitialSingle = ['a', 'o', 'e']
  if (zeroInitialSingle.includes(pinyin)) return [pinyin, pinyin]

  const zeroInitialPairs = ['ai', 'an', 'ao', 'en', 'ei', 'ou']
  if (zeroInitialPairs.includes(pinyin)) {
    return [pinyin[0], pinyin[1]]
  }

  const zeroInitialTriples = ['ang', 'eng']
  if (zeroInitialTriples.includes(pinyin)) {
    return [pinyin[0], FINAL_MAP[pinyin]]
  }

  const initialConsonants = ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l',
    'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's', 'y', 'w']

  let initial = ''
  let rest = pinyin

  if (pinyin.startsWith('zh')) { initial = 'zh'; rest = pinyin.slice(2) }
  else if (pinyin.startsWith('ch')) { initial = 'ch'; rest = pinyin.slice(2) }
  else if (pinyin.startsWith('sh')) { initial = 'sh'; rest = pinyin.slice(2) }
  else {
    for (const c of initialConsonants) {
      if (c.length === 1 && pinyin.startsWith(c) && !['zh', 'ch', 'sh'].includes(c)) {
        const next = pinyin[c.length]
        if (next && 'aeiouv'.includes(next)) {
          initial = c
          rest = pinyin.slice(c.length)
          break
        }
      }
    }
  }

  if (!initial) return null

  const initialKey = INITIAL_MAP[initial]
  const finalKey = FINAL_MAP[rest]

  if (!initialKey || !finalKey) {
    const restStr = String(rest)
    if (FINAL_MAP[restStr]) {
      return [initialKey || initial, FINAL_MAP[restStr]]
    }
    const fallback = restStr.length > 0 ? restStr[0] : '?'
    return [initialKey || initial, fallback]
  }

  return [initialKey, finalKey]
}

export function parsePinyin(pinyin) {
  const initials = ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l',
    'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's', 'y', 'w']
  for (const init of initials) {
    if (pinyin.startsWith(init)) {
      const rest = pinyin.slice(init.length)
      if (rest.length > 0) return { initial: init, final: rest }
    }
  }
  return { initial: '', final: pinyin }
}

export const KEYBOARD_ROWS = [
  [
    { key: 'q', initials: ['q'], finals: ['iu'], labelTop: 'Q', labelBottom: 'iu' },
    { key: 'w', initials: ['w'], finals: ['ei'], labelTop: 'W', labelBottom: 'ei' },
    { key: 'e', initials: [], finals: ['e'], labelTop: 'E', labelBottom: 'e' },
    { key: 'r', initials: ['r'], finals: ['uan'], labelTop: 'R', labelBottom: 'uan' },
    { key: 't', initials: ['t'], finals: ['ue', 've'], labelTop: 'T', labelBottom: 'ue/ve' },
    { key: 'y', initials: ['y'], finals: ['un', 'vn'], labelTop: 'Y', labelBottom: 'un/vn' },
    { key: 'u', initials: ['sh'], finals: ['u'], labelTop: 'U', labelBottom: 'sh/u' },
    { key: 'i', initials: ['ch'], finals: ['i'], labelTop: 'I', labelBottom: 'ch/i' },
    { key: 'o', initials: [], finals: ['o', 'uo'], labelTop: 'O', labelBottom: 'o/uo' },
    { key: 'p', initials: ['p'], finals: ['ie'], labelTop: 'P', labelBottom: 'ie' },
    { key: '[', initials: [], finals: [], labelTop: '「', labelBottom: '[', punct: true },
    { key: ']', initials: [], finals: [], labelTop: '」', labelBottom: ']', punct: true },
  ],
  [
    { key: 'a', initials: [], finals: ['a'], labelTop: 'A', labelBottom: 'a' },
    { key: 's', initials: ['s'], finals: ['ong', 'iong'], labelTop: 'S', labelBottom: 'ong/iong' },
    { key: 'd', initials: ['d'], finals: ['ai'], labelTop: 'D', labelBottom: 'ai' },
    { key: 'f', initials: ['f'], finals: ['en'], labelTop: 'F', labelBottom: 'en' },
    { key: 'g', initials: ['g'], finals: ['eng'], labelTop: 'G', labelBottom: 'eng' },
    { key: 'h', initials: ['h'], finals: ['ang'], labelTop: 'H', labelBottom: 'ang' },
    { key: 'j', initials: ['j'], finals: ['an'], labelTop: 'J', labelBottom: 'an' },
    { key: 'k', initials: ['k'], finals: ['ing', 'uai'], labelTop: 'K', labelBottom: 'ing/uai' },
    { key: 'l', initials: ['l'], finals: ['iang', 'uang'], labelTop: 'L', labelBottom: 'iang/uang' },
    { key: ';', initials: [], finals: [], labelTop: '；', labelBottom: ';', punct: true },
    { key: "'", initials: [], finals: [], labelTop: "'", labelBottom: "'", punct: true },
  ],
  [
    { key: 'z', initials: ['z'], finals: ['ou'], labelTop: 'Z', labelBottom: 'ou' },
    { key: 'x', initials: ['x'], finals: ['ia', 'ua'], labelTop: 'X', labelBottom: 'ia/ua' },
    { key: 'c', initials: ['c'], finals: ['ao'], labelTop: 'C', labelBottom: 'ao' },
    { key: 'v', initials: ['zh'], finals: ['ui', 'v'], labelTop: 'V', labelBottom: 'zh/ui' },
    { key: 'b', initials: ['b'], finals: ['in'], labelTop: 'B', labelBottom: 'in' },
    { key: 'n', initials: ['n'], finals: ['iao'], labelTop: 'N', labelBottom: 'iao' },
    { key: 'm', initials: ['m'], finals: ['ian'], labelTop: 'M', labelBottom: 'ian' },
    { key: ',', initials: [], finals: [], labelTop: '，', labelBottom: ',', punct: true },
    { key: '.', initials: [], finals: [], labelTop: '。', labelBottom: '.', punct: true },
    { key: '/', initials: [], finals: [], labelTop: '、', labelBottom: '/', punct: true },
  ],
  [
    { key: ' ', initials: [], finals: [], labelTop: '空格', labelBottom: '', wide: true },
  ],
]
