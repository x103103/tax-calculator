/**
 * Profit Calculator
 * Calculates realized profits from closed positions
 */

const { convertToPlnWithDate, formatDate } = require('../services/currency-converter');

/**
 * Calculate realized profits from closed positions
 * @param {Array<Object>} closedPositions - Array of closed position objects
 * @param {Object} rateService - Rate service with getRateForPreviousDay method
 * @returns {Promise<Object>} Profits with totalUsd, totalPln, and details array
 */
async function calculateProfits(closedPositions, rateService) {
  let totalUsd = 0;
  let totalPln = 0;
  const details = [];

  for (const position of closedPositions) {
    const symbol = position.Symbol;
    const profitUsd = parseFloat(position.FifoPnlRealized) || 0;
    const tradeDate = formatDate(position.TradeDate);

    const conversion = await convertToPlnWithDate(profitUsd, tradeDate, rateService);

    totalUsd += profitUsd;
    totalPln += conversion.amountPln;

    details.push({
      symbol,
      tradeDate,
      profitUsd,
      rate: conversion.rate,
      rateDate: conversion.rateDate,
      profitPln: conversion.amountPln
    });
  }

  return { totalUsd, totalPln, details };
}

module.exports = { calculateProfits };
