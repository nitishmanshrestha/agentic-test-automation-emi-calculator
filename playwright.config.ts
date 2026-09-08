import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration
 *
 * Professional configuration for EMI Calculator QA automation framework.
 * Optimized for reliability, diagnostics, and CI/CD integration.
 */
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,

  /* Reporter configuration */
  reporter: [
    ["html"],
    ["list"],
    ["json", { outputFile: "./test-results/results.json" }],
    ["junit", { outputFile: "./test-results/results.xml" }],
  ],

  /* Shared settings for all projects */
  use: {
    baseURL: "https://emicalculator.net/",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Global timeout */
  timeout: 120 * 1000,

  /* Global setup/teardown */
  globalSetup: undefined,
  globalTeardown: undefined,

  /* Webserver not needed as we're testing external application */
  webServer: undefined,
});
