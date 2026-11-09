import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/ui',
  use: { baseURL: 'http://127.0.0.1:5197', viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 5197 --strictPort', url: 'http://127.0.0.1:5197', reuseExistingServer: !process.env.CI },
})

