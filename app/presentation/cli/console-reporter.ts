/**
 * Console Reporter
 * Formats and prints tax calculation report to stdout
 */

import { TaxReport, TaxSummary } from '../../types';

/**
 * Print loading summary section
 */
function printLoadingSummary(report: TaxReport): void {
  const closedCount = report.details.profitBreakdown.length;
  const buyCount = report.details.buyFeeBreakdown.length;
  const sellCount = report.details.sellFeeBreakdown.length;

  console.log('Loading trading data...\n');
  console.log(`✓ Loaded ${closedCount.toString()} closed positions from ${report.year.toString()}`);
  console.log(`✓ Loaded ${buyCount.toString()} total trades (2024 + 2025)`);
  console.log(`✓ Found ${sellCount.toString()} sell trades in ${report.year.toString()}\n`);
}

/**
 * Print profits section
 */
function printProfits(report: TaxReport | TaxSummary): void {
  console.log('=== CALCULATING PROFITS ===\n');
  console.log(`Total Profit: $${report.profitsUSD.toFixed(2)} USD`);
  console.log(`Total Profit: ${report.profits.toFixed(2)} PLN\n`);
}

/**
 * Print buy fees section
 */
function printBuyFees(report: TaxReport | TaxSummary): void {
  console.log('=== CALCULATING BUY FEES ===\n');
  console.log(`Total Buy Fees: $${report.buyFeesUSD.toFixed(2)} USD`);
  console.log(`Total Buy Fees: ${report.buyFees.toFixed(2)} PLN\n`);
}

/**
 * Print sell fees section
 */
function printSellFees(report: TaxReport | TaxSummary): void {
  console.log('=== CALCULATING SELL FEES ===\n');
  console.log(`Total Sell Fees: $${report.sellFeesUSD.toFixed(2)} USD`);
  console.log(`Total Sell Fees: ${report.sellFees.toFixed(2)} PLN\n`);
}

/**
 * Print tax calculation section
 */
function printTaxCalculation(report: TaxReport | TaxSummary): void {
  const taxRatePercent = Math.round(report.taxRate * 100);

  console.log('=== TAX CALCULATION ===\n');
  console.log(`Formula: ((Profit) - (Buy Fees) - (Sell Fees)) × ${taxRatePercent.toString()}%\n`);
  console.log(`Profit:          ${report.profits.toFixed(2)} PLN`);
  console.log(`Buy Fees:      - ${report.buyFees.toFixed(2)} PLN`);
  console.log(`Sell Fees:     - ${report.sellFees.toFixed(2)} PLN`);
  console.log('='.repeat(50));
  console.log(`Taxable Base:    ${report.taxableBase.toFixed(2)} PLN`);
  console.log(`Tax Rate:        ${taxRatePercent.toString()}%`);
  console.log('='.repeat(50));
  console.log(`TAX OWED:        ${report.taxOwed.toFixed(2)} PLN`);
  console.log(`${'='.repeat(50)}\n`);
}

/**
 * Print summary section
 */
function printSummary(report: TaxReport): void {
  const closedCount = report.details.profitBreakdown.length;
  const buyCount = report.details.buyFeeBreakdown.length;
  const sellCount = report.details.sellFeeBreakdown.length;

  console.log('=== SUMMARY ===\n');
  console.log(`Closed Positions: ${closedCount.toString()}`);
  console.log(`Buy Transactions: ${buyCount.toString()}`);
  console.log(`Sell Transactions: ${sellCount.toString()}\n`);

  console.log('USD Amounts:');
  console.log(`  Profit:     $${report.profitsUSD.toFixed(2)}`);
  console.log(`  Buy Fees:   $${report.buyFeesUSD.toFixed(2)}`);
  console.log(`  Sell Fees:  $${report.sellFeesUSD.toFixed(2)}\n`);

  console.log('PLN Amounts (converted at previous day rates):');
  console.log(`  Profit:     ${report.profits.toFixed(2)} PLN`);
  console.log(`  Buy Fees:   ${report.buyFees.toFixed(2)} PLN`);
  console.log(`  Sell Fees:  ${report.sellFees.toFixed(2)} PLN\n`);
}

/**
 * Print full tax calculation report to console
 */
export function printReport(report: TaxReport | TaxSummary): void {
  if ('details' in report) {
    // TaxReport with details
    printLoadingSummary(report);
    printProfits(report);
    printBuyFees(report);
    printSellFees(report);
    printTaxCalculation(report);
    printSummary(report);
  } else {
    // TaxSummary without details
    printProfits(report);
    printBuyFees(report);
    printSellFees(report);
    printTaxCalculation(report);
  }
}
