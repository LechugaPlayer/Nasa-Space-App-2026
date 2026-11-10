export const CATALOG = {
  soja: { name: 'Soja', family: 'Fabaceae', cover: false },
  maiz: { name: 'Maíz', family: 'Poaceae', cover: false },
  trigo: { name: 'Trigo', family: 'Poaceae', cover: false },
  avena: { name: 'Avena de cobertura', family: 'Poaceae', cover: true },
} as const
export type CropId = keyof typeof CATALOG
export type Answer = 'si' | 'no' | 'desconocido'
export type Cycle = {
  id: string
  crop: CropId
  start: string
  end: string
  payDate: string
  saleDate: string
  yieldT: number | null
  price: number | null
  direct: number | null
  other: number | null
  extra: number | null
  priceSource: string
  notes: string
}
export type Strategy = {
  id: string
  name: string
  cycles: Cycle[]
  residues: 'retenidos' | 'retirados' | 'desconocido'
  machinery: Answer
  experience: Answer
  buyer: Answer
}
export type PriceReference = {
  crop: CropId
  date: string
  market: string
  currency: 'USD'
  unit: 'USD/t'
  price: number
  kind: 'venta' | 'referencia'
}
export type Plan = {
  schemaVersion: 2
  plot: {
    name: string
    lat: number
    lon: number
    hectares: number
    tenancy: 'propio' | 'alquilado'
    landCost: number | null
    capital: number | null
  }
  start: string
  end: string
  priorities: { water: boolean; soil: boolean; economy: boolean }
  dryMm: number
  heatC: number
  strategies: Strategy[]
  references: PriceReference[]
}
export const DAY = 86_400_000
export const iso = (time: number) => new Date(time).toISOString().slice(0, 10)
export function dateValue(value: unknown): number {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN
  const time = Date.parse(value + 'T00:00:00Z')
  return Number.isFinite(time) && iso(time) === value ? time : NaN
}
export function dates(start: string, end: string): string[] {
  const a = dateValue(start),
    b = dateValue(end)
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a || b - a > 550 * DAY) return []
  return Array.from({ length: (b - a) / DAY + 1 }, (_, i) => iso(a + i * DAY))
}
export function months(start: string, end: string): string[] {
  return [...new Set(dates(start, end).map((d) => d.slice(0, 7)))]
}
const obj = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === 'object' && !Array.isArray(x)
const text = (x: unknown, max = 200) =>
  typeof x === 'string' && x.trim().length > 0 && x.length <= max
const num = (x: unknown, min: number, max: number): x is number =>
  typeof x === 'number' && Number.isFinite(x) && x >= min && x <= max
export function validatePlan(value: unknown): string[] {
  const errors: string[] = []
  if (!obj(value) || value.schemaVersion !== 2)
    return ['Formato de plan no compatible (se requiere versión 2).']
  const p = value
  if (
    !obj(p.plot) ||
    !text(p.plot.name, 100) ||
    !num(p.plot.lat, -90, 90) ||
    !num(p.plot.lon, -180, 180) ||
    !num(p.plot.hectares, 0.01, 1e6)
  )
    errors.push('Lote: nombre, coordenadas y superficie válidos son obligatorios.')
  if (
    !obj(p.plot) ||
    !['propio', 'alquilado'].includes(p.plot.tenancy as string) ||
    ![p.plot.landCost, p.plot.capital].every((v) => v === null || num(v, 0, 1e12))
  )
    errors.push('Tenencia, costo de tierra o capital inválidos.')
  const start = dateValue(p.start),
    end = dateValue(p.end)
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start || end - start > 550 * DAY)
    errors.push('El horizonte debe contener entre 1 y 551 días válidos.')
  if (!num(p.dryMm, 0, 50) || !num(p.heatC, -20, 60))
    errors.push('Umbrales: lluvia entre 0 y 50 mm/día; calor entre −20 y 60 °C.')
  if (
    !obj(p.priorities) ||
    !['water', 'soil', 'economy'].every(
      (k) => typeof (p.priorities as Record<string, unknown>)[k] === 'boolean',
    )
  )
    errors.push('Prioridades inválidas.')
  if (!Array.isArray(p.strategies) || p.strategies.length !== 3)
    return [...errors, 'Se requieren exactamente tres estrategias.']
  const ids = new Set<string>()
  for (const [i, s] of p.strategies.entries()) {
    const prefix = `Estrategia ${i + 1}`
    if (
      !obj(s) ||
      !text(s.id, 80) ||
      !text(s.name, 100) ||
      !Array.isArray(s.cycles) ||
      s.cycles.length > 8
    ) {
      errors.push(`${prefix}: estructura inválida (máximo 8 ciclos).`)
      continue
    }
    if (ids.has(s.id as string)) errors.push('Identificadores de estrategia duplicados.')
    ids.add(s.id as string)
    if (
      !['retenidos', 'retirados', 'desconocido'].includes(s.residues as string) ||
      !['machinery', 'experience', 'buyer'].every((k) =>
        ['si', 'no', 'desconocido'].includes(s[k] as string),
      )
    )
      errors.push(`${prefix}: restricciones inválidas.`)
    const cycleIds = new Set<string>()
    for (const [j, c] of s.cycles.entries()) {
      const label = `${prefix}, ciclo ${j + 1}`
      if (!obj(c) || !text(c.id, 80) || !Object.hasOwn(CATALOG, c.crop as string)) {
        errors.push(`${label}: cultivo/identificador inválido.`)
        continue
      }
      if (cycleIds.has(c.id as string)) errors.push(`${label}: identificador duplicado.`)
      cycleIds.add(c.id as string)
      const a = dateValue(c.start),
        b = dateValue(c.end),
        pay = dateValue(c.payDate),
        sale = dateValue(c.saleDate)
      if (
        ![a, b, pay, sale].every(Number.isFinite) ||
        a > b ||
        a < start ||
        b > end ||
        pay < start ||
        pay > a ||
        sale < b ||
        sale > end
      )
        errors.push(
          `${label}: fechas inválidas; pago entre inicio del horizonte y siembra, cobro entre cosecha y fin del horizonte.`,
        )
      if (
        !['yieldT', 'price', 'direct', 'other', 'extra'].every(
          (k) => c[k] === null || num(c[k], 0, k === 'yieldT' ? 100 : 1e6),
        )
      )
        errors.push(`${label}: cantidades entre 0 y el límite permitido, o vacías.`)
      if (CATALOG[c.crop as CropId].cover && (c.yieldT !== 0 || c.price !== 0))
        errors.push(`${label}: la cobertura no comercial requiere rendimiento y precio cero.`)
      if (
        typeof c.priceSource !== 'string' ||
        c.priceSource.length > 300 ||
        typeof c.notes !== 'string' ||
        c.notes.length > 500
      )
        errors.push(`${label}: notas/fuente inválidas.`)
    }
  }
  if (!Array.isArray(p.references) || p.references.length > 100)
    errors.push('Máximo 100 referencias de precio.')
  else
    for (const r of p.references)
      if (
        !obj(r) ||
        !Object.hasOwn(CATALOG, r.crop as string) ||
        !Number.isFinite(dateValue(r.date)) ||
        !text(r.market, 150) ||
        r.currency !== 'USD' ||
        r.unit !== 'USD/t' ||
        !num(r.price, 0, 1e6) ||
        !['venta', 'referencia'].includes(r.kind as string)
      )
        errors.push('Referencia de precio inválida: usar fecha ISO, USD y USD/t.')
  return [...new Set(errors)]
}
export function parsePlan(value: unknown): Plan {
  const errors = validatePlan(value)
  if (errors.length) throw new Error(errors.join('\n'))
  return structuredClone(value) as Plan
}
export function overlaps(s: Strategy): string[] {
  const result: string[] = []
  for (let i = 0; i < s.cycles.length; i++)
    for (let j = i + 1; j < s.cycles.length; j++) {
      const a = s.cycles[i],
        b = s.cycles[j]
      if (a.start <= b.end && b.start <= a.end)
        result.push(
          `${CATALOG[a.crop].name} y ${CATALOG[b.crop].name} comparten fechas. No se modelan cultivos asociados.`,
        )
    }
  return result
}
