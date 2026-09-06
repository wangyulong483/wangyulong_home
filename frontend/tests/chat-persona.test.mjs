import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  advanceSession,
  buildChatReferences,
  buildSystemPrompt,
  buildWebSearchQuery,
  extractMemoryUpdates,
  inferPersona,
  needsWebSearch,
  normalizeMemories,
  relationshipFromScore,
  retrieveWebSources,
  searchKnowledge,
  tokenizeKnowledge,
} from '../_worker.js'
import worker from '../_worker.js'

const knowledgeBase = JSON.parse(readFileSync(
  new URL('../public/shrine-data/knowledge-base.json', import.meta.url),
  'utf8',
))

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

test('中文分词与混合检索能够召回精确事实和关联知识', () => {
  assert.ok(tokenizeKnowledge('眼狩令与神之眼').includes('眼狩'))
  const result = searchKnowledge(knowledgeBase, '眼狩令之后，你如何理解愿望、永恒与责任？')
  assert.ok(result.entries.length >= 3)
  assert.ok(result.entries.length <= knowledgeBase.retrieval.maxEntries)
  assert.equal(result.entries[0].id, 'timeline-vision-hunt')
  assert.ok(result.entries.some(entry => entry.id === 'values-responsibility'))
  assert.ok(result.entries.some(entry => entry.id === 'values-wishes'))
  assert.ok(result.stats.characters <= knowledgeBase.retrieval.maxCharacters)
})

test('知识检索遵守世界树记忆边界并统一来源编号', () => {
  const result = searchKnowledge(knowledgeBase, '影还记得国崩和流浪者吗？世界树改写后呢？')
  assert.ok(result.entries.some(entry => entry.id === 'relationship-wanderer'))
  assert.ok(result.entries.some(entry => entry.id === 'world-irminsul-memory'))

  const references = buildChatReferences(knowledgeBase, result, [{
    title: '实时资料',
    source: '测试来源',
    url: 'https://example.com/live',
    excerpt: '实时摘要',
  }])
  assert.match(references.context, /角色视角/)
  assert.match(references.context, /来源 1/)
  assert.ok(references.sources.some(source => source.sourceType === 'knowledge'))
  assert.ok(references.sources.some(source => source.sourceType === 'live'))
})

test('网络搜索只在时效问题触发，并避免发送明确隐私记忆', () => {
  assert.equal(needsWebSearch('雷电将军最近有复刻消息吗？'), true)
  assert.equal(needsWebSearch('你如何理解永恒？'), false)
  assert.equal(needsWebSearch('请记住，我的生日是 6 月 26 日，最近我有点累'), false)

  const query = buildWebSearchQuery('影，最近雷电将军什么时候复刻？')
  assert.match(query, /原神 雷电将军/)
  assert.ok(query.length <= 120)
})

test('Brave 网络搜索结果会合并为可引用来源', async () => {
  const originalFetch = globalThis.fetch
  let requestedUrl
  globalThis.fetch = async (input, options = {}) => {
    requestedUrl = String(input)
    assert.equal(options.headers['X-Subscription-Token'], 'brave-test-key')
    return Response.json({
      web: {
        results: [{
          title: '雷电将军复刻公告',
          description: '测试用搜索摘要。',
          url: 'https://example.com/raiden-news',
          profile: { name: '示例来源' },
          age: '2026-09-06T00:00:00Z',
        }],
      },
    })
  }

  try {
    const result = await retrieveWebSources('最近雷电将军复刻了吗？', { BRAVE_SEARCH_API_KEY: 'brave-test-key' })
    assert.match(requestedUrl, /api\.search\.brave\.com/)
    assert.equal(result.provider, 'brave')
    assert.equal(result.sources.length, 1)
    assert.equal(result.sources[0].sourceType, 'web')

    const references = buildChatReferences(null, { entries: [] }, result.sources)
    assert.match(references.context, /网络搜索/)
    assert.equal(references.sources[0].sourceType, 'web')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('典型问题稳定命中对应知识节点', () => {
  const cases = [
    ['将军人偶和影是双重人格吗', 'identity-ei-and-shogun'],
    ['眼狩令是谁的责任', 'timeline-vision-hunt'],
    ['影还记得散兵吗', 'relationship-wanderer'],
    ['御舆千代是天狗吗', 'relationship-chiyo'],
    ['为什么影喜欢团子牛奶', 'daily-sweets'],
    ['如何理解须臾和永恒', 'philosophy-transience'],
    ['海祇岛怎么看奥罗巴斯', 'world-watatsumi-and-orobashi'],
    ['影会做饭吗', 'daily-cooking'],
    ['怎么和影切磋武艺', 'combat-martial-legacy'],
    ['天理和坎瑞亚的真相是什么', 'world-khaenriah'],
    ['团子牛奶为什么能改变影', 'daily-sweets'],
    ['神樱是谁种下的', 'world-sacred-sakura-loop'],
    ['影认识伊斯塔露吗', 'world-istaroth-boundary'],
    ['荒泷一斗是谁', 'relationship-itto'],
    ['将军人偶有自己的意志吗', 'identity-shogun-independent-will'],
    ['诸愿百眼之轮的愿力怎么积攒', 'combat-resolve-chakra'],
    ['梦想一心和无想的一刀有什么区别', 'combat-musou'],
  ]
  for (const [query, expectedTopId] of cases) {
    const result = searchKnowledge(knowledgeBase, query)
    assert.equal(result.entries[0]?.id, expectedTopId, query)
  }

  const dangoInsight = searchKnowledge(knowledgeBase, '团子牛奶为什么能改变影')
  assert.ok(dangoInsight.entries.some(entry => entry.id === 'timeline-city-walk'))

  const uncertain = searchKnowledge(knowledgeBase, '天理和坎瑞亚的真相是什么')
  assert.ok(!uncertain.entries.some(entry => entry.id === 'daily-poetry-and-cards'))
})

test('聊天接口使用 Flash 0731 协议并返回可持久化状态', async () => {
  const originalFetch = globalThis.fetch
  let deepSeekPayload
  globalThis.fetch = async (input, options = {}) => {
    const url = String(input)
    if (url.includes('shrine-data/knowledge-base.json')) {
      return Response.json(knowledgeBase)
    }
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
    assert.equal(data.knowledgeVersion, knowledgeBase.knowledgeVersion)
    assert.ok(data.knowledgeMatches.some(entry => entry.id === 'values-wishes'))
    assert.ok(data.sources.some(source => source.sourceType === 'knowledge'))
    assert.equal(data.webSearch.skipped, 'not-needed')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('聊天接口会把网络搜索资料注入提示并返回来源', async () => {
  const originalFetch = globalThis.fetch
  let deepSeekPayload
  globalThis.fetch = async (input, options = {}) => {
    const url = String(input)
    if (url.includes('shrine-data/knowledge-base.json')) return Response.json(knowledgeBase)
    if (url.includes('shrine-data/index.json')) {
      return Response.json({
        character: { sources: [] },
        liveSearch: { generatedAt: '2026-09-06T00:00:00Z', wiki: [], news: [] },
        guides: [],
        news: [],
      })
    }
    if (url.startsWith('https://api.search.brave.com/')) {
      assert.equal(options.headers['X-Subscription-Token'], 'brave-test-key')
      return Response.json({
        web: {
          results: [{
            title: '雷电将军近期活动',
            description: '近期活动测试摘要。',
            url: 'https://example.com/live-event',
            profile: { name: '活动来源' },
          }],
        },
      })
    }
    if (url === 'https://api.deepseek.com/chat/completions') {
      deepSeekPayload = JSON.parse(options.body)
      return Response.json({ choices: [{ message: { content: '此事我只听闻一二。[1]' } }] })
    }
    throw new Error(`unexpected fetch: ${url}`)
  }

  try {
    const response = await worker.fetch(new Request('https://example.com/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: '最近雷电将军有什么活动？' }],
        session: { trustScore: 4, memory: [] },
      }),
    }), { DEEPSEEK_API_KEY: 'test-key', BRAVE_SEARCH_API_KEY: 'brave-test-key' })
    const data = await response.json()

    assert.equal(response.status, 200)
    assert.ok(deepSeekPayload.messages.some(message => /网络搜索/.test(message.content)))
    assert.ok(data.sources.some(source => source.sourceType === 'web'))
    assert.equal(data.webSearch.resultCount, 1)
    assert.equal(data.webSearch.provider, 'brave')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('知识库查询接口返回版本、确定性与可核对来源', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async input => {
    if (String(input).includes('shrine-data/knowledge-base.json')) return Response.json(knowledgeBase)
    throw new Error(`unexpected fetch: ${input}`)
  }

  try {
    const response = await worker.fetch(
      new Request('https://example.com/api/shrine/knowledge?q=御舆千代是天狗吗'),
      {},
    )
    const data = await response.json()
    assert.equal(response.status, 200)
    assert.equal(data.knowledgeVersion, knowledgeBase.knowledgeVersion)
    assert.ok(data.entryCount >= 30)
    assert.equal(data.results[0].id, 'relationship-chiyo')
    assert.ok(data.results[0].sources[0].url.startsWith('https://'))
  } finally {
    globalThis.fetch = originalFetch
  }
})
