/**
 * Sell Fee Calculator
 * Calculates sell fees from sell trades
 */

const { convertToPlnWithDate, formatDate } = require('../services/currency-converter');

/**
 * Calculate sell fees from sell trades
 * @param {Array<Object>} sellTrades - Array of sell trade objects
 * @param {Object} rateService - Rate service with getRateForPreviousDay method
 * @returns {Promise<Object>} Fees with totalUsd, totalPln, and details array
 */
async function calculateSellFees(sellTrades, rateService) {
  let totalUsd = 0;
  let totalPln = 0;
  const details = [];

  for (const trade of sellTrades) {
    const symbol = trade.Symbol;
    const feeUsd = Math.abs(parseFloat(trade.IBCommission) || 0);
    const sellDate = formatDate(trade.TradeDate);

    const conversion = await convertToPlnWithDate(feeUsd, sellDate, rateService);

    totalUsd += feeUsd;
    totalPln += conversion.amountPln;

    details.push({
      symbol,
      sellDate,
      feeUsd,
      rate: conversion.rate,
      rateDate: conversion.rateDate,
      feePln: conversion.amountPln
    });
  }

  return { totalUsd, totalPln, details };
}

module.exports = { calculateSellFees };
