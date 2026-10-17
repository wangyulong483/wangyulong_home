/*
  鸣神纪年 — 年表数据测试

  目的：把「年表不得脱离站内知识库、不得编造年份」这条纪律固定成回归测试。
  年表节点必须逐条对应 frontend/public/shrine-data/knowledge-base.json 中
  certainty 为 canonical 的 timeline 条目（这些条目的 layer 可能是「经历」或「治理」）。
*/
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { CHRONICLE_NODES, CHRONICLE_SOURCE } from '../src/features/dialogue/data/chronicle.js'

const knowledgeBase = JSON.parse(readFileSync(
  new URL('../public/shrine-data/knowledge-base.json', import.meta.url),
  'utf8',
))

const isTimelineEntry = entry => typeof entry?.id === 'string' && entry.id.startsWith('timeline-')
const timelineEntries = knowledgeBase.entries.filter(isTimelineEntry)
const canonicalTimeline = timelineEntries.filter(entry => entry.certainty === 'canonical')
const entryById = new Map(knowledgeBase.entries.map(entry => [entry.id, entry]))

test('年表节点与知识库 canonical 时间线条目一一对应', () => {
  const nodeEntryIds = CHRONICLE_NODES.map(node => node.entryId)
  const canonicalIds = canonicalTimeline.map(entry => entry.id)

  assert.ok(canonicalIds.length > 0, '知识库中应当存在 canonical 时间线条目')
  assert.equal(new Set(nodeEntryIds).size, nodeEntryIds.length, '年表存在重复的 entryId')
  assert.deepEqual(
    [...nodeEntryIds].sort(),
    [...canonicalIds].sort(),
    '年表节点必须完整覆盖知识库的 canonical 时间线条目，且不引入多余条目',
  )
})

test('每个年表节点引用的条目都存在且是确定性条目', () => {
  for (const node of CHRONICLE_NODES) {
    const entry = entryById.get(node.entryId)
    assert.ok(entry, `年表节点 ${node.id} 引用了不存在的知识库条目 ${node.entryId}`)
    assert.match(entry.id, /^timeline-/, `条目 ${node.entryId} 应当是时间线条目`)
    assert.ok(['经历', '治理'].includes(entry.layer), `条目 ${node.entryId} 的 layer 应为「经历」或「治理」`)
    assert.equal(entry.certainty, 'canonical', `条目 ${node.entryId} 必须是 canonical，不能引用推测条目`)
    assert.ok(entry.content?.trim(), `条目 ${node.entryId} 缺少正文内容`)
  }
})

test('年表沿用知识库的时间顺序，不重排史实', () => {
  const nodeEntryIds = CHRONICLE_NODES.map(node => node.entryId)
  const canonicalIds = canonicalTimeline.map(entry => entry.id)
  assert.deepEqual(nodeEntryIds, canonicalIds, '年表顺序应与知识库时间线条目顺序一致')
})

test('年表不编造具体年份', () => {
  for (const node of CHRONICLE_NODES) {
    const text = [node.era, node.eraNote, node.title, node.summary, node.them].join(' ')
    assert.doesNotMatch(
      text,
      /\d{3,4}\s*年/,
      `年表节点 ${node.id} 出现了具体年份数字；原作未给出年份，只能用时期标注`,
    )
    assert.doesNotMatch(text, /\d{1,2}\s*月\s*\d{1,2}\s*日/, `年表节点 ${node.id} 出现了具体日期`)
  }
})

test('年表节点字段完整、序号唯一', () => {
  const marks = new Set()
  for (const node of CHRONICLE_NODES) {
    for (const field of ['id', 'entryId', 'era', 'eraNote', 'mark', 'title', 'summary', 'them']) {
      assert.equal(typeof node[field], 'string', `年表节点 ${node.id} 的 ${field} 应为字符串`)
      assert.ok(node[field].trim(), `年表节点 ${node.id} 的 ${field} 不能为空`)
    }
    assert.ok(!marks.has(node.mark), `年表序号 ${node.mark} 重复`)
    marks.add(node.mark)
  }
  assert.equal(CHRONICLE_NODES.length, canonicalTimeline.length, '年表节点数量应与知识库 canonical 时间线条目数量一致')
})

test('年表资料来源说明标明依据与年份边界', () => {
  assert.ok(CHRONICLE_SOURCE.label.trim())
  assert.match(CHRONICLE_SOURCE.detail, /canonical|确定性/)
  assert.match(CHRONICLE_SOURCE.detail, /年份/)
})
