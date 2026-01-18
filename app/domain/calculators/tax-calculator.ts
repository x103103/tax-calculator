/**
 * Tax Calculator
 * Applies Polish tax formula to profits and fees
 */

interface TaxCalculationResult {
  taxableBase: number;
  taxOwed: number;
}

/**
 * Calculate Polish tax on trading profits
 * Formula: (profits - buyFees - sellFees) * taxRate
 * @param profitsPln - Total profits in PLN
 * @param buyFeesPln - Total buy fees in PLN
 * @param sellFeesPln - Total sell fees in PLN
 * @param taxRate - Tax rate (default 19% = 0.19)
 * @returns Tax calculation with taxableBase and taxOwed
 */
export function calculateTax(
  profitsPln: number,
  buyFeesPln: number,
  sellFeesPln: number,
  taxRate: number = 0.19
): TaxCalculationResult {
  const taxableBase = profitsPln - buyFeesPln - sellFeesPln;
  const taxOwed = taxableBase * taxRate;

  return { taxableBase, taxOwed };
}
