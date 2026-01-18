/**
 * CLI Entry Point
 * Main script for running tax calculation from command line
 */

import { generateReport } from '../../application';
import { printReport } from './console-reporter';

export async function main(): Promise<void> {
  try {
    const report = await generateReport();
    printReport(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error:', message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
