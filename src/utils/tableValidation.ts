/**
 * Table Validation Utilities
 *
 * Extracts and validates amortization table data.
 * Handles currency parsing, normalization, and comparison.
 */

import {
  parseIndianCurrency,
  compareWithTolerance,
} from "@domain/emiCalculator";

export interface ParsedTableRow {
  year: number;
  principal: number;
  interest: number;
  totalPayment: number;
  balance: number;
}

/**
 * Parse raw table row data from UI
 * Handles currency formatting (₹44,986 -> 44986)
 */
export function parseTableRow(rawRow: {
  year: string | number;
  principal: string;
  interest: string;
  totalPayment: string;
  balance: string;
}): ParsedTableRow {
  return {
    year:
      typeof rawRow.year === "string" ? parseInt(rawRow.year, 10) : rawRow.year,
    principal: parseIndianCurrency(String(rawRow.principal)),
    interest: parseIndianCurrency(String(rawRow.interest)),
    totalPayment: parseIndianCurrency(String(rawRow.totalPayment)),
    balance: parseIndianCurrency(String(rawRow.balance)),
  };
}

/**
 * Validate table row against expected values
 * Uses tolerance for floating-point comparison
 * Returns validation result with diagnostics
 */
export function validateTableRow(
  actual: ParsedTableRow,
  expected: ParsedTableRow,
  tolerance: number = 2,
): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (actual.year !== expected.year) {
    issues.push({
      field: "year",
      expected: expected.year,
      actual: actual.year,
      passed: false,
    });
  }

  if (!compareWithTolerance(actual.principal, expected.principal, tolerance)) {
    issues.push({
      field: "principal",
      expected: expected.principal,
      actual: actual.principal,
      difference: Math.abs(actual.principal - expected.principal),
      passed: false,
    });
  }

  if (!compareWithTolerance(actual.interest, expected.interest, tolerance)) {
    issues.push({
      field: "interest",
      expected: expected.interest,
      actual: actual.interest,
      difference: Math.abs(actual.interest - expected.interest),
      passed: false,
    });
  }

  if (
    !compareWithTolerance(actual.totalPayment, expected.totalPayment, tolerance)
  ) {
    issues.push({
      field: "totalPayment",
      expected: expected.totalPayment,
      actual: actual.totalPayment,
      difference: Math.abs(actual.totalPayment - expected.totalPayment),
      passed: false,
    });
  }

  if (!compareWithTolerance(actual.balance, expected.balance, tolerance)) {
    issues.push({
      field: "balance",
      expected: expected.balance,
      actual: actual.balance,
      difference: Math.abs(actual.balance - expected.balance),
      passed: false,
    });
  }

  return {
    passed: issues.length === 0,
    issues,
  };
}

export interface ValidationIssue {
  field: string;
  expected: number;
  actual: number;
  difference?: number;
  passed: boolean;
}

export interface ValidationResult {
  passed: boolean;
  issues: ValidationIssue[];
}

/**
 * Format validation error message for diagnostic output
 */
export function formatValidationError(
  rowNumber: number,
  result: ValidationResult,
  loanParams?: { principal: number; rate: number; years: number },
): string {
  const issues = result.issues
    .map((issue) => {
      const base = `${issue.field}: expected ${issue.expected}, got ${issue.actual}`;
      return issue.difference
        ? `${base} (diff: ${issue.difference.toFixed(2)})`
        : base;
    })
    .join("; ");

  let message = `Year ${rowNumber} validation failed: ${issues}`;

  if (loanParams) {
    message += ` [Params: Principal=${loanParams.principal}, Rate=${loanParams.rate}%, Years=${loanParams.years}]`;
  }

  return message;
}
