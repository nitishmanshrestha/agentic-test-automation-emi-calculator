/**
 * UI Selector Constants for EMI Calculator
 * RULE: Never use selector literals in specs or helpers
 * All selectors defined here for centralized management
 */

export const SELECTORS = {
  // Live calculator controls are text inputs, not range sliders.
  loanAmountInput: "#loanamount",
  interestRateInput: "#loaninterest",
  loanTenureInput: "#loanterm",

  // Result blocks confirmed on the live application.
  monthlyEMI: "#emiamount span",
  totalInterestPayable: "#emitotalinterest span",
  totalPayment: "#emitotalamount span",

  // Tenure unit pills (hidden radios wrapped by labels that intercept clicks).
  tenureUnitYearsPill: "label:text-is('Yr')",
  tenureUnitMonthsPill: "label:text-is('Mo')",
  tenureUnitYearsRadio: "#loanyears",
  tenureUnitMonthsRadio: "#loanmonths",

  // EMI mode pills (car/personal loan, out of core scope).
  emiAdvancePill: "label:text-is('EMI in Advance')",
  emiArrearsPill: "label:text-is('EMI in Arrears')",

  // Schedule controls.
  scheduleYearFormatSelect: "#yearformat",
  scheduleStartDateInput: "#loanstartdate",
  scheduleContainer: "#emipaymentdetails",

  // Select the payment table by its real header instead of matching every table.
  amortizationTable: 'table:has(th:has-text("Year"))',
  tableBody: "tbody, .table-body",
  tableRow: 'tr, [role="row"]',
  tableCell: 'td, [role="gridcell"]',

  // Highcharts pie chart container confirmed on the live application.
  chart: "#emipiechart",
  chartContainer: "#emipiechart",
  // Pie chart data labels: filtered in the page object for '%' texts — FIRST = Principal
  // slice %, SECOND = Total Interest slice % (verified live: "46.3%" then "53.7%").
  // NOTE: percentages render inside <tspan> children of <text> nodes.
  pieChartPercentages: "svg text",
  pieLegendPrincipalName: "text=Principal Loan Amount",
  pieLegendInterestName: "text=Total Interest",

  // Download controls are styled anchors with button semantics.
  downloadButton: "a.ecaldownloadexcel",
  pdfDownloadButton: "a.ecaldownloadpdf",

  // Page Elements
  pageHeading: "h1",
  pageContainer: '.calculator-container, main, [role="main"]',
  loadingIndicator: '[data-testid="loading"], .spinner, .loader',
  errorMessage: '[role="alert"], .error, .error-message',
} as const;

/**
 * Accessible-name locators (getByRole) for calculator inputs — preferred over CSS.
 * Accessible names verified against the live application (scaffold §2.1).
 */
export const INPUT_ROLES = {
  loanAmountInput: { role: "textbox", name: "Home Loan Amount" },
  interestRateInput: { role: "textbox", name: "Interest Rate" },
  loanTenureInput: { role: "textbox", name: "Loan Tenure" },
} as const;

/**
 * Other accessible-name locators (getByRole).
 * The download control is an <a role="button"> — a regex name beats whitespace/icon
 * quirks in its accessible name (scaffold §6.2).
 */
export const ROLES = {
  downloadExcel: { role: "button", name: /download excel/i },
} as const;

/**
 * Accessible-label locators (getByLabel) for controls without a stable DOM id.
 * Verified against the live application (scaffold §2.3 / §6.8).
 */
export const LABELS = {
  scheduleStartDate: /schedule showing emi payments starting from/i,
} as const;

/**
 * Locator builder for dynamic selectors
 * Use getByRole, getByLabel, getByText, getByTestId in order of preference
 */
export const SEMANTIC_ROLES = {
  // Semantic locators - preferred over CSS selectors
  slider: "slider",
  button: "button",
  heading: "heading",
  table: "table",
  row: "row",
  cell: "cell",
} as const;

/**
 * Test IDs for semantic locators
 * Use when role-based locators are insufficient
 */
export const TEST_IDS = {
  // Main Controls
  loanAmountSlider: "loan-amount-slider",
  interestRateSlider: "interest-rate-slider",
  tenureSlider: "tenure-slider",

  // Display Values
  monthlyEmi: "monthly-emi",
  totalInterest: "total-interest",
  totalPayment: "total-payment",

  // Table
  amortizationTable: "amortization-table",
  tableRow: "table-row",

  // Chart
  chartContainer: "chart-container",

  // Actions
  downloadButton: "download-button",
  resetButton: "reset-button",
} as const;
