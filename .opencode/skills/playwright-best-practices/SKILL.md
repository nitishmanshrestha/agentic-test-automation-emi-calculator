---
name: playwright-best-practices
description: Authoritative Playwright Test best practices for generating resilient, isolated, maintainable end-to-end tests. Covers locator strategy, web-first assertions, page object models, test isolation, cross-browser config, CI, linting, and parallelism. Load before writing any Playwright test code.
license: MIT
compatibility: opencode
metadata:
  audience: test-automation-agents
  source: https://playwright.dev/docs/best-practices
---

# Playwright Best Practices

Authoritative rules distilled from the Playwright docs. Follow **every** rule below when generating or reviewing Playwright tests.

## Testing philosophy

- **Test user-visible behavior.** Assert on what users see/interact with, never on implementation details (function names, arrays, CSS classes, internal state).
- **Make tests isolated.** Each test runs independently with its own storage/session/data/cookies (Playwright default). No test depends on another.
- **Avoid testing third-party dependencies.** Only test what you control. Mock external endpoints with `page.route` instead of driving external sites.
- **Control your data.** When a test touches a database/API, control and seed the data (staging, fixed datasets).

## Locators

- Use Playwright built-in **locators**, which auto-wait and retry. Prefer user-facing attributes and explicit contracts.
- Priority order: `getByRole` > `getByLabel` > `getByPlaceholder` > `getByText` > `getByTestId`.
  ```ts
  // 👍 resilient, user-facing
  await page.getByRole('button', { name: 'submit' }).click();
  // 👎 brittle — depends on DOM/class structure
  await page.locator('button.buttonIcon.episode-actions-later').click();
  ```
- **Chain and filter** to disambiguate:
  ```ts
  const product = page.getByRole('listitem').filter({ hasText: 'Product 2' });
  await product.getByRole('button', { name: 'Add to cart' }).click();
  ```
- Prefer role/text/test-id locators over XPath or CSS. If multiple elements match, refine the locator until it uniquely identifies the target.
- Generate locators with `npx playwright codegen <url>` or the VS Code extension rather than hand-writing brittle ones.

## No hard waits — synchronization rules

- **NEVER use fixed sleeps.** `page.waitForTimeout()`, `sleep()`, and arbitrary delays are banned from generated code. They make tests flaky and slow.
- Playwright **auto-waits** before every action (actionability checks: visible, stable, receives events, enabled, editable) and assertions **auto-retry** until the condition passes. Lean on that.
- When an explicit wait is genuinely required, use a deterministic condition only:
  ```ts
  // 👍 web-first assertion (retries)
  await expect(page.getByText('welcome')).toBeVisible();
  // 👍 explicit, deterministic
  await page.locator('#table').waitFor({ state: 'visible' });
  await page.waitForLoadState('networkidle'); // only when strictly needed
  // 👍 wait for an event instead of a sleep (e.g. downloads, navigation)
  const download = await page.waitForEvent('download');
  // 👎 banned — arbitrary fixed delay
  await page.waitForTimeout(1000);
  ```
- Identify the real readiness signal per flow: element visible/stable, loading indicator hidden, API response, download/event emitted — and encode that, not a wall-clock delay.
- Prefer web-first assertions over `waitFor` where the assertion is the very point (visibility, text, value, count).

## Page object models & layer separation

- Model each screen/component as a **page object (POM)** exposing a **high-level semantic API** and **capturing selectors in one place** so locator changes are a single-file edit.
  ```ts
  // models/PlaywrightDevPage.ts
  export class PlaywrightDevPage {
    readonly getStartedLink: Locator;
    constructor(public readonly page: Page) {
      this.getStartedLink = page.getByRole('link', { name: 'Get started' });
    }
    async goto() { await this.page.goto('https://playwright.dev'); }
    async getStarted() { await this.getStartedLink.click(); }
  }
  ```
- Layering:
  - **Specs/tests** — orchestrate scenarios & assertions (the "what to validate").
  - **Page objects & helpers** — semantic interactions (the "how to interact"), reusable across tests.
  - **Domain/utilities** — business logic, data parsing, independent oracles.
- Keep page objects focused; avoid mega-objects with dozens of low-level methods. A page object may embed assertions when they verify its own contract (e.g. a `goto()` that asserts the page landed), but keep domain validation in tests/utilities.
- Fixtures inject page objects (via `base.extend`) so specs stay clean.
- Use `test.beforeEach` / setup projects / `storageState` for reusable state; never couple tests to each other.

## Selector hygiene — centralize, never inline

- **All selectors live in their own centralized file** (e.g. `playwright/configs/ui/selectors.ts`), one registry per app, named exports grouped by page/component.
- **Rules:**
  - Specs and page objects/helpers must NOT contain raw selector literals (no `page.locator('td, [role=gridcell]')` sprinkled in helper methods). They reference the registry.
  - Give every selector a stable logical name (`loanAmountInput`, `downloadButton`, `amortizationTable`) so intent is readable in specs.
  - Keep a `SEMANTIC_ROLES` / `TEST_IDS` section in the registry for role-based locators and `data-testid` contracts.
  - The registry itself may hold the implementation (role, label, CSS, testid) — the call sites only use the logical name.
- When a UI element has no reliable handle, **do not inline a brittle CSS workaround** — recommend a stable `data-testid`, register it in the registry, and mark it.

## Web-first assertions

- Use web-first assertions ONLY. They auto-wait and retry until the condition passes.
  ```ts
  // 👍 waits & retries
  await expect(page.getByText('welcome')).toBeVisible();
  // 👎 manual — returns immediately, no retry
  expect(await page.getByText('welcome').isVisible()).toBe(true);
  ```
- The `await` must be **inside/around expect**, never a non-awaited `isVisible()` check wrapped by `expect`.

## Test isolation & setup

- Each test gets its own page/context (default). Use `test.beforeEach` for shared per-test setup (e.g. navigating, signing in).
- For shared logged-in state, use a **setup project** writing `storageState`, then reuse it via `use.storageState` — log in once, skip per-test login.
- Don't re-test third-party servers: `await page.route('**/api/...', route => route.fulfill({ status: 200, body: testData }))`.

## Debugging & tooling

- Locally: use the VS Code extension, run with `--debug` (Playwright inspector), or `--trace on`.
- On CI: use the **trace viewer** for failures instead of videos/screenshots. Configure trace to `on-first-retry`, not `on`, to avoid the performance cost of tracing every test.
- Configure the HTML report (`npx playwright show-report`).

## Cross-browser & config

- Test across browsers with projects in `playwright.config.ts`:
  ```ts
  import { defineConfig, devices } from '@playwright/test';
  export default defineConfig({
    projects: [
      { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
      { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
      { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    ],
  });
  ```
- Keep `@playwright/test` up to date; test latest browser versions.

## CI

- Run tests on every commit and PR. Use Linux on CI (cheaper). Use sharding to speed up CI.
- Install only the browsers you need on CI (e.g. `npx playwright install chromium --with-deps`, not `playwright install --with-deps`).
- Recommended configs: `retries: 1` in CI, `trace/screenshot/video: 'on-first-retry'`, HTML report artifact upload.

## Lint & typecheck

- Use TypeScript + ESLint. Enable `@typescript-eslint/no-floating-promises` to catch missing `await` on Playwright's async APIs.
- Run `tsc --noEmit` in CI to validate signatures.

## Parallelism & sharding

- Playwright runs parallel by default. For many independent tests in one file, use:
  ```ts
  test.describe.configure({ mode: 'parallel' });
  ```
- Shard across machines: `npx playwright test --shard=1/3`.

## Productivity tips

- Use **soft assertions** to accumulate failures without aborting:
  ```ts
  await expect.soft(page.getByTestId('status')).toHaveText('Success');
  await page.getByRole('link', { name: 'next page' }).click();
  ```
