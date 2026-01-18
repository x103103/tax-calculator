/**
 * Buy Fee Calculator
 * Calculates buy fees by matching closed positions to buy trades
 */

const { convertToPlnWithDate, formatDate } = require('../services/currency-converter');

/**
 * Calculate buy fees from closed positions and their matching buy trades
 * @param {Array<Object>} closedPositions - Array of closed position objects
 * @param {Map<string, Object>} buyTradesMap - Map of buy trades keyed by Symbol_OpenDateTime
 * @param {Object} rateService - Rate service with getRateForPreviousDay method
 * @returns {Promise<Object>} Fees with totalUsd, totalPln, and details array
 * @throws {Error} If buy trade not found for a position (fail fast)
 */
async function calculateBuyFees(closedPositions, buyTradesMap, rateService) {
  let totalUsd = 0;
  let totalPln = 0;
  const details = [];

  for (const position of closedPositions) {
    const symbol = position.Symbol;
    const openDateTime = position.OpenDateTime;
    const key = `${symbol}_${openDateTime}`;

    const buyTrade = buyTradesMap.get(key);
    if (!buyTrade) {
      throw new Error(`Buy trade not found for ${symbol} at ${openDateTime}`);
    }

    const feeUsd = Math.abs(parseFloat(buyTrade.IBCommission) || 0);
    const buyDate = formatDate(buyTrade.TradeDate);

    const conversion = await convertToPlnWithDate(feeUsd, buyDate, rateService);

    totalUsd += feeUsd;
    totalPln += conversion.amountPln;

    details.push({
      symbol,
      buyDate,
      feeUsd,
      rate: conversion.rate,
      rateDate: conversion.rateDate,
      feePln: conversion.amountPln
    });
  }

  return { totalUsd, totalPln, details };
}

module.exports = { calculateBuyFees };
