const { calculateProfits } = require('../calculators/profit-calculator');

describe('calculateProfits', () => {
  const mockRateService = {
    getRateForPreviousDay: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calculates profits from closed positions', async () => {
    mockRateService.getRateForPreviousDay.mockResolvedValue({
      rate: 4.0,
      date: '2025-01-21',
      daysBack: 1
    });

    const positions = [
      { Symbol: 'AAPL', FifoPnlRealized: '100.50', TradeDate: '20250122' },
      { Symbol: 'GOOGL', FifoPnlRealized: '200.00', TradeDate: '20250123' }
    ];

    const result = await calculateProfits(positions, mockRateService);

    expect(result.totalUsd).toBeCloseTo(300.50);
    expect(result.totalPln).toBeCloseTo(1202.00);
    expect(result.details).toHaveLength(2);
  });

  it('returns details with correct structure', async () => {
    mockRateService.getRateForPreviousDay.mockResolvedValue({
      rate: 4.0,
      date: '2025-01-21',
      daysBack: 1
    });

    const positions = [
      { Symbol: 'MSFT', FifoPnlRealized: '50.00', TradeDate: '20250122' }
    ];

    const result = await calculateProfits(positions, mockRateService);

    expect(result.details[0]).toEqual({
      symbol: 'MSFT',
      tradeDate: '2025-01-22',
      profitUsd: 50,
      rate: 4.0,
      rateDate: '2025-01-21',
      profitPln: 200
    });
  });

  it('handles empty positions array', async () => {
    const result = await calculateProfits([], mockRateService);

    expect(result.totalUsd).toBe(0);
    expect(result.totalPln).toBe(0);
    expect(result.details).toEqual([]);
  });

  it('handles missing/invalid FifoPnlRealized', async () => {
    mockRateService.getRateForPreviousDay.mockResolvedValue({
      rate: 4.0,
      date: '2025-01-21',
      daysBack: 1
    });

    const positions = [
      { Symbol: 'AAPL', FifoPnlRealized: '', TradeDate: '20250122' },
      { Symbol: 'GOOGL', TradeDate: '20250122' }
    ];

    const result = await calculateProfits(positions, mockRateService);

    expect(result.totalUsd).toBe(0);
    expect(result.totalPln).toBe(0);
  });

  it('aggregates totals correctly', async () => {
    mockRateService.getRateForPreviousDay
      .mockResolvedValueOnce({ rate: 4.0, date: '2025-01-21', daysBack: 1 })
      .mockResolvedValueOnce({ rate: 3.9, date: '2025-01-22', daysBack: 1 });

    const positions = [
      { Symbol: 'AAPL', FifoPnlRealized: '100', TradeDate: '20250122' },
      { Symbol: 'GOOGL', FifoPnlRealized: '100', TradeDate: '20250123' }
    ];

    const result = await calculateProfits(positions, mockRateService);

    expect(result.totalUsd).toBe(200);
    expect(result.totalPln).toBe(790); // 100*4.0 + 100*3.9
  });
});
