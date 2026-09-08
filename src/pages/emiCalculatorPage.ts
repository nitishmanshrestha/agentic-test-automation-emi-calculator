/**
 * EMI Calculator Page Object
 *
 * Encapsulates UI interaction logic for the EMI calculator.
 * Provides high-level domain methods rather than low-level UI actions.
 *
 * Verified against the LIVE application (see .playwright-cli/scaffold/):
 * - Controls are <input type="text"> (NOT range sliders); recalculation fires on Tab/blur.
 * - Tenure unit pills (Yr/Mo) are hidden radios wrapped by <label class="btn"> that
 *   intercept pointer events — interact with the label, not the radio.
 * - Amortization table exposes YEARLY rows; monthly details collapse into one cell
 *   per year and are filtered out here.
 * - Download buttons are <a role="button"> styled anchors.
 *
 * RULE: No waitForTimeout/sleep — web-first assertions and deterministic waits only.
 * RULE: No raw selector literals — all selectors come from @configs/ui/selectors.
 */

import { expect, Locator, Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { INPUT_ROLES, LABELS, ROLES, SELECTORS } from "@configs/ui/selectors";
import { TIMEOUTS } from "@configs/app/routes";

export interface AmortizationTableRow {
  year: number;
  principal: string;
  interest: string;
  totalPayment: string;
  balance: string;
}

export type TenureUnit = "Yr" | "Mo";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export class EMICalculatorPage {
  private readonly page: Page;
  private readonly loanAmountInput: Locator;
  private readonly interestRateInput: Locator;
  private readonly loanTenureInput: Locator;
  private readonly monthlyEMI: Locator;
  private readonly totalInterestPayable: Locator;
  private readonly totalPayment: Locator;
  private readonly tenureUnitYearsPill: Locator;
  private readonly tenureUnitMonthsPill: Locator;
  private readonly tenureUnitYearsRadio: Locator;
  private readonly tenureUnitMonthsRadio: Locator;
  private readonly amortizationTable: Locator;
  private readonly chart: Locator;
  private readonly pieChartPercentages: Locator;
  private readonly scheduleStartDate: Locator;
  private readonly downloadExcel: Locator;
  private readonly downloadButton: Locator;

  /**
   * Locators are defined once and lazily re-resolved on every use by Playwright,
   * so a single readonly field per element is safe and idiomatic. User-facing
   * role/label locators are preferred; source of truth is @configs/ui/selectors.
   */
  constructor(page: Page) {
    this.page = page;
    this.loanAmountInput = page.getByRole(INPUT_ROLES.loanAmountInput.role, {
      name: INPUT_ROLES.loanAmountInput.name,
    });
    this.interestRateInput = page.getByRole(INPUT_ROLES.interestRateInput.role, {
      name: INPUT_ROLES.interestRateInput.name,
    });
    this.loanTenureInput = page.getByRole(INPUT_ROLES.loanTenureInput.role, {
      name: INPUT_ROLES.loanTenureInput.name,
    });
    this.monthlyEMI = page.locator(SELECTORS.monthlyEMI);
    this.totalInterestPayable = page.locator(SELECTORS.totalInterestPayable);
    this.totalPayment = page.locator(SELECTORS.totalPayment);
    this.tenureUnitYearsPill = page.locator(SELECTORS.tenureUnitYearsPill);
    this.tenureUnitMonthsPill = page.locator(SELECTORS.tenureUnitMonthsPill);
    this.tenureUnitYearsRadio = page.locator(SELECTORS.tenureUnitYearsRadio);
    this.tenureUnitMonthsRadio = page.locator(SELECTORS.tenureUnitMonthsRadio);
    this.amortizationTable = page.locator(SELECTORS.amortizationTable);
    this.chart = page.locator(SELECTORS.chart);
    this.pieChartPercentages = this.chart.locator(SELECTORS.pieChartPercentages);
    this.scheduleStartDate = page.getByLabel(LABELS.scheduleStartDate);
    this.downloadExcel = page.getByRole(ROLES.downloadExcel.role, {
      name: ROLES.downloadExcel.name,
    });
    this.downloadButton = page.locator(SELECTORS.downloadButton);
  }

  /**
   * Navigate to the EMI calculator application.
   * domcontentloaded is used (networkIdle stalls behind ads/lazy content).
   */
  async navigateTo(): Promise<void> {
    await this.page.goto("/", { waitUntil: "domcontentloaded" });
    await this.verifyPageLoaded();
  }

  /**
   * Verify the calculator is ready for interaction (web-first, no fixed waits).
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.loanAmountInput).toBeVisible({
      timeout: TIMEOUTS.pageLoad,
    });
  }

  /**
   * Set loan amount via the live text input. Recalculation is triggered (and awaited)
   * by committing the field with the Tab key.
   */
  async setLoanAmount(amount: number): Promise<void> {
    await this.replaceInput(
      this.loanAmountInput,
      amount.toLocaleString("en-IN"),
    );
  }

  /**
   * Set interest rate via the live text input.
   */
  async setInterestRate(rate: number): Promise<void> {
    await this.replaceInput(this.interestRateInput, String(rate));
  }

  /**
   * Set loan tenure (in the active unit, years by default) via the live text input.
   */
  async setLoanTenure(years: number): Promise<void> {
    await this.replaceInput(this.loanTenureInput, String(years));
  }

  /**
   * Toggle the tenure unit pill (Yr ↔ Mo).
   * Click the wrapping label — the hidden radio intercepts direct calls.
   */
  async selectTenureUnit(unit: TenureUnit): Promise<void> {
    const isYears = unit === "Yr";
    const pill = isYears ? this.tenureUnitYearsPill : this.tenureUnitMonthsPill;
    const radio = isYears
      ? this.tenureUnitYearsRadio
      : this.tenureUnitMonthsRadio;

    await pill.click();
    await expect(radio).toBeChecked({
      timeout: TIMEOUTS.action,
    });
  }

  /**
   * Get currently displayed monthly EMI (e.g. ₹44,986 → 44986).
   */
  async getDisplayedEMI(): Promise<number> {
    const emiText = (await this.monthlyEMI.textContent()) ?? "0";
    return this.parseIndianCurrency(emiText);
  }

  /**
   * Get total interest payable.
   */
  async getTotalInterestPayable(): Promise<number> {
    const text = (await this.totalInterestPayable.textContent()) ?? "0";
    return this.parseIndianCurrency(text);
  }

  /**
   * Get total payment (principal + interest).
   */
  async getTotalPayment(): Promise<number> {
    const text = (await this.totalPayment.textContent()) ?? "0";
    return this.parseIndianCurrency(text);
  }

  /**
   * Get current loan amount input value.
   */
  async getLoanAmount(): Promise<number> {
    const value = await this.loanAmountInput.inputValue();
    return parseInt(value.replace(/,/g, "") || "0", 10);
  }

  /**
   * Get current interest rate input value.
   */
  async getInterestRate(): Promise<number> {
    const value = await this.interestRateInput.inputValue();
    return parseFloat(value || "0");
  }

  /**
   * Get current loan tenure input value (years, or months when Mo pill is active).
   */
  async getLoanTenure(): Promise<number> {
    const value = await this.loanTenureInput.inputValue();
    return parseInt(value || "0", 10);
  }

  /**
   * Extract amortization table data (YEARLY rows only).
   * Monthly-detail rows collapse into a single concatenated cell and are skipped.
   */
  async getAmortizationTableData(): Promise<AmortizationTableRow[]> {
    const table = this.amortizationTable;
    await table.waitFor({ state: "visible" });

    const data: AmortizationTableRow[] = [];
    const rows = table.locator(SELECTORS.tableRow);
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
      const cells = rows.nth(i).locator(SELECTORS.tableCell);
      const cellCount = await cells.count();

      if (cellCount < 5) continue;

      const cellTexts: string[] = [];
      for (let j = 0; j < 5; j++) {
        cellTexts.push(((await cells.nth(j).textContent()) ?? "").trim());
      }

      const year = parseInt(cellTexts[0].split("-")[0], 10);
      if (Number.isNaN(year)) continue;

      data.push({
        year,
        principal: cellTexts[1],
        interest: cellTexts[2],
        totalPayment: cellTexts[3],
        balance: cellTexts[4],
      });
    }

    return data;
  }

  /**
   * Download amortization report as Excel and save it under test-results.
   * When filenamePrefix is provided (e.g. test id), it is prepended so parallel
   * tests never race writing to the same suggested filename.
   */
  async downloadExcelReport(filenamePrefix = ""): Promise<string> {
    const downloadPromise = this.page.waitForEvent("download", {
      timeout: TIMEOUTS.fileDownload,
    });

    const downloadBtn = this.downloadExcel.or(this.downloadButton);

    await downloadBtn.click();

    const download = await downloadPromise;

    const outputDirectory = path.join(process.cwd(), "test-results");
    await mkdir(outputDirectory, { recursive: true });
    const suggestedFilename = download.suggestedFilename();
    const fileName = filenamePrefix
      ? `${filenamePrefix}-${suggestedFilename}`
      : suggestedFilename;
    const filePath = path.join(outputDirectory, fileName);
    await download.saveAs(filePath);

    return filePath;
  }

  /**
   * Verify the chart container is present and visible.
   */
  async verifyChartExists(): Promise<boolean> {
    const chart = this.chart;
    try {
      await chart.waitFor({ state: "visible", timeout: TIMEOUTS.calculation });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extract the pie chart slice percentages from the Highcharts SVG.
   * FIRST percentage node maps to the "Principal Loan Amount" slice,
   * SECOND to the "Total Interest" slice (verified live).
   */
  async getChartBreakdown(): Promise<{
    principalPct: number;
    interestPct: number;
  }> {
    const chart = this.chart;
    await chart.waitFor({ state: "visible", timeout: TIMEOUTS.calculation });

    // Percentages render inside <tspan> under <svg><text>; find them by text.
    const dataLabels = this.pieChartPercentages;
    const count = await dataLabels.count();
    const pctTexts: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = ((await dataLabels.nth(i).textContent()) ?? "").trim();
      if (text.includes("%")) pctTexts.push(text);
    }

    if (pctTexts.length < 2) {
      throw new Error(
        `Expected 2 chart slice percentages, found ${pctTexts.length} (got: ${pctTexts.join(", ")})`,
      );
    }

    return {
      principalPct: this.parsePercent(pctTexts[0]),
      interestPct: this.parsePercent(pctTexts[1]),
    };
  }

  /**
   * Parse a percentage string (e.g. "46.3%" → 46.3).
   */
  private parsePercent(text: string): number {
    const cleaned = text.replace(/[%,\s]/g, "").trim();
    const value = parseFloat(cleaned);
    if (Number.isNaN(value)) {
      throw new Error(`Unparseable percentage: "${text}"`);
    }
    return value;
  }

  /**
   * Wait for calculations to settle after input changes.
   * Deterministic signal (EMI panel visible), not a fixed delay.
   */
  async waitForCalculationComplete(): Promise<void> {
    await this.monthlyEMI.waitFor({
      state: "visible",
      timeout: TIMEOUTS.calculation,
    });
  }

  /**
   * Read the schedule start date (e.g. "Sep 2026") from the schedule picker.
   * Used to align calendar-year table grouping with the domain oracle.
   */
  async getScheduleStart(): Promise<{ year: number; month: number }> {
    const label = (
      (await this.scheduleStartDate.inputValue()) ?? ""
    ).trim();

    const parts = label.split(" ");
    const month = MONTHS.indexOf(parts[0]) + 1;
    const year = parseInt(parts[1], 10);

    if (month === 0 || Number.isNaN(year)) {
      throw new Error(`Unparseable schedule start date: "${label}"`);
    }

    return { year, month };
  }

  /**
   * Commit a value to a text input and wait for the recalculation to complete.
   * When the committed value actually changes the calculation, wait for the EMI
   * text to stop matching its pre-input value (web-first retry, no sleep).
   * Re-setting an unchanged value requires no recalculation wait.
   */
  private async replaceInput(input: Locator, value: string): Promise<void> {
    const emi = this.monthlyEMI;
    const previousEmi = ((await emi.textContent()) ?? "").trim();

    const currentInputValue = (await input.inputValue()).trim();
    const valueChanged = currentInputValue !== value;

    await input.click();
    await input.press("ControlOrMeta+A");
    await input.pressSequentially(value);
    await input.press("Tab");

    if (previousEmi && valueChanged) {
      await expect(emi).not.toHaveText(previousEmi, {
        timeout: TIMEOUTS.calculation,
      });
    }
  }

  /**
   * Parse Indian currency format (₹44,986 / ₹ 46,533) to a number.
   */
  private parseIndianCurrency(text: string): number {
    const cleaned = text.replace(/[₹,\s]/g, "").trim();
    return parseFloat(cleaned || "0");
  }
}