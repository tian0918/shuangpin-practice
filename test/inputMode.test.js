import test from 'node:test'
import assert from 'node:assert/strict'
import { applyInputMode, normalizeFullPinyin, INPUT_MODES } from '../src/utils/inputMode.js'
import { FULL_PINYIN_MAP } from '../src/data/generatedFullPinyin.js'
import { PINYIN_DB } from '../src/data/pinyinDb.js'

test('generated data contains keyboard-friendly full pinyin', () => {
  assert.deepEqual(FULL_PINYIN_MAP['我们学习'], ['women', 'xuexi'])
  assert.deepEqual(FULL_PINYIN_MAP['绿'], ['lv'])
  assert.equal(normalizeFullPinyin('lü'), 'lv')
})

test('full pinyin mode replaces each question key sequence without mutation', () => {
  const question = {
    content: '我们学习',
    pinyin: 'women xuexi',
    keys: ['w', 'o', 'x', 'i'],
    chars: [
      { char: '我们', pinyin: 'women', keys: ['w', 'o'] },
      { char: '学习', pinyin: 'xuexi', keys: ['x', 'i'] },
    ],
  }

  const converted = applyInputMode(question, INPUT_MODES.FULL_PINYIN)

  assert.deepEqual(converted.keys, [...'womenxuexi'])
  assert.deepEqual(converted.chars[0].keys, [...'women'])
  assert.deepEqual(question.keys, ['w', 'o', 'x', 'i'])
})

test('shuangpin mode preserves the existing question', () => {
  const question = { keys: ['w', 'o'] }
  assert.equal(applyInputMode(question, INPUT_MODES.SHUANGPIN), question)
})

test('full pinyin input keeps tone marks for display', () => {
  const question = {
    content: '吕',
    pinyin: 'lǚ',
    keys: ['l', 'v'],
    chars: [{ char: '吕', pinyin: 'lǚ', inputPinyin: 'lv', keys: ['l', 'v'] }],
  }

  const converted = applyInputMode(question, INPUT_MODES.FULL_PINYIN)
  assert.equal(converted.pinyin, 'lǚ')
  assert.equal(converted.chars[0].pinyin, 'lǚ')
  assert.deepEqual(converted.keys, ['l', 'v'])
})

test('every question has a complete generated full pinyin sequence', () => {
  for (const question of PINYIN_DB) {
    const converted = applyInputMode(question, INPUT_MODES.FULL_PINYIN)
    assert.equal(converted.chars.length, question.chars.length, question.content)
    assert.ok(converted.keys.length > 0, `${question.content} has no full pinyin keys`)
    assert.ok(converted.keys.every(key => /^[a-z]$/.test(key)), `${question.content} has invalid full pinyin keys`)
  }
})
