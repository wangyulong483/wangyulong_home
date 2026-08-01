import test from 'node:test'
import assert from 'node:assert/strict'

import {
  advanceSession,
  buildSystemPrompt,
  extractMemoryUpdates,
  inferPersona,
  normalizeMemories,
  relationshipFromScore,
  searchKnowledge,
} from '../_worker.js'
import worker from '../_worker.js'

test('按语义选择人物侧面，而不是按固定轮数切换', () => {
  assert.deepEqual(inferPersona('想和你切磋一下薙刀'), {
    persona: 'warrior',
    emotion: 'focused',
  })
  assert.deepEqual(inferPersona('你如何看待眼狩令造成的伤害？'), {
    persona: 'reflective',
    emotion: 'solemn',
  })
  assert.deepEqual(inferPersona('一起去喝团子牛奶吧'), {
    persona: 'ei',
    emotion: 'amused',
  })
})

test('关系进展有界且保留既有信任', () => {
  assert.equal(relationshipFromScore(0), 'stranger')
  assert.equal(relationshipFromScore(9), 'trusted')
  assert.equal(relationshipFromScore(16), 'close')

  const state = advanceSession(
    { trustScore: 8, turnCount: 6 },
    '谢谢你愿意听我说，我也信任你。',
    [{ role: 'user', content: '你好' }],
  )
  assert.equal(state.relationship, 'trusted')
  assert.equal(state.persona, 'ei')
  assert.ok(state.trustScore > 8)
})

test('只提取用户明确分享的有限长期记忆', () => {
  assert.deepEqual(extractMemoryUpdates('请记住，我叫归去来兮。'), [{
    kind: 'name',
    value: '归去来兮',
    key: 'name:归去来兮',
  }])
  assert.equal(extractMemoryUpdates('今天天气不错').length, 0)

  const memories = normalizeMemories([
    { kind: 'preference', value: '雷电影', key: 'same' },
    { kind: 'preference', value: '团子牛奶', key: 'same' },
  ])
  assert.equal(memories.length, 1)
  assert.equal(memories[0].value, '团子牛奶')
})

test('系统提示包含完整价值框架、当前状态和连续性记忆', () => {
  const prompt = buildSystemPrompt(
    { persona: 'reflective', relationship: 'trusted' },
    [{ kind: 'goal', value: '去合肥从事机器人工作' }],
  )
  assert.match(prompt, /# 世界观/)
  assert.match(prompt, /# 人生观/)
  assert.match(prompt, /# 价值观/)
  assert.match(prompt, /诚实面对失去、责任与改变/)
  assert.match(prompt, /去合肥从事机器人工作/)
})

test('知识检索按命中强度排序并限制上下文数量', () => {
  const entries = searchKnowledge('眼狩令之后，你如何理解愿望、永恒与须臾？')
  assert.ok(entries.length >= 2)
  assert.ok(entries.length <= 4)
  assert.ok(entries.some(entry => entry.category === '哲学'))
})

test('聊天接口使用 Flash 0731 协议并返回可持久化状态', async () => {
  const originalFetch = globalThis.fetch
  let deepSeekPayload
  globalThis.fetch = async (input, options = {}) => {
    const url = String(input)
    if (url.includes('shrine-data/index.json')) {
      return Response.json({
        character: { sources: [] },
        liveSearch: { generatedAt: '2026-08-01T00:00:00Z', wiki: [], news: [] },
        guides: [],
        news: [],
      })
    }
    if (url === 'https://api.deepseek.com/chat/completions') {
      deepSeekPayload = JSON.parse(options.body)
      return Response.json({ choices: [{ message: { content: '愿望并非永恒的敌人。' } }] })
    }
    throw new Error(`unexpected fetch: ${url}`)
  }

  try {
    const response = await worker.fetch(new Request('https://example.com/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: '请记住，我叫归去来兮。你如何看待愿望？' }],
        session: { trustScore: 0, memory: [] },
      }),
    }), { DEEPSEEK_API_KEY: 'test-key' })
    const data = await response.json()

    assert.equal(response.status, 200)
    assert.equal(deepSeekPayload.model, 'deepseek-v4-flash')
    assert.equal(deepSeekPayload.max_tokens, 700)
    assert.match(deepSeekPayload.messages[0].content, /人生观/)
    assert.equal(data.model, 'DeepSeek-V4-Flash-0731')
    assert.equal(data.memoryUpdates[0].value, '归去来兮')
    assert.equal(data.persona, 'reflective')
  } finally {
    globalThis.fetch = originalFetch
  }
})
