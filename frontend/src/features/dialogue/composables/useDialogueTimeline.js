/*
  对话纪年 — 把消息流折成一条可读的时间轴

  与「鸣神纪年」不同：这里不描述背景故事，只记录用户与影真实说过的话。
  规则：
  - 一条用户消息开启一轮；紧随其后的第一条助手消息是这一轮的回答。
  - 第一轮之前、没有用户消息时的助手消息视为「卷首引语」（greeting）。
  - 所有字段都保持纯数据，方便单元测试与组件复用。
*/

/** 把 ISO 时间格式化为 HH:mm；无效值返回空串 */
export function formatClock(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function validSourceCount(sources) {
  if (!Array.isArray(sources)) return 0
  return sources.filter(source => source && source.url).length
}

/**
 * @param {Array<{role:string, content:string, createdAt?:string, retrievedAt?:string, streaming?:boolean, sources?:Array}>} messages
 * @returns {{ greeting: {text:string,time:string|null,index:number}|null, nodes: Array, stats: {rounds:number, answered:number, sources:number} }}
 */
export function buildConversationTimeline(messages) {
  const list = Array.isArray(messages) ? messages : []
  const rounds = []
  let greeting = null

  list.forEach((message, index) => {
    if (!message || typeof message !== 'object') return
    const content = cleanText(message.content)

    if (message.role === 'user') {
      if (!content) return
      rounds.push({
        id: `turn-${rounds.length + 1}`,
        mark: String(rounds.length + 1).padStart(2, '0'),
        question: content,
        answer: '',
        userIndex: index,
        answerIndex: -1,
        time: message.createdAt || null,
        streaming: false,
        sources: 0,
      })
      return
    }

    if (message.role !== 'assistant') return

    const current = rounds[rounds.length - 1]
    if (!current) {
      if (!greeting && content) {
        greeting = {
          text: content,
          time: message.createdAt || message.retrievedAt || null,
          index,
        }
      }
      return
    }

    // 只把一轮之后的第一条助手消息当作回答，后续提示消息不覆盖
    if (current.answerIndex !== -1) return

    current.answer = content
    current.answerIndex = index
    current.streaming = Boolean(message.streaming) || !content
    current.sources = validSourceCount(message.sources)
    if (message.retrievedAt) current.time = message.retrievedAt
    if (!current.time && message.createdAt) current.time = message.createdAt
  })

  const nodes = rounds.map(node => ({
    ...node,
    answer: node.answer || (node.streaming ? '影正在思量……' : '……'),
    timeLabel: formatClock(node.time),
    statusLabel: node.answerIndex === -1 ? '待答' : node.streaming ? '生成中' : '已落笔',
  }))

  return {
    greeting,
    nodes,
    stats: {
      rounds: nodes.length,
      answered: nodes.filter(node => node.answerIndex !== -1).length,
      sources: nodes.reduce((sum, node) => sum + node.sources, 0),
    },
  }
}
