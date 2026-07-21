import test from 'node:test'
import assert from 'node:assert/strict'
import { PINYIN_DB, LEVEL_THRESHOLDS } from '../src/data/pinyinDb.js'

test('all questions contain valid key sequences', () => {
  assert.ok(PINYIN_DB.length > 0)

  for (const question of PINYIN_DB) {
    assert.ok(question.keys.length > 0, `${question.content} has no keys`)
    assert.ok(
      question.keys.every(key => typeof key === 'string' && key.length === 1 && key !== '?'),
      `${question.content} has an invalid key sequence`,
    )
    assert.equal(
      question.keys.length,
      question.chars.reduce((total, char) => total + char.keys.length, 0),
      `${question.content} has inconsistent character keys`,
    )
  }
})

test('every question type is reachable from the mastery-level pool', () => {
  const masteryTypes = LEVEL_THRESHOLDS[4].types
  const questionTypes = new Set(PINYIN_DB.map(question => question.type))

  for (const type of questionTypes) {
    assert.ok(masteryTypes.includes(type), `${type} is missing from the mastery-level pool`)
  }

  assert.equal(PINYIN_DB.filter(question => question.type === 'sentence').length, 10)
})
