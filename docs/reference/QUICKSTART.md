> **File Path:** `docs/reference/QUICKSTART.md`  
> **Related Documents:** [README](../../README.md) | [Index](INDEX.md) | [Test Plan](../testing/TEST_PLAN.md)

# Quick Start Guide

## Installation (5 minutes)

```bash
# Install dependencies
npm install

# Install Playwright browsers (required for first run)
npx playwright install --with-deps
```

## Running Tests

### Smoke Tests (< 2 min) - Quick validation

```bash
npm run test:smoke
# Tests: Page load, default EMI, table display
```

### Regression Tests (< 10 min) - PR validation

```bash
npm run test:regression
# Tests: All critical + high-priority tests
```

### Full Test Suite (~2 min) - Complete validation

```bash
npm test
# Tests: All 23 tests (smoke, functional, boundary, calculation, consistency, export)
```

### Specific Test Categories

```bash
# Calculation tests only
npm run test:calculation

# Export tests only
npm run test:export

# Smoke tests only
npm run test:smoke

# Regression suite only
npm run test:regression

# Assignment-demanded tests
npm run test:assignment

# Boundary/consistency tests (no npm script - use grep)
npx playwright test --grep @boundary
npx playwright test --grep @consistency

# Lint (non-fixing, for CI gating)
npm run lint:check
```

## Advanced Options

### Run with Headed Browser (see what tests do)

```bash
npm run test:headed
# Better for debugging - shows browser window
```

### Debug Mode

```bash
npm run test:debug
# Opens Playwright Inspector for stepping through tests
```

### View Results

```bash
# Open HTML report (generates after test run)
npm run test:report

# View in UI mode (interactive test runner)
npm run test:ui
```

## File Locations

| Item                | Location                         |
| ------------------- | -------------------------------- |
| Test Cases          | `tests/emi.spec.ts`              |
| Test Data           | `src/data/testData.ts`           |
| Page Object         | `src/pages/emiCalculatorPage.ts` |
| EMI Calculator      | `src/domain/emiCalculator.ts`    |
| Test Plan           | `docs/testing/TEST_PLAN.md`      |
| Test Case Matrix    | `docs/testing/TEST_CASE_MATRIX.md` |
| Architecture        | `docs/architecture/ARCHITECTURE.md` |
| Regression Strategy | `docs/testing/REGRESSION_STRATEGY.md` |
| Test Report         | `docs/testing/TEST_SUMMARY_REPORT.md` |
| Requirement Mapper  | `docs/testing/REQUIREMENT_MAPPER.md` |

## Expected Results

### Smoke Test Output (should pass)

```
✓ should load EMI calculator (5s)
✓ should calculate default EMI (3s)
✓ should display amortization table (4s)
──────────────────────────────────
3 passed (12s)
```

### Full Test Output (should pass)

```
✓ SMOKE Tests (3/3)
✓ FUNCTIONAL Tests (5/5)
✓ CALCULATION Tests (3/3)
✓ CONSISTENCY Tests (4/4)
✓ BOUNDARY TESTS (6/6)
✓ EXPORT Tests (2/2)
──────────────────────────────────
23 passed (~1-2 min)
```

## Troubleshooting

### Browser not found

```bash
# Reinstall browsers
npx playwright install --with-deps
```

### Tests timing out

```bash
# Increase timeout in playwright.config.ts
# Or check if application URL is reachable
```

### Locators not found

```bash
# Locators may need adjustment based on live app DOM
# Update in src/pages/emiCalculatorPage.ts
```

### Excel validation fails

```bash
# Check if file downloaded successfully
# Verify XLSX library is installed: npm install xlsx
```

## Key Documentation

- **Getting Started:** README.md
- **How to Test:** docs/testing/TEST_PLAN.md
- **Test Details:** docs/testing/TEST_CASE_MATRIX.md
- **Architecture:** docs/architecture/ARCHITECTURE.md
- **Regression:** docs/testing/REGRESSION_STRATEGY.md
- **Requirements → Tests:** docs/testing/REQUIREMENT_MAPPER.md

## Tips

✅ Always run `test:smoke` first to verify setup  
✅ Use `test:report` to view detailed HTML results  
✅ Check test-results/ directory for screenshots/videos on failure  
✅ Use `test:headed` mode for debugging  
✅ Read architecture docs to understand framework design

## CI/CD

Tests will run automatically on:

- Every push (smoke tests)
- Every pull request (regression tests)
- Daily at 2 AM UTC (full suite)

Results will be:

- Reported in PR comments
- Available as artifacts
- Visible in GitHub Actions tab
