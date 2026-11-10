import { test, expect } from '@playwright/test'

test('production reloads offline and compares all three real archives', async ({
  page,
  context,
}) => {
  await page.goto('/')
  await expect(page.getByLabel('Nombre del lote')).toBeVisible()
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
          once: true,
        }),
      )
  })
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByLabel('Nombre del lote')).toBeVisible()
  for (const title of [
    '1 · Propio / margen',
    '2 · Alquilado / liquidez',
    '3 · Pequeño / cobertura',
  ]) {
    await page.getByRole('button', { name: 'Lote', exact: true }).click()
    await page.getByRole('button', { name: 'Elegir ' + title, exact: true }).click()
    await page.getByRole('button', { name: 'Cargar caso', exact: true }).click()
    await page.getByRole('button', { name: 'Evidencia', exact: true }).click()
    await page.getByRole('button', { name: 'Cargar respaldo real del caso', exact: true }).click()
    await expect(
      page.getByRole('heading', { name: 'Respaldo real incluido', exact: true }),
    ).toBeVisible()
    await expect(page.locator('.metric-grid')).toContainText('365/365')
    await page.getByRole('button', { name: 'Comparar', exact: true }).click()
    await expect(page.locator('.strategy')).toHaveCount(3)
  }
  await page.getByRole('button', { name: 'Datos', exact: true }).click()
  const file = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Guardar comparación CSV' }).click()
  expect((await file).suggestedFilename()).toBe('escenarios-agricolas.csv')
})
