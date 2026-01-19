import { ClosedPositionRow, TradeRow, FeeResult, IRateService } from '../../types/index';
import { convertToPlnWithDate, formatDate } from '../services/currency-converter';

/**
 * Calculate buy fees from closed positions and their matching buy trades
 * @param closedPositions - Array of closed position objects
 * @param buyTradesMap - Map of buy trades keyed by TransactionID
 * @param rateService - Rate service with getRateForPreviousDay method
 * @returns Fees with totalUsd, totalPln, and details array
 * @throws Error If buy trade not found for a position (fail fast)
 */
export function calculateBuyFees(
  closedPositions: ClosedPositionRow[],
  buyTradesMap: Map<string, TradeRow>,
  rateService: IRateService
): FeeResult {
  let totalUsd = 0;
  let totalPln = 0;
  const details = [];

  for (const position of closedPositions) {
    const symbol = position.Symbol;

    const buyTrade = buyTradesMap.get(position.TransactionID);
    if (!buyTrade) {
      throw new Error(`Buy trade not found for TransactionID ${position.TransactionID}`);
    }

    const fullFeeUsd = Math.abs(parseFloat(buyTrade.IBCommission) || 0);
    const buyQuantity = Math.abs(parseFloat(buyTrade.Quantity) || 1);
    const closedQuantity = Math.abs(parseFloat(position.Quantity) || 0);

    const feeUsd = (fullFeeUsd * closedQuantity) / buyQuantity;

    const buyDate = formatDate(buyTrade.TradeDate);

    const conversion = convertToPlnWithDate(feeUsd, buyDate, rateService);

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
