/**
 * CSV Row Types (raw data from CSV files)
 */
export interface ClosedPositionRow extends Record<string, string> {
  Symbol: string;
  FifoPnlRealized: string;
  TradeDate: string;
  OpenDateTime: string;
  TransactionID: string;
  TRNT: string;
}

export interface TradeRow extends Record<string, string> {
  Symbol: string;
  DateTime: string;
  TradeDate: string;
  TransactionID: string;
  IBCommission: string;
  'Buy/Sell': 'BUY' | 'SELL';
  TRNT: string;
}

export interface RateRow {
  date: string;
  rate: string;
}

export interface CashTransactionRow extends Record<string, string> {
  Symbol: string;
  Description: string;
  'Date/Time': string;
  Amount: string;
  Type: string;
}

/**
 * Domain Types
 */
export interface ConversionResult {
  amountPln: number;
  rate: number;
  rateDate: string;
  daysBack: number;
}

export interface RateInfo {
  date: string;
  rate: number;
  daysBack: number;
}

export interface ProfitDetail {
  symbol: string;
  tradeDate: string;
  profitUsd: number;
  rate: number;
  rateDate: string;
  profitPln: number;
}

export interface FeeDetail {
  symbol: string;
  buyDate?: string;
  sellDate?: string;
  feeUsd: number;
  rate: number;
  rateDate: string;
  feePln: number;
}

export interface ProfitResult {
  totalUsd: number;
  totalPln: number;
  details: ProfitDetail[];
}

export interface FeeResult {
  totalUsd: number;
  totalPln: number;
  details: FeeDetail[];
}

export interface DividendDetail {
  symbol: string;
  date: string;
  amountUsd: number;
  rate: number;
  rateDate: string;
  amountPln: number;
}

export interface WithholdingTaxDetail {
  symbol: string;
  date: string;
  amountUsd: number;
  rate: number;
  rateDate: string;
  amountPln: number;
}

export interface BrokerInterestDetail {
  date: string;
  amountUsd: number;
  rate: number;
  rateDate: string;
  amountPln: number;
}

export interface DividendTaxResult {
  dividends: { totalUsd: number; totalPln: number; details: DividendDetail[] };
  withholdingTax: { totalUsd: number; totalPln: number; details: WithholdingTaxDetail[] };
  brokerInterest: { totalUsd: number; totalPln: number; details: BrokerInterestDetail[] };
  dividendTaxPln: number;
  interestTaxPln: number;
  withholdingCreditPln: number;
  taxOwedPln: number;
}

export interface CashTransactionData {
  dividends: CashTransactionRow[];
  withholdingTax: CashTransactionRow[];
  brokerInterest: CashTransactionRow[];
}

/**
 * Config Types
 */
export interface CsvPaths {
  closedPositions: string;
  trades: string[];
  rates: string;
  cashTransactions?: string;
}

export interface TaxConfig {
  dataDir: string;
  csvPaths: CsvPaths;
  taxRate: number;
  year: number;
}

export interface ConfigOverrides {
  dataDir?: string;
  csvPaths?: Partial<CsvPaths>;
  taxRate?: number;
  year?: number;
}

/**
 * Tax Report Types
 */
export interface TaxSummary {
  year: number;
  currency: string;
  profits: number;
  buyFees: number;
  sellFees: number;
  taxableBase: number;
  taxRate: number;
  taxOwed: number;
  profitsUSD: number;
  buyFeesUSD: number;
  sellFeesUSD: number;
  dividendTax?: DividendTaxResult;
  totalTaxOwed: number;
}

export interface TaxReport extends TaxSummary {
  details: {
    profitBreakdown: ProfitDetail[];
    buyFeeBreakdown: FeeDetail[];
    sellFeeBreakdown: FeeDetail[];
  };
}

/**
 * Repository Types
 */
export interface TradeData {
  closedPositions: ClosedPositionRow[];
  buyTradesMap: Map<string, TradeRow>;
  sellTrades: TradeRow[];
}

export interface TradeRepositoryConfig {
  closedPositionsPath: string;
  tradesPaths: string[];
}

/**
 * Service Interfaces
 */
export interface IRateService {
  load(): Promise<void>;
  getRateForPreviousDay(date: string | Date, maxAttempts?: number): RateInfo;
  getRate(date: string | Date, useFallback?: boolean): RateInfo | null;
  reload(): Promise<void>;
}

export interface ITradeRepository {
  load(config: TradeRepositoryConfig & { year: number }): Promise<TradeData>;
}
