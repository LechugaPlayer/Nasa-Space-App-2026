import { test, expect } from '@playwright/test'
// Explicit opt-in integration smoke test; not part of deterministic/offline CI.
test('NASA POWER live browser request passes CORS and preserves provenance', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Evidencia', exact: true }).click()
  await page.getByRole('button', { name: 'Consultar NASA', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Consulta en vivo', exact: true })).toBeVisible({
    timeout: 30000,
  })
  await expect(page.locator('.metric-grid')).toContainText('365/365')
  await expect(page.locator('.provenance')).toContainText('MERRA2')
})
