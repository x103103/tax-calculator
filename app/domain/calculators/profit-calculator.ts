import { ClosedPositionRow, ProfitResult, IRateService } from '../../types/index';
import { convertToPlnWithDate, formatDate } from '../services/currency-converter';

/**
 * Calculate realized profits from closed positions
 * @param closedPositions - Array of closed position objects
 * @param rateService - Rate service with getRateForPreviousDay method
 * @returns Profits with totalUsd, totalPln, and details array
 */
export function calculateProfits(
  closedPositions: ClosedPositionRow[],
  rateService: IRateService
): ProfitResult {
  let totalUsd = 0;
  let totalPln = 0;
  const details = [];

  for (const position of closedPositions) {
    const symbol = position.Symbol;
    const profitUsd = parseFloat(position.FifoPnlRealized) || 0;
    const tradeDate = formatDate(position.TradeDate);

    const conversion = convertToPlnWithDate(profitUsd, tradeDate, rateService);

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
