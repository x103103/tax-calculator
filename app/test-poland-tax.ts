#!/usr/bin/env node

/**
 * Test script for Poland Tax Calculator v2
 * Usage: pnpm run dev -- --data-dir tmp/data/alex --pdf
 */

import path from 'path';
import { generateReport } from './application';
import { printReport } from './presentation/cli/console-reporter';
import { generatePdfReport } from './presentation/pdf';
import type { ConfigOverrides } from './types';

const PDF_FLAG = '--pdf';
const DATA_DIR_FLAG = '--data-dir';

function parseDataDir(): string | undefined {
  const idx = process.argv.indexOf(DATA_DIR_FLAG);
  if (idx === -1 || idx + 1 >= process.argv.length) return undefined;
  return path.resolve(process.argv[idx + 1]);
}

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║           POLAND TAX CALCULATOR FOR 2025 (v2)                 ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

async function main(): Promise<void> {
  try {
    const dataDir = parseDataDir();
    const overrides: ConfigOverrides | undefined = dataDir ? { dataDir } : undefined;

    const report = await generateReport(overrides);
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
      const outputDir = dataDir ?? 'tmp/data/reports';
      const pdfPath = path.join(outputDir, `tax-report-${report.year}.pdf`);
      await generatePdfReport(report, pdfPath);
      console.log(`PDF report generated: ${pdfPath}\n`);
    }

    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('\nERROR:', errorMessage);
    if (errorStack !== undefined && errorStack !== '') console.error(errorStack);
    process.exit(1);
  }
}

void main();
