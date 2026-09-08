/**
 * Excel Download Validation Utilities
 *
 * Handles:
 * - File type/integrity validation
 * - Workbook structure verification
 * - Data extraction and parsing
 * - Comparison with UI data
 */

import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";

export interface ExcelValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  metadata: {
    fileExists: boolean;
    fileSize: number;
    sheets: string[];
  };
  data?: {
    rows: number;
    columns: number;
    sampleRow?: Record<string, unknown>;
  };
}

/**
 * Comprehensive Excel file validation
 */
export async function validateExcelFile(
  filePath: string,
): Promise<ExcelValidationResult> {
  const result: ExcelValidationResult = {
    passed: true,
    errors: [],
    warnings: [],
    metadata: {
      fileExists: false,
      fileSize: 0,
      sheets: [],
    },
  };

  // Check file exists
  if (!fs.existsSync(filePath)) {
    result.errors.push(`Excel file not found at path: ${filePath}`);
    result.passed = false;
    return result;
  }

  result.metadata.fileExists = true;
  result.metadata.fileSize = fs.statSync(filePath).size;

  // Check file extension
  const extension = path.extname(filePath).toLowerCase();
  if (extension !== ".xlsx" && extension !== ".xls") {
    result.errors.push(
      `Invalid file extension: ${extension}. Expected .xlsx or .xls`,
    );
    result.passed = false;
    return result;
  }

  // Attempt to read workbook
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.readFile(filePath);
  } catch (error) {
    result.errors.push(`Failed to open workbook: ${error}`);
    result.passed = false;
    return result;
  }

  result.metadata.sheets = workbook.SheetNames;

  // Verify workbook has sheets
  if (workbook.SheetNames.length === 0) {
    result.errors.push("Workbook contains no sheets");
    result.passed = false;
    return result;
  }

  // Get first sheet (amortization schedule)
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  if (!worksheet) {
    result.errors.push(`Cannot read sheet: ${firstSheetName}`);
    result.passed = false;
    return result;
  }

  // Convert to JSON for analysis
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

  if (rows.length === 0) {
    result.errors.push("Amortization sheet contains no data rows");
    result.passed = false;
    return result;
  }

  // Verify expected columns exist
  const expectedColumns = [
    "Year",
    "Principal",
    "Interest",
    "Total Payment",
    "Balance",
  ];
  const firstRowKeys = Object.keys(rows[0]);

  const missingColumns = expectedColumns.filter(
    (col) =>
      !firstRowKeys.some((key) =>
        key.toLowerCase().includes(col.toLowerCase()),
      ),
  );

  if (missingColumns.length > 0) {
    result.warnings.push(
      `Missing expected columns: ${missingColumns.join(", ")}. Found: ${firstRowKeys.join(", ")}`,
    );
  }

  // Verify data structure
  result.data = {
    rows: rows.length,
    columns: firstRowKeys.length,
    sampleRow: rows[0],
  };

  // Validate at least one row has numerical data
  if (rows.length > 0) {
    const firstRow = rows[0];
    const hasNumericData = Object.values(firstRow).some(
      (val) =>
        typeof val === "number" || (typeof val === "string" && /\d/.test(val)),
    );

    if (!hasNumericData) {
      result.errors.push("No numeric data found in amortization sheet");
      result.passed = false;
    }
  }

  result.passed = result.errors.length === 0;
  return result;
}

/**
 * Extract amortization data from Excel.
 *
 * The file has a metadata block (Loan Details / Payment Summary) before the real
 * table, so the sheet is read in array mode and the amortization header row
 * ("Month #", "Month & Year", ...) is located before parsing rows below it.
 */
export async function extractExcelAmortizationData(
  filePath: string,
): Promise<ExcelAmortizationRow[]> {
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Array<string | number>>(worksheet, {
    header: 1,
  });

  // Locate the amortization header row (contains a "Month" column).
  const headerIndex = rows.findIndex((row) =>
    Array.isArray(row) && row.some((cell) => /month/i.test(String(cell ?? ""))),
  );
  if (headerIndex === -1) {
    return [];
  }

  const header = (rows[headerIndex] ?? []).map((cell) => String(cell ?? ""));

  const colIndex = (pattern: RegExp): number =>
    header.findIndex((cell) => pattern.test(cell));

  const iMonth = colIndex(/^month\s*#/i);
  const iMonthYear = colIndex(/month\s*&?\s*year/i);
  const iPrincipal = colIndex(/^principal/i);
  const iInterest = colIndex(/^interest/i);
  const iTotal = colIndex(/^total/i);
  const iBalance = colIndex(/outstanding\s*balance|^balance/i);

  const toNumber = (value: string | number | undefined): number => {
    if (typeof value === "number") return value;
    const cleaned = String(value ?? "").replace(/[₹,\s]/g, "").trim();
    return parseFloat(cleaned) || 0;
  };

  const result: ExcelAmortizationRow[] = [];

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row)) continue;

    const monthNumber = row[iMonth];
    if (monthNumber === undefined || String(monthNumber).trim() === "") {
      break;
    }

    const rowIndex = toNumber(monthNumber);
    const monthYearLabel = iMonthYear >= 0 ? String(row[iMonthYear] ?? "") : "";

    const rawRow: Record<string, unknown> = {};
    for (let c = 0; c < header.length; c++) {
      rawRow[header[c]] = row[c];
    }

    result.push({
      rowIndex,
      year: parseInt(monthYearLabel.split("-")[0], 10) || rowIndex,
      principal: toNumber(row[iPrincipal]),
      interest: toNumber(row[iInterest]),
      totalPayment: toNumber(row[iTotal]),
      balance: toNumber(row[iBalance]),
      rawRow,
    });
  }

  return result;
}

export interface ExcelAmortizationRow {
  rowIndex: number;
  year: number;
  principal: number;
  interest: number;
  totalPayment: number;
  balance: number;
  rawRow: Record<string, unknown>;
}

/**
 * Aggregate monthly Excel rows into calendar years using the loan start date,
 * matching the UI table's grouping (partial first calendar year).
 */
export function aggregateExcelToCalendarYears(
  excelRows: ExcelAmortizationRow[],
  startYear: number,
  startMonth: number,
): Array<{
  year: number;
  principal: number;
  interest: number;
  totalPayment: number;
  balance: number;
}> {
  const yearly: Map<
    number,
    {
      year: number;
      principal: number;
      interest: number;
      totalPayment: number;
      balance: number;
    }
  > = new Map();
  let year = startYear;
  let month = startMonth;

  for (const row of excelRows) {
    if (!yearly.has(year)) {
      yearly.set(year, {
        year,
        principal: 0,
        interest: 0,
        totalPayment: 0,
        balance: 0,
      });
    }

    const accrued = yearly.get(year)!;
    accrued.principal += row.principal;
    accrued.interest += row.interest;
    accrued.totalPayment += row.totalPayment;
    accrued.balance = row.balance;

    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return Array.from(yearly.values());
}

/**
 * Clean up temporary download file
 */
export async function cleanupDownloadFile(filePath: string): Promise<void> {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    // Silently ignore cleanup errors
    console.warn(`Warning: Could not delete temporary file ${filePath}`);
  }
}

/**
 * Compare Excel data with UI table data
 * Returns details of any mismatches
 */
export interface DataComparisonResult {
  matches: boolean;
  rowsCompared: number;
  mismatches: RowMismatch[];
}

export interface RowMismatch {
  rowNumber: number;
  field: string;
  uiValue: number;
  excelValue: number;
  difference: number;
}

export function compareExcelWithUIData(
  uiRows: TableRowLike[],
  excelRows: TableRowLike[],
  tolerance: number = 2,
): DataComparisonResult {
  const mismatches: RowMismatch[] = [];
  const rowsToCompare = Math.min(uiRows.length, excelRows.length);

  for (let i = 0; i < rowsToCompare; i++) {
    const uiRow = uiRows[i];
    const excelRow = excelRows[i];

    // Compare each field
    const fields = [
      "principal",
      "interest",
      "totalPayment",
      "balance",
    ] as const;

    for (const field of fields) {
      const uiValue = uiRow[field];
      const excelValue = excelRow[field];
      const difference = Math.abs(uiValue - excelValue);

      if (difference > tolerance) {
        mismatches.push({
          rowNumber: i + 1,
          field,
          uiValue,
          excelValue,
          difference,
        });
      }
    }
  }

  return {
    matches: mismatches.length === 0,
    rowsCompared: rowsToCompare,
    mismatches,
  };
}

interface TableRowLike {
  year: number;
  principal: number;
  interest: number;
  totalPayment: number;
  balance: number;
}
