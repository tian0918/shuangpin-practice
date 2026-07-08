import { useState, useCallback, useRef, useEffect } from 'react'
import { PINYIN_DB, LEVEL_THRESHOLDS } from '../data/pinyinDb'
import { pickQuestion } from '../utils/questionPicker'

export default function useGameLogic() {
  const [level, setLevel] = useState(3)
  const [question, setQuestion] = useState(null)
  const [keyIndex, setKeyIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [totalKeystrokes, setTotalKeystrokes] = useState(0)
  const [levelQuestions, setLevelQuestions] = useState(0)
  const [lastFeedback, setLastFeedback] = useState(null)
  const [gameId, setGameId] = useState(0)
  const [startTime, setStartTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [isFlashing, setIsFlashing] = useState(false)
  const [paused, setPaused] = useState(false)
  const [finished, setFinished] = useState(false)
  const [finishTime, setFinishTime] = useState(null)
  const [errorRecords, setErrorRecords] = useState([])

  const errorMapRef = useRef({})
  const historyRef = useRef([])
  const timerRef = useRef(null)
  const startTimeRef = useRef(Date.now())
  const questionRef = useRef(null)
  const keyIndexRef = useRef(0)
  const charIndexRef = useRef(0)
  const correctRef = useRef(0)
  const errorRef = useRef(0)
  const keystrokesRef = useRef(0)
  const levelRef = useRef(3)
  const lqRef = useRef(0)
  const errorRecordsRef = useRef([])

  const accuracy = totalKeystrokes === 0 ? 100
    : Math.round((correctCount / (correctCount + errorCount)) * 100)
  const speed = elapsed === 0 ? 0
    : Math.round(((correctCount) / (elapsed / 60000)) * 10) / 10

  function computeCharIndex(ki, q) {
    if (!q || !q.chars) return 0
    let idx = 0
    for (const ch of q.chars) {
      if (ki < ch.keys.length) return idx
      ki -= ch.keys.length
      idx++
    }
    return q.chars.length - 1
  }

  const getPool = useCallback((lvl) => {
    const cfg = LEVEL_THRESHOLDS[lvl]
    if (!cfg) return PINYIN_DB
    return PINYIN_DB.filter(e => cfg.types.includes(e.type))
  }, [])

  const doLevelUp = useCallback(() => {
    const lvl = levelRef.current
    if (lvl >= 4) return
    const cfg = LEVEL_THRESHOLDS[lvl]
    if (!cfg) return
    if (lqRef.current < cfg.count) return
    const newAcc = correctRef.current === 0 ? 100
      : Math.round((correctRef.current / (correctRef.current + errorRef.current)) * 100)
    if (newAcc < cfg.accuracyReq * 100) return

    setLevel(prev => Math.min(prev + 1, 4))
    setLevelQuestions(0)
    lqRef.current = 0
  }, [])

  const doLevelDown = useCallback(() => {
    const lvl = levelRef.current
    if (lvl <= 1) return
    if (keystrokesRef.current < 30) return
    const curAcc = correctRef.current === 0 ? 100
      : Math.round((correctRef.current / (correctRef.current + errorRef.current)) * 100)
    if (curAcc >= 30) return

    setLevel(prev => Math.max(prev - 1, 1))
    setLevelQuestions(0)
    lqRef.current = 0
  }, [])

  const nextQuestion = useCallback(() => {
    const pool = getPool(levelRef.current)
    const q = pickQuestion(pool, errorMapRef.current, levelRef.current, historyRef.current)
    questionRef.current = q
    keyIndexRef.current = 0
    charIndexRef.current = 0
    setQuestion(q)
    setKeyIndex(0)
    setCharIndex(0)
    setLastFeedback(null)
    setPaused(false)
  }, [getPool])

  useEffect(() => {
    const now = Date.now()
    startTimeRef.current = now
    setStartTime(now)
    setElapsed(0)
    timerRef.current = setInterval(() => {
      setElapsed(Date.now() - startTimeRef.current)
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [gameId])

  useEffect(() => {
    if (!question && !finished) {
      nextQuestion()
    }
  }, [question, nextQuestion, finished])

  useEffect(() => {
    keyIndexRef.current = keyIndex
  }, [keyIndex])

  useEffect(() => {
    charIndexRef.current = charIndex
  }, [charIndex])

  useEffect(() => { correctRef.current = correctCount }, [correctCount])
  useEffect(() => { errorRef.current = errorCount }, [errorCount])
  useEffect(() => { keystrokesRef.current = totalKeystrokes }, [totalKeystrokes])
  useEffect(() => { levelRef.current = level }, [level])

  const handleKey = useCallback((key) => {
    const q = questionRef.current
    if (!q || paused || finished) return

    const expectedKey = q.keys[keyIndexRef.current]
    if (!expectedKey) return

    if (key === expectedKey) {
      correctRef.current += 1
      setCorrectCount(correctRef.current)
      keystrokesRef.current += 1
      setTotalKeystrokes(keystrokesRef.current)
      setLastFeedback({ status: 'correct', key })

      if (keyIndexRef.current < q.keys.length - 1) {
        keyIndexRef.current += 1
        setKeyIndex(keyIndexRef.current)
        setCharIndex(computeCharIndex(keyIndexRef.current, q))
      } else {
        lqRef.current += 1
        setLevelQuestions(lqRef.current)
        historyRef.current = [...historyRef.current.slice(-7), q]
        doLevelUp()
        setTimeout(() => nextQuestion(), 200)
      }
    } else {
      errorRef.current += 1
      setErrorCount(errorRef.current)
      keystrokesRef.current += 1
      setTotalKeystrokes(keystrokesRef.current)
      errorMapRef.current[q.pinyin] = (errorMapRef.current[q.pinyin] || 0) + 1

      const errorChar = q.chars[charIndexRef.current]
      const rec = {
        content: q.content,
        type: q.type,
        typeLabel: q.typeLabel,
        char: errorChar?.char ?? '',
        pinyin: errorChar?.pinyin ?? '',
        charIndex: charIndexRef.current,
        expectedKeys: q.keys,
        keyIndex: keyIndexRef.current,
        expectedKey,
        pressedKey: key,
      }
      errorRecordsRef.current = [...errorRecordsRef.current, rec]
      setErrorRecords(errorRecordsRef.current)
      setLastFeedback({ status: 'wrong', key: expectedKey, pressed: key })
      setIsFlashing(true)
      setTimeout(() => setIsFlashing(false), 300)

      let charStart = 0
      for (let i = 0; i < charIndexRef.current && i < q.chars.length; i++) {
        charStart += q.chars[i].keys.length
      }
      const keysIntoChar = keyIndexRef.current - charStart
      correctRef.current = Math.max(0, correctRef.current - keysIntoChar)
      setCorrectCount(correctRef.current)
      keystrokesRef.current = Math.max(0, keystrokesRef.current - keysIntoChar)
      setTotalKeystrokes(keystrokesRef.current)
      keyIndexRef.current = charStart
      setKeyIndex(charStart)
      setCharIndex(charIndexRef.current)
    }
  }, [paused, finished, nextQuestion, doLevelUp])

  const finish = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setFinished(true)
    setFinishTime(Date.now())
    setElapsed(Date.now() - startTime)
  }, [startTime])

  const dismissResult = useCallback(() => {
    questionRef.current = null
    keyIndexRef.current = 0
    charIndexRef.current = 0
    errorMapRef.current = {}
    historyRef.current = []
    errorRecordsRef.current = []
    correctRef.current = 0
    errorRef.current = 0
    keystrokesRef.current = 0
    lqRef.current = 0
    setCorrectCount(0)
    setErrorCount(0)
    setTotalKeystrokes(0)
    setLevelQuestions(0)
    setKeyIndex(0)
    setCharIndex(0)
    setLastFeedback(null)
    setIsFlashing(false)
    setPaused(false)
    setFinished(false)
    setFinishTime(null)
    setErrorRecords([])
    setQuestion(null)
    setGameId(id => id + 1)
  }, [])

  const restart = useCallback(() => {
    questionRef.current = null
    keyIndexRef.current = 0
    charIndexRef.current = 0
    errorMapRef.current = {}
    historyRef.current = []
    errorRecordsRef.current = []
    correctRef.current = 0
    errorRef.current = 0
    keystrokesRef.current = 0
    lqRef.current = 0
    setLevel(1)
    levelRef.current = 1
    setCorrectCount(0)
    setErrorCount(0)
    setTotalKeystrokes(0)
    setLevelQuestions(0)
    setKeyIndex(0)
    setCharIndex(0)
    setLastFeedback(null)
    setIsFlashing(false)
    setPaused(false)
    setFinished(false)
    setFinishTime(null)
    setErrorRecords([])
    setQuestion(null)
    setGameId(id => id + 1)
  }, [])

  const levelConfig = LEVEL_THRESHOLDS[level]

  return {
    question,
    keyIndex,
    charIndex,
    correctCount,
    errorCount,
    totalKeystrokes,
    accuracy,
    speed,
    elapsed,
    level,
    levelLabel: ['初级', '中级', '高级', '精通'][level - 1],
    levelProgress: levelQuestions,
    levelMax: levelConfig?.count ?? 30,
    lastFeedback,
    isFlashing,
    handleKey,
    restart,
    paused,
    finished,
    finish,
    dismissResult,
    errorRecords,
  }
}
