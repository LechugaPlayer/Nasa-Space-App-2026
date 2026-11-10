import { readFileSync, writeFileSync } from 'node:fs'
import { CASES, casePlan } from '../src/planner/demo.ts'
import { analyze } from '../src/planner/analysis.ts'
import { budgetStrategy } from '../src/planner/economics.ts'
import { weatherFromEnvelope, climateSummary } from '../src/planner/power.ts'
const entries = JSON.parse(readFileSync('public/data/index.json', 'utf8'))
const results = []
for (const item of CASES) {
  const plan = casePlan(item.id),
    entry = entries.find((e: { id: string }) => e.id === item.id)
  const weather = await weatherFromEnvelope(
    { ...entry, rawText: readFileSync('public/data/' + entry.file, 'utf8') },
    'snapshot',
  )
  results.push({
    case: item.id,
    plot: plan.plot,
    period: [plan.start, plan.end],
    priorities: plan.priorities,
    climate: climateSummary(weather.days, plan.start, plan.end, plan.dryMm, plan.heatC),
    nasaHash: weather.hash,
    strategies: plan.strategies.map((strategy) => {
      const a = analyze(strategy, plan, weather)
      return {
        id: strategy.id,
        net: a.budget.net,
        funding: a.budget.funding,
        lowNet: budgetStrategy(strategy, plan, 'bajo').net,
        highNet: budgetStrategy(strategy, plan, 'alto').net,
        coveredDays: a.covered,
        families: a.families,
        buyer: strategy.buyer,
      }
    }),
  })
}
writeFileSync(
  'docs/CASE-RESULTS.json',
  JSON.stringify(
    {
      method: 'Demo deterministic v2; USD; synthetic budgets; real POWER archives',
      cases: results,
    },
    null,
    2,
  ) + '\n',
)
console.log('Reproduced three case comparisons: docs/CASE-RESULTS.json')
