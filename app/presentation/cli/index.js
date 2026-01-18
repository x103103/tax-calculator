/**
 * CLI Entry Point
 * Main script for running tax calculation from command line
 */

const { generateReport } = require('../../application');
const { printReport } = require('./console-reporter');

async function main() {
  try {
    const report = await generateReport();
    printReport(report);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
