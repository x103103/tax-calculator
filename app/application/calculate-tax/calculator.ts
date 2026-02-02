/**
 * Tax Calculator Orchestrator
 * Coordinates all layers to calculate Polish tax on trading profits
 */

import { defaultConfig } from '../../config';
import { calculateBuyFees } from '../../domain/calculators/buy-fee-calculator';
import { calculateDividendTax } from '../../domain/calculators/dividend-tax-calculator';
import { calculateProfits } from '../../domain/calculators/profit-calculator';
import { calculateSellFees } from '../../domain/calculators/sell-fee-calculator';
import { calculateTax } from '../../domain/calculators/tax-calculator';
import { CashTransactionRepository } from '../../infrastructure/repositories/cash-transaction-repository';
import { TradeRepository } from '../../infrastructure/repositories/trade-repository';
import { UsdPlnRateService } from '../../infrastructure/services/usd-pln-rate';
import type {
  CashTransactionData,
  DividendTaxResult,
  TaxConfig,
  TaxSummary,
  TaxReport,
  TradeData,
} from '../../types';

export class TaxCalculator {
  config: TaxConfig;
  private _tradeRepo: TradeRepository | null = null;
  private _cashTransactionRepo: CashTransactionRepository | null = null;
  private _rateService: UsdPlnRateService | null = null;
  private _tradeData: TradeData | null = null;
  private _cashTransactionData: CashTransactionData | null = null;

  constructor(config: TaxConfig = defaultConfig) {
    this.config = config;
  }

  /**
   * Lazy-init trade repository
   */
  get tradeRepo(): TradeRepository {
    if (!this._tradeRepo) {
      this._tradeRepo = new TradeRepository();
    }
    return this._tradeRepo;
  }

  /**
   * Lazy-init cash transaction repository
   */
  get cashTransactionRepo(): CashTransactionRepository {
    if (!this._cashTransactionRepo) {
      this._cashTransactionRepo = new CashTransactionRepository();
    }
    return this._cashTransactionRepo;
  }

  /**
   * Lazy-init rate service
   */
  get rateService(): UsdPlnRateService {
    if (!this._rateService) {
      this._rateService = new UsdPlnRateService(this.config.csvPaths.rates);
    }
    return this._rateService;
  }

  /**
   * Load all data from CSV files
   */
  async loadData(): Promise<TradeData> {
    if (this._tradeData) return this._tradeData;

    const [tradeData] = await Promise.all([
      this.tradeRepo.load({
        closedPositionsPath: this.config.csvPaths.closedPositions,
        tradesPaths: this.config.csvPaths.trades,
        year: this.config.year,
      }),
      this.rateService.load(),
    ]);

    this._tradeData = tradeData;
    return tradeData;
  }

  /**
   * Load cash transaction data if path configured
   */
  async loadCashTransactionData(): Promise<CashTransactionData | null> {
    if (this._cashTransactionData) return this._cashTransactionData;
    if (!this.config.csvPaths.cashTransactions) return null;

    this._cashTransactionData = await this.cashTransactionRepo.load(
      this.config.csvPaths.cashTransactions
    );
    return this._cashTransactionData;
  }

  /**
   * Calculate dividend tax if data available
   */
  async calculateDividendTax(): Promise<DividendTaxResult | undefined> {
    const cashData = await this.loadCashTransactionData();
    if (!cashData) return undefined;
    return calculateDividendTax(cashData, this.rateService);
  }

  /**
   * Calculate tax - returns summary result
   */
  async calculateTax(): Promise<TaxSummary> {
    const [{ closedPositions, buyTradesMap, sellTrades }, cashData] = await Promise.all([
      this.loadData(),
      this.loadCashTransactionData(),
    ]);

    const dividendTax = cashData
      ? calculateDividendTax(cashData, this.rateService)
      : undefined;

    const profits = calculateProfits(closedPositions, this.rateService);
    const buyFees = calculateBuyFees(
      closedPositions,
      buyTradesMap,
      this.rateService
    );
    const sellFees = calculateSellFees(sellTrades, this.rateService);

    const { taxableBase, taxOwed } = calculateTax(
      profits.totalPln,
      buyFees.totalPln,
      sellFees.totalPln,
      this.config.taxRate
    );

    const totalTaxOwed = taxOwed + (dividendTax?.taxOwedPln ?? 0);

    return {
      year: this.config.year,
      currency: 'PLN',
      profits: profits.totalPln,
      buyFees: buyFees.totalPln,
      sellFees: sellFees.totalPln,
      taxableBase,
      taxRate: this.config.taxRate,
      taxOwed,
      profitsUSD: profits.totalUsd,
      buyFeesUSD: buyFees.totalUsd,
      sellFeesUSD: sellFees.totalUsd,
      dividendTax,
      totalTaxOwed,
    };
  }

  /**
   * Generate full report with details
   */
  async generateReport(): Promise<TaxReport> {
    const [{ closedPositions, buyTradesMap, sellTrades }, cashData] = await Promise.all([
      this.loadData(),
      this.loadCashTransactionData(),
    ]);

    const dividendTax = cashData
      ? calculateDividendTax(cashData, this.rateService)
      : undefined;

    const profits = calculateProfits(closedPositions, this.rateService);
    const buyFees = calculateBuyFees(
      closedPositions,
      buyTradesMap,
      this.rateService
    );
    const sellFees = calculateSellFees(sellTrades, this.rateService);

    const { taxableBase, taxOwed } = calculateTax(
      profits.totalPln,
      buyFees.totalPln,
      sellFees.totalPln,
      this.config.taxRate
    );

    const totalTaxOwed = taxOwed + (dividendTax?.taxOwedPln ?? 0);

    return {
      year: this.config.year,
      currency: 'PLN',
      profits: profits.totalPln,
      buyFees: buyFees.totalPln,
      sellFees: sellFees.totalPln,
      taxableBase,
      taxRate: this.config.taxRate,
      taxOwed,
      profitsUSD: profits.totalUsd,
      buyFeesUSD: buyFees.totalUsd,
      sellFeesUSD: sellFees.totalUsd,
      dividendTax,
      totalTaxOwed,
      details: {
        profitBreakdown: profits.details,
        buyFeeBreakdown: buyFees.details,
        sellFeeBreakdown: sellFees.details,
      },
    };
  }
}
