import test from 'node:test'
import assert from 'node:assert/strict'
import {
  poemToQuestions,
  RANDOM_POEM_API,
  RANDOM_POEM_TYPES,
} from '../src/services/poemApi.js'

const poem = {
  id: 96184,
  title: '苎萝山  其一',
  author: { id: 871, name: '姚宽' },
  dynasty: { id: 6, name: '唐' },
  type: { id: 12, name: '七言绝句', category: '唐诗' },
  content: [
    '娉婷初出苎萝春，一笑当年国自倾。',
    '丝网珠玑迷去路，鸱夷风月倍多情。',
  ],
}

test('random poem request includes every selected poem type', () => {
  const url = new URL(RANDOM_POEM_API, 'http://localhost')
  assert.deepEqual(url.searchParams.getAll('type'), RANDOM_POEM_TYPES)
})

test('poem response becomes one practice question per line', async () => {
  const questions = await poemToQuestions(poem)

  assert.equal(questions.length, 2)
  assert.equal(questions[0].content, '娉婷初出苎萝春一笑当年国自倾')
  assert.equal(questions[0].chars.length, 14)
  assert.equal(questions[0].typeLabel, '七言绝句')
  assert.equal(questions[0].sourceLabel, '唐 · 姚宽 · 苎萝山  其一')
  assert.equal(questions[0].lineIndex, 0)
  assert.equal(questions[0].lineCount, 2)
  assert.deepEqual(questions[0].displayLines, [
    '娉婷初出苎萝春，',
    '一笑当年国自倾。',
  ])
  assert.equal(questions[0].chars[0].pinyin, 'pīng')
  assert.equal(questions[0].chars[0].inputPinyin, 'ping')
  assert.match(questions[0].pinyin, /[\u0101áǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/u)
  assert.ok(questions[0].keys.every(key => /^[a-z]$/.test(key)))
  assert.equal(
    questions[0].keys.length,
    questions[0].chars.reduce((total, char) => total + char.keys.length, 0),
  )
})

test('invalid poem responses are rejected', async () => {
  await assert.rejects(poemToQuestions({ content: [] }), /诗词内容为空/)
  await assert.rejects(poemToQuestions(null), /无效数据/)
})
