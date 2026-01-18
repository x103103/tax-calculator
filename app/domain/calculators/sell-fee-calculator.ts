import { TradeRow, FeeResult, IRateService } from '../../types/index';
import { convertToPlnWithDate, formatDate } from '../services/currency-converter';

/**
 * Calculate sell fees from sell trades
 * @param sellTrades - Array of sell trade objects
 * @param rateService - Rate service with getRateForPreviousDay method
 * @returns Fees with totalUsd, totalPln, and details array
 */
export async function calculateSellFees(
  sellTrades: TradeRow[],
  rateService: IRateService
): Promise<FeeResult> {
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
