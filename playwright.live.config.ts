import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/live',
  workers: 1,
  timeout: 45000,
  use: { baseURL: 'http://127.0.0.1:5199' },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 5199 --strictPort', url: 'http://127.0.0.1:5199', reuseExistingServer: false },
})
