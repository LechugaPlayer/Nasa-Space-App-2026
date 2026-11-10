import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calculate, initialScenarios } from '../src/calc.ts'

test('known three-campaign budget and hectare scaling', () => {
  const a = calculate(initialScenarios[0], 120, {}, 0, 0, 0)
  assert.equal(a.revenue, 366120)
  assert.equal(a.cost, 248400)
  assert.equal(a.net, 117720)
  assert.equal(a.maxCapital, 94200)
  const b = calculate(initialScenarios[0], 1, {}, 0, 0, 0)
  assert.equal(a.breakPrice, b.breakPrice)
  assert.equal(a.net, b.net * 120)
})
test('sensitivities and fixed additional costs follow the budget', () => {
  const scenario = {
    name: 'Test',
    color: '',
    crops: [{ crop: 'Soja', yieldT: 3, price: 400, direct: 500, other: 100 }],
  }
  const r = calculate(
    scenario,
    10,
    { Tierra: true, Maquinaria: true, Financiación: true },
    300,
    100,
    50,
    -10,
    -20,
    20,
  )
  const expectedRevenue = 3 * 0.8 * 400 * 0.9 * 10
  const expectedCost = (500 * 1.2 + 100 * 1.2 + 300 + 100 + 50) * 10
  assert.ok(Math.abs(r.net - (expectedRevenue - expectedCost)) < 1e-8)
  assert.ok(Math.abs(r.breakPrice - expectedCost / (3 * 0.8 * 10)) < 1e-8)
  assert.ok(Math.abs(r.breakYield - expectedCost / 10 / 360) < 1e-8)
})
test('zero production or price does not imply zero break-even', () => {
  const scenario = {
    name: 'Zero',
    color: '',
    crops: [{ crop: 'Soja', yieldT: 0, price: 0, direct: 500, other: 0 }],
  }
  const r = calculate(scenario, 120, {}, 0, 0, 0)
  assert.equal(r.breakPrice, Infinity)
  assert.equal(r.breakYield, Infinity)
  assert.equal(r.net, -60000)
})

test('multiple crop campaigns do not expose a misleading blended break-even', () => {
  const result = calculate(initialScenarios[0], 1, {}, 0, 0, 0)
  assert.equal(result.breakPrice, Infinity)
  assert.equal(result.breakYield, Infinity)
})

test('a single campaign has independently verifiable break-even and losses', () => {
  const result = calculate(
    {
      name: 'Budget',
      color: '',
      crops: [{ crop: 'Soja', yieldT: 2, price: 300, direct: 600, other: 100 }],
    },
    10,
    {},
    0,
    0,
    0,
  )
  assert.equal(result.breakPrice, 350)
  assert.equal(result.breakYield, 700 / 300)
  assert.equal(result.net, -1000)
})
