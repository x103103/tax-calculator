import type { CashTransactionData, CashTransactionRow, IRateService } from '../../types';
import { calculateDividendTax } from '../calculators/dividend-tax-calculator';

describe('calculateDividendTax', () => {
  const mockRateService = {
    getRateForPreviousDay: jest.fn(),
    load: jest.fn(),
    getRate: jest.fn(),
    reload: jest.fn(),
  } as unknown as jest.Mocked<IRateService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRateService.getRateForPreviousDay.mockReturnValue({
      rate: 4.0,
      date: '2025-01-14',
      daysBack: 1,
    });
  });

  const makeRow = (overrides: Partial<CashTransactionRow>): CashTransactionRow => ({
    Symbol: 'AAPL',
    Description: '',
    'Date/Time': '20250115;080000',
    Amount: '0',
    Type: 'Dividends',
    ...overrides,
  });

  describe('dividends', () => {
    it('sums dividends and converts to PLN', () => {
      const data: CashTransactionData = {
        dividends: [
          makeRow({ Symbol: 'AAPL', Amount: '100', 'Date/Time': '20250115;080000' }),
          makeRow({ Symbol: 'GOOG', Amount: '50', 'Date/Time': '20250116;080000' }),
        ],
        withholdingTax: [],
        brokerInterest: [],
      };

      const result = calculateDividendTax(data, mockRateService);

      expect(result.dividends.totalUsd).toBe(150);
      expect(result.dividends.totalPln).toBe(600);
      expect(result.dividends.details).toHaveLength(2);
    });

    it('returns detail with correct structure', () => {
      const data: CashTransactionData = {
        dividends: [makeRow({ Symbol: 'MSFT', Amount: '25', 'Date/Time': '20250120;103000' })],
        withholdingTax: [],
        brokerInterest: [],
      };

      const result = calculateDividendTax(data, mockRateService);

      expect(result.dividends.details[0]).toEqual({
        symbol: 'MSFT',
        date: '2025-01-20',
        amountUsd: 25,
        rate: 4.0,
        rateDate: '2025-01-14',
        amountPln: 100,
      });
    });
  });

  describe('withholding tax', () => {
    it('sums withholding tax (negative amounts)', () => {
      const data: CashTransactionData = {
        dividends: [],
        withholdingTax: [
          makeRow({ Symbol: 'AAPL', Amount: '-15', Type: 'Withholding Tax' }),
          makeRow({ Symbol: 'GOOG', Amount: '-7.5', Type: 'Withholding Tax' }),
        ],
        brokerInterest: [],
      };

      const result = calculateDividendTax(data, mockRateService);

      expect(result.withholdingTax.totalUsd).toBe(-22.5);
      expect(result.withholdingTax.totalPln).toBe(-90);
      expect(result.withholdingCreditPln).toBe(90);
    });
  });

  describe('broker interest', () => {
    it('sums broker interest and converts to PLN', () => {
      const data: CashTransactionData = {
        dividends: [],
        withholdingTax: [],
        brokerInterest: [
          makeRow({ Symbol: '', Amount: '0.19', Type: 'Broker Interest Received' }),
        ],
      };

      const result = calculateDividendTax(data, mockRateService);

      expect(result.brokerInterest.totalUsd).toBeCloseTo(0.19);
      expect(result.brokerInterest.totalPln).toBeCloseTo(0.76);
    });

    it('broker interest detail has no symbol', () => {
      const data: CashTransactionData = {
        dividends: [],
        withholdingTax: [],
        brokerInterest: [makeRow({ Amount: '1', 'Date/Time': '20250201' })],
      };

      const result = calculateDividendTax(data, mockRateService);

      expect(result.brokerInterest.details[0]).toEqual({
        date: '2025-02-01',
        amountUsd: 1,
        rate: 4.0,
        rateDate: '2025-01-14',
        amountPln: 4,
      });
    });
  });

  describe('tax calculation', () => {
    it('calculates 19% tax on dividends and interest', () => {
      const data: CashTransactionData = {
        dividends: [makeRow({ Amount: '100' })],
        withholdingTax: [],
        brokerInterest: [makeRow({ Amount: '10' })],
      };

      const result = calculateDividendTax(data, mockRateService);

      expect(result.dividendTaxPln).toBeCloseTo(76); // 100 * 4 * 0.19
      expect(result.interestTaxPln).toBeCloseTo(7.6); // 10 * 4 * 0.19
    });

    it('subtracts withholding tax from total', () => {
      const data: CashTransactionData = {
        dividends: [makeRow({ Amount: '100' })],
        withholdingTax: [makeRow({ Amount: '-15' })],
        brokerInterest: [],
      };

      const result = calculateDividendTax(data, mockRateService);

      // dividendTax = 100 * 4 * 0.19 = 76
      // withholdingCredit = |-15 * 4| = 60
      // taxOwed = 60 - 76 - 0 = -16 (owe 16 PLN)
      expect(result.taxOwedPln).toBeCloseTo(-16);
    });

    it('full scenario with all components', () => {
      const data: CashTransactionData = {
        dividends: [makeRow({ Amount: '236.79' })],
        withholdingTax: [makeRow({ Amount: '-79.03' })],
        brokerInterest: [makeRow({ Amount: '0.19' })],
      };

      const result = calculateDividendTax(data, mockRateService);

      const dividendPln = 236.79 * 4;
      const withholdingPln = -79.03 * 4;
      const interestPln = 0.19 * 4;
      const withholdingCreditPln = Math.abs(withholdingPln);

      expect(result.dividends.totalPln).toBeCloseTo(dividendPln);
      expect(result.withholdingTax.totalPln).toBeCloseTo(withholdingPln);
      expect(result.brokerInterest.totalPln).toBeCloseTo(interestPln);

      const expectedTax = withholdingCreditPln - dividendPln * 0.19 - interestPln * 0.19;
      expect(result.taxOwedPln).toBeCloseTo(expectedTax);
    });
  });

  describe('empty data', () => {
    it('returns zero result for empty data', () => {
      const data: CashTransactionData = {
        dividends: [],
        withholdingTax: [],
        brokerInterest: [],
      };

      const result = calculateDividendTax(data, mockRateService);

      expect(result.dividends.totalUsd).toBe(0);
      expect(result.dividends.totalPln).toBe(0);
      expect(result.withholdingTax.totalUsd).toBe(0);
      expect(result.withholdingTax.totalPln).toBe(0);
      expect(result.brokerInterest.totalUsd).toBe(0);
      expect(result.brokerInterest.totalPln).toBe(0);
      expect(result.dividendTaxPln).toBe(0);
      expect(result.interestTaxPln).toBe(0);
      expect(result.withholdingCreditPln).toBe(0);
      expect(result.taxOwedPln).toBe(0);
    });
  });

  describe('date parsing', () => {
    it('parses date from "YYYYMMDD;HHMMSS" format', () => {
      const data: CashTransactionData = {
        dividends: [makeRow({ Amount: '10', 'Date/Time': '20250315;143000' })],
        withholdingTax: [],
        brokerInterest: [],
      };

      const result = calculateDividendTax(data, mockRateService);

      expect(result.dividends.details[0].date).toBe('2025-03-15');
    });

    it('parses date from "YYYYMMDD" format', () => {
      const data: CashTransactionData = {
        dividends: [makeRow({ Amount: '10', 'Date/Time': '20250315' })],
        withholdingTax: [],
        brokerInterest: [],
      };

      const result = calculateDividendTax(data, mockRateService);

      expect(result.dividends.details[0].date).toBe('2025-03-15');
    });
  });
});
