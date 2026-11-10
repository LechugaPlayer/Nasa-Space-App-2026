import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test('three cases lead to distinct economic and operational conclusions', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Una decisión empieza por su contexto.' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Comparar', exact: true }).click()
  await expect(page.locator('.strategy').first()).toContainText('66.840')
  await page.getByRole('button', { name: 'Lote', exact: true }).click()
  await page.getByRole('button', { name: 'Elegir 2 · Alquilado / liquidez' }).click()
  await page.getByRole('button', { name: 'Cargar caso', exact: true }).click()
  await page.getByRole('button', { name: 'Comparar', exact: true }).click()
  await expect(page.locator('.strategy').first()).toContainText('13.965')
  await expect(page.locator('.strategy').first()).toContainText('Capital insuficiente')
  await page.getByRole('button', { name: 'Lote', exact: true }).click()
  await page.getByRole('button', { name: 'Elegir 3 · Pequeño / cobertura' }).click()
  await page.getByRole('button', { name: 'Cargar caso', exact: true }).click()
  await page.getByRole('button', { name: 'Comparar', exact: true }).click()
  await expect(page.locator('.strategy').nth(2)).toContainText('342/365')
  await expect(page.getByLabel('Comprador · estrategia 2')).toHaveValue('no')
  await page.reload()
  await expect(page.getByLabel('Nombre del lote')).toHaveValue('Caso 3 · Caaguazú · propio')
  expect(errors).toEqual([])
})
test('real snapshot, network failure, incompatible location and editable thresholds', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Evidencia', exact: true }).click()
  await page.getByRole('button', { name: 'Cargar respaldo real del caso' }).click()
  await expect(
    page.getByRole('heading', { name: 'Respaldo real incluido', exact: true }),
  ).toBeVisible()
  await expect(page.locator('.metric-grid')).toContainText('365/365')
  await page.route('https://power.larc.nasa.gov/**', (route) =>
    route.fulfill({ status: 503, body: 'unavailable' }),
  )
  await page.getByRole('button', { name: 'Consultar NASA', exact: true }).click()
  await expect(page.getByText(/Error: NASA respondió HTTP 503/)).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Respaldo real incluido', exact: true }),
  ).toBeVisible()
  await page.getByLabel('Día seco: lluvia menor a (mm/día)').fill('')
  await expect(page.getByRole('alert')).toContainText('Umbrales')
  await page.getByLabel('Día seco: lluvia menor a (mm/día)').fill('1')
  await page.getByRole('button', { name: 'Lote', exact: true }).click()
  await page.getByLabel('Latitud', { exact: true }).fill('-20')
  await page.getByRole('button', { name: 'Evidencia', exact: true }).click()
  await page.getByRole('button', { name: 'Cargar respaldo real del caso' }).click()
  await expect(page.getByText(/No hay respaldo incluido/)).toBeVisible()
  await expect(page.locator('.metric-grid')).toHaveCount(0)
})
test('calendar overlap prevents totals and imported CSV applies only explicitly', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Calendario', exact: true }).click()
  await page.getByLabel('Siembra/inicio 1.2', { exact: true }).fill('2024-10-10')
  await expect(page.getByRole('alert')).toContainText('comparten fechas')
  await page.getByRole('button', { name: 'Comparar', exact: true }).click()
  await expect(page.locator('.strategy').first().locator('.metric')).toContainText('No definido')
  await page.getByRole('button', { name: 'Datos', exact: true }).click()
  await page.getByLabel('Importar referencias CSV').setInputFiles({
    name: 'price.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(
      'crop,date,market,currency,unit,price,kind\nsoja,2025-03-15,Venta de prueba,USD,USD/t,450,venta',
    ),
  })
  await expect(page.getByText(/1 referencias importadas/)).toBeVisible()
  await page.getByRole('button', { name: 'Calendario', exact: true }).click()
  const cycle = page.locator('.cycle-editor').nth(1)
  await cycle.locator('summary').click()
  await expect(page.getByLabel('Precio USD/t 1.2', { exact: true })).toHaveValue('390')
  await page.getByLabel('Aplicar referencia 1.2', { exact: true }).selectOption('0')
  await expect(page.getByLabel('Precio USD/t 1.2', { exact: true })).toHaveValue('450')
})
test('dossier round-trip retains evidence, rejects corrupted schema without destroying plan', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Evidencia', exact: true }).click()
  await page.getByRole('button', { name: 'Cargar respaldo real del caso' }).click()
  await expect(
    page.getByRole('heading', { name: 'Respaldo real incluido', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Datos', exact: true }).click()
  const downloaded = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Guardar dossier JSON' }).click()
  const download = await downloaded,
    saved = JSON.parse(await readFile((await download.path())!, 'utf8'))
  expect(saved.climate.hash).toMatch(/^[a-f0-9]{64}$/)
  saved.plan.plot.name = 'Plan restaurado'
  await page.getByLabel('Importar dossier JSON').setInputFiles({
    name: 'plan.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(saved)),
  })
  await expect(page.getByText(/Dossier importado/)).toBeVisible()
  await page.getByLabel('Importar dossier JSON').setInputFiles({
    name: 'invalid.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"format":"other"}'),
  })
  await expect(page.getByText(/Importación rechazada/)).toBeVisible()
  await page.getByRole('button', { name: 'Lote', exact: true }).click()
  await expect(page.getByLabel('Nombre del lote')).toHaveValue('Plan restaurado')
  await page.getByRole('button', { name: 'Evidencia', exact: true }).click()
  await page.getByRole('button', { name: 'Abrir caché local' }).click()
  await expect(page.getByRole('heading', { name: 'Caché del dispositivo' })).toBeVisible()
})
test('corrupt saved plan is preserved until explicit replacement', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('agriculture.planner.v2', '{damaged'))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Recuperación del plan' })).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('agriculture.planner.v2'))).toBe('{damaged')
  await page.getByRole('button', { name: 'Guardar este caso en su lugar' }).click()
  expect(
    JSON.parse((await page.evaluate(() => localStorage.getItem('agriculture.planner.v2')))!),
  ).toHaveProperty('schemaVersion', 2)
})
test('all views fit mobile and desktop; no uncaught errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const tab of ['Lote', 'Calendario', 'Evidencia', 'Comparar', 'Datos']) {
      await page.getByRole('button', { name: tab, exact: true }).click()
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true)
    }
  }
  await page.getByRole('button', { name: 'Comparar', exact: true }).click()
  await page.screenshot({ path: 'deliverables/planner-desktop.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Lote', exact: true }).click()
  await page.screenshot({ path: 'deliverables/planner-mobile.png', fullPage: true })
  expect(errors).toEqual([])
})
