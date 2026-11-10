import { parsePlan, type Cycle, type Plan, type Strategy } from './model.ts'
const wheat: Cycle = {
  id: 'trigo',
  crop: 'trigo',
  start: '2024-07-01',
  end: '2024-10-10',
  payDate: '2024-07-01',
  saleDate: '2024-10-20',
  yieldT: 2.7,
  price: 220,
  direct: 430,
  other: 70,
  extra: 0,
  priceSource: 'Supuesto ilustrativo, no cotización',
  notes: 'Fechas ilustrativas; requiere revisión local.',
}
const soy: Cycle = {
  ...wheat,
  id: 'soja',
  crop: 'soja',
  start: '2024-10-20',
  end: '2025-02-28',
  payDate: '2024-10-20',
  saleDate: '2025-03-15',
  yieldT: 3.2,
  price: 390,
  direct: 690,
  other: 95,
}
const base: Strategy = {
  id: 'actual',
  name: 'Práctica actual · ejemplo',
  cycles: [wheat, soy],
  residues: 'desconocido',
  machinery: 'desconocido',
  experience: 'desconocido',
  buyer: 'desconocido',
}
export function demoPlan(): Plan {
  const plan = parsePlan({
    schemaVersion: 2,
    plot: {
      name: 'Caso 1 · Itapúa · propio',
      lat: -27.1,
      lon: -55.8,
      hectares: 120,
      tenancy: 'propio',
      landCost: 0,
      capital: 160000,
    },
    start: '2024-07-01',
    end: '2025-06-30',
    priorities: { water: false, soil: false, economy: true },
    dryMm: 1,
    heatC: 35,
    references: [],
    strategies: [
      base,
      {
        ...base,
        id: 'diversificacion',
        name: 'Alternativa · maíz',
        cycles: [
          wheat,
          { ...soy, id: 'maiz', crop: 'maiz', yieldT: 6.8, price: 175, direct: 790, other: 110 },
        ],
      },
      {
        ...base,
        id: 'cobertura',
        name: 'Alternativa · cobertura',
        cycles: [
          wheat,
          soy,
          {
            ...soy,
            id: 'avena',
            crop: 'avena',
            start: '2025-03-15',
            end: '2025-06-30',
            payDate: '2025-03-15',
            saleDate: '2025-06-30',
            yieldT: 0,
            price: 0,
            direct: 120,
            other: 30,
            priceSource: 'Sin venta: cobertura',
            notes: 'Costo y fechas supuestos; no cuantifica ahorro de insumos.',
          },
        ],
      },
    ],
  })
  return { ...plan, strategies: plan.strategies.map((strategy) => structuredClone(strategy)) }
}
export const CASES = [
  {
    id: 'itapua',
    title: '1 · Propio / margen',
    description: '120 ha propias en Itapúa. Capital supuesto USD 160.000; prioridad económica.',
  },
  {
    id: 'alto-parana',
    title: '2 · Alquilado / liquidez',
    description:
      '50 ha alquiladas en Alto Paraná. Alquiler supuesto USD 500/ha por horizonte y capital USD 45.000.',
  },
  {
    id: 'caaguazu',
    title: '3 · Pequeño / cobertura',
    description:
      '15 ha propias en Caaguazú. Capital supuesto USD 18.000; prioridad suelo y agua; comprador de maíz no disponible.',
  },
] as const
export function casePlan(id: string): Plan {
  const p = demoPlan()
  if (id === 'alto-parana') {
    p.plot = {
      name: 'Caso 2 · Alto Paraná · alquilado',
      lat: -25.5,
      lon: -54.8,
      hectares: 50,
      tenancy: 'alquilado',
      landCost: 500,
      capital: 45000,
    }
    for (const s of p.strategies)
      for (const c of s.cycles)
        if (!c.crop.includes('avena')) {
          c.yieldT = c.yieldT! * 0.85
          c.other = c.other! + 30
        }
  } else if (id === 'caaguazu') {
    p.plot = {
      name: 'Caso 3 · Caaguazú · propio',
      lat: -25.4,
      lon: -56,
      hectares: 15,
      tenancy: 'propio',
      landCost: 0,
      capital: 18000,
    }
    p.priorities = { water: true, soil: true, economy: false }
    p.strategies[1].buyer = 'no'
    p.strategies[2].residues = 'retenidos'
  }
  return parsePlan(p)
}
