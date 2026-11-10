import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toCsv } from '../src/csv.ts'

test('CSV preserves separators, quotes, newlines and negative numeric results', () => {
  assert.equal(toCsv([['Soja; "A"\nB', -42]]), '\uFEFF"Soja; ""A""\nB";"-42"')
})
test('CSV protects spreadsheet formulas in farmer-entered text', () => {
  assert.equal(
    toCsv([['=1+1', ' @SUM(A1)', '+2', '-texto']]),
    '\uFEFF"\'=1+1";"\' @SUM(A1)";"\'+2";"\'-texto"',
  )
})
