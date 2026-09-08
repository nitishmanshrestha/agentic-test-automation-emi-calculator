/**
 * EMI Calculator Core Automation Tests
 *
 * Comprehensive test suite covering:
 * - Smoke tests (quick validation)
 * - Functional tests (text-input interaction)
 * - Calculation tests (EMI accuracy)
 * - Consistency tests (chart/table alignment)
 * - Export tests (download functionality)
 *
 * Test Strategy:
 * 1. Load application and verify UI ready
 * 2. Set input values via live text fields (Tab commits recalculation)
 * 3. Extract calculated values from UI
 * 4. Independently calculate expected values using domain module
 * 5. Compare actual vs expected with appropriate tolerance
 * 6. Validate dependent components update correctly
 */

import { test, expect } from "@fixtures/index";
import {
  calculateEMI,
  aggregateToCalendarSchedule,
  compareWithTolerance,
  parseIndianCurrency,
} from "@domain/emiCalculator";
import {
  parseTableRow,
  validateTableRow,
  formatValidationError,
} from "@utils/tableValidation";
import {
  validateExcelFile,
  extractExcelAmortizationData,
  aggregateExcelToCalendarYears,
  compareExcelWithUIData,
  cleanupDownloadFile,
} from "@utils/excelValidation";
import {
  SMOKE_TEST_DATA,
  FUNCTIONAL_TEST_DATA,
  BOUNDARY_TEST_DATA,
} from "@data/testData";

/**
 * SMOKE TESTS
 * Quick verification that core functionality works
 * Tagged: @smoke @regression
 */
test.describe("EMI Calculator - Smoke Tests", { tag: "@smoke" }, () => {
  test("should load calculator and display default EMI", { tag: "@regression" }, async ({
    emiPage,
  }) => {
    // Verify page loaded with calculator visible
    await emiPage.verifyPageLoaded();

    // Should be able to retrieve current values
    const loanAmount = await emiPage.getLoanAmount();
    const interestRate = await emiPage.getInterestRate();
    const tenure = await emiPage.getLoanTenure();

    expect(loanAmount).toBeGreaterThan(0);
    expect(interestRate).toBeGreaterThan(0);
    expect(tenure).toBeGreaterThan(0);

    // EMI should be displayed
    const displayedEmi = await emiPage.getDisplayedEMI();
    expect(displayedEmi).toBeGreaterThan(0);
  });

  test("should calculate correct EMI for default values", { tag: ["@regression", "@calculation"] }, async ({
    emiPage,
  }) => {
    // Use default test data
    const scenario = SMOKE_TEST_DATA[0];

    // Get current values (should be defaults)
    await emiPage.setLoanAmount(scenario.principal);
    await emiPage.setInterestRate(scenario.annualRate);
    await emiPage.setLoanTenure(scenario.years);
    await emiPage.waitForCalculationComplete();

    // Get displayed EMI
    const displayedEmi = await emiPage.getDisplayedEMI();

    // Calculate expected EMI independently
    const calculation = calculateEMI({
      principal: scenario.principal,
      annualRate: scenario.annualRate,
      years: scenario.years,
    });

    // Validate EMI is correct (within 2 rupees tolerance)
    expect(
      compareWithTolerance(displayedEmi, calculation.monthlyEmi, 2),
      `EMI mismatch: expected ${calculation.monthlyEmi}, got ${displayedEmi}`,
    ).toBe(true);
  });

  test("should display amortization table", { tag: "@regression" }, async ({
    emiPage,
  }) => {
    const scenario = SMOKE_TEST_DATA[0];

    await emiPage.setLoanAmount(scenario.principal);
    await emiPage.setInterestRate(scenario.annualRate);
    await emiPage.setLoanTenure(scenario.years);
    await emiPage.waitForCalculationComplete();

    // Table should be populated
    const tableData = await emiPage.getAmortizationTableData();
    expect(tableData.length).toBeGreaterThan(0);

    // First row should have Year 1 or similar
    expect(tableData[0].year).toBeGreaterThan(0);
  });
});

/**
 * FUNCTIONAL TESTS - INPUT & UNIT-PILL INTERACTION
 * Validates live text-input entry (Tab commits recalculation) and Yr/Mo pill toggling
 * Tagged: @functional @regression @interaction
 */
test.describe(
  "EMI Calculator - Input Interaction",
  { tag: ["@functional", "@regression", "@interaction"] },
  () => {
  test("should update EMI when loan amount changes", async ({
    emiPage,
  }) => {
    // Set initial values
    const initialPrincipal = 3000000;
    const rate = 9;
    const years = 20;

    await emiPage.setLoanAmount(initialPrincipal);
    await emiPage.setInterestRate(rate);
    await emiPage.setLoanTenure(years);
    await emiPage.waitForCalculationComplete();

    const initialEmi = await emiPage.getDisplayedEMI();

    // Change loan amount
    const newPrincipal = 5000000;
    await emiPage.setLoanAmount(newPrincipal);
    await emiPage.waitForCalculationComplete();

    const newEmi = await emiPage.getDisplayedEMI();

    // EMI should increase when principal increases
    expect(newEmi).toBeGreaterThan(initialEmi);

    // Verify new EMI is correct
    const expectedCalculation = calculateEMI({
      principal: newPrincipal,
      annualRate: rate,
      years: years,
    });

    expect(
      compareWithTolerance(newEmi, expectedCalculation.monthlyEmi, 2),
    ).toBe(true);
  });

  test("should update EMI when interest rate changes", async ({
    emiPage,
  }) => {
    const principal = 4000000;
    const initialRate = 8;
    const years = 15;

    await emiPage.setLoanAmount(principal);
    await emiPage.setInterestRate(initialRate);
    await emiPage.setLoanTenure(years);
    await emiPage.waitForCalculationComplete();

    const initialEmi = await emiPage.getDisplayedEMI();

    // Increase interest rate
    const newRate = 12;
    await emiPage.setInterestRate(newRate);
    await emiPage.waitForCalculationComplete();

    const newEmi = await emiPage.getDisplayedEMI();

    // EMI should increase when rate increases
    expect(newEmi).toBeGreaterThan(initialEmi);

    // Verify new EMI is correct
    const expectedCalculation = calculateEMI({
      principal,
      annualRate: newRate,
      years,
    });

    expect(
      compareWithTolerance(newEmi, expectedCalculation.monthlyEmi, 2),
    ).toBe(true);
  });

  test("should update EMI when tenure changes", async ({
    emiPage,
  }) => {
    const principal = 3000000;
    const rate = 9;
    const initialYears = 10;

    await emiPage.setLoanAmount(principal);
    await emiPage.setInterestRate(rate);
    await emiPage.setLoanTenure(initialYears);
    await emiPage.waitForCalculationComplete();

    const initialEmi = await emiPage.getDisplayedEMI();

    // Increase tenure
    const newYears = 25;
    await emiPage.setLoanTenure(newYears);
    await emiPage.waitForCalculationComplete();

    const newEmi = await emiPage.getDisplayedEMI();

    // EMI should decrease when tenure increases
    expect(newEmi).toBeLessThan(initialEmi);

    // Verify new EMI is correct
    const expectedCalculation = calculateEMI({
      principal,
      annualRate: rate,
      years: newYears,
    });

    expect(
      compareWithTolerance(newEmi, expectedCalculation.monthlyEmi, 2),
    ).toBe(true);
  });

  test("should update EMI when all three inputs change together", { tag: "@assignment" }, async ({
    emiPage,
  }) => {
    // Update ALL THREE inputs in one workflow (assessment req 3a).
    const principal = 3500000;
    const rate = 8.25;
    const years = 12;

    await emiPage.setLoanAmount(principal);
    await emiPage.setInterestRate(rate);
    await emiPage.setLoanTenure(years);
    await emiPage.waitForCalculationComplete();

    const displayedEmi = await emiPage.getDisplayedEMI();

    // Formula recalculation must match after all three inputs changed.
    const expectedCalculation = calculateEMI({
      principal,
      annualRate: rate,
      years,
    });

    expect(
      compareWithTolerance(displayedEmi, expectedCalculation.monthlyEmi, 2),
      `EMI mismatch: expected ${expectedCalculation.monthlyEmi}, got ${displayedEmi}`,
    ).toBe(true);

    // Inputs must reflect what was entered.
    expect(await emiPage.getLoanAmount()).toBe(principal);
    expect(await emiPage.getInterestRate()).toBe(rate);
    expect(await emiPage.getLoanTenure()).toBe(years);
  });

  test("should toggle tenure unit between years and months", async ({
    emiPage,
  }) => {
    const principal = 3000000;
    const rate = 9;
    const years = 15;

    await emiPage.setLoanAmount(principal);
    await emiPage.setInterestRate(rate);
    await emiPage.setLoanTenure(years);
    await emiPage.waitForCalculationComplete();

    const emiInYears = await emiPage.getDisplayedEMI();
    expect(emiInYears).toBeGreaterThan(0);

    // Switch to months: 15 years → 180 months, EMI unchanged
    await emiPage.selectTenureUnit("Mo");
    expect(await emiPage.getLoanTenure()).toBe(years * 12);
    expect(await emiPage.getDisplayedEMI()).toBe(emiInYears);

    // Switch back to years: tenure reconverts to the original value
    await emiPage.selectTenureUnit("Yr");
    expect(await emiPage.getLoanTenure()).toBe(years);
    expect(await emiPage.getDisplayedEMI()).toBe(emiInYears);
  });
});

/**
 * CALCULATION TESTS
 * Validates EMI calculation accuracy
 * Tagged: @calculation @regression @critical
 */
test.describe("EMI Calculator - Calculation Accuracy", { tag: ["@calculation", "@assignment"] }, () => {
  FUNCTIONAL_TEST_DATA.forEach((scenario) => {
    test(`should calculate correct EMI: ${scenario.name}`, { tag: "@regression" }, async ({
      emiPage,
    }) => {
      // Set values
      await emiPage.setLoanAmount(scenario.principal);
      await emiPage.setInterestRate(scenario.annualRate);
      await emiPage.setLoanTenure(scenario.years);
      await emiPage.waitForCalculationComplete();

      // Get displayed values
      const displayedEmi = await emiPage.getDisplayedEMI();
      const displayedTotalInterest = await emiPage.getTotalInterestPayable();
      const displayedTotalPayment = await emiPage.getTotalPayment();

      // Calculate expected values
      const calculation = calculateEMI({
        principal: scenario.principal,
        annualRate: scenario.annualRate,
        years: scenario.years,
      });

      // Assertions with tolerance for rounding
      expect(
        compareWithTolerance(displayedEmi, calculation.monthlyEmi, 2),
        `EMI: expected ${calculation.monthlyEmi}, got ${displayedEmi}`,
      ).toBe(true);

      expect(
        compareWithTolerance(
          displayedTotalInterest,
          calculation.totalInterest,
          10,
        ),
        `Total Interest: expected ${calculation.totalInterest}, got ${displayedTotalInterest}`,
      ).toBe(true);

      expect(
        compareWithTolerance(
          displayedTotalPayment,
          calculation.totalPayment,
          10,
        ),
        `Total Payment: expected ${calculation.totalPayment}, got ${displayedTotalPayment}`,
      ).toBe(true);
    });
  });
});

/**
 * BOUNDARY TESTS
 * Tests edge cases and limits
 * Tagged: @boundary @regression
 */
test.describe("EMI Calculator - Boundary Cases", { tag: ["@boundary", "@regression"] }, () => {
  BOUNDARY_TEST_DATA.forEach((scenario) => {
    test(`should handle boundary case: ${scenario.name}`, async ({
      emiPage,
    }) => {
      await emiPage.setLoanAmount(scenario.principal);
      await emiPage.setInterestRate(scenario.annualRate);
      await emiPage.setLoanTenure(scenario.years);
      await emiPage.waitForCalculationComplete();

      // Should successfully calculate EMI without errors
      const displayedEmi = await emiPage.getDisplayedEMI();
      expect(displayedEmi).toBeGreaterThan(0);

      // Should have valid table data
      const tableData = await emiPage.getAmortizationTableData();
      expect(tableData.length).toBeGreaterThan(0);

      // Verify using formula
      const calculation = calculateEMI({
        principal: scenario.principal,
        annualRate: scenario.annualRate,
        years: scenario.years,
      });

      expect(
        compareWithTolerance(displayedEmi, calculation.monthlyEmi, 2),
      ).toBe(true);
    });
  });
});

/**
 * DATA CONSISTENCY TESTS
 * Validates chart and table show consistent data
 * Tagged: @consistency @regression @critical
 */
test.describe("EMI Calculator - Data Consistency", { tag: ["@consistency", "@regression"] }, () => {
  test("should have consistent values across EMI, Total Interest, and Total Payment", { tag: "@critical" }, async ({
    emiPage,
  }) => {
    const scenario = FUNCTIONAL_TEST_DATA[0];

    await emiPage.setLoanAmount(scenario.principal);
    await emiPage.setInterestRate(scenario.annualRate);
    await emiPage.setLoanTenure(scenario.years);
    await emiPage.waitForCalculationComplete();

    const emi = await emiPage.getDisplayedEMI();
    const totalInterest = await emiPage.getTotalInterestPayable();
    const totalPayment = await emiPage.getTotalPayment();

    const numMonths = scenario.years * 12;

    // Verify displayed totals match the independent domain calculation.
    const calculation = calculateEMI({
      principal: scenario.principal,
      annualRate: scenario.annualRate,
      years: scenario.years,
    });

    expect(
      compareWithTolerance(totalPayment, calculation.totalPayment, 10),
      `Total Payment: expected ${calculation.totalPayment}, got ${totalPayment}`,
    ).toBe(true);

    expect(
      compareWithTolerance(totalInterest, calculation.totalInterest, 10),
      `Total Interest: expected ${calculation.totalInterest}, got ${totalInterest}`,
    ).toBe(true);

    // Verify UI-internal identity: Total Payment = Principal + Total Interest
    const expectedTotalPayment = scenario.principal + totalInterest;
    expect(compareWithTolerance(totalPayment, expectedTotalPayment, 10)).toBe(
      true,
    );

    // Verify: EMI × Months ≈ Total Payment within one rupee per month. The app
    // rounds the displayed EMI to whole rupees, so allow numMonths of drift.
    const calculatedTotalFromEmi = emi * numMonths;
    expect(
      compareWithTolerance(totalPayment, calculatedTotalFromEmi, numMonths + 10),
    ).toBe(true);
  });

  test("should display year-wise amortization table with correct structure", async ({
    emiPage,
  }) => {
    const scenario = FUNCTIONAL_TEST_DATA[0];

    await emiPage.setLoanAmount(scenario.principal);
    await emiPage.setInterestRate(scenario.annualRate);
    await emiPage.setLoanTenure(scenario.years);
    await emiPage.waitForCalculationComplete();

    const tableData = await emiPage.getAmortizationTableData();

    // Calendar-year grouping: a loan started mid-year spanning calendar years,
    // so expect at least one row per loan year (partial first/last years).
    expect(tableData.length).toBeGreaterThanOrEqual(scenario.years);

    // Verify structure
    tableData.forEach((row, _index) => {
      expect(row.year).toBeGreaterThan(0);
      expect(row.principal).toBeTruthy();
      expect(row.interest).toBeTruthy();
      expect(row.totalPayment).toBeTruthy();
      expect(row.balance).toBeTruthy();
    });

    // Final balance should be 0 or very close
    const lastRow = tableData[tableData.length - 1];
    const finalBalance = parseIndianCurrency(lastRow.balance);
    expect(finalBalance).toBeLessThan(scenario.principal * 0.01); // Less than 1% of principal
  });

  test("should validate table values match independent calculation", { tag: "@critical" }, async ({
    emiPage,
  }) => {
    const scenario = FUNCTIONAL_TEST_DATA[0];

    await emiPage.setLoanAmount(scenario.principal);
    await emiPage.setInterestRate(scenario.annualRate);
    await emiPage.setLoanTenure(scenario.years);
    await emiPage.waitForCalculationComplete();

    // Get table data from UI
    const uiTableData = await emiPage.getAmortizationTableData();

    // Calculate expected amortization schedule
    const calculation = calculateEMI({
      principal: scenario.principal,
      annualRate: scenario.annualRate,
      years: scenario.years,
    });

    // The app groups the table by calendar year using its schedule start date.
    const start = await emiPage.getScheduleStart();
    const expectedYearlyData = aggregateToCalendarSchedule(
      calculation.monthlyBreakdown,
      start.year,
      start.month,
    );

    // Validate each row (tolerance covers the app's whole-rupee month rounding).
    for (
      let i = 0;
      i < Math.min(uiTableData.length, expectedYearlyData.length);
      i++
    ) {
      const uiRow = uiTableData[i];
      const parsedRow = parseTableRow(uiRow);
      const yearly = expectedYearlyData[i];
      const expectedRow = {
        year: yearly.year,
        principal: yearly.principalPaid,
        interest: yearly.interestPaid,
        totalPayment: yearly.totalPayment,
        balance: yearly.endingBalance,
      };

      const result = validateTableRow(parsedRow, expectedRow, 10); // 10 rupee tolerance (whole-rupee month rounding)

      expect(
        result.passed,
        formatValidationError(i + 1, result, {
          principal: scenario.principal,
          rate: scenario.annualRate,
          years: scenario.years,
        }),
      ).toBe(true);
    }
  });

  test("should validate chart slices match year-wise table sums", { tag: ["@critical", "@assignment"] }, async ({
    emiPage,
  }) => {
    const scenario = FUNCTIONAL_TEST_DATA[0];

    await emiPage.setLoanAmount(scenario.principal);
    await emiPage.setInterestRate(scenario.annualRate);
    await emiPage.setLoanTenure(scenario.years);
    await emiPage.waitForCalculationComplete();

    // Year-wise table → aggregate sums.
    const tableData = await emiPage.getAmortizationTableData();
    let sumPrincipal = 0;
    let sumInterest = 0;
    for (const row of tableData) {
      sumPrincipal += parseIndianCurrency(row.principal);
      sumInterest += parseIndianCurrency(row.interest);
    }
    const totalPayment = sumPrincipal + sumInterest;
    expect(totalPayment).toBeGreaterThan(0);

    // Expected slice percentages derived from the year-wise table.
    const expectedPrincipalPct = (sumPrincipal / totalPayment) * 100;
    const expectedInterestPct = (sumInterest / totalPayment) * 100;

    // Actual chart slices (first = Principal, second = Total Interest).
    const chart = await emiPage.getChartBreakdown();

    // Highcharts labels round to one decimal place → ±0.3 tolerance.
    expect(
      compareWithTolerance(chart.principalPct, expectedPrincipalPct, 0.3),
      `Chart principal ${chart.principalPct}% vs table ${expectedPrincipalPct.toFixed(1)}%`,
    ).toBe(true);
    expect(
      compareWithTolerance(chart.interestPct, expectedInterestPct, 0.3),
      `Chart interest ${chart.interestPct}% vs table ${expectedInterestPct.toFixed(1)}%`,
    ).toBe(true);

    // Slices must total ~100%.
    expect(compareWithTolerance(chart.principalPct + chart.interestPct, 100, 0.3)).toBe(
      true,
    );
  });
});

/**
 * EXPORT TESTS
 * Validates file download functionality
 * Tagged: @export @regression @critical
 */
test.describe("EMI Calculator - Export & Download", { tag: ["@export", "@regression", "@assignment"] }, () => {
  test("should download Excel file with valid structure", { tag: "@critical" }, async ({
    emiPage,
  }) => {
    const scenario = FUNCTIONAL_TEST_DATA[0];

    await emiPage.setLoanAmount(scenario.principal);
    await emiPage.setInterestRate(scenario.annualRate);
    await emiPage.setLoanTenure(scenario.years);
    await emiPage.waitForCalculationComplete();

    // Download Excel file
    let downloadPath: string | null = null;
    try {
      downloadPath = await emiPage.downloadExcelReport(test.info().testId);
      expect(downloadPath).toBeTruthy();

      // Validate file structure and content
      const validationResult = await validateExcelFile(downloadPath);

      expect(
        validationResult.passed,
        `Excel validation failed: ${validationResult.errors.join(", ")}`,
      ).toBe(true);

      expect(validationResult.metadata.fileSize).toBeGreaterThan(0);
      expect(validationResult.data?.rows).toBeGreaterThan(0);
    } finally {
      // Cleanup
      if (downloadPath) {
        await cleanupDownloadFile(downloadPath);
      }
    }
  });

  test("should match Excel data with UI table", async ({
    emiPage,
  }) => {
    const scenario = FUNCTIONAL_TEST_DATA[0];

    await emiPage.setLoanAmount(scenario.principal);
    await emiPage.setInterestRate(scenario.annualRate);
    await emiPage.setLoanTenure(scenario.years);
    await emiPage.waitForCalculationComplete();

    // Get UI table data
    const uiTableData = await emiPage.getAmortizationTableData();
    const parsedUiData = uiTableData.map((row) => ({
      year: row.year,
      principal: parseIndianCurrency(row.principal),
      interest: parseIndianCurrency(row.interest),
      totalPayment: parseIndianCurrency(row.totalPayment),
      balance: parseIndianCurrency(row.balance),
    }));

    // Download and extract Excel data
    let downloadPath: string | null = null;
    try {
      downloadPath = await emiPage.downloadExcelReport(test.info().testId);

      const excelData = await extractExcelAmortizationData(downloadPath);

      // Excel is MONTHLY; aggregate to the same calendar years as the UI table.
      const start = await emiPage.getScheduleStart();
      const excelYearlyData = aggregateExcelToCalendarYears(
        excelData,
        start.year,
        start.month,
      );

      // Compare data
      const comparison = compareExcelWithUIData(parsedUiData, excelYearlyData, 10);

      expect(
        comparison.matches,
        `Data mismatch: ${comparison.mismatches.length} rows differ`,
      ).toBe(true);
    } finally {
      if (downloadPath) {
        await cleanupDownloadFile(downloadPath);
      }
    }
  });
});
