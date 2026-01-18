/**
 * Calculate Tax Use Case
 * Public API for tax calculation
 */

import { TaxCalculator } from './calculator';
import { createConfig } from '../../config';
import type { TaxSummary, TaxReport, ConfigOverrides } from '../../types';

export async function calculateTax(
  configOverrides?: ConfigOverrides
): Promise<TaxSummary> {
  const config = createConfig(configOverrides);
  const calc = new TaxCalculator(config);
  return calc.calculateTax();
}

export async function generateReport(
  configOverrides?: ConfigOverrides
): Promise<TaxReport> {
  const config = createConfig(configOverrides);
  const calc = new TaxCalculator(config);
  return calc.generateReport();
}

export { TaxCalculator };
