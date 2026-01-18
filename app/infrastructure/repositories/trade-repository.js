const { loadCsv } = require('../data/csv-loader');

/**
 * Repository for loading and indexing trade data from CSV files
 */
class TradeRepository {
  /**
   * Load trade data from CSV files
   * @param {Object} config - File paths configuration
   * @param {string} config.closedPositionsPath - Path to closed positions CSV
   * @param {string} config.trades2024Path - Path to 2024 trades CSV
   * @param {string} config.trades2025Path - Path to 2025 trades CSV
   * @returns {Promise<Object>} Indexed trade data
   */
  async load(config) {
    const { closedPositionsPath, trades2024Path, trades2025Path } = config;

    const [closedRaw, trades2024Raw, trades2025Raw] = await Promise.all([
      loadCsv(closedPositionsPath),
      loadCsv(trades2024Path),
      loadCsv(trades2025Path),
    ]);

    const closedPositions = this.#filterTrnt(closedRaw);
    const trades2024 = this.#filterTrnt(trades2024Raw);
    const trades2025 = this.#filterTrnt(trades2025Raw);

    const buyTradesMap = this.#buildBuyTradesMap(trades2024, trades2025);
    const sellTrades = this.#collectSellTrades(trades2025);

    return {
      closedPositions,
      buyTradesMap,
      sellTrades,
    };
  }

  /**
   * Filter records where TRNT === 'TRNT'
   * @param {Object[]} records
   * @returns {Object[]}
   */
  #filterTrnt(records) {
    return records.filter((r) => r.TRNT === 'TRNT');
  }

  /**
   * Build map of buy trades keyed by Symbol_DateTime
   * @param {Object[]} trades2024
   * @param {Object[]} trades2025
   * @returns {Map<string, Object>}
   */
  #buildBuyTradesMap(trades2024, trades2025) {
    const map = new Map();

    const addToMap = (trade) => {
      const key = `${trade.Symbol}_${trade.DateTime}`;
      map.set(key, trade);
    };

    trades2024.forEach(addToMap);
    trades2025.forEach(addToMap);

    return map;
  }

  /**
   * Collect SELL trades from 2025
   * @param {Object[]} trades2025
   * @returns {Object[]}
   */
  #collectSellTrades(trades2025) {
    return trades2025.filter((t) => t['Buy/Sell'] === 'SELL');
  }
}

module.exports = { TradeRepository };
