import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  buildPaper,
  isAnswerCorrect,
  scorePaper,
} from '../src/features/ai-quiz/lib/scoring.js'

const DATA_DIR = new URL('../public/ai-quiz-data/', import.meta.url)

function loadQuizData() {
  const manifest = JSON.parse(readFileSync(new URL('manifest.json', DATA_DIR), 'utf8'))
  const files = [...new Set(manifest.questions.map(question => question.file))]
  const contentById = new Map()
  for (const file of files) {
    const chunk = JSON.parse(readFileSync(new URL(file, DATA_DIR), 'utf8'))
    for (const content of chunk.questions) contentById.set(content.id, content)
  }
  return {
    ...manifest,
    questions: manifest.questions.map(meta => ({ ...meta, ...contentById.get(meta.id) })),
  }
}

const quizData = loadQuizData()

test('标准卷按 seed 稳定组卷，并覆盖全部维度', () => {
  const first = buildPaper({
    questions: quizData.questions,
    dimensions: quizData.dimensions,
    audience: 'professional',
    mode: 'standard',
    count: 20,
    seed: 42,
  })
  const second = buildPaper({
    questions: quizData.questions,
    dimensions: quizData.dimensions,
    audience: 'professional',
    mode: 'standard',
    count: 20,
    seed: 42,
  })

  assert.equal(first.length, 20)
  assert.deepEqual(first.map(question => question.id), second.map(question => question.id))
  assert.equal(new Set(first.map(question => question.id)).size, first.length)

  for (const dimension of quizData.dimensions) {
    assert.ok(first.filter(question => question.dimension === dimension.id).length >= 2)
  }
})

test('单维深度模式只抽取指定维度', () => {
  const paper = buildPaper({
    questions: quizData.questions,
    dimensions: quizData.dimensions,
    audience: 'professional',
    mode: 'deep',
    dimensionId: 'tools-skills-mcp',
    count: 10,
    seed: 7,
  })

  assert.ok(paper.length > 0)
  assert.ok(paper.every(question => question.dimension === 'tools-skills-mcp'))
})

test('single、judge、multiple 判分规则一致，多选必须全对', () => {
  const single = quizData.questions.find(question => question.type === 'single')
  const judge = quizData.questions.find(question => question.type === 'judge')
  const multiple = quizData.questions.find(question => question.type === 'multiple')

  assert.equal(isAnswerCorrect(single, [single.answer]), true)
  assert.equal(isAnswerCorrect(judge, [judge.answer]), true)
  assert.equal(isAnswerCorrect(multiple, multiple.answer), true)
  assert.equal(isAnswerCorrect(multiple, multiple.answer.slice(0, 1)), false)
})

test('结果包含总分、维度分和错题', () => {
  const paper = buildPaper({
    questions: quizData.questions,
    dimensions: quizData.dimensions,
    audience: 'professional',
    mode: 'standard',
    count: 20,
    seed: 11,
  })
  const answers = paper.map((question, index) => ({
    qId: question.id,
    selected: index % 2 === 0
      ? (Array.isArray(question.answer) ? question.answer : [question.answer])
      : [0],
  }))

  const result = scorePaper({
    paper,
    answers,
    dimensions: quizData.dimensions,
    audience: 'professional',
  })

  assert.equal(result.total, 20)
  assert.equal(result.dimensionScores.length, quizData.dimensions.length)
  assert.ok(result.score >= 0 && result.score <= 100)
  assert.ok(result.wrongAnswers.length > 0)
  assert.ok(result.level.name)
})

test('manifest 索引能解析出完整题目正文', () => {
  assert.ok(quizData.questions.length > 0)
  for (const question of quizData.questions) {
    assert.ok(question.prompt, `${question.id} 缺少题干`)
    assert.ok(Array.isArray(question.options) && question.options.length >= 2, `${question.id} 缺少选项`)
    assert.ok(question.answer !== undefined && question.answer !== null, `${question.id} 缺少答案`)
  }
})
