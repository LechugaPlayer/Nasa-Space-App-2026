import { calculate } from '../calc.ts'
import { CATALOG, overlaps, type Cycle, type Plan, type Strategy } from './model.ts'
export const SHIFTS = { bajo: [-20, -20, 10], base: [0, 0, 0], alto: [20, 20, -10] } as const
export type Band = keyof typeof SHIFTS
export function budgetCycle(c: Cycle, area: number, band: Band = 'base') {
  if ([c.yieldT, c.price, c.direct, c.other, c.extra].some((v) => v === null)) return null
  const [price, yieldShift, cost] = SHIFTS[band]
  return calculate(
    {
      name: c.id,
      color: '',
      crops: [
        { crop: c.crop, yieldT: c.yieldT!, price: c.price!, direct: c.direct!, other: c.other! },
      ],
    },
    area,
    { Tierra: true },
    c.extra!,
    0,
    0,
    price,
    yieldShift,
    cost,
  )
}
export function budgetStrategy(s: Strategy, p: Plan, band: Band = 'base') {
  const cycles = s.cycles.map((c) => ({ cycle: c, result: budgetCycle(c, p.plot.hectares, band) }))
  const complete =
    cycles.every((c) => c.result !== null) && p.plot.landCost !== null && overlaps(s).length === 0
  if (!complete)
    return { complete, cycles, net: null, revenue: null, cost: null, funding: null, cash: [] }
  // Daily netting assumes receipts and payments on the same day can offset each other.
  const events = new Map<string, { income: number; expense: number }>()
  const land = p.plot.landCost! * p.plot.hectares
  events.set(p.start, { income: 0, expense: land })
  for (const { cycle, result } of cycles) {
    const payment = events.get(cycle.payDate) ?? { income: 0, expense: 0 }
    payment.expense += result!.cost
    events.set(cycle.payDate, payment)
    const sale = events.get(cycle.saleDate) ?? { income: 0, expense: 0 }
    sale.income += result!.revenue
    events.set(cycle.saleDate, sale)
  }
  let balance = 0,
    minimum = 0
  const cash = [...events.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, e]) => {
      balance += e.income - e.expense
      minimum = Math.min(minimum, balance)
      return { date, ...e, balance }
    })
  const revenue = cycles.reduce((sum, c) => sum + c.result!.revenue, 0),
    cost = land + cycles.reduce((sum, c) => sum + c.result!.cost, 0)
  return { complete, cycles, net: revenue - cost, revenue, cost, funding: -minimum, cash }
}
export function budgetMissing(s: Strategy): string[] {
  return s.cycles.flatMap((c) =>
    (['yieldT', 'price', 'direct', 'other', 'extra'] as const)
      .filter((k) => c[k] === null)
      .map(
        (k) =>
          `${CATALOG[c.crop].name}: ${{ yieldT: 'rendimiento', price: 'precio', direct: 'costos directos', other: 'otros costos', extra: 'adicionales' }[k]}`,
      ),
  )
}
