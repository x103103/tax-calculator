import path from 'path';
import { TaxCalculator } from '../calculator';
import { createConfig } from '../../../config';

const fixturesDir = path.join(__dirname, 'fixtures');
const testConfig = createConfig({
  csvPaths: {
    closed2025: path.join(fixturesDir, 'closed_2025.csv'),
    trades2024: path.join(fixturesDir, 'trades_2024.csv'),
    trades2025: path.join(fixturesDir, 'trades_2025.csv'),
    rates: path.join(fixturesDir, 'rates.csv'),
  },
});

describe('TaxCalculator', () => {
  describe('constructor', () => {
    it('uses default config when none provided', () => {
      const calc = new TaxCalculator();
      expect(calc.config.taxRate).toBe(0.19);
      expect(calc.config.year).toBe(2025);
    });

    it('accepts custom config', () => {
      const custom = createConfig({ taxRate: 0.2, year: 2024 });
      const calc = new TaxCalculator(custom);
      expect(calc.config.taxRate).toBe(0.2);
      expect(calc.config.year).toBe(2024);
    });
  });

  describe('calculateTax', () => {
    it('returns correct structure', async () => {
      const calc = new TaxCalculator(testConfig);
      const result = await calc.calculateTax();

      expect(result).toHaveProperty('year', 2025);
      expect(result).toHaveProperty('currency', 'PLN');
      expect(result).toHaveProperty('profits');
      expect(result).toHaveProperty('buyFees');
      expect(result).toHaveProperty('sellFees');
      expect(result).toHaveProperty('taxableBase');
      expect(result).toHaveProperty('taxRate', 0.19);
      expect(result).toHaveProperty('taxOwed');
      expect(result).toHaveProperty('profitsUSD');
      expect(result).toHaveProperty('buyFeesUSD');
      expect(result).toHaveProperty('sellFeesUSD');
    });

    it('calculates correct USD totals', async () => {
      const calc = new TaxCalculator(testConfig);
      const result = await calc.calculateTax();

      // 2 TRNT closed positions: 100.50 + 250.00
      expect(result.profitsUSD).toBe(350.5);
      // Buy fees: 1.50 (AAPL 2024) + 2.00 (GOOG 2025)
      expect(result.buyFeesUSD).toBe(3.5);
      // Sell fees: 1.25 (AAPL) + 1.75 (GOOG)
      expect(result.sellFeesUSD).toBe(3.0);
    });

    it('applies 19% tax rate', async () => {
      const calc = new TaxCalculator(testConfig);
      const result = await calc.calculateTax();

      const expectedBase = result.profits - result.buyFees - result.sellFees;
      expect(result.taxableBase).toBeCloseTo(expectedBase, 2);
      expect(result.taxOwed).toBeCloseTo(expectedBase * 0.19, 2);
    });
  });

  describe('generateReport', () => {
    it('includes detail breakdowns', async () => {
      const calc = new TaxCalculator(testConfig);
      const result = await calc.generateReport();

      expect(result).toHaveProperty('details');
      expect(result.details).toHaveProperty('profitBreakdown');
      expect(result.details).toHaveProperty('buyFeeBreakdown');
      expect(result.details).toHaveProperty('sellFeeBreakdown');
    });

    it('profit breakdown has correct entries', async () => {
      const calc = new TaxCalculator(testConfig);
      const result = await calc.generateReport();

      expect(result.details.profitBreakdown).toHaveLength(2);
      expect(result.details.profitBreakdown[0]).toMatchObject({
        symbol: 'AAPL',
        profitUsd: 100.5,
      });
    });

    it('buy fee breakdown matches closed positions', async () => {
      const calc = new TaxCalculator(testConfig);
      const result = await calc.generateReport();

      // Should have 2 buy fee entries (one per closed position)
      expect(result.details.buyFeeBreakdown).toHaveLength(2);
    });

    it('sell fee breakdown includes only 2025 sells', async () => {
      const calc = new TaxCalculator(testConfig);
      const result = await calc.generateReport();

      // 2 TRNT sells in 2025 (AAPL, GOOG)
      expect(result.details.sellFeeBreakdown).toHaveLength(2);
    });
  });

  describe('error handling', () => {
    it('throws on missing CSV file', async () => {
      const badConfig = createConfig({
        csvPaths: {
          closed2025: '/nonexistent/closed.csv',
          trades2024: '/nonexistent/2024.csv',
          trades2025: '/nonexistent/2025.csv',
          rates: '/nonexistent/rates.csv',
        },
      });
      const calc = new TaxCalculator(badConfig);
      await expect(calc.calculateTax()).rejects.toThrow();
    });
  });
});
