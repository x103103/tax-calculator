/**
 * Tax Calculator Orchestrator
 * Coordinates all layers to calculate Polish tax on trading profits
 */

import { defaultConfig } from '../../config';
import { calculateBuyFees } from '../../domain/calculators/buy-fee-calculator';
import { calculateProfits } from '../../domain/calculators/profit-calculator';
import { calculateSellFees } from '../../domain/calculators/sell-fee-calculator';
import { calculateTax } from '../../domain/calculators/tax-calculator';
import { TradeRepository } from '../../infrastructure/repositories/trade-repository';
import { UsdPlnRateService } from '../../infrastructure/services/usd-pln-rate';
import type {
  TaxConfig,
  TaxSummary,
  TaxReport,
  TradeData,
} from '../../types';

export class TaxCalculator {
  config: TaxConfig;
  private _tradeRepo: TradeRepository | null = null;
  private _rateService: UsdPlnRateService | null = null;
  private _tradeData: TradeData | null = null;

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
        closedPositionsPath: this.config.csvPaths.closed2025,
        trades2024Path: this.config.csvPaths.trades2024,
        trades2025Path: this.config.csvPaths.trades2025,
      }),
      this.rateService.load(),
    ]);

    this._tradeData = tradeData;
    return tradeData;
  }

  /**
   * Calculate tax - returns summary result
   */
  async calculateTax(): Promise<TaxSummary> {
    const { closedPositions, buyTradesMap, sellTrades } = await this.loadData();

    const profits = await calculateProfits(closedPositions, this.rateService);
    const buyFees = await calculateBuyFees(
      closedPositions,
      buyTradesMap,
      this.rateService
    );
    const sellFees = await calculateSellFees(sellTrades, this.rateService);

    const { taxableBase, taxOwed } = calculateTax(
      profits.totalPln,
      buyFees.totalPln,
      sellFees.totalPln,
      this.config.taxRate
    );

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
    };
  }

  /**
   * Generate full report with details
   */
  async generateReport(): Promise<TaxReport> {
    const { closedPositions, buyTradesMap, sellTrades } = await this.loadData();

    const profits = await calculateProfits(closedPositions, this.rateService);
    const buyFees = await calculateBuyFees(
      closedPositions,
      buyTradesMap,
      this.rateService
    );
    const sellFees = await calculateSellFees(sellTrades, this.rateService);

    const { taxableBase, taxOwed } = calculateTax(
      profits.totalPln,
      buyFees.totalPln,
      sellFees.totalPln,
      this.config.taxRate
    );

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
      details: {
        profitBreakdown: profits.details,
        buyFeeBreakdown: buyFees.details,
        sellFeeBreakdown: sellFees.details,
      },
    };
  }
}
