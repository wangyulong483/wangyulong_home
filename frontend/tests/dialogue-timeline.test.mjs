/*
  对话纪年 — 配对规则测试

  目的：把「时间轴描述对话历史」固定成回归契约：
  一条用户消息 + 紧随其后的助手回复 = 一轮；卷首引语单独存放；跳转下标指回原消息。
*/
import test from 'node:test'
import assert from 'node:assert/strict'

import { buildConversationTimeline, formatClock } from '../src/features/dialogue/composables/useDialogueTimeline.js'

test('空消息只得到空轴', () => {
  const timeline = buildConversationTimeline([])
  assert.deepEqual(timeline.nodes, [])
  assert.equal(timeline.greeting, null)
  assert.deepEqual(timeline.stats, { rounds: 0, answered: 0, sources: 0 })
})

test('问候语单独成为卷首引语', () => {
  const timeline = buildConversationTimeline([
    { role: 'assistant', content: '雷光已静。', createdAt: '2026-10-23T09:00:00.000Z' },
  ])
  assert.equal(timeline.nodes.length, 0)
  assert.equal(timeline.greeting.text, '雷光已静。')
  assert.equal(timeline.greeting.index, 0)
  assert.equal(timeline.stats.rounds, 0)
})

test('一问一答配成一轮，并保留下标与来源数', () => {
  const timeline = buildConversationTimeline([
    { role: 'assistant', content: '雷光已静。' },
    { role: 'user', content: '何为永恒？', createdAt: '2026-10-23T01:00:00.000Z' },
    {
      role: 'assistant',
      content: '永恒并非静止。',
      retrievedAt: '2026-10-23T01:02:00.000Z',
      sources: [{ url: 'https://example.com/a', title: 'A' }, { title: '没有链接，不计入' }],
    },
  ])

  assert.equal(timeline.nodes.length, 1)
  const [node] = timeline.nodes
  assert.equal(node.id, 'turn-1')
  assert.equal(node.mark, '01')
  assert.equal(node.question, '何为永恒？')
  assert.equal(node.answer, '永恒并非静止。')
  assert.equal(node.userIndex, 1)
  assert.equal(node.answerIndex, 2)
  assert.equal(node.sources, 1)
  assert.equal(node.statusLabel, '已落笔')
  assert.equal(node.timeLabel, formatClock('2026-10-23T01:02:00.000Z'))
  assert.deepEqual(timeline.stats, { rounds: 1, answered: 1, sources: 1 })
})

test('多轮对话按顺序配对，编号从 01 起', () => {
  const timeline = buildConversationTimeline([
    { role: 'assistant', content: '序' },
    { role: 'user', content: '第一问' },
    { role: 'assistant', content: '第一答' },
    { role: 'user', content: '第二问' },
    { role: 'assistant', content: '第二答', streaming: true },
    { role: 'user', content: '第三问' },
  ])

  assert.deepEqual(timeline.nodes.map(node => node.mark), ['01', '02', '03'])
  assert.deepEqual(timeline.nodes.map(node => node.question), ['第一问', '第二问', '第三问'])
  assert.equal(timeline.nodes[0].answer, '第一答')
  assert.equal(timeline.nodes[1].answer, '第二答')
  assert.equal(timeline.nodes[1].streaming, true)
  assert.equal(timeline.nodes[1].statusLabel, '生成中')
  assert.equal(timeline.nodes[2].statusLabel, '待答')
  assert.equal(timeline.nodes[2].answerIndex, -1)
  assert.equal(timeline.stats.answered, 2)
})

test('流式占位助手消息也能成为可读节点', () => {
  const timeline = buildConversationTimeline([
    { role: 'user', content: '在吗？' },
    { role: 'assistant', content: '', streaming: true },
  ])
  const [node] = timeline.nodes
  assert.equal(node.streaming, true)
  assert.equal(node.answer, '影正在思量……')
  assert.equal(node.answerIndex, 1)
  assert.equal(node.statusLabel, '生成中')
})

test('连续两条用户消息各自成轮，助手只回答最后一条', () => {
  const timeline = buildConversationTimeline([
    { role: 'user', content: '问题一' },
    { role: 'user', content: '问题二' },
    { role: 'assistant', content: '只答最后' },
  ])
  assert.equal(timeline.nodes.length, 2)
  assert.equal(timeline.nodes[0].answerIndex, -1)
  assert.equal(timeline.nodes[1].answer, '只答最后')
  assert.equal(timeline.nodes[1].answerIndex, 2)
})

test('非对话角色与空白消息被忽略', () => {
  const timeline = buildConversationTimeline([
    { role: 'system', content: '系统提示' },
    { role: 'user', content: '   ' },
    { role: 'user', content: '有效问题' },
    { role: 'assistant', content: '有效回答' },
  ])
  assert.equal(timeline.nodes.length, 1)
  assert.equal(timeline.nodes[0].userIndex, 2)
  assert.equal(timeline.nodes[0].answerIndex, 3)
})

test('时间格式化对无效值返回空串', () => {
  assert.equal(formatClock(null), '')
  assert.equal(formatClock(''), '')
  assert.equal(formatClock('not-a-date'), '')
  assert.match(formatClock('2026-10-23T01:02:00.000Z'), /^\d{2}:\d{2}$/)
})
