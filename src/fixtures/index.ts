/**
 * Playwright Test Fixtures
 *
 * Provides reusable setup/teardown and shared resources for tests.
 *
 * Fixtures:
 * - page: Playwright Page (standard)
 * - emiPage: EMI Calculator page object with initialized state
 */

import { test as base } from "@playwright/test";
import { EMICalculatorPage } from "@pages/emiCalculatorPage";

export interface Fixtures {
  emiPage: EMICalculatorPage;
}

/**
 * Third-party traffic that destabilizes runs (ads, analytics, consent, comments).
 * Calculation is client-side — none of these are needed. See scaffold §5.
 */
const BLOCKED_ROUTES: RegExp[] = [
  /googlesyndication\.com/,
  /pagead2\.googlesyndication\.com/,
  /fundingchoicesmessages\.google\.com/,
  /google-analytics\.com/,
  /admin-ajax\.php\?action=alm_comments/,
];

/**
 * Extended test fixture with EMI Calculator page object
 */
export const test = base.extend<Fixtures>({
  emiPage: async ({ page }, use) => {
    // Setup: Initialize page object and navigate to application
    await Promise.all(
      BLOCKED_ROUTES.map((pattern) => page.route(pattern, (route) => route.abort())),
    );
    const emiPage = new EMICalculatorPage(page);
    await emiPage.navigateTo();
    await emiPage.verifyPageLoaded();

    // Use in test
    await use(emiPage);

    // Teardown: Clean up if needed
    // (Playwright automatically closes page after test)
  },
});

export { expect } from "@playwright/test";
