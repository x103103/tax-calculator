#!/usr/bin/env node

/**
 * Test script for Poland Tax Calculator
 * Usage: node app/test-poland-tax.js
 */

const { generateReport } = require('./services/poland-tax-calculator');

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║           POLAND TAX CALCULATOR FOR 2025                       ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

try {
  const report = generateReport();

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    FINAL TAX RESULT                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  console.log(`Year:           ${report.year}`);
  console.log(`Tax Owed:       ${report.taxOwed.toFixed(2)} PLN`);
  console.log(`Taxable Base:   ${report.taxableBase.toFixed(2)} PLN`);
  console.log(`Tax Rate:       ${(report.taxRate * 100)}%\n`);

  console.log('Note: All USD amounts have been converted to PLN using the');
  console.log('      exchange rate from the day BEFORE each transaction.\n');

  process.exit(0);
} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  console.error(error.stack);
  process.exit(1);
}
