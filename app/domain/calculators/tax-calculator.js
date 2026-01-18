/**
 * Tax Calculator
 * Applies Polish tax formula to profits and fees
 */

/**
 * Calculate Polish tax on trading profits
 * Formula: (profits - buyFees - sellFees) * taxRate
 * @param {number} profitsPln - Total profits in PLN
 * @param {number} buyFeesPln - Total buy fees in PLN
 * @param {number} sellFeesPln - Total sell fees in PLN
 * @param {number} taxRate - Tax rate (default 19% = 0.19)
 * @returns {Object} Tax calculation with taxableBase and taxOwed
 */
function calculateTax(profitsPln, buyFeesPln, sellFeesPln, taxRate = 0.19) {
  const taxableBase = profitsPln - buyFeesPln - sellFeesPln;
  const taxOwed = taxableBase * taxRate;

  return { taxableBase, taxOwed };
}

module.exports = { calculateTax };
