import { calculateProfits } from '../calculators/profit-calculator';
import { ClosedPositionRow, IRateService } from '../../types/index';

describe('calculateProfits', () => {
  const mockRateService = {
    getRateForPreviousDay: jest.fn(),
    load: jest.fn(),
    getRate: jest.fn(),
    reload: jest.fn()
  } as unknown as jest.Mocked<IRateService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calculates profits from closed positions', () => {
    mockRateService.getRateForPreviousDay.mockReturnValue({
      rate: 4.0,
      date: '2025-01-21',
      daysBack: 1
    });

    const positions = [
      { Symbol: 'AAPL', FifoPnlRealized: '100.50', TradeDate: '20250122' },
      { Symbol: 'GOOGL', FifoPnlRealized: '200.00', TradeDate: '20250123' }
    ] as ClosedPositionRow[];

    const result = calculateProfits(positions, mockRateService);

    expect(result.totalUsd).toBeCloseTo(300.50);
    expect(result.totalPln).toBeCloseTo(1202.00);
    expect(result.details).toHaveLength(2);
  });

  it('returns details with correct structure', () => {
    mockRateService.getRateForPreviousDay.mockReturnValue({
      rate: 4.0,
      date: '2025-01-21',
      daysBack: 1
    });

    const positions = [
      { Symbol: 'MSFT', FifoPnlRealized: '50.00', TradeDate: '20250122' }
    ] as ClosedPositionRow[];

    const result = calculateProfits(positions, mockRateService);

    expect(result.details[0]).toEqual({
      symbol: 'MSFT',
      tradeDate: '2025-01-22',
      profitUsd: 50,
      rate: 4.0,
      rateDate: '2025-01-21',
      profitPln: 200
    });
  });

  it('handles empty positions array', () => {
    const result = calculateProfits([], mockRateService);

    expect(result.totalUsd).toBe(0);
    expect(result.totalPln).toBe(0);
    expect(result.details).toEqual([]);
  });

  it('handles missing/invalid FifoPnlRealized', () => {
    mockRateService.getRateForPreviousDay.mockReturnValue({
      rate: 4.0,
      date: '2025-01-21',
      daysBack: 1
    });

    const positions = [
      { Symbol: 'AAPL', FifoPnlRealized: '', TradeDate: '20250122' },
      { Symbol: 'GOOGL', TradeDate: '20250122' }
    ] as ClosedPositionRow[];

    const result = calculateProfits(positions, mockRateService);

    expect(result.totalUsd).toBe(0);
    expect(result.totalPln).toBe(0);
  });

  it('aggregates totals correctly', () => {
    mockRateService.getRateForPreviousDay
      .mockReturnValueOnce({ rate: 4.0, date: '2025-01-21', daysBack: 1 })
      .mockReturnValueOnce({ rate: 3.9, date: '2025-01-22', daysBack: 1 });

    const positions = [
      { Symbol: 'AAPL', FifoPnlRealized: '100', TradeDate: '20250122' },
      { Symbol: 'GOOGL', FifoPnlRealized: '100', TradeDate: '20250123' }
    ] as ClosedPositionRow[];

    const result = calculateProfits(positions, mockRateService);

    expect(result.totalUsd).toBe(200);
    expect(result.totalPln).toBe(790); // 100*4.0 + 100*3.9
  });
});
