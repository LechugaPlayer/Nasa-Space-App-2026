import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { parsePower } from '../src/planner/power.ts'
const indexUrl = new URL('../public/data/index.json', import.meta.url)
const existing = JSON.parse(await readFile(indexUrl, 'utf8'))
const refresh = process.argv.includes('--refresh')
const cases = [
  ['itapua', -27.1, -55.8],
  ['alto-parana', -25.5, -54.8],
  ['caaguazu', -25.4, -56],
]
const manifests = []
const pending = []
for (const [id, lat, lon] of cases) {
  const file = `power-${id}-20240701-20250630.json`
  const location = new URL('../public/data/' + file, import.meta.url)
  const query = { lat, lon, start: '2024-07-01', end: '2025-06-30' }
  const url =
    'https://power.larc.nasa.gov/api/temporal/daily/point?' +
    new URLSearchParams({
      parameters: 'PRECTOTCORR,T2M_MAX,T2M_MIN',
      community: 'AG',
      longitude: String(lon),
      latitude: String(lat),
      start: '20240701',
      end: '20250630',
      format: 'JSON',
      'time-standard': 'UTC',
    })
  let text, retrievedAt
  if (refresh) {
    const response = await fetch(url, { signal: AbortSignal.timeout(60000) })
    if (!response.ok) throw new Error(`NASA HTTP ${response.status}`)
    const content = await response.text()
    parsePower(JSON.parse(content), query)
    text = content
    retrievedAt = new Date().toISOString()
    pending.push({ location, text })
  } else {
    text = await readFile(location, 'utf8')
    const original = existing.find((entry) => entry.id === id)
    if (!original || original.hash !== createHash('sha256').update(text).digest('hex'))
      throw new Error('Original o hash inconsistente: ' + id)
    retrievedAt = original.retrievedAt
  }
  const raw = JSON.parse(text)
  parsePower(raw, query)
  manifests.push({
    id,
    file,
    query,
    retrievedAt,
    hash: createHash('sha256').update(text).digest('hex'),
    url,
    sources: raw.header.sources,
    apiVersion: raw.header.api.version,
    timeStandard: raw.header.time_standard,
    attribution:
      'NASA Langley Research Center POWER Project, funded through NASA Earth Science/Applied Science Program.',
    rights:
      'Public NASA POWER scientific data; retain attribution and consult source policy. No third-party market data included.',
    spatialResolution:
      'Native source grid (MERRA-2 meteorology: 0.5° latitude × 0.625° longitude); not a field measurement.',
  })
}
if (refresh) {
  // No local writes until all three requests have passed validation.
  for (const item of pending) await writeFile(item.location, item.text)
  await writeFile(indexUrl, JSON.stringify(manifests, null, 2) + '\n')
}
console.log(
  refresh ? 'Refreshed' : 'Verified without modifying provenance:',
  manifests.length,
  'NASA POWER datasets.',
)
