import type {
  CashTransactionData,
  CashTransactionRow,
  DividendDetail,
  DividendTaxResult,
  IRateService,
  WithholdingTaxDetail,
  BrokerInterestDetail,
} from '../../types';
import { convertToPlnWithDate, formatDate } from '../services/currency-converter';

interface TransactionSummary<T> {
  totalUsd: number;
  totalPln: number;
  details: T[];
}

function sumDividends(
  rows: CashTransactionRow[],
  rateService: IRateService
): TransactionSummary<DividendDetail> {
  let totalUsd = 0;
  let totalPln = 0;
  const details: DividendDetail[] = [];

  for (const row of rows) {
    const amountUsd = parseFloat(row.Amount) || 0;
    const date = formatDate(row['Date/Time']);
    const conversion = convertToPlnWithDate(amountUsd, date, rateService);

    totalUsd += amountUsd;
    totalPln += conversion.amountPln;

    details.push({
      symbol: row.Symbol,
      date,
      amountUsd,
      rate: conversion.rate,
      rateDate: conversion.rateDate,
      amountPln: conversion.amountPln,
    });
  }

  return { totalUsd, totalPln, details };
}

function sumWithholdingTax(
  rows: CashTransactionRow[],
  rateService: IRateService
): TransactionSummary<WithholdingTaxDetail> {
  let totalUsd = 0;
  let totalPln = 0;
  const details: WithholdingTaxDetail[] = [];

  for (const row of rows) {
    const amountUsd = parseFloat(row.Amount) || 0;
    const date = formatDate(row['Date/Time']);
    const conversion = convertToPlnWithDate(amountUsd, date, rateService);

    totalUsd += amountUsd;
    totalPln += conversion.amountPln;

    details.push({
      symbol: row.Symbol,
      date,
      amountUsd,
      rate: conversion.rate,
      rateDate: conversion.rateDate,
      amountPln: conversion.amountPln,
    });
  }

  return { totalUsd, totalPln, details };
}

function sumBrokerInterest(
  rows: CashTransactionRow[],
  rateService: IRateService
): TransactionSummary<BrokerInterestDetail> {
  let totalUsd = 0;
  let totalPln = 0;
  const details: BrokerInterestDetail[] = [];

  for (const row of rows) {
    const amountUsd = parseFloat(row.Amount) || 0;
    const date = formatDate(row['Date/Time']);
    const conversion = convertToPlnWithDate(amountUsd, date, rateService);

    totalUsd += amountUsd;
    totalPln += conversion.amountPln;

    details.push({
      date,
      amountUsd,
      rate: conversion.rate,
      rateDate: conversion.rateDate,
      amountPln: conversion.amountPln,
    });
  }

  return { totalUsd, totalPln, details };
}

export function calculateDividendTax(
  data: CashTransactionData,
  rateService: IRateService
): DividendTaxResult {
  const dividends = sumDividends(data.dividends, rateService);
  const withholdingTax = sumWithholdingTax(data.withholdingTax, rateService);
  const brokerInterest = sumBrokerInterest(data.brokerInterest, rateService);

  const dividendTaxPln = dividends.totalPln * 0.19;
  const interestTaxPln = brokerInterest.totalPln * 0.19;
  const withholdingCreditPln = Math.abs(withholdingTax.totalPln);
  const taxOwedPln = withholdingCreditPln - dividendTaxPln - interestTaxPln;

  return {
    dividends,
    withholdingTax,
    brokerInterest,
    dividendTaxPln,
    interestTaxPln,
    withholdingCreditPln,
    taxOwedPln,
  };
}
