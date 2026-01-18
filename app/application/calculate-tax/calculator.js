/**
 * Tax Calculator Orchestrator
 * Coordinates all layers to calculate Polish tax on trading profits
 */

const { TradeRepository } = require('../../infrastructure/repositories/trade-repository');
const { UsdPlnRateService } = require('../../infrastructure/services/usd-pln-rate');
const { calculateProfits } = require('../../domain/calculators/profit-calculator');
const { calculateBuyFees } = require('../../domain/calculators/buy-fee-calculator');
const { calculateSellFees } = require('../../domain/calculators/sell-fee-calculator');
const { calculateTax } = require('../../domain/calculators/tax-calculator');
const { defaultConfig } = require('../../config');

class TaxCalculator {
  constructor(config = defaultConfig) {
    this.config = config;
    this._tradeRepo = null;
    this._rateService = null;
    this._tradeData = null;
  }

  /**
   * Lazy-init trade repository
   */
  get tradeRepo() {
    if (!this._tradeRepo) {
      this._tradeRepo = new TradeRepository();
    }
    return this._tradeRepo;
  }

  /**
   * Lazy-init rate service
   */
  get rateService() {
    if (!this._rateService) {
      this._rateService = new UsdPlnRateService(this.config.csvPaths.rates);
    }
    return this._rateService;
  }

  /**
   * Load all data from CSV files
   */
  async loadData() {
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
  async calculateTax() {
    const { closedPositions, buyTradesMap, sellTrades } = await this.loadData();

    const profits = await calculateProfits(closedPositions, this.rateService);
    const buyFees = await calculateBuyFees(closedPositions, buyTradesMap, this.rateService);
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
  async generateReport() {
    const { closedPositions, buyTradesMap, sellTrades } = await this.loadData();

    const profits = await calculateProfits(closedPositions, this.rateService);
    const buyFees = await calculateBuyFees(closedPositions, buyTradesMap, this.rateService);
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

module.exports = { TaxCalculator };
