/**
 * Calculate Tax Use Case
 * Public API for tax calculation
 */

const { TaxCalculator } = require('./calculator');
const { createConfig } = require('../../config');

async function calculateTax(configOverrides) {
  const config = createConfig(configOverrides);
  const calc = new TaxCalculator(config);
  return calc.calculateTax();
}

async function generateReport(configOverrides) {
  const config = createConfig(configOverrides);
  const calc = new TaxCalculator(config);
  return calc.generateReport();
}

module.exports = { TaxCalculator, calculateTax, generateReport };
