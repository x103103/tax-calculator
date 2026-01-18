#!/usr/bin/env node

/**
 * Test script for Poland Tax Calculator v2
 * Usage: node app/test-poland-tax.ts or npm run dev
 */

import { generateReport } from './application';
import type { TaxReport } from './types';

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║           POLAND TAX CALCULATOR FOR 2025 (v2)                 ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

async function main(): Promise<void> {
  try {
    const report: TaxReport = await generateReport();

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
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('\n❌ ERROR:', errorMessage);
    if (errorStack) console.error(errorStack);
    process.exit(1);
  }
}

main();
