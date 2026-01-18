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
      { Symbol: 'AAPL', OpenDateTime: '20240101;100000', TransactionID: 'TXN001' }
    ] as ClosedPositionRow[];

    const buyTradesMap = new Map<string, TradeRow>([
      ['TXN001', { Symbol: 'AAPL', IBCommission: '-1.50', TradeDate: '20240101' } as TradeRow]
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
      { Symbol: 'AAPL', OpenDateTime: '20240101;100000', TransactionID: 'TXN001' }
    ] as ClosedPositionRow[];

    const buyTradesMap = new Map<string, TradeRow>([
      ['TXN001', { Symbol: 'AAPL', IBCommission: '-2.50', TradeDate: '20240101' } as TradeRow]
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
      { Symbol: 'MSFT', OpenDateTime: '20240215;093000', TransactionID: 'TXN002' }
    ] as ClosedPositionRow[];

    const buyTradesMap = new Map<string, TradeRow>([
      ['TXN002', { Symbol: 'MSFT', IBCommission: '-1.00', TradeDate: '20240215' } as TradeRow]
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
      { Symbol: 'AAPL', OpenDateTime: '20240101;100000', TransactionID: 'TXN001' },
      { Symbol: 'GOOGL', OpenDateTime: '20240102;110000', TransactionID: 'TXN003' }
    ] as ClosedPositionRow[];

    const buyTradesMap = new Map<string, TradeRow>([
      ['TXN001', { Symbol: 'AAPL', IBCommission: '-1.00', TradeDate: '20240101' } as TradeRow],
      ['TXN003', { Symbol: 'GOOGL', IBCommission: '-2.00', TradeDate: '20240102' } as TradeRow]
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
});
