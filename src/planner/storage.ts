import { parsePlan, type Plan } from './model.ts'
import { demoPlan } from './demo.ts'
export const PLAN_KEY = 'agriculture.planner.v2'
export const WEATHER_KEY = 'agriculture.power.v1'
export function loadPlan(storage: Pick<Storage, 'getItem'>): {
  plan: Plan
  recovery: string | null
  message: string
} {
  let raw: string | null = null
  try {
    raw = storage.getItem(PLAN_KEY)
    return { plan: raw ? parsePlan(JSON.parse(raw)) : demoPlan(), recovery: null, message: '' }
  } catch {
    return {
      plan: demoPlan(),
      recovery: raw ?? '',
      message:
        'El plan guardado no pudo abrirse. Se conserva el original; exportarlo antes de reemplazarlo.',
    }
  }
}
export function savePlan(storage: Pick<Storage, 'setItem'>, plan: Plan): void {
  storage.setItem(PLAN_KEY, JSON.stringify(parsePlan(plan)))
}
