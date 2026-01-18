jest.mock('../../data/csv-loader');

const { loadCsv } = require('../../data/csv-loader');
const { TradeRepository } = require('../trade-repository');

describe('TradeRepository', () => {
  let repo;
  const config = {
    closedPositionsPath: '/data/closed_2025.csv',
    trades2024Path: '/data/trades_2024.csv',
    trades2025Path: '/data/trades_2025.csv',
  };

  beforeEach(() => {
    repo = new TradeRepository();
    jest.clearAllMocks();
  });

  describe('load', () => {
    it('loads all 3 CSV files', async () => {
      loadCsv.mockResolvedValue([]);

      await repo.load(config);

      expect(loadCsv).toHaveBeenCalledTimes(3);
      expect(loadCsv).toHaveBeenCalledWith(config.closedPositionsPath);
      expect(loadCsv).toHaveBeenCalledWith(config.trades2024Path);
      expect(loadCsv).toHaveBeenCalledWith(config.trades2025Path);
    });

    it('filters by TRNT === "TRNT"', async () => {
      const closedData = [
        { Symbol: 'GOOG', TRNT: 'TRNT' },
        { Symbol: 'AAPL', TRNT: 'OTHER' },
        { Symbol: 'MSFT', TRNT: 'TRNT' },
      ];
      const trades2024 = [{ Symbol: 'AMD', TRNT: 'SKIP' }];
      const trades2025 = [{ Symbol: 'NVDA', TRNT: 'TRNT' }];

      loadCsv
        .mockResolvedValueOnce(closedData)
        .mockResolvedValueOnce(trades2024)
        .mockResolvedValueOnce(trades2025);

      const result = await repo.load(config);

      expect(result.closedPositions).toHaveLength(2);
      expect(result.closedPositions.map((p) => p.Symbol)).toEqual(['GOOG', 'MSFT']);
    });

    it('builds buyTradesMap with TransactionID key', async () => {
      const closedData = [];
      const trades2024 = [
        { Symbol: 'GOOG', DateTime: '20240101', TransactionID: 'TXN001', TRNT: 'TRNT', 'Buy/Sell': 'BUY' },
        { Symbol: 'AAPL', DateTime: '20240615', TransactionID: 'TXN002', TRNT: 'TRNT', 'Buy/Sell': 'BUY' },
      ];
      const trades2025 = [
        { Symbol: 'MSFT', DateTime: '20250110', TransactionID: 'TXN003', TRNT: 'TRNT', 'Buy/Sell': 'BUY' },
      ];

      loadCsv
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
      ];
      const trades2025 = [
        { Symbol: 'GOOG', DateTime: '20240101', TransactionID: 'TXN001', TRNT: 'TRNT', source: '2025' },
      ];

      loadCsv
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(trades2024)
        .mockResolvedValueOnce(trades2025);

      const result = await repo.load(config);

      expect(result.buyTradesMap.get('TXN001').source).toBe('2025');
    });

    it('collects SELL trades from 2025 only', async () => {
      const trades2024 = [
        { Symbol: 'OLD', DateTime: '20240101', TRNT: 'TRNT', 'Buy/Sell': 'SELL' },
      ];
      const trades2025 = [
        { Symbol: 'GOOG', DateTime: '20250115', TRNT: 'TRNT', 'Buy/Sell': 'SELL' },
        { Symbol: 'AAPL', DateTime: '20250116', TRNT: 'TRNT', 'Buy/Sell': 'BUY' },
        { Symbol: 'MSFT', DateTime: '20250117', TRNT: 'TRNT', 'Buy/Sell': 'SELL' },
      ];

      loadCsv
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(trades2024)
        .mockResolvedValueOnce(trades2025);

      const result = await repo.load(config);

      expect(result.sellTrades).toHaveLength(2);
      expect(result.sellTrades.map((t) => t.Symbol)).toEqual(['GOOG', 'MSFT']);
    });

    it('returns all three data structures', async () => {
      loadCsv.mockResolvedValue([]);

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
      loadCsv.mockRejectedValue(error);

      await expect(repo.load(config)).rejects.toThrow('File not found');
    });
  });
});
