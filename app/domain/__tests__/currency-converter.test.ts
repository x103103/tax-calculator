import { IRateService } from '../../types/index';
import { convertToPlnWithDate, formatDate } from '../services/currency-converter';

describe('formatDate', () => {
  it('converts YYYYMMDD to YYYY-MM-DD', () => {
    expect(formatDate('20250122')).toBe('2025-01-22');
  });

  it('handles date with semicolon timestamp', () => {
    expect(formatDate('20250122;123456')).toBe('2025-01-22');
  });

  it('returns already formatted date unchanged', () => {
    expect(formatDate('2025-01-22')).toBe('2025-01-22');
  });

  it('returns short/invalid input unchanged', () => {
    expect(formatDate('2025')).toBe('2025');
    expect(formatDate('')).toBe('');
    expect(formatDate(null as unknown as string)).toBeNull();
    expect(formatDate(undefined as unknown as string)).toBeUndefined();
  });
});

describe('convertToPlnWithDate', () => {
  const mockRateService = {
    getRateForPreviousDay: jest.fn(),
    load: jest.fn(),
    getRate: jest.fn(),
    reload: jest.fn()
  } as unknown as jest.Mocked<IRateService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('converts USD to PLN using rate service', () => {
    mockRateService.getRateForPreviousDay.mockReturnValue({
      rate: 4.0,
      date: '2025-01-21',
      daysBack: 1
    });

    const result = convertToPlnWithDate(100, '2025-01-22', mockRateService);

    expect(result.amountPln).toBe(400);
    expect(result.rate).toBe(4.0);
    expect(result.rateDate).toBe('2025-01-21');
    expect(result.daysBack).toBe(1);
  });

  it('formats date before lookup', () => {
    mockRateService.getRateForPreviousDay.mockReturnValue({
      rate: 4.0,
      date: '2025-01-21',
      daysBack: 1
    });

    convertToPlnWithDate(100, '20250122', mockRateService);

    expect(mockRateService.getRateForPreviousDay).toHaveBeenCalledWith('2025-01-22'); // eslint-disable-line @typescript-eslint/unbound-method
  });

  it('returns correct metadata', () => {
    mockRateService.getRateForPreviousDay.mockReturnValue({
      rate: 3.95,
      date: '2025-01-19',
      daysBack: 3
    });

    const result = convertToPlnWithDate(50, '2025-01-22', mockRateService);

    expect(result).toEqual({
      amountPln: 197.5,
      rate: 3.95,
      rateDate: '2025-01-19',
      daysBack: 3
    });
  });

  it('propagates rate service errors', () => {
    mockRateService.getRateForPreviousDay.mockImplementation(() => {
      throw new Error('No rate found');
    });

    expect(
      () => convertToPlnWithDate(100, '2025-01-22', mockRateService)
    ).toThrow('No rate found');
  });
});
