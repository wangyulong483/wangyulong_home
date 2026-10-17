/*
  与影对谈 — 流式客户端测试

  目的：把前端与 Worker 之间的 SSE 契约固定下来。
  覆盖：meta / delta / replace / done / error 事件、跨 chunk 的行缓冲、
        以及后端未升级时的 JSON 降级路径。
*/
import test from 'node:test'
import assert from 'node:assert/strict'

// ---- 最小浏览器环境桩 ----
class MemoryStorage {
  constructor() { this.map = new Map() }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null }
  setItem(key, value) { this.map.set(key, String(value)) }
  removeItem(key) { this.map.delete(key) }
}
globalThis.localStorage = new MemoryStorage()

const { useDialogue } = await import('../src/features/dialogue/composables/useDialogue.js')

const encoder = new TextEncoder()

/** 把事件数组编码成 SSE 文本块（可指定切分点，用于测试行缓冲） */
function sseChunks(events, splitAt) {
  const text = events.map(event => `data: ${JSON.stringify(event)}\n\n`).join('')
  if (!splitAt) return [encoder.encode(text)]
  return [
    encoder.encode(text.slice(0, splitAt)),
    encoder.encode(text.slice(splitAt)),
  ]
}

function streamResponse(chunks) {
  const stream = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk)
      controller.close()
    },
  })
  return new Response(stream, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream; charset=utf-8' },
  })
}

function mockFetch(handler) {
  const calls = []
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options })
    return handler(url, options)
  }
  return calls
}

const META = {
  type: 'meta',
  persona: 'ei',
  personaLabel: '闲谈',
  emotion: 'gentle',
  emotionLabel: '温和',
  relationship: 'familiar',
  relationshipLabel: '相识',
  trustScore: 5,
  turnCount: 2,
  sources: [{ url: 'https://example.com/a', title: '来源甲', source: '原神官方', sourceType: 'web' }],
  knowledgeVersion: '2026.08.03',
  webSearch: { provider: 'brave', resultCount: 1, skipped: null },
  githubTool: { tool: 'github-mcp', resultCount: 0, skipped: 'not-needed' },
  personaCard: { source: 'LC1332/Chat-Haruhi-Suzumiya', url: 'https://github.com/x', loaded: true },
  model: 'DeepSeek-V4.1-Flash-0910',
  safety: { route: 'fast', revision: 'skipped' },
}

/** 注意：META 自带 type:'meta'，必须展开在前，否则会覆盖 done/error 的 type */
const doneEvent = (content, extra = {}) => ({ ...META, type: 'done', content, ...extra })
const event = (payload) => `data: ${JSON.stringify(payload)}\n\n`

test('流式：meta 先行、delta 累积、done 收敛为最终内容', async () => {
  localStorage.removeItem('shrine-ei-dialogue-v3')
  const calls = mockFetch(() => streamResponse([
    encoder.encode(event(META)),
    encoder.encode(event({ type: 'delta', text: '雷光' })),
    encoder.encode(event({ type: 'delta', text: '已静。' })),
    encoder.encode(event(doneEvent('雷光已静。', {
      memoryUpdates: [{ kind: '称呼', key: 'name', value: '旅者' }],
    }))),
  ]))

  const dialogue = useDialogue()
  dialogue.restoreChat()
  await dialogue.send('你好')

  const assistant = dialogue.messages.at(-1)
  assert.equal(assistant.role, 'assistant')
  assert.equal(assistant.content, '雷光已静。')
  assert.equal(assistant.streaming, false)
  assert.equal(assistant.sources.length, 1)
  assert.equal(assistant.personaLabel, '闲谈')

  // 会话状态来自 meta
  assert.equal(dialogue.session.persona, 'ei')
  assert.equal(dialogue.session.relationshipLabel, '相识')
  assert.equal(dialogue.session.trustScore, 5)
  assert.equal(dialogue.session.memory.length, 1)

  // 工具与模型状态进入侧栏
  assert.equal(dialogue.lastToolState.model, 'DeepSeek-V4.1-Flash-0910')
  assert.equal(dialogue.lastToolState.personaCard.loaded, true)
  assert.equal(dialogue.lastToolState.web.resultCount, 1)

  // 请求体带 stream: true，且历史里不包含正在流式的占位消息
  const body = JSON.parse(calls[0].options.body)
  assert.equal(body.stream, true)
  assert.equal(body.messages.at(-1).content, '你好')
  assert.ok(!body.messages.some(message => message.content === ''))
})

test('流式：单个事件被切成两个 chunk 时仍能正确解析', async () => {
  localStorage.removeItem('shrine-ei-dialogue-v3')
  const events = [
    META,
    { type: 'delta', text: '愚问。' },
    doneEvent('愚问。'),
  ]
  const full = events.map(event).join('')
  // 切在第一个事件中间，迫使客户端做跨 chunk 的行缓冲
  const cut = Math.floor(full.length * 0.35)
  mockFetch(() => streamResponse(sseChunks(events, cut)))

  const dialogue = useDialogue()
  dialogue.restoreChat()
  await dialogue.send('你是谁')

  assert.equal(dialogue.messages.at(-1).content, '愚问。')
})

test('流式：replace 事件会覆盖已累积的文本', async () => {
  localStorage.removeItem('shrine-ei-dialogue-v3')
  mockFetch(() => streamResponse([
    encoder.encode(event(META)),
    encoder.encode(event({ type: 'delta', text: '初稿内容。' })),
    encoder.encode(event({ type: 'replace', text: '修订后的内容。' })),
    encoder.encode(event(doneEvent('修订后的内容。', { safety: { route: 'slow', revision: 'applied' } }))),
  ]))

  const dialogue = useDialogue()
  dialogue.restoreChat()
  await dialogue.send('眼狩令是谁的责任')

  assert.equal(dialogue.messages.at(-1).content, '修订后的内容。')
  assert.equal(dialogue.lastToolState.safety.revision, 'applied')
})

test('流式：error 事件给出错误提示并保留已收到文本', async () => {
  localStorage.removeItem('shrine-ei-dialogue-v3')
  mockFetch(() => streamResponse([
    encoder.encode(event(META)),
    encoder.encode(event({ type: 'delta', text: '话说到一半' })),
    encoder.encode(event({ type: 'error', message: '上游超时' })),
  ]))

  const dialogue = useDialogue()
  dialogue.restoreChat()
  await dialogue.send('继续')

  const assistant = dialogue.messages.at(-1)
  assert.equal(assistant.content, '话说到一半')
  assert.match(dialogue.connectionError.value, /上游超时/)
  assert.equal(dialogue.loading.value, false)
})

test('降级：后端返回普通 JSON 时仍能完成一次对话', async () => {
  localStorage.removeItem('shrine-ei-dialogue-v3')
  const calls = mockFetch(() => Response.json({
    ...META,
    role: 'assistant',
    content: '此事我只听闻一二。',
    persona: 'academic',
    personaLabel: '考究',
    memoryUpdates: [],
  }, { headers: { 'Content-Type': 'application/json' } }))

  const dialogue = useDialogue()
  dialogue.restoreChat()
  await dialogue.send('稻妻的近况')

  assert.equal(calls.length, 1)
  assert.equal(dialogue.messages.at(-1).content, '此事我只听闻一二。')
  assert.equal(dialogue.messages.at(-1).streaming, false)
  assert.equal(dialogue.session.personaLabel, '考究')
  assert.equal(dialogue.connectionError.value, '')
})

test('网络失败：给出可读提示并写入兜底回复', async () => {
  localStorage.removeItem('shrine-ei-dialogue-v3')
  mockFetch(() => { throw new Error('network down') })

  const dialogue = useDialogue()
  dialogue.restoreChat()
  await dialogue.send('在吗')

  assert.match(dialogue.connectionError.value, /network down/)
  assert.match(dialogue.messages.at(-1).content, /门扉暂未开启/)
  assert.equal(dialogue.loading.value, false)
})

test('对话持久化：重载后能恢复消息与会话状态', async () => {
  localStorage.removeItem('shrine-ei-dialogue-v3')
  mockFetch(() => streamResponse([
    encoder.encode(event(META)),
    encoder.encode(event(doneEvent('嗯。'))),
  ]))

  const first = useDialogue()
  first.restoreChat()
  await first.send('在吗')
  const savedCount = first.messages.length

  const second = useDialogue()
  second.restoreChat()
  assert.equal(second.messages.length, savedCount)
  assert.equal(second.messages.at(-1).content, '嗯。')
  assert.equal(second.session.relationshipLabel, '相识')
})
