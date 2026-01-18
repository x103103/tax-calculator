const { calculateBuyFees } = require('../calculators/buy-fee-calculator');

describe('calculateBuyFees', () => {
  const mockRateService = {
    getRateForPreviousDay: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calculates fees by matching positions to buy trades', async () => {
    mockRateService.getRateForPreviousDay.mockResolvedValue({
      rate: 4.0,
      date: '2024-12-31',
      daysBack: 1
    });

    const positions = [
      { Symbol: 'AAPL', OpenDateTime: '20240101;100000', TransactionID: 'TXN001' }
    ];

    const buyTradesMap = new Map([
      ['TXN001', { Symbol: 'AAPL', IBCommission: '-1.50', TradeDate: '20240101' }]
    ]);

    const result = await calculateBuyFees(positions, buyTradesMap, mockRateService);

    expect(result.totalUsd).toBe(1.50);
    expect(result.totalPln).toBe(6.00);
    expect(result.details).toHaveLength(1);
  });

  it('throws error when buy trade not found', async () => {
    const positions = [
      { Symbol: 'AAPL', OpenDateTime: '20240101;100000', TransactionID: 'TXN999' }
    ];

    const buyTradesMap = new Map(); // Empty map

    await expect(
      calculateBuyFees(positions, buyTradesMap, mockRateService)
    ).rejects.toThrow('Buy trade not found for TransactionID TXN999');
  });

  it('applies Math.abs to commission', async () => {
    mockRateService.getRateForPreviousDay.mockResolvedValue({
      rate: 4.0,
      date: '2024-12-31',
      daysBack: 1
    });

    const positions = [
      { Symbol: 'AAPL', OpenDateTime: '20240101;100000', TransactionID: 'TXN001' }
    ];

    const buyTradesMap = new Map([
      ['TXN001', { Symbol: 'AAPL', IBCommission: '-2.50', TradeDate: '20240101' }]
    ]);

    const result = await calculateBuyFees(positions, buyTradesMap, mockRateService);

    expect(result.totalUsd).toBe(2.50); // Positive, not negative
  });

  it('returns correct detail structure', async () => {
    mockRateService.getRateForPreviousDay.mockResolvedValue({
      rate: 4.0,
      date: '2024-12-31',
      daysBack: 1
    });

    const positions = [
      { Symbol: 'MSFT', OpenDateTime: '20240215;093000', TransactionID: 'TXN002' }
    ];

    const buyTradesMap = new Map([
      ['TXN002', { Symbol: 'MSFT', IBCommission: '-1.00', TradeDate: '20240215' }]
    ]);

    const result = await calculateBuyFees(positions, buyTradesMap, mockRateService);

    expect(result.details[0]).toEqual({
      symbol: 'MSFT',
      buyDate: '2024-02-15',
      feeUsd: 1.00,
      rate: 4.0,
      rateDate: '2024-12-31',
      feePln: 4.00
    });
  });

  it('aggregates multiple positions', async () => {
    mockRateService.getRateForPreviousDay.mockResolvedValue({
      rate: 4.0,
      date: '2024-12-31',
      daysBack: 1
    });

    const positions = [
      { Symbol: 'AAPL', OpenDateTime: '20240101;100000', TransactionID: 'TXN001' },
      { Symbol: 'GOOGL', OpenDateTime: '20240102;110000', TransactionID: 'TXN003' }
    ];

    const buyTradesMap = new Map([
      ['TXN001', { Symbol: 'AAPL', IBCommission: '-1.00', TradeDate: '20240101' }],
      ['TXN003', { Symbol: 'GOOGL', IBCommission: '-2.00', TradeDate: '20240102' }]
    ]);

    const result = await calculateBuyFees(positions, buyTradesMap, mockRateService);

    expect(result.totalUsd).toBe(3.00);
    expect(result.totalPln).toBe(12.00);
    expect(result.details).toHaveLength(2);
  });

  it('handles empty positions array', async () => {
    const result = await calculateBuyFees([], new Map(), mockRateService);

    expect(result.totalUsd).toBe(0);
    expect(result.totalPln).toBe(0);
    expect(result.details).toEqual([]);
  });
});
