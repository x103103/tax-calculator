import { ClosedPositionRow, TradeRow, TradeRepositoryConfig } from '../../../types';
import { loadCsv } from '../../data/csv-loader';
import { TradeRepository } from '../trade-repository';

jest.mock('../../data/csv-loader');

describe('TradeRepository', () => {
  let repo: TradeRepository;
  const config: TradeRepositoryConfig = {
    closedPositionsPath: '/data/closed_2025.csv',
    trades2024Path: '/data/trades_2024.csv',
    trades2025Path: '/data/trades_2025.csv',
  };

  const mockedLoadCsv = loadCsv as jest.MockedFunction<typeof loadCsv>;

  beforeEach(() => {
    repo = new TradeRepository();
    jest.clearAllMocks();
  });

  describe('load', () => {
    it('loads all 3 CSV files', async () => {
      mockedLoadCsv.mockResolvedValue([]);

      await repo.load(config);

      expect(mockedLoadCsv).toHaveBeenCalledTimes(3);
      expect(mockedLoadCsv).toHaveBeenCalledWith(config.closedPositionsPath);
      expect(mockedLoadCsv).toHaveBeenCalledWith(config.trades2024Path);
      expect(mockedLoadCsv).toHaveBeenCalledWith(config.trades2025Path);
    });

    it('filters by TRNT === "TRNT"', async () => {
      const closedData = [
        { Symbol: 'GOOG', TRNT: 'TRNT' },
        { Symbol: 'AAPL', TRNT: 'OTHER' },
        { Symbol: 'MSFT', TRNT: 'TRNT' },
      ] as ClosedPositionRow[];
      const trades2024 = [{ Symbol: 'AMD', TRNT: 'SKIP' }] as TradeRow[];
      const trades2025 = [{ Symbol: 'NVDA', TRNT: 'TRNT' }] as TradeRow[];

      mockedLoadCsv
        .mockResolvedValueOnce(closedData)
        .mockResolvedValueOnce(trades2024)
        .mockResolvedValueOnce(trades2025);

      const result = await repo.load(config);

      expect(result.closedPositions).toHaveLength(2);
      expect(result.closedPositions.map((p) => p.Symbol)).toEqual(['GOOG', 'MSFT']);
    });

    it('builds buyTradesMap with TransactionID key', async () => {
      const closedData: ClosedPositionRow[] = [];
      const trades2024 = [
        { Symbol: 'GOOG', DateTime: '20240101', TransactionID: 'TXN001', TRNT: 'TRNT', 'Buy/Sell': 'BUY' },
        { Symbol: 'AAPL', DateTime: '20240615', TransactionID: 'TXN002', TRNT: 'TRNT', 'Buy/Sell': 'BUY' },
      ] as TradeRow[];
      const trades2025 = [
        { Symbol: 'MSFT', DateTime: '20250110', TransactionID: 'TXN003', TRNT: 'TRNT', 'Buy/Sell': 'BUY' },
      ] as TradeRow[];

      mockedLoadCsv
        .mockResolvedValueOnce(closedData)
        .mockResolvedValueOnce(trades2024)
        .mockResolvedValueOnce(trades2025);

      const result = await repo.load(config);

      expect(result.buyTradesMap.size).toBe(3);
      expect(result.buyTradesMap.get('TXN001')).toEqual(trades2024[0]);
      expect(result.buyTradesMap.get('TXN002')).toEqual(trades2024[1]);
      expect(result.buyTradesMap.get('TXN003')).toEqual(trades2025[0]);
    });

    it('2025 trades overwrite 2024 in buyTradesMap for same key', async () => {
      const trades2024 = [
        { Symbol: 'GOOG', DateTime: '20240101', TransactionID: 'TXN001', TRNT: 'TRNT', source: '2024' },
      ] as any[];
      const trades2025 = [
        { Symbol: 'GOOG', DateTime: '20240101', TransactionID: 'TXN001', TRNT: 'TRNT', source: '2025' },
      ] as any[];

      mockedLoadCsv
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(trades2024)
        .mockResolvedValueOnce(trades2025);

      const result = await repo.load(config);

      expect(result.buyTradesMap.get('TXN001')?.Symbol).toBe('GOOG');
      expect((result.buyTradesMap.get('TXN001') as unknown as { source: string }).source).toBe('2025');
    });

    it('collects SELL trades from 2025 only', async () => {
      const trades2024 = [
        { Symbol: 'OLD', DateTime: '20240101', TRNT: 'TRNT', 'Buy/Sell': 'SELL' },
      ] as TradeRow[];
      const trades2025 = [
        { Symbol: 'GOOG', DateTime: '20250115', TRNT: 'TRNT', 'Buy/Sell': 'SELL' },
        { Symbol: 'AAPL', DateTime: '20250116', TRNT: 'TRNT', 'Buy/Sell': 'BUY' },
        { Symbol: 'MSFT', DateTime: '20250117', TRNT: 'TRNT', 'Buy/Sell': 'SELL' },
      ] as TradeRow[];

      mockedLoadCsv
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(trades2024)
        .mockResolvedValueOnce(trades2025);

      const result = await repo.load(config);

      expect(result.sellTrades).toHaveLength(2);
      expect(result.sellTrades.map((t) => t.Symbol)).toEqual(['GOOG', 'MSFT']);
    });

    it('returns all three data structures', async () => {
      mockedLoadCsv.mockResolvedValue([]);

      const result = await repo.load(config);

      expect(result).toHaveProperty('closedPositions');
      expect(result).toHaveProperty('buyTradesMap');
      expect(result).toHaveProperty('sellTrades');
      expect(Array.isArray(result.closedPositions)).toBe(true);
      expect(result.buyTradesMap instanceof Map).toBe(true);
      expect(Array.isArray(result.sellTrades)).toBe(true);
    });

    it('propagates CSV loader errors', async () => {
      const error = new Error('File not found');
      mockedLoadCsv.mockRejectedValue(error);

      await expect(repo.load(config)).rejects.toThrow('File not found');
    });
  });
});
