export type Crop = { crop: string; yieldT: number; price: number; direct: number; other: number }
export type Scenario = { name: string; color: string; crops: Crop[] }
export type Modules = Record<string, boolean>

export const initialScenarios: Scenario[] = [
  { name: 'Escenario A', color: '#28785b', crops: [
    { crop: 'Soja', yieldT: 3.2, price: 390, direct: 690, other: 95 },
    { crop: 'Trigo', yieldT: 2.7, price: 220, direct: 430, other: 70 },
    { crop: 'Soja', yieldT: 3.1, price: 390, direct: 690, other: 95 },
  ] },
  { name: 'Escenario B', color: '#d19a45', crops: [
    { crop: 'Soja', yieldT: 3.2, price: 390, direct: 690, other: 95 },
    { crop: 'Maíz', yieldT: 6.8, price: 175, direct: 790, other: 110 },
    { crop: 'Soja', yieldT: 3.1, price: 390, direct: 690, other: 95 },
  ] },
]

export type Metrics = { revenue: number; gross: number; net: number; cost: number; maxCapital: number; breakPrice: number; breakYield: number; yearly: number[] }

// Los costos de tierra, maquinaria y financiación se agregan según módulos activos.
export function calculate(s: Scenario, hectares: number, modules: Modules, rent: number, machine: number, finance: number, priceShift = 0, yieldShift = 0, costShift = 0): Metrics {
  const yearly = s.crops.map(c => {
    const rev = c.yieldT * (1 + yieldShift / 100) * c.price * (1 + priceShift / 100)
    const direct = c.direct * (1 + costShift / 100)
    const other = c.other * (1 + costShift / 100)
    const fixed = (modules.Tierra ? rent : 0) + (modules.Maquinaria ? machine : 0) + (modules.Financiación ? finance : 0)
    return { rev, direct, cost: direct + other + fixed, net: rev - direct - other - fixed }
  })
  const revenue = yearly.reduce((n, y) => n + y.rev, 0) * hectares
  const cost = yearly.reduce((n, y) => n + y.cost, 0) * hectares
  const direct = yearly.reduce((n, y) => n + y.direct, 0) * hectares
  const gross = revenue - direct
  const totalNet = revenue - cost
  const productionPerHa = s.crops.reduce((n, c) => n + c.yieldT * (1 + yieldShift / 100), 0)
  const costPerHa = yearly.reduce((n, y) => n + y.cost, 0)
  const breakPrice = productionPerHa > 0 ? costPerHa / productionPerHa : Infinity
  const breakYield = yearly.length ? yearly.reduce((n, y, i) => {
    const price = s.crops[i].price * (1 + priceShift / 100)
    return n + (price > 0 ? y.cost / price : y.cost > 0 ? Infinity : 0)
  }, 0) / yearly.length : Infinity
  return { revenue, gross, net: totalNet, cost, maxCapital: Math.max(0, ...yearly.map(y => y.cost)) * hectares, breakPrice: s.crops.length === 1 ? breakPrice : Infinity, breakYield: s.crops.length === 1 ? breakYield : Infinity, yearly: yearly.map(y => y.net * hectares) }
}

export const money = (value: number, currency = 'USD') => Number.isFinite(value) ? new Intl.NumberFormat('es-PY', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value) : 'No definido'
export const number = (value: number, digits = 1) => Number.isFinite(value) ? new Intl.NumberFormat('es-PY', { maximumFractionDigits: digits }).format(value) : 'No definido'
