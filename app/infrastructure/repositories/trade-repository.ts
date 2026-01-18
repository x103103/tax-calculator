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
  async load(config: TradeRepositoryConfig): Promise<TradeData> {
    const { closedPositionsPath, trades2024Path, trades2025Path } = config;

    const [closedRaw, trades2024Raw, trades2025Raw] = await Promise.all([
      loadCsv<ClosedPositionRow>(closedPositionsPath),
      loadCsv<TradeRow>(trades2024Path),
      loadCsv<TradeRow>(trades2025Path),
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
   */
  #filterTrnt<T extends { TRNT: string }>(records: T[]): T[] {
    return records.filter((r) => r.TRNT === 'TRNT');
  }

  /**
   * Build map of buy trades keyed by Symbol_DateTime
   */
  #buildBuyTradesMap(
    trades2024: TradeRow[],
    trades2025: TradeRow[]
  ): Map<string, TradeRow> {
    const map = new Map<string, TradeRow>();

    const addToMap = (trade: TradeRow): void => {
      const key = `${trade.Symbol}_${trade.DateTime}`;
      map.set(key, trade);
    };

    trades2024.forEach(addToMap);
    trades2025.forEach(addToMap);

    return map;
  }

  /**
   * Collect SELL trades from 2025
   */
  #collectSellTrades(trades2025: TradeRow[]): TradeRow[] {
    return trades2025.filter((t) => t['Buy/Sell'] === 'SELL');
  }
}
