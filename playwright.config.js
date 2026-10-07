const { defineConfig, devices } = require('@playwright/test');
const port = 4173;
module.exports = defineConfig({
  testDir: 'tests',
  timeout: 45_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: `http://localhost:${port}` },
  webServer: { command: 'node tests/serve.js', port, reuseExistingServer: !process.env.CI },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'android', use: { ...devices['Pixel 7'] } },   // Chrome for Android emulation
    { name: 'ios', use: { ...devices['iPhone 14'] } },     // Mobile Safari emulation
  ],
});
