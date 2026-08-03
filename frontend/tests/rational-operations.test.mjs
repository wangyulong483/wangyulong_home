import test from 'node:test'
import assert from 'node:assert/strict'
import {
  formatRational,
  powerFactors,
  powerValue,
  rationalOperation,
  signRule,
} from '../src/features/tutoring/lib/rational.js'

test('有理数四则运算保留符号并约分', () => {
  assert.equal(rationalOperation(-8, 3, 'add').text, '-5')
  assert.equal(rationalOperation(6, -4, 'subtract').text, '10')
  assert.equal(rationalOperation(-3, -5, 'multiply').text, '15')
  assert.equal(rationalOperation(-18, 12, 'divide').text, '-3/2')
  assert.equal(rationalOperation(4, 0, 'divide').text, '除数不能为 0')
  assert.equal(formatRational(0, -9), '0')
  assert.equal(formatRational(0.75, 1), '3/4')
  assert.equal(formatRational(-1.5, 2.25), '-2/3')
  assert.equal(rationalOperation(1.25, -0.8, 'add').text, '0.45')
  assert.equal(rationalOperation(-1.5, 2.25, 'divide').text, '-2/3')
})

test('乘方正确区分负数底数是否带括号', () => {
  assert.equal(powerValue(-2, 4, true), 16)
  assert.equal(powerValue(-2, 4, false), -16)
  assert.equal(powerValue(-3, 0, true), 1)
  assert.deepEqual(powerFactors(-2, 3, true), ['(-2)', '(-2)', '(-2)'])
  assert.deepEqual(powerFactors(-2, 3, false), ['-2', '2', '2'])
})

test('乘除法同号得正、异号得负', () => {
  assert.equal(signRule(-2, -7), 'same')
  assert.equal(signRule(-2, 7), 'different')
})
