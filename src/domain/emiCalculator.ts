/**
 * EMI Calculation Domain Module
 *
 * Independent oracle for EMI calculation using standard financial formula.
 * NOT derived from application code - used to validate application calculations.
 *
 * Formula: EMI = P × r × (1+r)^n / ((1+r)^n − 1)
 * Where:
 *   P = Principal (loan amount)
 *   r = Monthly interest rate (annual % / 12 / 100)
 *   n = Total months (years × 12)
 */

export interface LoanParameters {
  principal: number; // Loan amount in rupees
  annualRate: number; // Annual interest rate as percentage (e.g., 9 for 9%)
  years: number; // Loan tenure in years
}

export interface EMICalculation {
  monthlyEmi: number;
  totalPayment: number;
  totalInterest: number;
  monthlyBreakdown: MonthlyPayment[];
}

export interface MonthlyPayment {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface YearlyAmortization {
  year: number;
  principalPaid: number;
  interestPaid: number;
  totalPayment: number;
  endingBalance: number;
}

/**
 * Core EMI calculation using standard formula
 * Handles all edge cases and precision requirements
 */
export function calculateEMI(params: LoanParameters): EMICalculation {
  const { principal, annualRate, years } = params;

  // Edge case: Zero interest
  if (annualRate === 0) {
    return calculateZeroInterestEMI(principal, years);
  }

  const monthlyRate = annualRate / 12 / 100;
  const numberOfMonths = years * 12;

  // EMI Formula: P × r × (1+r)^n / ((1+r)^n − 1)
  const numerator =
    principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths);
  const denominator = Math.pow(1 + monthlyRate, numberOfMonths) - 1;
  const monthlyEmi = numerator / denominator;

  // Generate month-by-month breakdown
  const monthlyBreakdown = generateMonthlySchedule(
    principal,
    monthlyRate,
    monthlyEmi,
    numberOfMonths,
  );

  const totalPayment = monthlyEmi * numberOfMonths;
  const totalInterest = totalPayment - principal;

  return {
    monthlyEmi: roundToNearest(monthlyEmi, 2),
    totalPayment: roundToNearest(totalPayment, 2),
    totalInterest: roundToNearest(totalInterest, 2),
    monthlyBreakdown,
  };
}

/**
 * Generate month-by-month amortization schedule
 * Used for detailed tracking and year-wise aggregation validation
 */
function generateMonthlySchedule(
  principal: number,
  monthlyRate: number,
  emi: number,
  numberOfMonths: number,
): MonthlyPayment[] {
  const schedule: MonthlyPayment[] = [];
  let balance = principal;

  for (let month = 1; month <= numberOfMonths; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = emi - interestPayment;
    balance -= principalPayment;

    // Prevent floating-point errors from creating negative balance
    if (balance < 0.01) {
      balance = 0;
    }

    schedule.push({
      month,
      payment: roundToNearest(emi, 2),
      principal: roundToNearest(principalPayment, 2),
      interest: roundToNearest(interestPayment, 2),
      balance: roundToNearest(balance, 2),
    });
  }

  return schedule;
}

/**
 * Aggregate monthly schedule to yearly amortization data
 * Used to validate against table/chart year-wise values
 */
export function aggregateToYearlySchedule(
  monthlySchedule: MonthlyPayment[],
): YearlyAmortization[] {
  const yearlyData: Map<number, YearlyAmortization> = new Map();

  monthlySchedule.forEach((payment) => {
    const year = Math.ceil(payment.month / 12);

    if (!yearlyData.has(year)) {
      yearlyData.set(year, {
        year,
        principalPaid: 0,
        interestPaid: 0,
        totalPayment: 0,
        endingBalance: 0,
      });
    }

    const yearData = yearlyData.get(year)!;
    yearData.principalPaid += payment.principal;
    yearData.interestPaid += payment.interest;
    yearData.totalPayment += payment.payment;
    yearData.endingBalance = payment.balance;
  });

  return Array.from(yearlyData.values()).sort((a, b) => a.year - b.year);
}

/**
 * Aggregate monthly schedule to a CALENDAR-year schedule based on the loan start.
 *
 * The live application groups its amortization table by calendar year using the
 * schedule start (e.g. a loan starting Sep 2026 produces a partial 2026 row for
 * Sep–Dec, then 2027..2040 full years, then a partial final year). Aggregate the
 * domain breakdown the same way so UI rows can be validated against the oracle.
 */
export function aggregateToCalendarSchedule(
  monthlyBreakdown: MonthlyPayment[],
  startYear: number,
  startMonth: number,
): YearlyAmortization[] {
  const yearlyData: Map<number, YearlyAmortization> = new Map();
  let year = startYear;
  let month = startMonth;

  monthlyBreakdown.forEach((payment) => {
    if (!yearlyData.has(year)) {
      yearlyData.set(year, {
        year,
        principalPaid: 0,
        interestPaid: 0,
        totalPayment: 0,
        endingBalance: 0,
      });
    }

    const yearData = yearlyData.get(year)!;
    yearData.principalPaid += payment.principal;
    yearData.interestPaid += payment.interest;
    yearData.totalPayment += payment.payment;
    yearData.endingBalance = payment.balance;

    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  });

  return Array.from(yearlyData.values()).sort((a, b) => a.year - b.year);
}

/**
 * Special case: Zero interest loan
 * EMI = Principal / Number of Months
 */
function calculateZeroInterestEMI(
  principal: number,
  years: number,
): EMICalculation {
  const numberOfMonths = years * 12;
  const monthlyEmi = principal / numberOfMonths;

  const monthlyBreakdown: MonthlyPayment[] = [];
  let balance = principal;

  for (let month = 1; month <= numberOfMonths; month++) {
    balance -= monthlyEmi;
    monthlyBreakdown.push({
      month,
      payment: roundToNearest(monthlyEmi, 2),
      principal: roundToNearest(monthlyEmi, 2),
      interest: 0,
      balance: roundToNearest(Math.max(0, balance), 2),
    });
  }

  return {
    monthlyEmi: roundToNearest(monthlyEmi, 2),
    totalPayment: principal,
    totalInterest: 0,
    monthlyBreakdown,
  };
}

/**
 * Round to nearest specified decimal places
 * Handles floating-point precision issues common in financial calculations
 */
export function roundToNearest(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Compare two monetary values with tolerance
 * Returns true if values are within tolerance (typical: ±2 rupees)
 * This accounts for rounding differences in UI and calculation
 */
export function compareWithTolerance(
  actual: number,
  expected: number,
  tolerance: number = 2,
): boolean {
  return Math.abs(actual - expected) <= tolerance;
}

/**
 * Format value as Indian Rupees (used for assertions/comparisons)
 * Converts "₹44,986" format to numeric value
 */
export function parseIndianCurrency(formattedValue: string): number {
  return parseFloat(formattedValue.replace(/[₹,]/g, ""));
}

/**
 * Format numeric value as Indian Rupees
 * Used when validating UI display values
 */
export function formatAsIndianCurrency(value: number): string {
  return "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}
