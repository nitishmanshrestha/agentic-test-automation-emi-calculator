/**
 * Application Routes and Endpoints
 * RULE: Never use route or endpoint literals when config exists
 * All URLs and routes defined here for centralized management
 */

const BASE_URL = process.env.APP_URL || "https://emicalculator.net";

export const ROUTES = {
  // Application URLs
  home: BASE_URL,
  calculator: `${BASE_URL}/`,

  // API Endpoints (if available)
  api: {
    baseUrl: process.env.API_BASE_URL || "https://api.emicalculator.net",
    calculate: "/api/calculate",
    export: "/api/export",
  },
} as const;

/**
 * Navigation paths
 * Use for internal navigation and URL assertions
 */
export const PATHS = {
  home: "/",
  calculator: "/",
} as const;

/**
 * Default timeouts (milliseconds)
 * RULE: Replace page.waitForTimeout() with specific waits
 */
export const TIMEOUTS = {
  // Page navigation and loading
  pageLoad: 30000,
  navigation: 30000,

  // UI element interactions
  action: 10000,
  elementAppear: 10000,

  // API calls
  api: 30000,
  download: 30000,

  // Calculation updates
  calculation: 5000,

  // File operations
  fileDownload: 30000,
  fileWrite: 10000,
} as const;

/**
 * Wait conditions for common scenarios
 * Use waitForResponse(), waitForLoadState(), or deterministic assertions
 */
export const WAIT_CONDITIONS = {
  domContentLoaded: "domcontentloaded",
  networkIdle: "networkidle",
  loadState: "load",
} as const;
