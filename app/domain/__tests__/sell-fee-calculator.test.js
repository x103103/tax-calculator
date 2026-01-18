const { calculateSellFees } = require('../calculators/sell-fee-calculator');

describe('calculateSellFees', () => {
  const mockRateService = {
    getRateForPreviousDay: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('extracts fees from sell trades', () => {
    mockRateService.getRateForPreviousDay.mockReturnValue({
      rate: 4.0,
      date: '2025-01-21',
      daysBack: 1
    });

    const sellTrades = [
      { Symbol: 'AAPL', IBCommission: '-1.50', TradeDate: '20250122' }
    ];

    const result = calculateSellFees(sellTrades, mockRateService);

    expect(result.totalUsd).toBe(1.50);
    expect(result.totalPln).toBe(6.00);
    expect(result.details).toHaveLength(1);
  });

  it('applies Math.abs to commission', () => {
    mockRateService.getRateForPreviousDay.mockReturnValue({
      rate: 4.0,
      date: '2025-01-21',
      daysBack: 1
    });

    const sellTrades = [
      { Symbol: 'AAPL', IBCommission: '-2.50', TradeDate: '20250122' }
    ];

    const result = calculateSellFees(sellTrades, mockRateService);

    expect(result.totalUsd).toBe(2.50);
  });

  it('returns correct detail structure', () => {
    mockRateService.getRateForPreviousDay.mockReturnValue({
      rate: 3.95,
      date: '2025-01-21',
      daysBack: 1
    });

    const sellTrades = [
      { Symbol: 'MSFT', IBCommission: '-1.00', TradeDate: '20250122' }
    ];

    const result = calculateSellFees(sellTrades, mockRateService);

    expect(result.details[0]).toEqual({
      symbol: 'MSFT',
      sellDate: '2025-01-22',
      feeUsd: 1.00,
      rate: 3.95,
      rateDate: '2025-01-21',
      feePln: 3.95
    });
  });

  it('aggregates multiple trades', () => {
    mockRateService.getRateForPreviousDay
      .mockReturnValueOnce({ rate: 4.0, date: '2025-01-21', daysBack: 1 })
      .mockReturnValueOnce({ rate: 3.9, date: '2025-01-22', daysBack: 1 });

    const sellTrades = [
      { Symbol: 'AAPL', IBCommission: '-1.00', TradeDate: '20250122' },
      { Symbol: 'GOOGL', IBCommission: '-2.00', TradeDate: '20250123' }
    ];

    const result = calculateSellFees(sellTrades, mockRateService);

    expect(result.totalUsd).toBe(3.00);
    expect(result.totalPln).toBeCloseTo(11.80); // 1*4.0 + 2*3.9
    expect(result.details).toHaveLength(2);
  });

  it('handles empty trades array', () => {
    const result = calculateSellFees([], mockRateService);

    expect(result.totalUsd).toBe(0);
    expect(result.totalPln).toBe(0);
    expect(result.details).toEqual([]);
  });

  it('handles missing/invalid IBCommission', () => {
    mockRateService.getRateForPreviousDay.mockReturnValue({
      rate: 4.0,
      date: '2025-01-21',
      daysBack: 1
    });

    const sellTrades = [
      { Symbol: 'AAPL', IBCommission: '', TradeDate: '20250122' },
      { Symbol: 'GOOGL', TradeDate: '20250122' }
    ];

    const result = calculateSellFees(sellTrades, mockRateService);

    expect(result.totalUsd).toBe(0);
    expect(result.totalPln).toBe(0);
  });
});
