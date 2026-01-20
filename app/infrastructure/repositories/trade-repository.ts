import type {
  ITradeRepository,
  TradeRepositoryConfig,
  TradeData,
  ClosedPositionRow,
  TradeRow,
} from '../../types';
import { loadCsv } from '../data/csv-loader';

/**
 * Repository for loading and indexing trade data from CSV files
 */
export class TradeRepository implements ITradeRepository {
  /**
   * Load trade data from CSV files
   * @param config - File paths configuration
   * @returns Indexed trade data
   */
  async load(config: TradeRepositoryConfig & { year: number }): Promise<TradeData> {
    const { closedPositionsPath, tradesPaths, year } = config;

    const [closedRaw, ...tradesRaw] = await Promise.all([
      loadCsv<ClosedPositionRow>(closedPositionsPath),
      ...tradesPaths.map((path) => loadCsv<TradeRow>(path)),
    ]);

    const closedPositions = this.#filterTrnt(closedRaw);
    const allTrades = this.#filterTrnt(tradesRaw.flat());

    const buyTradesMap = this.#buildBuyTradesMap(allTrades);
    const sellTrades = this.#collectSellTrades(allTrades, year);

    return {
      closedPositions,
      buyTradesMap,
      sellTrades,
    };
  }

  /**
   * Filter records where TRNT === 'TRNT'
   */
  #filterTrnt<T extends { TRNT: string }>(records: T[]): T[] {
    return records.filter((r) => r.TRNT === 'TRNT');
  }

  /**
   * Build map of buy trades keyed by TransactionID
   */
  #buildBuyTradesMap(allTrades: TradeRow[]): Map<string, TradeRow> {
    const map = new Map<string, TradeRow>();

    const addToMap = (trade: TradeRow): void => {
      const key = trade.TransactionID;
      map.set(key, trade);
    };

    allTrades.forEach(addToMap);

    return map;
  }

  /**
   * Collect SELL trades from the specified year
   */
  #collectSellTrades(allTrades: TradeRow[], year: number): TradeRow[] {
    return allTrades.filter((t) => {
      const tradeYear = new Date(t.TradeDate).getFullYear();
      return t['Buy/Sell'] === 'SELL' && tradeYear === year;
    });
  }
}
