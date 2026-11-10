import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  climateSummary,
  compatible,
  fetchPower,
  parsePower,
  powerUrl,
  weatherFromEnvelope,
} from '../src/planner/power.ts'
const manifest = JSON.parse(readFileSync('public/data/index.json', 'utf8'))
const entry = manifest[0],
  text = readFileSync('public/data/' + entry.file, 'utf8'),
  raw = JSON.parse(text)
test('all real NASA archives verify SHA-256, provenance, units and 365 days', async () => {
  for (const e of manifest) {
    const weather = await weatherFromEnvelope(
      { ...e, rawText: readFileSync('public/data/' + e.file, 'utf8') },
      'snapshot',
    )
    assert.equal(weather.days.length, 365)
    const m = climateSummary(weather.days, e.query.start, e.query.end, 1, 35)
    assert.equal(m.complete, true)
    assert.ok(m.rain! > 0)
  }
})
test('tampered archive is rejected', async () => {
  await assert.rejects(weatherFromEnvelope({ ...entry, rawText: text + ' ' }, 'snapshot'), /huella/)
})
test('NASA response validates units, coordinates and time standard', () => {
  for (const mutate of [
    (x: any) => (x.parameters.PRECTOTCORR.units = 'inch'),
    (x: any) => (x.geometry.coordinates[0] = 0),
    (x: any) => (x.header.time_standard = 'LST'),
    (x: any) => (x.header.start = '19900101'),
  ]) {
    const fixture = structuredClone(raw)
    mutate(fixture)
    assert.throws(() => parsePower(fixture, entry.query))
  }
})
test('sentinel and omitted days are gaps, never zero precipitation', () => {
  const fixture = structuredClone(raw)
  fixture.properties.parameter.PRECTOTCORR['20240701'] = -999
  delete fixture.properties.parameter.PRECTOTCORR['20240702']
  const data = parsePower(fixture, entry.query)
  assert.equal(data.days[0].rain, null)
  assert.equal(data.days[1].rain, null)
  assert.equal(climateSummary(data.days, entry.query.start, entry.query.end, 1, 35).rainDays, 363)
})
test('dry streak resets at missing days; threshold edges and no observations', () => {
  const days = [
    { date: '2025-01-01', rain: 0, max: 35, min: 20 },
    { date: '2025-01-02', rain: null, max: null, min: null },
    { date: '2025-01-03', rain: 0, max: 34, min: 20 },
    { date: '2025-01-04', rain: 1, max: 36, min: 21 },
  ]
  const m = climateSummary(days, '2025-01-01', '2025-01-04', 1, 35)
  assert.equal(m.longestDry, 1)
  assert.equal(m.dryDays, 2)
  assert.equal(m.hotDays, 2)
  assert.equal(m.complete, false)
  assert.equal(climateSummary([], '2025-01-01', '2025-01-02', 1, 35).rain, null)
})
test('never reuse data for another location or outside original dates', async () => {
  const w = await weatherFromEnvelope({ ...entry, rawText: text }, 'cache')
  assert.equal(compatible(w, { ...entry.query, lat: 0 }), false)
  assert.equal(compatible(w, { ...entry.query, end: '2026-01-01' }), false)
  assert.equal(compatible(w, { ...entry.query, start: '2025-01-01' }), true)
})
test('network failures and invalid responses surface instead of returning mock data', async () => {
  await assert.rejects(
    fetchPower(entry.query, undefined, async () => new Response('failed', { status: 503 })),
    /503/,
  )
  await assert.rejects(
    fetchPower(entry.query, undefined, async () => new Response('{}')),
    /objeto/,
  )
  await assert.rejects(
    fetchPower(entry.query, undefined, async () => {
      throw new Error('offline')
    }),
    /offline/,
  )
  assert.throws(() => powerUrl({ ...entry.query, lat: 91 }))
})
