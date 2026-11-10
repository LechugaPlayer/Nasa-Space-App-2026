import { dateValue, dates, type Plan } from './model.ts'
export type Query = { lat: number; lon: number; start: string; end: string }
export type DayWeather = {
  date: string
  rain: number | null
  max: number | null
  min: number | null
}
export type Weather = {
  query: Query
  days: DayWeather[]
  apiVersion: string
  sources: string[]
  retrievedAt: string
  hash: string
  origin: 'live' | 'cache' | 'snapshot'
  url: string
}
export type WeatherEnvelope = {
  query: Query
  raw: unknown
  retrievedAt: string
  hash: string
  rawText: string
}
export const POWER_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point'
export const queryFor = (p: Plan): Query => ({
  lat: p.plot.lat,
  lon: p.plot.lon,
  start: p.start,
  end: p.end,
})
export const queryKey = (q: Query) => JSON.stringify([q.lat, q.lon, q.start, q.end])
const object = (x: unknown): Record<string, unknown> => {
  if (!x || typeof x !== 'object' || Array.isArray(x))
    throw new Error('Respuesta NASA: objeto esperado.')
  return x as Record<string, unknown>
}
export function powerUrl(q: Query): string {
  if (
    !Number.isFinite(q.lat) ||
    Math.abs(q.lat) > 90 ||
    !Number.isFinite(q.lon) ||
    Math.abs(q.lon) > 180 ||
    !dates(q.start, q.end).length
  )
    throw new Error('Consulta NASA inválida.')
  const params = new URLSearchParams({
    parameters: 'PRECTOTCORR,T2M_MAX,T2M_MIN',
    community: 'AG',
    longitude: String(q.lon),
    latitude: String(q.lat),
    start: q.start.replaceAll('-', ''),
    end: q.end.replaceAll('-', ''),
    format: 'JSON',
    'time-standard': 'UTC',
  })
  return `${POWER_URL}?${params}`
}
export async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}
export function parsePower(
  raw: unknown,
  query: Query,
): Pick<Weather, 'days' | 'apiVersion' | 'sources'> {
  powerUrl(query)
  const root = object(raw),
    header = object(root.header),
    parameters = object(root.parameters),
    data = object(object(root.properties).parameter)
  if (
    header.time_standard !== 'UTC' ||
    header.start !== query.start.replaceAll('-', '') ||
    header.end !== query.end.replaceAll('-', '')
  )
    throw new Error('NASA devolvió otro período o estándar temporal.')
  const coords = object(root.geometry).coordinates
  if (
    !Array.isArray(coords) ||
    typeof coords[0] !== 'number' ||
    typeof coords[1] !== 'number' ||
    !Number.isFinite(coords[0]) ||
    !Number.isFinite(coords[1]) ||
    Math.abs(coords[0] - query.lon) > 0.001 ||
    Math.abs(coords[1] - query.lat) > 0.001
  )
    throw new Error('NASA devolvió otra ubicación.')
  if (typeof header.fill_value !== 'number' || !Number.isFinite(header.fill_value))
    throw new Error('Falta convención de datos faltantes NASA.')
  const api = object(header.api)
  if (
    typeof api.version !== 'string' ||
    !Array.isArray(header.sources) ||
    !header.sources.every((s) => typeof s === 'string')
  )
    throw new Error('Falta procedencia NASA.')
  const specs = [
    ['PRECTOTCORR', 'mm/day', 0, 3000],
    ['T2M_MAX', 'C', -100, 70],
    ['T2M_MIN', 'C', -100, 70],
  ] as const
  for (const [name, unit] of specs)
    if (object(parameters[name]).units !== unit)
      throw new Error(`Unidad incompatible para ${name}: se esperaba ${unit}.`)
  const series = specs.map(([name]) => object(data[name]))
  const days = dates(query.start, query.end).map((date) => {
    const key = date.replaceAll('-', '')
    const values = specs.map(([, , low, high], i) => {
      const value = series[i][key]
      if (value === undefined || value === null || value === header.fill_value) return null
      if (typeof value !== 'number' || !Number.isFinite(value) || value < low || value > high)
        throw new Error(`Valor NASA inválido en ${date}.`)
      return value
    })
    if (values[1] !== null && values[2] !== null && values[1] < values[2])
      throw new Error(`Temperaturas incompatibles en ${date}.`)
    return { date, rain: values[0], max: values[1], min: values[2] }
  })
  if (!days.some((d) => d.rain !== null || d.max !== null || d.min !== null))
    throw new Error('NASA no devolvió observaciones válidas para ese período.')
  return { days, apiVersion: api.version, sources: header.sources as string[] }
}
export async function weatherFromEnvelope(
  input: unknown,
  origin: Weather['origin'],
): Promise<Weather> {
  const e = object(input),
    q = object(e.query) as unknown as Query
  if (
    typeof e.rawText !== 'string' ||
    e.rawText.length > 2e6 ||
    typeof e.hash !== 'string' ||
    !/^[a-f0-9]{64}$/.test(e.hash) ||
    typeof e.retrievedAt !== 'string' ||
    !Number.isFinite(Date.parse(e.retrievedAt))
  )
    throw new Error('Respaldo climático inválido.')
  if ((await sha256(e.rawText)) !== e.hash)
    throw new Error('La huella del respaldo climático no coincide.')
  const parsed = parsePower(JSON.parse(e.rawText), q)
  return { ...parsed, query: q, hash: e.hash, retrievedAt: e.retrievedAt, origin, url: powerUrl(q) }
}
export async function fetchPower(
  q: Query,
  signal?: AbortSignal,
  request: typeof fetch = fetch,
): Promise<WeatherEnvelope> {
  if (dateValue(q.end) >= dateValue(new Date().toISOString().slice(0, 10)))
    throw new Error('POWER es histórico: elegir una fecha final anterior a hoy.')
  const controller = new AbortController(),
    abort = () => controller.abort()
  if (signal?.aborted) controller.abort()
  signal?.addEventListener('abort', abort, { once: true })
  const timeout = setTimeout(abort, 25000)
  try {
    const response = await request(powerUrl(q), { signal: controller.signal })
    if (!response.ok)
      throw new Error(
        `NASA respondió HTTP ${response.status}. Reintentar o elegir respaldo explícitamente.`,
      )
    const rawText = await response.text()
    if (rawText.length > 2e6) throw new Error('Respuesta NASA demasiado grande.')
    const raw: unknown = JSON.parse(rawText)
    parsePower(raw, q)
    return {
      query: q,
      raw,
      rawText,
      hash: await sha256(rawText),
      retrievedAt: new Date().toISOString(),
    }
  } catch (error) {
    if (controller.signal.aborted)
      throw new Error(
        'Consulta cancelada o tiempo de espera agotado. No se sustituyeron los datos.',
      )
    throw error
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', abort)
  }
}
export function compatible(weather: Weather, q: Query): boolean {
  return (
    weather.query.lat === q.lat &&
    weather.query.lon === q.lon &&
    weather.query.start <= q.start &&
    weather.query.end >= q.end
  )
}
export function climateSummary(
  days: DayWeather[],
  start: string,
  end: string,
  dryMm: number,
  heatC: number,
) {
  const expected = dates(start, end),
    byDate = new Map(days.map((d) => [d.date, d]))
  let rain = 0,
    rainDays = 0,
    hotDays = 0,
    temperatureDays = 0,
    dryDays = 0,
    longestDry = 0,
    streak = 0
  for (const date of expected) {
    const d = byDate.get(date)
    if (d?.rain != null) {
      rain += d.rain
      rainDays++
      if (d.rain < dryMm) {
        dryDays++
        streak++
      } else streak = 0
    } else streak = 0
    longestDry = Math.max(longestDry, streak)
    if (d?.max != null) {
      temperatureDays++
      if (d.max >= heatC) hotDays++
    }
  }
  return {
    rain: rainDays ? rain : null,
    rainDays,
    hotDays: temperatureDays ? hotDays : null,
    temperatureDays,
    dryDays: rainDays ? dryDays : null,
    longestDry: rainDays ? longestDry : null,
    expected: expected.length,
    complete: rainDays === expected.length && temperatureDays === expected.length,
  }
}
