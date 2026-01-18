/**
 * Console Reporter
 * Formats and prints tax calculation report to stdout
 */

/**
 * Print loading summary section
 */
function printLoadingSummary(report) {
  const closedCount = report.details.profitBreakdown.length;
  const buyCount = report.details.buyFeeBreakdown.length;
  const sellCount = report.details.sellFeeBreakdown.length;

  console.log('Loading trading data...\n');
  console.log(`\u2713 Loaded ${closedCount} closed positions from ${report.year}`);
  console.log(`\u2713 Loaded ${buyCount} total trades (2024 + 2025)`);
  console.log(`\u2713 Found ${sellCount} sell trades in ${report.year}\n`);
}

/**
 * Print profits section
 */
function printProfits(report) {
  console.log('=== CALCULATING PROFITS ===\n');
  console.log(`Total Profit: $${report.profitsUSD.toFixed(2)} USD`);
  console.log(`Total Profit: ${report.profits.toFixed(2)} PLN\n`);
}

/**
 * Print buy fees section
 */
function printBuyFees(report) {
  console.log('=== CALCULATING BUY FEES ===\n');
  console.log(`Total Buy Fees: $${report.buyFeesUSD.toFixed(2)} USD`);
  console.log(`Total Buy Fees: ${report.buyFees.toFixed(2)} PLN\n`);
}

/**
 * Print sell fees section
 */
function printSellFees(report) {
  console.log('=== CALCULATING SELL FEES ===\n');
  console.log(`Total Sell Fees: $${report.sellFeesUSD.toFixed(2)} USD`);
  console.log(`Total Sell Fees: ${report.sellFees.toFixed(2)} PLN\n`);
}

/**
 * Print tax calculation section
 */
function printTaxCalculation(report) {
  const taxRatePercent = Math.round(report.taxRate * 100);

  console.log('=== TAX CALCULATION ===\n');
  console.log(`Formula: ((Profit) - (Buy Fees) - (Sell Fees)) \u00d7 ${taxRatePercent}%\n`);
  console.log(`Profit:          ${report.profits.toFixed(2)} PLN`);
  console.log(`Buy Fees:      - ${report.buyFees.toFixed(2)} PLN`);
  console.log(`Sell Fees:     - ${report.sellFees.toFixed(2)} PLN`);
  console.log(`${'='.repeat(50)}`);
  console.log(`Taxable Base:    ${report.taxableBase.toFixed(2)} PLN`);
  console.log(`Tax Rate:        ${taxRatePercent}%`);
  console.log(`${'='.repeat(50)}`);
  console.log(`TAX OWED:        ${report.taxOwed.toFixed(2)} PLN`);
  console.log(`${'='.repeat(50)}\n`);
}

/**
 * Print summary section
 */
function printSummary(report) {
  const closedCount = report.details.profitBreakdown.length;
  const buyCount = report.details.buyFeeBreakdown.length;
  const sellCount = report.details.sellFeeBreakdown.length;

  console.log('=== SUMMARY ===\n');
  console.log(`Closed Positions: ${closedCount}`);
  console.log(`Buy Transactions: ${buyCount}`);
  console.log(`Sell Transactions: ${sellCount}\n`);

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
 * @param {Object} report - Tax result from calculator.generateReport()
 */
function printReport(report) {
  printLoadingSummary(report);
  printProfits(report);
  printBuyFees(report);
  printSellFees(report);
  printTaxCalculation(report);
  printSummary(report);
}

module.exports = { printReport };
