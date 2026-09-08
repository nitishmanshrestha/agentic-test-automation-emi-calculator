/**
 * Test Data Module
 *
 * Defines representative test scenarios for comprehensive coverage.
 * Organized by test category and risk level.
 *
 * Each dataset rationale is documented to explain why it's included.
 */

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  principal: number; // Loan amount in rupees
  annualRate: number; // Interest rate as percentage
  years: number; // Loan tenure in years
  tags: string[]; // Test categorization tags
  rationale: string; // Why this scenario is important
}

/**
 * SMOKE TEST SCENARIOS
 * Quick validation that basic functionality works
 * Should execute in <2 seconds total
 */
export const SMOKE_TEST_DATA: TestScenario[] = [
  {
    id: "SMOKE-001",
    name: "Default Values",
    description: "Load calculator with default values",
    principal: 5000000, // ₹50 lakhs (default)
    annualRate: 9, // 9% (typical home loan rate)
    years: 20, // 20 years (typical tenure)
    tags: ["smoke", "regression"],
    rationale:
      "Validates core calculation works. Default values are most commonly used in production.",
  },
];

/**
 * FUNCTIONAL TEST SCENARIOS
 * Validate key calculator features work correctly
 */
export const FUNCTIONAL_TEST_DATA: TestScenario[] = [
  {
    id: "FUNC-001",
    name: "Typical Home Loan",
    description: "Standard home loan parameters",
    principal: 3000000, // ₹30 lakhs
    annualRate: 8.5, // 8.5%
    years: 15,
    tags: ["functional", "regression", "calculation"],
    rationale:
      "Represents typical middle-market home loan. Common real-world scenario.",
  },
  {
    id: "FUNC-002",
    name: "Low Loan Amount",
    description: "Small personal/auto loan",
    principal: 100000, // ₹1 lakh
    annualRate: 12, // 12%
    years: 3,
    tags: ["functional", "regression", "calculation"],
    rationale:
      "Validates calculation accuracy with small amounts. Tests rounding in small numbers.",
  },
  {
    id: "FUNC-003",
    name: "High Loan Amount",
    description: "Large commercial loan",
    principal: 20000000, // ₹2 crores
    annualRate: 7, // 7%
    years: 25,
    tags: ["functional", "regression", "calculation"],
    rationale:
      "Tests high-precision calculations with large amounts. Important for commercial lending.",
  },
];

/**
 * BOUNDARY TEST SCENARIOS
 * Test edge cases and limits
 */
export const BOUNDARY_TEST_DATA: TestScenario[] = [
  {
    id: "BOUND-001",
    name: "Minimum Loan Amount",
    description: "Smallest possible loan",
    principal: 10000, // ₹10k (near minimum)
    annualRate: 9,
    years: 1,
    tags: ["boundary", "regression"],
    rationale:
      "Validates handling of very small amounts. Tests rounding edge cases.",
  },
  {
    id: "BOUND-002",
    name: "Maximum Loan Amount",
    description: "Largest possible loan (field max)",
    principal: 20000000, // ₹2 crores (field maximum)
    annualRate: 9,
    years: 20,
    tags: ["boundary", "regression"],
    rationale:
      "Tests application input maximum. Ensures large numbers handled correctly.",
  },
  {
    id: "BOUND-003",
    name: "Minimum Interest Rate",
    description: "Lowest possible interest rate",
    principal: 5000000,
    annualRate: 5, // 5% (observed minimum)
    years: 20,
    tags: ["boundary", "regression"],
    rationale:
      "Tests calculation with very low interest. Nearly zero-interest scenario.",
  },
  {
    id: "BOUND-004",
    name: "Maximum Interest Rate",
    description: "Highest possible interest rate",
    principal: 5000000,
    annualRate: 20, // 20% (observed maximum)
    years: 20,
    tags: ["boundary", "regression"],
    rationale:
      "Tests calculation with high interest rates. Important for high-risk lending.",
  },
  {
    id: "BOUND-005",
    name: "Minimum Tenure",
    description: "Shortest loan period",
    principal: 1000000,
    annualRate: 9,
    years: 1, // 1 year (minimum)
    tags: ["boundary", "regression"],
    rationale:
      "Tests amortization calculation for shortest period. Edge case for monthly breakdown.",
  },
  {
    id: "BOUND-006",
    name: "Maximum Tenure",
    description: "Longest loan period",
    principal: 5000000,
    annualRate: 9,
    years: 30, // 30 years (maximum)
    tags: ["boundary", "regression"],
    rationale:
      "Tests long-term amortization. Important for evaluating interest accumulation.",
  },
];

/**
 * CALCULATION ACCURACY TEST SCENARIOS
 * Focused on validating EMI formula correctness
 */
export const CALCULATION_TEST_DATA: TestScenario[] = [
  {
    id: "CALC-001",
    name: "Standard Formula Validation",
    description: "Classic EMI calculation example",
    principal: 10000000, // ₹1 crore (nice round number for manual verification)
    annualRate: 10.5,
    years: 10,
    tags: ["calculation", "regression", "critical"],
    rationale:
      "Matches the example from EMI formula documentation (₹1 crore). Can be manually verified.",
  },
  {
    id: "CALC-002",
    name: "Decimal Interest Rate",
    description: "Non-round interest rate percentage",
    principal: 2500000,
    annualRate: 8.75, // Decimal rate
    years: 15,
    tags: ["calculation", "regression"],
    rationale:
      "Tests proper handling of decimal interest rates (not just whole percentages).",
  },
  {
    id: "CALC-003",
    name: "Fractional Monthly Breakdown",
    description: "Validates monthly amortization accuracy",
    principal: 1234567, // Awkward number to test rounding
    annualRate: 9.5,
    years: 18,
    tags: ["calculation", "regression"],
    rationale:
      "Tests precision with non-standard amounts. Validates monthly schedule consistency.",
  },
];

/**
 * DATA CONSISTENCY TEST SCENARIOS
 * Focused on chart/table consistency validation
 */
export const CONSISTENCY_TEST_DATA: TestScenario[] = [
  {
    id: "CONS-001",
    name: "Chart Table Alignment",
    description: "Verify chart and table show same data",
    principal: 5000000,
    annualRate: 9,
    years: 20,
    tags: ["consistency", "regression", "critical"],
    rationale:
      "Validates that visual chart and data table represent same amortization schedule.",
  },
];

/**
 * EXPORT/DOWNLOAD TEST SCENARIOS
 * Focused on file generation and integrity
 */
export const EXPORT_TEST_DATA: TestScenario[] = [
  {
    id: "EXP-001",
    name: "Excel Export Basic",
    description: "Download and validate Excel file",
    principal: 5000000,
    annualRate: 9,
    years: 20,
    tags: ["export", "regression", "critical"],
    rationale:
      "Validates Excel download works and file is uncorrupted. Critical user feature.",
  },
];

/**
 * INTERACTION TEST SCENARIOS
 * Focused on text-input interaction
 */
export const INTERACTION_TEST_DATA: TestScenario[] = [
  {
    id: "INT-001",
    name: "Input Incremental Change",
    description: "Change values incrementally via text inputs",
    principal: 3000000,
    annualRate: 8,
    years: 15,
    tags: ["interaction", "regression"],
    rationale:
      "Tests that input interactions properly update UI and trigger recalculation.",
  },
  {
    id: "INT-002",
    name: "Rapid Input Changes",
    description: "Multiple rapid adjustments",
    principal: 4000000,
    annualRate: 9,
    years: 18,
    tags: ["interaction", "regression"],
    rationale:
      "Tests application stability under rapid user input. Validates no calculation corruption.",
  },
];

/**
 * Get all test data organized by category
 */
export function getTestDataByTag(tag: string): TestScenario[] {
  const allData = [
    ...SMOKE_TEST_DATA,
    ...FUNCTIONAL_TEST_DATA,
    ...BOUNDARY_TEST_DATA,
    ...CALCULATION_TEST_DATA,
    ...CONSISTENCY_TEST_DATA,
    ...EXPORT_TEST_DATA,
    ...INTERACTION_TEST_DATA,
  ];

  return allData.filter((scenario) => scenario.tags.includes(tag));
}

/**
 * Get all unique test scenarios
 */
export function getAllTestData(): TestScenario[] {
  return [
    ...SMOKE_TEST_DATA,
    ...FUNCTIONAL_TEST_DATA,
    ...BOUNDARY_TEST_DATA,
    ...CALCULATION_TEST_DATA,
    ...CONSISTENCY_TEST_DATA,
    ...EXPORT_TEST_DATA,
    ...INTERACTION_TEST_DATA,
  ];
}
