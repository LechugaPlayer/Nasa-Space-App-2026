import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { toCsv } from '../csv.ts'
import { budgetStrategy } from './economics.ts'
import { CATALOG, type Plan } from './model.ts'
import { type WeatherEnvelope } from './power.ts'
export function dossier(plan: Plan, climate: WeatherEnvelope | null) {
  return JSON.stringify(
    {
      format: 'agriculture-dossier',
      version: 1,
      exportedAt: new Date().toISOString(),
      plan,
      climate,
    },
    null,
    2,
  )
}
export function comparisonCsv(p: Plan) {
  const rows: (string | number)[][] = [
    [
      'Estrategia',
      'Cultivo',
      'Inicio',
      'Fin',
      'ha',
      'Rendimiento base t/ha',
      'Precio base USD/t',
      'Fuente de precio',
      'Ingreso USD',
      'Costo USD',
      'Neto USD',
      'Pago',
      'Cobro',
      'Tierra USD horizonte (fila separada)',
    ],
  ]
  for (const s of p.strategies) {
    const budget = budgetStrategy(s, p)
    for (const { cycle: c, result: r } of budget.cycles)
      rows.push([
        s.name,
        CATALOG[c.crop].name,
        c.start,
        c.end,
        p.plot.hectares,
        c.yieldT ?? 'Pendiente',
        c.price ?? 'Pendiente',
        c.priceSource,
        r?.revenue ?? 'Pendiente',
        r?.cost ?? 'Pendiente',
        r?.net ?? 'Pendiente',
        c.payDate,
        c.saleDate,
        0,
      ])
    rows.push([
      s.name,
      'TIERRA DEL HORIZONTE',
      p.start,
      p.end,
      p.plot.hectares,
      '',
      '',
      p.plot.tenancy,
      0,
      p.plot.landCost === null ? 'Pendiente' : p.plot.landCost * p.plot.hectares,
      '',
      p.start,
      '',
      p.plot.landCost === null ? 'Pendiente' : p.plot.landCost * p.plot.hectares,
    ])
    rows.push([
      s.name,
      'TOTAL (base, sin probabilidad)',
      p.start,
      p.end,
      p.plot.hectares,
      '',
      '',
      budget.complete ? 'Completo según supuestos' : 'Incompleto o solapado',
      budget.revenue ?? 'Pendiente',
      budget.cost ?? 'Pendiente',
      budget.net ?? 'Pendiente',
      '',
      '',
      '',
    ])
  }
  return toCsv(rows)
}
export async function saveFile(name: string, text: string, type: string) {
  if (Capacitor.isNativePlatform()) {
    const file = await Filesystem.writeFile({
      path: name,
      data: text,
      encoding: Encoding.UTF8,
      directory: Directory.Cache,
    })
    await Share.share({ title: 'Comparación agrícola', files: [file.uri] })
  } else {
    const url = URL.createObjectURL(new Blob([text], { type }))
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}
