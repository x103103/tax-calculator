#!/usr/bin/env node

/**
 * Test script for Poland Tax Calculator v2
 * Usage: node app/test-poland-tax.ts or npm run dev
 */

import { generateReport } from './application';
import { printReport } from './presentation/cli/console-reporter';
import { generatePdfReport } from './presentation/pdf';
import type { TaxReport } from './types';

const PDF_FLAG = '--pdf';

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║           POLAND TAX CALCULATOR FOR 2025 (v2)                 ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

async function main(): Promise<void> {
  try {
    const report: TaxReport = await generateReport();
    const shouldGeneratePdf = process.argv.includes(PDF_FLAG);

    printReport(report);

    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    TOTAL TAX                                   ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    console.log(`Year:           ${report.year.toString()}`);
    console.log(`Total Tax:      ${report.totalTaxOwed.toFixed(2)} PLN\n`);

    console.log('Note: All USD amounts have been converted to PLN using the');
    console.log('      exchange rate from the day BEFORE each transaction.\n');

    if (shouldGeneratePdf) {
      const pdfPath = `tmp/data/reports/tax-report-${report.year}.pdf`;
      await generatePdfReport(report, pdfPath);
      console.log(`📄 PDF report generated: ${pdfPath}\n`);
    }

    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('\n❌ ERROR:', errorMessage);
    if (errorStack !== undefined && errorStack !== '') console.error(errorStack);
    process.exit(1);
  }
}

void main();
