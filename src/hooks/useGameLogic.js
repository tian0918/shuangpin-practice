import { useState, useCallback, useRef, useEffect } from 'react'
import { PINYIN_DB, LEVEL_THRESHOLDS } from '../data/pinyinDb'
import { pickQuestion } from '../utils/questionPicker'
import { applyInputMode } from '../utils/inputMode'
import { fetchRandomPoemQuestions } from '../services/poemApi'

export default function useGameLogic(inputMode = 'shuangpin') {
  const [level, setLevel] = useState(3)
  const [question, setQuestion] = useState(null)
  const [keyIndex, setKeyIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [totalKeystrokes, setTotalKeystrokes] = useState(0)
  const [completedQuestions, setCompletedQuestions] = useState(0)
  const [completedChars, setCompletedChars] = useState(0)
  const [levelQuestions, setLevelQuestions] = useState(0)
  const [lastFeedback, setLastFeedback] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [isFlashing, setIsFlashing] = useState(false)
  const [finished, setFinished] = useState(false)
  const [errorRecords, setErrorRecords] = useState([])

  const errorMapRef = useRef({})
  const historyRef = useRef([])
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)
  const questionRef = useRef(null)
  const keyIndexRef = useRef(0)
  const charIndexRef = useRef(0)
  const correctRef = useRef(0)
  const errorRef = useRef(0)
  const keystrokesRef = useRef(0)
  const levelRef = useRef(3)
  const lqRef = useRef(0)
  const completedQuestionsRef = useRef(0)
  const completedCharsRef = useRef(0)
  const errorRecordsRef = useRef([])
  const inputModeRef = useRef(inputMode)
  const poemQueueRef = useRef([])
  const isLoadingQuestionRef = useRef(false)
  const poemRetryAtRef = useRef(0)

  const accuracy = totalKeystrokes === 0 ? 100
    : Math.round((correctCount / (correctCount + errorCount)) * 100)
  const speed = elapsed === 0 ? 0
    : Math.round((completedChars / (elapsed / 60000)) * 10) / 10

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

    const nextLevel = Math.min(lvl + 1, 4)
    levelRef.current = nextLevel
    setLevel(nextLevel)
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

    const nextLevel = Math.max(lvl - 1, 1)
    levelRef.current = nextLevel
    setLevel(nextLevel)
    setLevelQuestions(0)
    lqRef.current = 0
  }, [])

  const nextQuestion = useCallback(async () => {
    if (isLoadingQuestionRef.current) return
    isLoadingQuestionRef.current = true

    try {
      if (poemQueueRef.current.length === 0 && Date.now() >= poemRetryAtRef.current) {
        try {
          poemQueueRef.current = await fetchRandomPoemQuestions()
          poemRetryAtRef.current = 0
        } catch (error) {
          console.warn('随机诗词加载失败，暂时使用本地题库。', error)
          poemRetryAtRef.current = Date.now() + 30000
        }
      }

      let picked = poemQueueRef.current.shift()
      if (!picked) {
        const pool = getPool(levelRef.current)
        picked = pickQuestion(pool, errorMapRef.current, levelRef.current, historyRef.current)
      }

      const q = applyInputMode(picked, inputModeRef.current)
      questionRef.current = q
      keyIndexRef.current = 0
      charIndexRef.current = 0
      setQuestion(q)
      setKeyIndex(0)
      setCharIndex(0)
      setLastFeedback(null)
    } finally {
      isLoadingQuestionRef.current = false
    }
  }, [getPool])

  const startTimer = useCallback(() => {
    if (timerRef.current || startTimeRef.current !== null) return

    const now = Date.now()
    startTimeRef.current = now
    setElapsed(0)
    timerRef.current = setInterval(() => {
      setElapsed(Date.now() - startTimeRef.current)
    }, 1000)
  }, [])

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    if (!question && !finished) {
      nextQuestion()
    }
  }, [question, nextQuestion, finished])

  useEffect(() => {
    keyIndexRef.current = keyIndex
  }, [keyIndex])

  useEffect(() => {
    inputModeRef.current = inputMode
  }, [inputMode])

  useEffect(() => {
    charIndexRef.current = charIndex
  }, [charIndex])

  useEffect(() => { correctRef.current = correctCount }, [correctCount])
  useEffect(() => { errorRef.current = errorCount }, [errorCount])
  useEffect(() => { keystrokesRef.current = totalKeystrokes }, [totalKeystrokes])
  useEffect(() => { levelRef.current = level }, [level])

  const handleKey = useCallback((key) => {
    const q = questionRef.current
    if (!q || finished) return

    const expectedKey = q.keys[keyIndexRef.current]
    if (!expectedKey) return
    startTimer()

    if (key === expectedKey) {
      correctRef.current += 1
      setCorrectCount(correctRef.current)
      keystrokesRef.current += 1
      setTotalKeystrokes(keystrokesRef.current)
      setLastFeedback({ status: 'correct', key, keyIndex: keyIndexRef.current })

      if (keyIndexRef.current < q.keys.length - 1) {
        keyIndexRef.current += 1
        setKeyIndex(keyIndexRef.current)
        setCharIndex(computeCharIndex(keyIndexRef.current, q))
      } else {
        completedQuestionsRef.current += 1
        completedCharsRef.current += q.chars.length
        setCompletedQuestions(completedQuestionsRef.current)
        setCompletedChars(completedCharsRef.current)
        lqRef.current += 1
        setLevelQuestions(lqRef.current)
        historyRef.current = [...historyRef.current.slice(-7), q]
        doLevelUp()
        questionRef.current = null
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
      setLastFeedback({ status: 'wrong', key: expectedKey, pressed: key, keyIndex: keyIndexRef.current })
      setIsFlashing(true)
      setTimeout(() => setIsFlashing(false), 300)

      let charStart = 0
      for (let i = 0; i < charIndexRef.current && i < q.chars.length; i++) {
        charStart += q.chars[i].keys.length
      }
      keyIndexRef.current = charStart
      setKeyIndex(charStart)
      setCharIndex(charIndexRef.current)
      doLevelDown()
    }
  }, [finished, nextQuestion, doLevelUp, doLevelDown, startTimer])

  const finish = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    setFinished(true)
    setElapsed(startTimeRef.current === null ? 0 : Date.now() - startTimeRef.current)
  }, [])

  const dismissResult = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    startTimeRef.current = null
    questionRef.current = null
    keyIndexRef.current = 0
    charIndexRef.current = 0
    errorMapRef.current = {}
    historyRef.current = []
    errorRecordsRef.current = []
    poemQueueRef.current = []
    poemRetryAtRef.current = 0
    correctRef.current = 0
    errorRef.current = 0
    keystrokesRef.current = 0
    lqRef.current = 0
    completedQuestionsRef.current = 0
    completedCharsRef.current = 0
    setCorrectCount(0)
    setErrorCount(0)
    setTotalKeystrokes(0)
    setCompletedQuestions(0)
    setCompletedChars(0)
    setLevelQuestions(0)
    setKeyIndex(0)
    setCharIndex(0)
    setLastFeedback(null)
    setIsFlashing(false)
    setFinished(false)
    setErrorRecords([])
    setQuestion(null)
    setElapsed(0)
  }, [])

  const restart = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    startTimeRef.current = null
    questionRef.current = null
    keyIndexRef.current = 0
    charIndexRef.current = 0
    errorMapRef.current = {}
    historyRef.current = []
    errorRecordsRef.current = []
    poemQueueRef.current = []
    poemRetryAtRef.current = 0
    correctRef.current = 0
    errorRef.current = 0
    keystrokesRef.current = 0
    lqRef.current = 0
    completedQuestionsRef.current = 0
    completedCharsRef.current = 0
    setLevel(1)
    levelRef.current = 1
    setCorrectCount(0)
    setErrorCount(0)
    setTotalKeystrokes(0)
    setCompletedQuestions(0)
    setCompletedChars(0)
    setLevelQuestions(0)
    setKeyIndex(0)
    setCharIndex(0)
    setLastFeedback(null)
    setIsFlashing(false)
    setFinished(false)
    setErrorRecords([])
    setQuestion(null)
    setElapsed(0)
  }, [])

  const levelConfig = LEVEL_THRESHOLDS[level]

  return {
    question,
    keyIndex,
    charIndex,
    correctCount,
    errorCount,
    totalKeystrokes,
    completedQuestions,
    completedChars,
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
    finished,
    finish,
    dismissResult,
    errorRecords,
  }
}
