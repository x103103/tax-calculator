import { ClosedPositionRow, TradeRow, IRateService } from '../../types/index';
import { calculateBuyFees } from '../calculators/buy-fee-calculator';

describe('calculateBuyFees', () => {
  const mockRateService = {
    getRateForPreviousDay: jest.fn(),
    load: jest.fn(),
    getRate: jest.fn(),
    reload: jest.fn()
  } as unknown as jest.Mocked<IRateService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calculates fees by matching positions to buy trades', () => {
    mockRateService.getRateForPreviousDay.mockReturnValue({
      rate: 4.0,
      date: '2024-12-31',
      daysBack: 1
    });

    const positions = [
      { Symbol: 'AAPL', Quantity: '1', OpenDateTime: '20240101;100000', TransactionID: 'TXN001' }
    ] as unknown as ClosedPositionRow[];

    const buyTradesMap = new Map<string, TradeRow>([
      ['TXN001', { Symbol: 'AAPL', IBCommission: '-1.50', Quantity: '1', TradeDate: '20240101' } as unknown as TradeRow]
    ]);

    const result = calculateBuyFees(positions, buyTradesMap, mockRateService);

    expect(result.totalUsd).toBe(1.50);
    expect(result.totalPln).toBe(6.00);
    expect(result.details).toHaveLength(1);
  });

  it('throws error when buy trade not found', () => {
    const positions = [
      { Symbol: 'AAPL', OpenDateTime: '20240101;100000', TransactionID: 'TXN999' }
    ] as ClosedPositionRow[];

    const buyTradesMap = new Map<string, TradeRow>(); // Empty map

    expect(
      () => calculateBuyFees(positions, buyTradesMap, mockRateService)
    ).toThrow('Buy trade not found for TransactionID TXN999');
  });

  it('applies Math.abs to commission', () => {
    mockRateService.getRateForPreviousDay.mockReturnValue({
      rate: 4.0,
      date: '2024-12-31',
      daysBack: 1
    });

    const positions = [
      { Symbol: 'AAPL', Quantity: '1', OpenDateTime: '20240101;100000', TransactionID: 'TXN001' }
    ] as unknown as ClosedPositionRow[];

    const buyTradesMap = new Map<string, TradeRow>([
      ['TXN001', { Symbol: 'AAPL', IBCommission: '-2.50', Quantity: '1', TradeDate: '20240101' } as unknown as TradeRow]
    ]);

    const result = calculateBuyFees(positions, buyTradesMap, mockRateService);

    expect(result.totalUsd).toBe(2.50); // Positive, not negative
  });

  it('returns correct detail structure', () => {
    mockRateService.getRateForPreviousDay.mockReturnValue({
      rate: 4.0,
      date: '2024-12-31',
      daysBack: 1
    });

    const positions = [
      { Symbol: 'MSFT', Quantity: '1', OpenDateTime: '20240215;093000', TransactionID: 'TXN002' }
    ] as unknown as ClosedPositionRow[];

    const buyTradesMap = new Map<string, TradeRow>([
      ['TXN002', { Symbol: 'MSFT', IBCommission: '-1.00', Quantity: '1', TradeDate: '20240215' } as unknown as TradeRow]
    ]);

    const result = calculateBuyFees(positions, buyTradesMap, mockRateService);

    expect(result.details[0]).toEqual({
      symbol: 'MSFT',
      buyDate: '2024-02-15',
      feeUsd: 1.00,
      rate: 4.0,
      rateDate: '2024-12-31',
      feePln: 4.00
    });
  });

  it('aggregates multiple positions', () => {
    mockRateService.getRateForPreviousDay.mockReturnValue({
      rate: 4.0,
      date: '2024-12-31',
      daysBack: 1
    });

    const positions = [
      { Symbol: 'AAPL', Quantity: '1', OpenDateTime: '20240101;100000', TransactionID: 'TXN001' },
      { Symbol: 'GOOGL', Quantity: '1', OpenDateTime: '20240102;110000', TransactionID: 'TXN003' }
    ] as unknown as ClosedPositionRow[];

    const buyTradesMap = new Map<string, TradeRow>([
      ['TXN001', { Symbol: 'AAPL', IBCommission: '-1.00', Quantity: '1', TradeDate: '20240101' } as unknown as TradeRow],
      ['TXN003', { Symbol: 'GOOGL', IBCommission: '-2.00', Quantity: '1', TradeDate: '20240102' } as unknown as TradeRow]
    ]);

    const result = calculateBuyFees(positions, buyTradesMap, mockRateService);

    expect(result.totalUsd).toBe(3.00);
    expect(result.totalPln).toBe(12.00);
    expect(result.details).toHaveLength(2);
  });

  it('handles empty positions array', () => {
    const result = calculateBuyFees([], new Map(), mockRateService);

    expect(result.totalUsd).toBe(0);
    expect(result.totalPln).toBe(0);
    expect(result.details).toEqual([]);
  });

  it('scales fee proportionally when only part of the position is closed', () => {
    mockRateService.getRateForPreviousDay.mockReturnValue({
      rate: 4.0,
      date: '2024-12-31',
      daysBack: 1
    });

    // Case 1: Multiple partial closes from the same buy trade
    // Buy 100 stocks with $10 fee
    const buyTradesMap = new Map<string, TradeRow>([
      ['TXN001', { Symbol: 'AAPL', IBCommission: '-10.00', Quantity: '100', TradeDate: '2024-01-01' } as unknown as TradeRow],
      ['TXN002', { Symbol: 'MSFT', IBCommission: '-12.00', Quantity: '3', TradeDate: '2024-02-01' } as unknown as TradeRow]
    ]);

    const positions = [
      // Close 20 stocks from TXN001
      { Symbol: 'AAPL', Quantity: '20', OpenDateTime: '20240101;100000', TransactionID: 'TXN001' },
      // Close another 30 stocks from TXN001
      { Symbol: 'AAPL', Quantity: '30', OpenDateTime: '20240101;100000', TransactionID: 'TXN001' },
      // Case 2: Partial close with a different ratio (1 out of 3)
      { Symbol: 'MSFT', Quantity: '1', OpenDateTime: '20240201;100000', TransactionID: 'TXN002' }
    ] as unknown as ClosedPositionRow[];

    const result = calculateBuyFees(positions, buyTradesMap, mockRateService);

    // TXN001: 20/100 * 10 = $2
    // TXN001: 30/100 * 10 = $3
    // TXN002: 1/3 * 12 = $4
    // Total USD: 2 + 3 + 4 = 9
    // Total PLN: 9 * 4 = 36

    expect(result.totalUsd).toBe(9.00);
    expect(result.totalPln).toBe(36.00);
    expect(result.details).toHaveLength(3);
    expect(result.details[0].feeUsd).toBe(2.00);
    expect(result.details[1].feeUsd).toBe(3.00);
    expect(result.details[2].feeUsd).toBe(4.00);
  });
});
