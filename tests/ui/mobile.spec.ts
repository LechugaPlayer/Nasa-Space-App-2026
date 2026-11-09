import product from '../../product.json' with { type: 'json' }
import { test, expect } from '@playwright/test'

test('mobile plan updates, persists, compares, exports, and resets', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', e => errors.push(e.message))
  await page.goto('/?android')
  await expect(page.getByRole('heading', { name: /Tu próxima cosecha/ })).toBeVisible()
  await expect(page.locator('.net-card>strong')).toContainText('117.720')
  await page.getByRole('button', { name: 'Planificar', exact: true }).click()
  await page.getByLabel('Superficie (ha)').fill('240')
  await page.getByRole('button', { name: 'Ver resultado' }).click()
  await expect(page.locator('.net-card>strong')).toContainText('235.440')
  await page.reload()
  await expect(page.locator('.net-card>strong')).toContainText('235.440')
  await page.getByRole('button', { name: 'Planificar', exact: true }).click()
  await page.getByRole('button', { name: 'Agregar campaña' }).click()
  await expect(page.getByText('4 / 6')).toBeVisible()
  await page.getByRole('button', { name: 'Eliminar campaña 4' }).click()
  await page.getByRole('checkbox', { name: 'Tierra', exact: true }).check()
  await page.getByLabel('Tierra (USD/ha)').fill('400')
  await page.getByRole('button', { name: 'Ver resultado' }).click()
  await expect(page.locator('.net-card>strong')).toContainText('52.560')
  await page.getByRole('button', { name: 'Comparar', exact: true }).click()
  await page.getByLabel('Precio de venta', { exact: true }).fill('-20')
  await expect(page.locator('.sensitivity-result b')).not.toHaveText(/0\s*US/)
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Compartir resultados' }).click()
  const file = await download
  expect(file.suggestedFilename()).toBe(product.exportFile)
  await page.getByRole('button', { name: 'Datos', exact: true }).click()
  await page.getByRole('button', { name: 'Restablecer demo' }).click()
  await page.getByRole('button', { name: 'Conservar mi plan' }).click()
  await page.getByRole('button', { name: 'Restablecer demo' }).click()
  await page.getByRole('button', { name: 'Restablecer', exact: true }).click()
  await page.getByRole('button', { name: 'Resumen', exact: true }).click()
  await expect(page.locator('.net-card>strong')).toContainText('117.720')
  expect(errors).toEqual([])
})

test('all mobile pages fit narrow and standard phones', async ({ page }) => {
  await page.goto('/?android')
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 })
    for (const name of ['Resumen', 'Planificar', 'Comparar', 'Datos']) {
      await page.getByRole('button', { name, exact: true }).click()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    }
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Resumen', exact: true }).click()
  await page.screenshot({ path: 'deliverables/android-resumen.png', fullPage: true })
  await page.getByRole('button', { name: 'Planificar', exact: true }).click()
  await page.screenshot({ path: 'deliverables/android-planificar.png', fullPage: true })
  await page.getByRole('button', { name: 'Comparar', exact: true }).click()
  await page.screenshot({ path: 'deliverables/android-comparar.png', fullPage: true })
})

test('desktop original remains available', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Calculadora de rotaciones' })).toBeVisible()
})
