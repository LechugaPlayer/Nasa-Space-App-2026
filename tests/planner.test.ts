import { test } from 'node:test'
import assert from 'node:assert/strict'
import { casePlan, demoPlan } from '../src/planner/demo.ts'
import { dates, dateValue, overlaps, parsePlan, validatePlan } from '../src/planner/model.ts'
import { analyze } from '../src/planner/analysis.ts'
import { budgetStrategy, budgetCycle } from '../src/planner/economics.ts'
import { loadPlan, savePlan } from '../src/planner/storage.ts'
import { parseReferences, parseDelimited } from '../src/planner/references.ts'

test('strict Gregorian dates, leap years, reversed and oversized horizons', () => {
  assert.equal(dates('2024-02-28', '2024-03-01').length, 3)
  assert.ok(Number.isNaN(dateValue('2025-02-29')))
  assert.deepEqual(dates('2025-01-02', '2025-01-01'), [])
  assert.deepEqual(dates('2024-01-01', '2026-01-01'), [])
})
test('all three illustrative cases validate and have independent nested state', () => {
  for (const id of ['itapua', 'alto-parana', 'caaguazu'])
    assert.deepEqual(validatePlan(casePlan(id)), [])
  const p = demoPlan()
  p.strategies[1].cycles[0].price = 0
  assert.equal(p.strategies[0].cycles[0].price, 220)
})
test('malformed files reject missing fields, duplicates, bad dates and future schemas', () => {
  for (const value of [null, {}, { schemaVersion: 3 }, { ...demoPlan(), strategies: [] }])
    assert.throws(() => parsePlan(value))
  const p = demoPlan()
  p.strategies[1].id = p.strategies[0].id
  assert.ok(validatePlan(p).some((x) => x.includes('duplicados')))
  const q = demoPlan()
  q.strategies[0].cycles[0].saleDate = '2024-01-01'
  assert.ok(validatePlan(q).some((x) => x.includes('fechas')))
})
test('invalid budgets and cover-crop sales are rejected', () => {
  const p = demoPlan()
  p.strategies[0].cycles[0].price = NaN
  assert.throws(() => parsePlan(p))
  const q = demoPlan()
  q.strategies[2].cycles[2].price = 100
  assert.throws(() => parsePlan(q))
})
test('overlap uses inclusive end dates and suspends economic totals', () => {
  const p = demoPlan(),
    s = p.strategies[0]
  s.cycles[1].start = s.cycles[0].end
  s.cycles[1].payDate = s.cycles[1].start
  assert.equal(overlaps(s).length, 1)
  assert.equal(budgetStrategy(s, p).net, null)
  assert.ok(analyze(s, p, null).covered <= 365)
})
test('independent budget: 120 ha, wheat + soybean, cash timeline', () => {
  const p = demoPlan(),
    b = budgetStrategy(p.strategies[0], p)
  assert.equal(b.revenue, (2.7 * 220 + 3.2 * 390) * 120)
  assert.equal(b.cost, (430 + 70 + 690 + 95) * 120)
  assert.equal(b.net, 66840)
  assert.equal(b.funding, 82920)
  assert.equal(b.cash.at(-1)?.balance, b.net)
})
test('rented case includes land exactly once and identifies capital shortfall', () => {
  const p = casePlan('alto-parana'),
    b = budgetStrategy(p.strategies[0], p)
  assert.ok(Math.abs(b.net! - -13965) < 1e-6)
  assert.equal(b.funding, 67005)
  assert.ok(b.funding! > p.plot.capital!)
})
test('cover costs money with zero sales and increases scheduled live-crop days', () => {
  const p = casePlan('caaguazu'),
    base = analyze(p.strategies[0], p, null),
    cover = analyze(p.strategies[2], p, null)
  assert.equal(base.covered, 234)
  assert.equal(cover.covered, 342)
  assert.equal(cover.budget.net, base.budget.net! - 150 * 15)
  assert.equal(cover.budget.cycles[2].result?.revenue, 0)
  assert.equal(p.strategies[1].buyer, 'no')
})
test('unknown costs remain unknown; a budget with zero costs remains valid', () => {
  const p = demoPlan(),
    c = p.strategies[0].cycles[0]
  c.direct = null
  assert.equal(budgetCycle(c, 1), null)
  assert.equal(budgetStrategy(p.strategies[0], p).net, null)
  c.direct = 0
  c.other = 0
  c.extra = 0
  assert.equal(budgetCycle(c, 1)?.cost, 0)
})
test('land-only fallow has negative net and no invented bare-soil classification', () => {
  const p = casePlan('alto-parana')
  p.strategies[0].cycles = []
  const a = analyze(p.strategies[0], p, null)
  assert.equal(a.budget.net, -25000)
  assert.equal(a.budget.funding, 25000)
  assert.equal(a.covered, 0)
  assert.ok(a.signals[0].detail.includes('No equivale a suelo desnudo'))
})
test('sensitivity adjusts price/yield/direct costs; fixed land stays fixed', () => {
  const p = demoPlan(),
    s = p.strategies[0]
  assert.ok(budgetStrategy(s, p, 'bajo').net! < budgetStrategy(s, p).net!)
  assert.ok(budgetStrategy(s, p, 'alto').net! > budgetStrategy(s, p).net!)
  p.plot.landCost = 500
  assert.equal(
    budgetStrategy(s, p, 'base').cost! - budgetStrategy(s, demoPlan(), 'base').cost!,
    60000,
  )
})
test('corrupt storage is preserved and write failures propagate', () => {
  const loaded = loadPlan({ getItem: () => '{bad' })
  assert.equal(loaded.recovery, '{bad')
  assert.ok(loaded.message)
  assert.throws(
    () =>
      savePlan(
        {
          setItem: () => {
            throw new Error('quota')
          },
        },
        demoPlan(),
      ),
    /quota/,
  )
})
test('CSV parser preserves quoted separators, escaped quotes and embedded newlines', () => {
  assert.deepEqual(parseDelimited('a,b\r\n"line\n1","A""B"'), [
    ['a', 'b'],
    ['line\n1', 'A"B'],
  ])
  assert.throws(() => parseDelimited('a,b\n"unclosed'))
})
test('price references require provenance, currency, unit and dates', () => {
  const header = 'crop,date,market,currency,unit,price,kind\n'
  const row = 'soja,2025-03-15,"Venta, local",USD,USD/t,390,venta'
  assert.equal(parseReferences(header + row)[0].market, 'Venta, local')
  for (const bad of [
    row.replace('USD,', 'PYG,'),
    row.replace('2025-03-15', '2025-02-30'),
    row.replace('390', '=1+1'),
    row.replace('USD/t', 'USD/kg'),
  ])
    assert.throws(() => parseReferences(header + bad))
})
