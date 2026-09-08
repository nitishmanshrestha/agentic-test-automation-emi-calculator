> **File Path:** `docs/testing/TEST_CASE_MATRIX.md`  
> **Related Documents:** [README](../../README.md) | [Index](../reference/INDEX.md) | [Test Plan](TEST_PLAN.md) | [Test Summary Report](TEST_SUMMARY_REPORT.md)

# EMI Calculator - Test Case Matrix

**Document Version:** 1.2  
**Last Updated:** September 2026  
**Total Test Cases:** 23  
**Automation Status:** 100% Automated with Playwright (Chromium)  
**Last Live Run:** 2026-09-07 — **23/23 passed**

---

## Executive Summary

This document provides a comprehensive matrix of all test cases for the EMI Calculator application. Test cases are organized by category, with full traceability to requirements, automation status, and business risk assessment.

All expected values in this document are verified against the live application (`https://emicalculator.net/`). Inputs are **live text inputs** (not HTML5 range sliders), and recalculation is triggered by pressing **Tab** after each entry.

**Test Distribution:**

| Category       | Count | Coverage | Priority |
| -------------- | ----- | -------- | -------- |
| Smoke          | 3     | 13.0%    | P0       |
| Functional     | 5     | 21.7%    | P1       |
| Calculation    | 3     | 13.0%    | P0       |
| Consistency    | 4     | 17.4%    | P0       |
| Boundary       | 6     | 26.1%    | P2       |
| Export         | 2     | 8.7%     | P1       |
| **TOTAL**      | **23**| **100%** | —        |

---

## Test Case Detail Matrix

### 1. SMOKE TEST CASES

Quick sanity checks ensuring basic functionality works.

---

| **TC-SMOKE-001**  | **Default Page Load**                                                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirement**   | Application loads and calculator is ready                                                                                                                      |
| **Priority**      | P0 (Critical)                                                                                                                                                  |
| **Test Type**     | Smoke                                                                                                                                                          |
| **Tags**          | `@smoke @regression`                                                                                                                                           |
| **Preconditions** | Browser opened; network connectivity verified                                                                                                                  |
| **Test Data**     | Application URL: https://emicalculator.net/                                                                                                                    |
| **Test Steps**    | 1. Navigate to EMI Calculator URL<br/>2. Wait for page load<br/>3. Verify calculator UI is visible<br/>4. Verify the three text-input fields are present       |
| **Expected Result** | Page loads successfully; calculator interface is visible; three text inputs (Loan Amount, Interest Rate, Loan Tenure) are present; no hard JS errors in console |
| **Actual Result** | **Passed** (2026-09-07)                                                                                                                                         |
| **Pass Criteria** | Page loads within 5 seconds; all UI elements visible                                                                                                            |
| **Flakiness Risk**| Low (simple load test)                                                                                                                                          |
| **Automation Status** | ✅ Automated (`emi.spec.ts:51`)                                                                                                                            |
| **Spec Ref**      | `should load calculator and display default EMI`                                                                                                                |

---

| **TC-SMOKE-002**  | **Default EMI Calculation**                                                                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirement**   | Application calculates EMI for default values                                                                                                                                      |
| **Priority**      | P0 (Critical)                                                                                                                                                                      |
| **Test Type**     | Smoke                                                                                                                                                                              |
| **Tags**          | `@smoke @regression @calculation`                                                                                                                                                  |
| **Preconditions** | Application loaded; calculator at default state                                                                                                                                    |
| **Test Data**     | Principal: ₹50,00,000; Rate: 9%; Tenure: 20 years<br/>**Expected EMI:** ~₹44,986                                                                                                  |
| **Test Steps**    | 1. Verify current values match defaults<br/>2. Extract displayed EMI value<br/>3. Calculate expected EMI independently using the standard formula<br/>4. Compare displayed vs expected (±₹2 tolerance) |
| **Expected Result** | EMI calculation is correct; displayed value matches formula; no calculation errors                                                                                                |
| **Actual Result** | **Passed** (2026-09-07)                                                                                                                                                            |
| **Pass Criteria** | Displayed EMI within ±₹2 of calculated value                                                                                                                                       |
| **Flakiness Risk**| Low (deterministic calculation)                                                                                                                                                     |
| **Automation Status** | ✅ Automated (`emi.spec.ts:70`)                                                                                                                            |
| **Spec Ref**      | `should calculate correct EMI for default values`                                                                                                                                  |

---

| **TC-SMOKE-003**  | **Amortization Table Display**                                                                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirement**   | Year-wise amortization table is displayed                                                                                                                                         |
| **Priority**      | P0 (Critical)                                                                                                                                                                     |
| **Test Type**     | Smoke                                                                                                                                                                             |
| **Tags**          | `@smoke @regression`                                                                                                                                                              |
| **Preconditions** | Application loaded; default values set                                                                                                                                            |
| **Test Data**     | Expected rows: ≥ 20 (calendar-year span may be years+1 depending on schedule start month)<br/>Expected columns: Year, Principal (A), Interest (B), Total Payment (A+B), Balance, Loan Paid To Date (%) |
| **Test Steps**    | 1. Scroll to amortization table section<br/>2. Verify table is visible<br/>3. Count data rows (skip monthly-detail sub-rows)<br/>4. Verify first row year equals current calendar year<br/>5. Verify final row balance ≈ ₹0 |
| **Expected Result** | Table displays ≥ loan-term rows; all required columns present; data populated in each row; final balance ≈ ₹0                                                                    |
| **Actual Result** | **Passed** (2026-09-07)                                                                                                                                                            |
| **Pass Criteria** | Table has correct number of rows with all columns populated                                                                                                                        |
| **Flakiness Risk**| Low                                                                                                                                                                                |
| **Automation Status** | ✅ Automated (`emi.spec.ts:100`)                                                                                                                           |
| **Notes**         | Table groups rows by **calendar year** using the schedule start date (e.g. a loan starting Sep 2026 produces a partial 2026 row for Sep–Dec). The last calendar year row shows balance ≈ ₹0. |

---

### 2. FUNCTIONAL TEST CASES

Validate individual features work correctly. All inputs are live text fields; recalculation fires on **Tab** commit.

---

| **TC-FUNC-001**  | **Loan Amount — Increase Value**                                                                                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirement**   | User can change loan amount via text input                                                                                                                                        |
| **Priority**      | P1 (High)                                                                                                                                                                         |
| **Test Type**     | Functional                                                                                                                                                                        |
| **Tags**          | `@functional @regression @interaction`                                                                                                                                            |
| **Preconditions** | Application loaded                                                                                                                                                                |
| **Test Data**     | Initial Principal: ₹30,00,000; Rate: 9%; Tenure: 20 years<br/>New Principal: ₹50,00,000                                                                                         |
| **Test Steps**    | 1. Set initial loan amount to ₹30,00,000<br/>2. Record initial EMI (~₹26,992)<br/>3. Change loan amount to ₹50,00,000<br/>4. Press **Tab** to trigger recalculation<br/>5. Record new EMI (~₹44,986)<br/>6. Verify EMI increased and matches formula |
| **Expected Result** | Loan amount updates; EMI increases; new EMI matches formula calculation (±₹2)                                                                                                     |
| **Actual Result** | **Passed** (2026-09-07)                                                                                                                                                           |
| **Pass Criteria** | EMI increases by expected amount (formula calculated)                                                                                                                              |
| **Flakiness Risk**| Low (direct value setting)                                                                                                                                                         |
| **Automation Status** | ✅ Automated (`emi.spec.ts:125`)                                                                                                                          |
| **Spec Ref**      | `should update EMI when loan amount changes`                                                                                                                                      |

---

| **TC-FUNC-002**  | **Interest Rate — Increase Rate**                                                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirement**   | User can change interest rate via text input                                                                                                                                      |
| **Priority**      | P1 (High)                                                                                                                                                                         |
| **Test Type**     | Functional                                                                                                                                                                        |
| **Tags**          | `@functional @regression @interaction`                                                                                                                                            |
| **Preconditions** | Application loaded                                                                                                                                                                |
| **Test Data**     | Principal: ₹40,00,000; Initial Rate: 8%; Tenure: 15 years<br/>New Rate: 12%                                                                                                     |
| **Test Steps**    | 1. Set principal and tenure<br/>2. Set rate to 8%<br/>3. Record EMI<br/>4. Change rate to 12% and press **Tab**<br/>5. Record new EMI<br/>6. Verify EMI increased and matches formula |
| **Expected Result** | Rate updates; EMI increases; calculation correct                                                                                                                                  |
| **Actual Result** | **Passed** (2026-09-07)                                                                                                                                                           |
| **Pass Criteria** | EMI increases with rate increase                                                                                                                                                  |
| **Flakiness Risk**| Low                                                                                                                                                                               |
| **Automation Status** | ✅ Automated (`emi.spec.ts:162`)                                                                                                                          |
| **Spec Ref**      | `should update EMI when interest rate changes`                                                                                                                                    |

---

| **TC-FUNC-003**  | **Loan Tenure — Increase Tenure**                                                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirement**   | User can change loan tenure via text input                                                                                                                                        |
| **Priority**      | P1 (High)                                                                                                                                                                         |
| **Test Type**     | Functional                                                                                                                                                                        |
| **Tags**          | `@functional @regression @interaction`                                                                                                                                            |
| **Preconditions** | Application loaded                                                                                                                                                                |
| **Test Data**     | Principal: ₹30,00,000; Rate: 9%; Initial Tenure: 10 years<br/>New Tenure: 25 years                                                                                              |
| **Test Steps**    | 1. Set principal and rate<br/>2. Set tenure to 10 years<br/>3. Record EMI<br/>4. Change tenure to 25 years and press **Tab**<br/>5. Record new EMI<br/>6. Verify EMI decreased (longer payback = lower monthly) |
| **Expected Result** | Tenure updates; EMI decreases; calculation correct                                                                                                                                |
| **Actual Result** | **Passed** (2026-09-07)                                                                                                                                                           |
| **Pass Criteria** | EMI decreases with tenure increase                                                                                                                                                |
| **Flakiness Risk**| Low                                                                                                                                                                               |
| **Automation Status** | ✅ Automated (`emi.spec.ts:198`)                                                                                                                          |
| **Spec Ref**      | `should update EMI when tenure changes`                                                                                                                                           |

---

| **TC-FUNC-004**  | **Tenure Unit Pill — Yr ↔ Mo Toggle**                                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirement**   | User can toggle tenure unit between years and months                                                                                                                              |
| **Priority**      | P1 (High)                                                                                                                                                                         |
| **Test Type**     | Functional                                                                                                                                                                        |
| **Tags**          | `@functional @regression @interaction`                                                                                                                                            |
| **Preconditions** | Application loaded; tenure set in years                                                                                                                                           |
| **Test Data**     | Principal: ₹30,00,000; Rate: 9%; Tenure: 15 years (180 months when toggled to Mo)                                                                                               |
| **Test Steps**    | 1. Set loan amount, rate, and tenure to test data<br/>2. Record EMI in **Yr** mode<br/>3. Click **Mo** pill label (hidden radio is wrapped by label that intercepts pointer events — interact via label, not radio)<br/>4. Verify tenure input now shows `180` (months)<br/>5. Verify EMI unchanged<br/>6. Click **Yr** pill label to restore<br/>7. Verify tenure input shows `15` and EMI unchanged |
| **Expected Result** | Tenure unit toggles correctly; tenure value converts between years and months; EMI remains unchanged across toggle                                                           |
| **Actual Result** | **Passed** (2026-09-07)                                                                                                                                                           |
| **Pass Criteria** | Tenure and EMI values correct after each toggle                                                                                                                                   |
| **Flakiness Risk**| Low (direct pill click)                                                                                                                                                            |
| **Automation Status** | ✅ Automated (`emi.spec.ts:267`)                                                                                                                          |
| **Notes**         | The Yr/Mo radios are hidden `<input type="radio">` elements wrapped by `<label class="btn btn-secondary">` labels that intercept pointer events — direct radio `.click()` times out; use label text-based locators instead. |

---

| **TC-FUNC-005**  | **All Three Inputs Changed Together**                                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirement**   | Updating Loan Amount, Interest Rate AND Loan Tenure together (assessment req 3a) revalidates EMI against the formula                                                             |
| **Priority**      | P1 (High)                                                                                                                                                                         |
| **Test Type**     | Functional                                                                                                                                                                        |
| **Tags**          | `@functional @regression @interaction`                                                                                                                                            |
| **Preconditions** | Application loaded                                                                                                                                                                |
| **Test Data**     | Principal: ₹35,00,000; Rate: 8.25%; Tenure: 12 years                                                                                                                              |
| **Test Steps**    | 1. Set loan amount to ₹35,00,000<br/>2. Set interest rate to 8.25%<br/>3. Set loan tenure to 12 years<br/>4. Press Tab on the last field to commit recalculation<br/>5. Extract displayed EMI<br/>6. Validate EMI against the independent formula (±₹2)<br/>7. Verify all three inputs hold the entered values |
| **Expected Result** | EMI recalculates correctly after changing all three inputs; displayed value matches formula; inputs reflect entered values                                                        |
| **Actual Result** | **Passed** (2026-09-07)                                                                                                                                                           |
| **Pass Criteria** | EMI within ±₹2 of formula; all inputs correct                                                                                                                                     |
| **Flakiness Risk**| Low                                                                                                                                                                               |
| **Automation Status** | ✅ Automated (`emi.spec.ts:234`)                                                                                                                          |
| **Spec Ref**      | `should update EMI when all three inputs change together`                                                                                                                         |

---

### 3. CALCULATION ACCURACY TEST CASES

Validate EMI formula correctness against an independent oracle.

---

| **TC-CALC-001**  | **Typical Loan — ₹30L @ 8.5% for 15 Years**                                                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirement**   | EMI calculation follows standard formula                                                                                                                                         |
| **Priority**      | P0 (Critical)                                                                                                                                                                     |
| **Test Type**     | Calculation                                                                                                                                                                       |
| **Tags**          | `@calculation @regression`                                                                                                                                                        |
| **Preconditions** | Application loaded                                                                                                                                                                |
| **Test Data**     | Principal: ₹30,00,000; Rate: 8.5%; Tenure: 15 years<br/>**Expected EMI:** ₹29,542<br/>**Expected Total Interest:** ₹23,17,594<br/>**Expected Total Payment:** ₹53,17,594        |
| **Test Steps**    | 1. Set all three inputs and press Tab<br/>2. Extract displayed EMI, Total Interest, Total Payment<br/>3. Calculate expected values using standard EMI formula<br/>4. Compare all three values with tolerance (EMI: ±₹2; aggregates: ±₹10) |
| **Expected Result** | EMI, Total Interest, and Total Payment each match the independent formula within tolerance                                                                                       |
| **Actual Result** | **Passed** (2026-09-07)                                                                                                                                                           |
| **Pass Criteria** | All three values within tolerance                                                                                                                                                 |
| **Flakiness Risk**| Very Low (deterministic calculation)                                                                                                                                              |
| **Automation Status** | ✅ Automated (`emi.spec.ts:268`)                                                                                                                          |
| **Spec Ref**      | `should calculate correct EMI: Typical Home Loan`                                                                                                                                 |

---

| **TC-CALC-002**  | **High Loan — ₹2Cr @ 7% for 25 Years**                                                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirement**   | High-value loan calculation accuracy                                                                                                                                             |
| **Priority**      | P1 (High)                                                                                                                                                                         |
| **Test Type**     | Calculation                                                                                                                                                                       |
| **Tags**          | `@calculation @regression`                                                                                                                                                        |
| **Preconditions** | Application loaded                                                                                                                                                                |
| **Test Data**     | Principal: ₹2,00,00,000; Rate: 7%; Tenure: 25 years<br/>**Expected EMI:** ₹1,41,356<br/>**Expected Total Interest:** ₹2,24,06,752<br/>**Expected Total Payment:** ₹4,24,06,752   |
| **Test Steps**    | 1. Set all three inputs and press Tab<br/>2. Extract displayed values<br/>3. Independently calculate expected values<br/>4. Validate all three values                             |
| **Expected Result** | EMI and aggregates match formula; no precision loss; large numbers handled correctly                                                                                             |
| **Actual Result** | **Passed** (2026-09-07)                                                                                                                                                           |
| **Pass Criteria** | All values within tolerance                                                                                                                                                       |
| **Flakiness Risk**| Low                                                                                                                                                                               |
| **Automation Status** | ✅ Automated (`emi.spec.ts:268`)                                                                                                                          |
| **Spec Ref**      | `should calculate correct EMI: High Loan Amount`                                                                                                                                  |

---

| **TC-CALC-003**  | **Small Loan — ₹1L @ 12% for 3 Years**                                                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirement**   | Small loan calculation accuracy                                                                                                                                                   |
| **Priority**      | P1 (High)                                                                                                                                                                         |
| **Test Type**     | Calculation                                                                                                                                                                       |
| **Tags**          | `@calculation @regression`                                                                                                                                                        |
| **Preconditions** | Application loaded                                                                                                                                                                |
| **Test Data**     | Principal: ₹1,00,000; Rate: 12%; Tenure: 3 years<br/>**Expected EMI:** ₹3,321<br/>**Expected Total Interest:** ₹19,572<br/>**Expected Total Payment:** ₹1,19,572                 |
| **Test Steps**    | 1. Set all inputs and press Tab<br/>2. Extract displayed values<br/>3. Calculate expected using formula<br/>4. Validate all values                                                |
| **Expected Result** | EMI calculation accurate; rounding handled correctly in small amounts; no underflow errors                                                                                        |
| **Actual Result** | **Passed** (2026-09-07)                                                                                                                                                           |
| **Pass Criteria** | Values match within tolerance                                                                                                                                                     |
| **Flakiness Risk**| Low                                                                                                                                                                               |
| **Automation Status** | ✅ Automated (`emi.spec.ts:268`)                                                                                                                          |
| **Spec Ref**      | `should calculate correct EMI: Low Loan Amount`                                                                                                                                   |

---

### 4. DATA CONSISTENCY TEST CASES

Validate chart and table alignment against domain oracle and internal relationships.

---

| **TC-CONS-001**  | **EMI ↔ Total Payment ↔ Total Interest Relationship**                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirement**   | Displayed totals are mutually consistent: Total Payment = Principal + Total Interest; all totals match the independent domain oracle                                            |
| **Priority**      | P0 (Critical)                                                                                                                                                                     |
| **Test Type**     | Consistency                                                                                                                                                                       |
| **Tags**          | `@consistency @regression @critical`                                                                                                                                              |
| **Preconditions** | Application loaded; values set                                                                                                                                                    |
| **Test Data**     | Scenario: ₹30,00,000 @ 8.5% for 15 years                                                                                                                                         |
| **Test Steps**    | 1. Set inputs and press Tab<br/>2. Extract EMI, Total Interest, Total Payment<br/>3. Calculate expected values independently via the domain formula<br/>4. Compare displayed totals to formula (tolerance: ±₹10)<br/>5. Verify UI-internal identity: Total Payment = Principal + Total Interest (±₹10)<br/>6. Verify EMI × (Tenure × 12) ≈ Total Payment (tolerance: ±numMonths + 10 to account for whole-rupee EMI rounding) |
| **Expected Result** | All totals match domain oracle; internal identity holds; EMI × Months is close to Total Payment considering display rounding                                                      |
| **Actual Result** | **Passed** (2026-09-07)                                                                                                                                                           |
| **Pass Criteria** | All comparisons pass within stated tolerances                                                                                                                                      |
| **Flakiness Risk**| Very Low                                                                                                                                                                          |
| **Automation Status** | ✅ Automated (`emi.spec.ts:359`)                                                                                                                          |
| **Notes**         | The app displays EMI as a whole rupee. EMI × Months can drift from the displayed Total Payment by up to one rupee per month — the test accounts for this.                         |

---

| **TC-CONS-002**  | **Year-wise Table ↔ Independent Calendar-Year Calculation**                                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirement**   | Year-wise table matches an independently calculated amortization schedule                                                                                                         |
| **Priority**      | P0 (Critical)                                                                                                                                                                     |
| **Test Type**     | Consistency                                                                                                                                                                       |
| **Tags**          | `@consistency @regression @critical`                                                                                                                                              |
| **Preconditions** | Application loaded; values set                                                                                                                                                    |
| **Test Data**     | Scenario: ₹30,00,000 @ 8.5% for 15 years; schedule start read live from `#loanstartdate` (e.g. Sep 2026)                                                                         |
| **Test Steps**    | 1. Extract table data from UI (yearly rows only — monthly-detail rows are collapsed into one cell and skipped)<br/>2. Generate expected amortization schedule using domain module, grouped by calendar year using the live schedule start date<br/>3. Compare row-by-row (tolerance: ±₹10 per field to account for whole-rupee month rounding)<br/>4. Validate final balance ≈ ₹0 |
| **Expected Result** | Each calendar-year row matches expected calculation; final balance ≈ ₹0; all columns consistent                                                                                 |
| **Actual Result** | **Passed** (2026-09-07)                                                                                                                                                           |
| **Pass Criteria** | All rows match within ±₹10 tolerance                                                                                                                                              |
| **Flakiness Risk**| Low                                                                                                                                                                               |
| **Automation Status** | ✅ Automated (`emi.spec.ts:437`)                                                                                                                          |
| **Notes**         | The app groups the table by **calendar year** (not 12-month loan cycles), so a loan starting Sep 2026 produces a partial first row (Sep–Dec only). The domain oracle aggregates the same way using the live `#loanstartdate` value. |

---

| **TC-CONS-003**  | **Year-wise Table — Correct Structure**                                                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirement**   | Amortization table has at least one row per loan year, with all required fields populated                                                                                         |
| **Priority**      | P1 (High)                                                                                                                                                                         |
| **Test Type**     | Consistency                                                                                                                                                                       |
| **Tags**          | `@consistency @regression`                                                                                                                                                        |
| **Preconditions** | Application loaded; values set                                                                                                                                                    |
| **Test Data**     | Scenario: ₹30,00,000 @ 8.5% for 15 years                                                                                                                                         |
| **Test Steps**    | 1. Set inputs and press Tab<br/>2. Extract table data (yearly rows only)<br/>3. Verify row count ≥ tenure years<br/>4. Verify each row has a valid year, and principal/interest/totalPayment/balance are non-empty<br/>5. Verify last row balance < 1% of principal |
| **Expected Result** | Table has ≥ tenure rows; each row has year and all monetary fields populated; final balance ≈ ₹0                                                                                 |
| **Actual Result** | **Passed** (2026-09-07)                                                                                                                                                           |
| **Pass Criteria** | Correct structure and row count                                                                                                                                                    |
| **Flakiness Risk**| Low                                                                                                                                                                               |
| **Automation Status** | ✅ Automated (`emi.spec.ts:439`)                                                                                                                          |
| **Notes**         | Calendar-year grouping: a loan starting mid-year (e.g. Sep 2026) spans `tenure + 1` calendar years (e.g. 2026..2040 for 15y), so expect ≥ tenure rows.                              |

---

| **TC-CONS-004**  | **Chart Slices Match Year-wise Table Sums**                                                                                                                                       |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirement**   | Validate Chart and Table values match (assessment req 3c) — the pie chart's Principal/Interest split must equal the year-wise table aggregates                                     |
| **Priority**      | P0 (Critical)                                                                                                                                                                     |
| **Test Type**     | Consistency                                                                                                                                                                       |
| **Tags**          | `@consistency @regression @critical`                                                                                                                                              |
| **Preconditions** | Application loaded; values set; Highcharts pie chart rendered                                                                                                                    |
| **Test Data**     | Scenario: ₹30,00,000 @ 8.5% for 15 years. For ₹30L @ 8.5%/15y the chart shows Principal ≈ 56.4% / Interest ≈ 43.6%.                                                              |
| **Test Steps**    | 1. Set inputs and press Tab<br/>2. Extract year-wise table data; sum Principal across all calendar-year rows<br/>3. Sum Interest across all calendar-year rows<br/>4. Compute expected slice %: Principal% = ΣPrincipal / (ΣPrincipal + ΣInterest) × 100; Interest% likewise<br/>5. Extract the two slice % from the Highcharts SVG (FIRST `<text>`→Principal, SECOND→Interest)<br/>6. Compare each slice % to its expected value (tolerance ±0.3 for one-decimal label rounding)<br/>7. Verify slices sum to ≈100% |
| **Expected Result** | Chart Principal% and Interest% each match the year-wise table-derived percentages within tolerance; slices sum to 100%                                                            |
| **Actual Result** | **Passed** (2026-09-07)                                                                                                                                                           |
| **Pass Criteria** | Both slice percentages within ±0.3 of table-derived values; sum within ±0.3 of 100                                                                                               |
| **Flakiness Risk**| Low                                                                                                                                                                               |
| **Automation Status** | ✅ Automated (`emi.spec.ts:528`)                                                                                                                          |
| **Notes**         | Highcharts renders slice labels inside `<tspan>` children of `<text>` nodes; percentages are `46.3%`-style one-decimal values. `#emipiechart` text nodes confirmed live.          |

---

### 5. BOUNDARY TEST CASES

Validate edge cases and limits at the application's input boundaries.

---

| **TC-BOUND-001**  | **Minimum Loan Amount (₹10,000)**                                                                                                                                                |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirement**   | Application handles minimum loan amount                                                                                                                                           |
| **Priority**      | P2 (Medium)                                                                                                                                                                       |
| **Test Type**     | Boundary                                                                                                                                                                          |
| **Tags**          | `@boundary @regression`                                                                                                                                                           |
| **Preconditions** | Application loaded                                                                                                                                                                |
| **Test Data**     | Principal: ₹10,000; Rate: 9%; Tenure: 1 year<br/>**Expected EMI:** ₹875; **Total Interest:** ₹494; **Total Payment:** ₹10,494                                                    |
| **Test Steps**    | 1. Set loan amount to minimum value<br/>2. Set other inputs<br/>3. Press Tab and verify EMI calculates correctly<br/>4. Verify table populated<br/>5. Verify no errors in console |
| **Expected Result** | Calculation succeeds; EMI = ₹875 (±₹2); table populated; no errors in console                                                                                                    |
| **Actual Result** | **Passed** (2026-09-07)                                                                                                                                                           |
| **Pass Criteria** | Application handles minimum without error; EMI correct                                                                                                                            |
| **Flakiness Risk**| Low                                                                                                                                                                               |
| **Automation Status** | ✅ Automated (`emi.spec.ts:323`)                                                                                                                          |
| **Spec Ref**      | `should handle boundary case: Minimum Loan Amount`                                                                                                                                |

---

| **TC-BOUND-002**  | **Maximum Loan Amount (₹2 Crores)**                                                                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirement**   | Application handles maximum loan amount                                                                                                                                           |
| **Priority**      | P2 (Medium)                                                                                                                                                                       |
| **Test Type**     | Boundary                                                                                                                                                                          |
| **Tags**          | `@boundary @regression`                                                                                                                                                           |
| **Preconditions** | Application loaded                                                                                                                                                                |
| **Test Data**     | Principal: ₹2,00,00,000; Rate: 9%; Tenure: 20 years<br/>**Expected EMI:** ₹1,79,945; **Total Interest:** ₹2,31,86,846; **Total Payment:** ₹4,31,86,846                          |
| **Test Steps**    | 1. Set loan amount to maximum value<br/>2. Set other inputs<br/>3. Press Tab and verify calculation<br/>4. Verify no overflow errors                                              |
| **Expected Result** | Calculation handles large amount; no numeric overflow; values displayed correctly; table populated                                                                                |
| **Actual Result** | **Passed** (2026-09-07)                                                                                                                                                           |
| **Pass Criteria** | Maximum amount handled without error                                                                                                                                              |
| **Flakiness Risk**| Low                                                                                                                                                                               |
| **Automation Status** | ✅ Automated (`emi.spec.ts:323`)                                                                                                                          |
| **Spec Ref**      | `should handle boundary case: Maximum Loan Amount`                                                                                                                                |

---

| **TC-BOUND-003**  | **Minimum Interest Rate (5%)**                                                                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirement**   | Low interest rate calculation                                                                                                                                                    |
| **Priority**      | P2 (Medium)                                                                                                                                                                       |
| **Test Type**     | Boundary                                                                                                                                                                          |
| **Tags**          | `@boundary @regression`                                                                                                                                                           |
| **Preconditions** | Application loaded                                                                                                                                                                |
| **Test Data**     | Principal: ₹50,00,000; Rate: 5% (minimum); Tenure: 20 years<br/>**Expected EMI:** ₹32,998; **Total Interest:** ₹29,19,469; **Total Payment:** ₹79,19,469                        |
| **Test Steps**    | 1. Set rate to 5%<br/>2. Set other inputs<br/>3. Press Tab and extract EMI<br/>4. Verify calculation                                                         |
| **Expected Result** | Low-interest EMI calculated correctly; interest portion is minimal; calculation sound                                                                                            |
| **Actual Result** | **Passed** (2026-09-07)                                                                                                                                                           |
| **Pass Criteria** | Low rate scenario handled correctly                                                                                                                                               |
| **Flakiness Risk**| Low                                                                                                                                                                               |
| **Automation Status** | ✅ Automated (`emi.spec.ts:323`)                                                                                                                          |
| **Spec Ref**      | `should handle boundary case: Minimum Interest Rate`                                                                                                                              |

---

| **TC-BOUND-004**  | **Maximum Interest Rate (20%)**                                                                                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirement**   | High interest rate calculation                                                                                                                                                   |
| **Priority**      | P2 (Medium)                                                                                                                                                                       |
| **Test Type**     | Boundary                                                                                                                                                                          |
| **Tags**          | `@boundary @regression`                                                                                                                                                           |
| **Preconditions** | Application loaded                                                                                                                                                                |
| **Test Data**     | Principal: ₹50,00,000; Rate: 20% (maximum); Tenure: 20 years<br/>**Expected EMI:** ₹84,941; **Total Interest:** ₹1,53,85,895; **Total Payment:** ₹2,03,85,895                    |
| **Test Steps**    | 1. Set rate to 20%<br/>2. Set other inputs<br/>3. Press Tab and extract EMI and Total Interest<br/>4. Verify calculations                                                         |
| **Expected Result** | High-interest EMI calculated correctly; interest portion is large; calculation consistent                                                                                        |
| **Actual Result** | **Passed** (2026-09-07)                                                                                                                                                           |
| **Pass Criteria** | High rate handled correctly                                                                                                                                                       |
| **Flakiness Risk**| Low                                                                                                                                                                               |
| **Automation Status** | ✅ Automated (`emi.spec.ts:323`)                                                                                                                          |
| **Spec Ref**      | `should handle boundary case: Maximum Interest Rate`                                                                                                                              |

---

| **TC-BOUND-005**  | **Minimum Tenure (1 Year)**                                                                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirement**   | Short-tenure loan calculation                                                                                                                                                    |
| **Priority**      | P2 (Medium)                                                                                                                                                                       |
| **Test Type**     | Boundary                                                                                                                                                                          |
| **Tags**          | `@boundary @regression`                                                                                                                                                           |
| **Preconditions** | Application loaded                                                                                                                                                                |
| **Test Data**     | Principal: ₹10,00,000; Rate: 9%; Tenure: 1 year (minimum)<br/>**Expected EMI:** ₹87,451; **Total Interest:** ₹49,418; **Total Payment:** ₹10,49,418                             |
| **Test Steps**    | 1. Set tenure to 1 year<br/>2. Set other inputs<br/>3. Press Tab and verify EMI calculates<br/>4. Verify table has ≥ 1 row (calendar-year span for Sep start = 2 rows: 2026 partial + 2027 partial)<br/>5. Verify final row balance ≈ ₹0 |
| **Expected Result** | 1-year schedule calculated; table shows ≥ 1 row; final balance ≈ ₹0; EMI is high (concentrated payment)                                                                         |
| **Actual Result** | **Passed** (2026-09-07)                                                                                                                                                           |
| **Pass Criteria** | Short tenure handled correctly                                                                                                                                                    |
| **Flakiness Risk**| Low                                                                                                                                                                               |
| **Automation Status** | ✅ Automated (`emi.spec.ts:323`)                                                                                                                          |
| **Spec Ref**      | `should handle boundary case: Minimum Tenure`                                                                                                                                     |

---

| **TC-BOUND-006**  | **Maximum Tenure (30 Years)**                                                                                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirement**   | Long-tenure loan calculation                                                                                                                                                     |
| **Priority**      | P2 (Medium)                                                                                                                                                                       |
| **Test Type**     | Boundary                                                                                                                                                                          |
| **Tags**          | `@boundary @regression`                                                                                                                                                           |
| **Preconditions** | Application loaded                                                                                                                                                                |
| **Test Data**     | Principal: ₹50,00,000; Rate: 9%; Tenure: 30 years (maximum)<br/>**Expected EMI:** ₹40,231; **Total Interest:** ₹94,83,207; **Total Payment:** ₹1,44,83,207                       |
| **Test Steps**    | 1. Set tenure to 30 years<br/>2. Set other inputs<br/>3. Press Tab and verify table has ≥ 30 rows (31 for calendar-year span from Sep 2026)<br/>4. Verify balance decreases gradually and final balance ≈ ₹0 |
| **Expected Result** | 30-year schedule generated; table shows ≥ 30 rows; EMI is low (spread over time); final balance ≈ ₹0                                                                           |
| **Actual Result** | **Passed** (2026-09-07)                                                                                                                                                           |
| **Pass Criteria** | Long tenure handled correctly                                                                                                                                                     |
| **Flakiness Risk**| Low                                                                                                                                                                               |
| **Automation Status** | ✅ Automated (`emi.spec.ts:323`)                                                                                                                          |
| **Spec Ref**      | `should handle boundary case: Maximum Tenure`                                                                                                                                     |

---

### 6. EXPORT TEST CASES

Validate download functionality and data integrity of exports.

---

| **TC-EXP-001**  | **Excel Download — File Integrity**                                                                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirement**  | Excel file can be downloaded                                                                                                                                                     |
| **Priority**     | P1 (High)                                                                                                                                                                         |
| **Test Type**    | Export                                                                                                                                                                            |
| **Tags**         | `@export @regression @critical`                                                                                                                                                   |
| **Preconditions** | Application loaded; values set                                                                                                                                                   |
| **Test Data**    | Scenario: ₹50,00,000 @ 9% for 20 years<br/>Expected: `loan_amortization_schedule.xlsx` (XLSX file)                                                                              |
| **Test Steps**   | 1. Click **Download Excel** button (role=`button` with name matching `/Download Excel/` — anchor styled with `role="button"`)<br/>2. Wait for download event (web-first — not a fixed timeout)<br/>3. Verify file saved as `.xlsx`<br/>4. Open workbook: verify sheet name, metadata rows (Home Loan Amount, Interest Rate, Loan Tenure), Payment Summary block, and amortization table header (`Month #`, `Month & Year`, `Principal (A)`, `Interest (B)`, `Total Monthly Payment (A+B)`, `Outstanding Balance`, `Loan Paid To Date (%)`)<br/>5. Verify amortization data rows present |
| **Expected Result** | File downloads successfully; file is valid XLSX; workbook contains amortization schedule with correct header structure                                                              |
| **Actual Result** | **Passed** (2026-09-07)                                                                                                                                                           |
| **Pass Criteria** | File downloads and is uncorrupted                                                                                                                                                 |
| **Flakiness Risk**| Medium (download timing dependent; mitigated by `waitForEvent('download')` before click)                                                                                          |
| **Automation Status** | ✅ Automated (`emi.spec.ts:502`)                                                                                                                          |
| **Notes**        | The Excel file has a metadata block before the amortization table (rows 1–11); the extraction util locates the amortization header row before parsing.                             |

---

| **TC-EXP-002**  | **Excel Data ↔ UI Table Consistency**                                                                                                                                             |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirement**  | Exported Excel matches UI table                                                                                                                                                  |
| **Priority**     | P1 (High)                                                                                                                                                                         |
| **Test Type**    | Export                                                                                                                                                                            |
| **Tags**         | `@export @regression @critical`                                                                                                                                                   |
| **Preconditions** | Application loaded; Excel downloaded (see TC-EXP-001)                                                                                                                            |
| **Test Data**    | Same scenario as TC-EXP-001; schedule start read live from `#loanstartdate`                                                                                                       |
| **Test Steps**   | 1. Extract year-wise data from UI table<br/>2. Extract monthly data from Excel file<br/>3. Aggregate Excel monthly rows to calendar years using the live schedule start date<br/>4. Compare aggregated Excel yearly rows with UI yearly rows<br/>5. Identify any discrepancies (tolerance: ±₹10) |
| **Expected Result** | All calendar-year rows match between UI and Excel; Principal, Interest, Total Payment, Balance match within tolerance                                                            |
| **Actual Result** | **Passed** (2026-09-07)                                                                                                                                                           |
| **Pass Criteria** | UI and Excel data match within tolerance                                                                                                                                          |
| **Flakiness Risk**| Low (deterministic comparison)                                                                                                                                                    |
| **Automation Status** | ✅ Automated (`emi.spec.ts:536`)                                                                                                                          |
| **Notes**        | Excel exports **monthly** data; UI table displays **yearly**. The test aggregates both to calendar years before comparing, using the live schedule start date for alignment.         |

---

### 7. REGRESSION TEST SUMMARY

| Category       | Count | Automated | Priority | Smoke | PR  | Nightly | Notes                          |
| -------------- | ----- | --------- | -------- | ----- | --- | ------- | ------------------------------ |
| Smoke          | 3     | ✅ 3/3    | P0       | ✅    | ✅  | ✅      | Every push                     |
| Functional     | 5     | ✅ 5/5    | P1       | —     | ✅  | ✅      | Every PR; includes tenure pill |
| Calculation    | 3     | ✅ 3/3    | P0       | ✅    | ✅  | ✅      | Included in smoke              |
| Consistency    | 4     | ✅ 4/4    | P0       | —     | ✅  | ✅      | Calendar-year + chart          |
| Boundary       | 6     | ✅ 6/6    | P2       | —     | ✅  | ✅      | Min/max values                 |
| Export         | 2     | ✅ 2/2    | P1       | —     | ✅  | ✅      | Excel structure + data compare |
| **TOTAL**      | **23**| **✅ 23/23**| —        | **3** | **17**| **23** | All passing on live app (2026-09-07) |

---

## Risk Assessment & Prioritization

### High Risk (Must Test Every Time)

| Case          | Test Name                                             | Rationale                           |
| ------------- | ----------------------------------------------------- | ----------------------------------- |
| TC-SMOKE-002  | Default EMI calculation                               | Validates core formula engine       |
| TC-CALC-001   | Standard loan (₹30L @ 8.5% / 15y)                    | Financial correctness baseline      |
| TC-CALC-002   | High loan (₹2Cr @ 7% / 25y)                           | High-value precision                |
| TC-CONS-001   | EMI ↔ Total Payment ↔ Interest relationship           | Internal data consistency           |
| TC-CONS-002   | Year-wise table ↔ independent calculation             | Calendar-year alignment validation  |
| TC-EXP-001    | Excel download integrity                              | User-facing feature correctness     |
| TC-EXP-002    | Excel ↔ UI data consistency                           | Export data fidelity                |

### Medium Risk (Regular Testing)

| Cases            | Name                                  |
| ---------------- | ------------------------------------- |
| TC-FUNC-001–004  | Input and pill interaction            |
| TC-CONS-003      | Table row structure                   |
| TC-SMOKE-003     | Amortization table presence           |
| TC-BOUND-001–006 | Edge cases at input boundaries        |

### Low Risk (Periodic Testing)

None identified — all tests are important for a financial application.

---

## Test Execution Frequency

| Test Suite    | Frequency          | Tests | Est. Time |
| ------------- | ------------------ | ----- | --------- |
| Smoke         | Every push         | 3     | < 2 min   |
| PR Regression | Every pull request | 18    | < 10 min  |
| Full          | Nightly + Release  | 21    | < 20 min  |

---

## Known Issues & Limitations

| Issue                           | Impact                               | Workaround                                          |
| ------------------------------- | ------------------------------------ | --------------------------------------------------- |
| Chart validation limited        | Can't visually verify chart          | Validate via underlying table data and calculations |
| PDF not tested                  | PDF export not validated             | Focus on Excel (more programmatically testable)     |
| Single browser (Chromium only)  | No cross-browser coverage            | Covers 80%+ users; expand to Firefox/Safari later   |
| Calendar-year grouping          | Table rows depend on schedule start  | Schedule start read from `#loanstartdate` in tests  |
| Tenure pills: label intercept   | Direct radio click times out         | Interact via label text locators, not radio inputs  |
| No auth / multi-tenant testing  | Single-user flow only                | Not applicable for this calculator                  |

---

**End of Test Case Matrix**

_This document reflects the verified, live-tested state of the EMI Calculator suite as of 2026-09-07. All expected values are confirmed against the running application at `https://emicalculator.net/`._