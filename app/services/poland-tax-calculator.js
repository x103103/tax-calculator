const fs = require('fs');
const path = require('path');
const { getRateForPreviousDay } = require('./usd-pln-rate');

/**
 * Poland Tax Calculator for 2025
 * Calculates taxes on stock trading profits according to Polish tax law
 *
 * Formula: ((sum of profit) - (sum of buy fees) - (sum of sell fees)) * 19%
 */
class PolandTaxCalculator {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data/spreadsheet-tabs');
    this.closed2025Path = path.join(this.dataDir, 'closed_2025.csv');
    this.trades2024Path = path.join(this.dataDir, 'trades_2024.csv');
    this.trades2025Path = path.join(this.dataDir, 'trades_2025.csv');

    this.closedPositions = [];
    this.buyTrades = new Map(); // Map by OpenDateTime for quick lookup
    this.sellTrades = [];
  }

  /**
   * Parse CSV line into object
   * @param {string} line - CSV line
   * @param {Array} headers - Array of header names
   * @returns {Object} Parsed object
   */
  parseCsvLine(line, headers) {
    const values = line.split(',');
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    return obj;
  }

  /**
   * Convert YYYYMMDD format to YYYY-MM-DD format
   * @param {string} dateStr - Date in YYYYMMDD format
   * @returns {string} Date in YYYY-MM-DD format
   */
  formatDate(dateStr) {
    if (!dateStr || dateStr.length < 8) {
      return dateStr;
    }
    // Handle format like "20250122" -> "2025-01-22"
    const cleanDate = dateStr.split(';')[0]; // Remove time part if present
    if (cleanDate.length === 8) {
      return `${cleanDate.substring(0, 4)}-${cleanDate.substring(4, 6)}-${cleanDate.substring(6, 8)}`;
    }
    return cleanDate;
  }

  /**
   * Load all required data files
   */
  loadData() {
    console.log('Loading trading data...\n');

    // Load closed positions (2025)
    const closedData = fs.readFileSync(this.closed2025Path, 'utf-8');
    const closedLines = closedData.trim().split('\n');
    const closedHeaders = closedLines[0].split(',');

    for (let i = 1; i < closedLines.length; i++) {
      const position = this.parseCsvLine(closedLines[i], closedHeaders);
      if (position.TRNT === 'TRNT') {
        this.closedPositions.push(position);
      }
    }
    console.log(`✓ Loaded ${this.closedPositions.length} closed positions from 2025`);

    // Load 2024 trades
    const trades2024Data = fs.readFileSync(this.trades2024Path, 'utf-8');
    const trades2024Lines = trades2024Data.trim().split('\n');
    const trades2024Headers = trades2024Lines[0].split(',');

    for (let i = 1; i < trades2024Lines.length; i++) {
      const trade = this.parseCsvLine(trades2024Lines[i], trades2024Headers);
      if (trade.TRNT === 'TRNT') {
        const key = `${trade.Symbol}_${trade.DateTime}`;
        this.buyTrades.set(key, trade);
      }
    }

    // Load 2025 trades
    const trades2025Data = fs.readFileSync(this.trades2025Path, 'utf-8');
    const trades2025Lines = trades2025Data.trim().split('\n');
    const trades2025Headers = trades2025Lines[0].split(',');

    for (let i = 1; i < trades2025Lines.length; i++) {
      const trade = this.parseCsvLine(trades2025Lines[i], trades2025Headers);
      if (trade.TRNT === 'TRNT') {
        const key = `${trade.Symbol}_${trade.DateTime}`;
        this.buyTrades.set(key, trade);

        // Collect SELL trades
        if (trade['Buy/Sell'] === 'SELL') {
          this.sellTrades.push(trade);
        }
      }
    }

    console.log(`✓ Loaded ${this.buyTrades.size} total trades (2024 + 2025)`);
    console.log(`✓ Found ${this.sellTrades.length} sell trades in 2025\n`);
  }

  /**
   * Calculate total profits in PLN
   * @returns {Object} Breakdown of profits with PLN conversion
   */
  calculateProfits() {
    let totalProfitUSD = 0;
    let totalProfitPLN = 0;
    const profitDetails = [];

    console.log('=== CALCULATING PROFITS ===\n');

    for (const position of this.closedPositions) {
      const symbol = position.Symbol;
      const profitUSD = parseFloat(position.FifoPnlRealized) || 0;
      const tradeDate = this.formatDate(position.TradeDate);

      // Get PLN rate for previous day
      const rateInfo = getRateForPreviousDay(tradeDate);
      const profitPLN = profitUSD * rateInfo.rate;

      totalProfitUSD += profitUSD;
      totalProfitPLN += profitPLN;

      profitDetails.push({
        symbol,
        tradeDate,
        profitUSD,
        rate: rateInfo.rate,
        rateDate: rateInfo.date,
        profitPLN
      });
    }

    console.log(`Total Profit: $${totalProfitUSD.toFixed(2)} USD`);
    console.log(`Total Profit: ${totalProfitPLN.toFixed(2)} PLN\n`);

    return {
      totalProfitUSD,
      totalProfitPLN,
      details: profitDetails
    };
  }

  /**
   * Calculate buy fees in PLN
   * @returns {Object} Breakdown of buy fees with PLN conversion
   */
  calculateBuyFees() {
    let totalBuyFeesUSD = 0;
    let totalBuyFeesPLN = 0;
    const feeDetails = [];

    console.log('=== CALCULATING BUY FEES ===\n');

    for (const position of this.closedPositions) {
      const symbol = position.Symbol;
      const openDateTime = position.OpenDateTime;

      // Find the corresponding buy trade
      const key = `${symbol}_${openDateTime}`;
      const buyTrade = this.buyTrades.get(key);

      if (!buyTrade) {
        console.warn(`⚠ Warning: Could not find buy trade for ${symbol} at ${openDateTime}`);
        continue;
      }

      const feeUSD = Math.abs(parseFloat(buyTrade.IBCommission) || 0);
      const buyDate = this.formatDate(buyTrade.TradeDate);

      // Get PLN rate for previous day of buy date
      const rateInfo = getRateForPreviousDay(buyDate);
      const feePLN = feeUSD * rateInfo.rate;

      totalBuyFeesUSD += feeUSD;
      totalBuyFeesPLN += feePLN;

      feeDetails.push({
        symbol,
        buyDate,
        feeUSD,
        rate: rateInfo.rate,
        rateDate: rateInfo.date,
        feePLN
      });
    }

    console.log(`Total Buy Fees: $${totalBuyFeesUSD.toFixed(2)} USD`);
    console.log(`Total Buy Fees: ${totalBuyFeesPLN.toFixed(2)} PLN\n`);

    return {
      totalBuyFeesUSD,
      totalBuyFeesPLN,
      details: feeDetails
    };
  }

  /**
   * Calculate sell fees in PLN
   * @returns {Object} Breakdown of sell fees with PLN conversion
   */
  calculateSellFees() {
    let totalSellFeesUSD = 0;
    let totalSellFeesPLN = 0;
    const feeDetails = [];

    console.log('=== CALCULATING SELL FEES ===\n');

    for (const trade of this.sellTrades) {
      const symbol = trade.Symbol;
      const feeUSD = Math.abs(parseFloat(trade.IBCommission) || 0);
      const sellDate = this.formatDate(trade.TradeDate);

      // Get PLN rate for previous day of sell date
      const rateInfo = getRateForPreviousDay(sellDate);
      const feePLN = feeUSD * rateInfo.rate;

      totalSellFeesUSD += feeUSD;
      totalSellFeesPLN += feePLN;

      feeDetails.push({
        symbol,
        sellDate,
        feeUSD,
        rate: rateInfo.rate,
        rateDate: rateInfo.date,
        feePLN
      });
    }

    console.log(`Total Sell Fees: $${totalSellFeesUSD.toFixed(2)} USD`);
    console.log(`Total Sell Fees: ${totalSellFeesPLN.toFixed(2)} PLN\n`);

    return {
      totalSellFeesUSD,
      totalSellFeesPLN,
      details: feeDetails
    };
  }

  /**
   * Calculate total tax owed in Poland
   * @returns {Object} Tax calculation breakdown
   */
  calculateTax() {
    this.loadData();

    const profits = this.calculateProfits();
    const buyFees = this.calculateBuyFees();
    const sellFees = this.calculateSellFees();

    console.log('=== TAX CALCULATION ===\n');

    // Calculate taxable base in PLN
    const taxableBasePLN = profits.totalProfitPLN - buyFees.totalBuyFeesPLN - sellFees.totalSellFeesPLN;
    const taxRate = 0.19; // 19% tax rate in Poland
    const taxOwedPLN = taxableBasePLN * taxRate;

    console.log('Formula: ((Profit) - (Buy Fees) - (Sell Fees)) × 19%\n');
    console.log(`Profit:          ${profits.totalProfitPLN.toFixed(2)} PLN`);
    console.log(`Buy Fees:      - ${buyFees.totalBuyFeesPLN.toFixed(2)} PLN`);
    console.log(`Sell Fees:     - ${sellFees.totalSellFeesPLN.toFixed(2)} PLN`);
    console.log(`${'='.repeat(50)}`);
    console.log(`Taxable Base:    ${taxableBasePLN.toFixed(2)} PLN`);
    console.log(`Tax Rate:        19%`);
    console.log(`${'='.repeat(50)}`);
    console.log(`TAX OWED:        ${taxOwedPLN.toFixed(2)} PLN`);
    console.log(`${'='.repeat(50)}\n`);

    return {
      year: 2025,
      currency: 'PLN',
      profits: profits.totalProfitPLN,
      buyFees: buyFees.totalBuyFeesPLN,
      sellFees: sellFees.totalSellFeesPLN,
      taxableBase: taxableBasePLN,
      taxRate: taxRate,
      taxOwed: taxOwedPLN,
      profitsUSD: profits.totalProfitUSD,
      buyFeesUSD: buyFees.totalBuyFeesUSD,
      sellFeesUSD: sellFees.totalSellFeesUSD,
      details: {
        profitBreakdown: profits.details,
        buyFeeBreakdown: buyFees.details,
        sellFeeBreakdown: sellFees.details
      }
    };
  }

  /**
   * Generate a detailed tax report
   * @returns {Object} Complete tax report
   */
  generateReport() {
    const taxCalculation = this.calculateTax();

    console.log('=== SUMMARY ===\n');
    console.log(`Closed Positions: ${this.closedPositions.length}`);
    console.log(`Buy Transactions: ${taxCalculation.details.buyFeeBreakdown.length}`);
    console.log(`Sell Transactions: ${this.sellTrades.length}\n`);

    console.log('USD Amounts:');
    console.log(`  Profit:     $${taxCalculation.profitsUSD.toFixed(2)}`);
    console.log(`  Buy Fees:   $${taxCalculation.buyFeesUSD.toFixed(2)}`);
    console.log(`  Sell Fees:  $${taxCalculation.sellFeesUSD.toFixed(2)}\n`);

    console.log('PLN Amounts (converted at previous day rates):');
    console.log(`  Profit:     ${taxCalculation.profits.toFixed(2)} PLN`);
    console.log(`  Buy Fees:   ${taxCalculation.buyFees.toFixed(2)} PLN`);
    console.log(`  Sell Fees:  ${taxCalculation.sellFees.toFixed(2)} PLN\n`);

    return taxCalculation;
  }
}

// Create a singleton instance
const taxCalculator = new PolandTaxCalculator();

module.exports = {
  PolandTaxCalculator,
  taxCalculator,
  calculateTax: () => taxCalculator.calculateTax(),
  generateReport: () => taxCalculator.generateReport()
};
