import { budgetStrategy, budgetMissing } from './economics.ts'
import { CATALOG, dates, overlaps, type Plan, type Strategy } from './model.ts'
import { climateSummary, compatible, queryFor, type Weather } from './power.ts'
export function analyze(s: Strategy, p: Plan, weather: Weather | null) {
  const dayList = dates(p.start, p.end),
    covered = dayList.filter((d) => s.cycles.some((c) => c.start <= d && c.end >= d)).length
  const families = [...new Set(s.cycles.map((c) => CATALOG[c.crop].family))]
  const repeated = [...s.cycles]
    .sort((a, b) => a.start.localeCompare(b.start))
    .some((c, i, list) => i > 0 && list[i - 1].crop === c.crop)
  const issues = overlaps(s),
    budget = budgetStrategy(s, p)
  const evidence = weather && compatible(weather, queryFor(p)) ? weather : null
  const signals = [
    {
      rule: 'CAL-01',
      title: `${covered}/${dayList.length} días con cultivo programado`,
      detail: `El resto del período tiene cobertura viva no registrada. Residuos: ${s.residues}. No equivale a suelo desnudo ni mide protección efectiva.`,
    },
    {
      rule: 'DIV-01',
      title: `${families.length} familias botánicas registradas`,
      detail: `${families.join(', ') || 'Sin cultivos'}. ${repeated ? 'Hay repetición consecutiva de un cultivo.' : 'No hay repetición consecutiva del mismo cultivo.'} La diversidad no demuestra mejora del suelo.`,
    },
  ]
  for (const [key, label] of [
    ['machinery', 'Maquinaria'],
    ['experience', 'Experiencia'],
    ['buyer', 'Comprador'],
  ] as const)
    signals.push({
      rule: 'OPS-01',
      title: `${label}: ${s[key]}`,
      detail:
        s[key] === 'si'
          ? 'Disponibilidad informada por el usuario, no verificada.'
          : 'Revisar esta restricción antes de ejecutar la estrategia; no se asume viabilidad.',
    })
  if (p.priorities.economy)
    signals.push({
      rule: 'ECO-01',
      title: 'Prioridad: continuidad económica',
      detail:
        budget.net === null
          ? 'Presupuesto incompleto o calendario solapado: no se emite total.'
          : `Comparar neto, banda baja y déficit de caja. Capital disponible ${p.plot.capital === null ? 'no informado' : budget.funding! > p.plot.capital ? 'inferior al déficit estimado' : 'cubre el déficit bajo los supuestos base'}.`,
    })
  if (p.priorities.soil)
    signals.push({
      rule: 'SOIL-01',
      title: 'Prioridad: suelo',
      detail:
        'Usar calendario y residuos como registros. Faltan análisis de suelo, erosión y revisión local; no se calcula un puntaje de salud.',
    })
  if (p.priorities.water)
    signals.push({
      rule: 'WATER-01',
      title: 'Prioridad: agua',
      detail: evidence
        ? 'Revisar lluvia y días secos en las ventanas de cultivo. No se estima agua disponible en raíces ni necesidad de riego.'
        : 'Sin evidencia compatible. Cargar datos históricos para esta ubicación y período.',
    })
  return {
    covered,
    families,
    issues,
    budget,
    signals,
    missing: [
      ...budgetMissing(s),
      ...(p.plot.landCost === null ? ['Costo de tierra del horizonte'] : []),
      'Análisis de suelo y validación agronómica local',
    ],
    exposure: s.cycles.map((c) => ({
      cycle: c,
      climate: evidence ? climateSummary(evidence.days, c.start, c.end, p.dryMm, p.heatC) : null,
    })),
  }
}
