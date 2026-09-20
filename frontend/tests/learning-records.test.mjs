import assert from 'node:assert/strict'
import test from 'node:test'

import { learningRecords } from '../src/features/learning/data/records.js'

test('学习记录使用唯一 ID 并按日期倒序排列', () => {
  const ids = learningRecords.map(record => record.id)
  const dates = learningRecords.map(record => record.date)

  assert.equal(new Set(ids).size, ids.length)
  assert.deepEqual(dates, [...dates].sort().reverse())
})

test('每条学习记录都包含可展示和复制的代码', () => {
  for (const record of learningRecords) {
    assert.ok(record.title)
    assert.ok(record.category)
    assert.ok(record.summary)
    assert.ok(record.points.length > 0)
    assert.ok(record.code.language)
    assert.ok(record.code.filename)
    assert.ok(record.code.value.trim())
  }
})
