import type { CashTransactionRow } from '../../../types';
import { loadCsv } from '../../data/csv-loader';
import { CashTransactionRepository } from '../cash-transaction-repository';

jest.mock('../../data/csv-loader');

describe('CashTransactionRepository', () => {
  let repo: CashTransactionRepository;
  const csvPath = '/data/cash_transactions.csv';
  const mockedLoadCsv = loadCsv as jest.MockedFunction<typeof loadCsv>;

  beforeEach(() => {
    repo = new CashTransactionRepository();
    jest.clearAllMocks();
  });

  describe('load', () => {
    it('loads CSV file', async () => {
      mockedLoadCsv.mockResolvedValue([]);

      await repo.load(csvPath);

      expect(mockedLoadCsv).toHaveBeenCalledWith(csvPath);
    });

    it('filters dividends by Type', async () => {
      const rows: CashTransactionRow[] = [
        { Symbol: 'AAPL', Description: '', 'Date/Time': '2025-01-15', Amount: '10', Type: 'Dividends' },
        { Symbol: 'GOOG', Description: '', 'Date/Time': '2025-01-16', Amount: '20', Type: 'Dividends' },
        { Symbol: 'MSFT', Description: '', 'Date/Time': '2025-01-17', Amount: '-5', Type: 'Withholding Tax' },
      ];
      mockedLoadCsv.mockResolvedValue(rows);

      const result = await repo.load(csvPath);

      expect(result.dividends).toHaveLength(2);
      expect(result.dividends.map((r) => r.Symbol)).toEqual(['AAPL', 'GOOG']);
    });

    it('filters withholding tax by Type', async () => {
      const rows: CashTransactionRow[] = [
        { Symbol: 'AAPL', Description: '', 'Date/Time': '2025-01-15', Amount: '10', Type: 'Dividends' },
        { Symbol: 'AAPL', Description: '', 'Date/Time': '2025-01-15', Amount: '-1.5', Type: 'Withholding Tax' },
        { Symbol: 'GOOG', Description: '', 'Date/Time': '2025-01-16', Amount: '-2', Type: 'Withholding Tax' },
      ];
      mockedLoadCsv.mockResolvedValue(rows);

      const result = await repo.load(csvPath);

      expect(result.withholdingTax).toHaveLength(2);
      expect(result.withholdingTax.map((r) => r.Amount)).toEqual(['-1.5', '-2']);
    });

    it('filters broker interest by Type', async () => {
      const rows: CashTransactionRow[] = [
        { Symbol: 'AAPL', Description: '', 'Date/Time': '2025-01-15', Amount: '10', Type: 'Dividends' },
        { Symbol: '', Description: '', 'Date/Time': '2025-02-01', Amount: '0.19', Type: 'Broker Interest Received' },
      ];
      mockedLoadCsv.mockResolvedValue(rows);

      const result = await repo.load(csvPath);

      expect(result.brokerInterest).toHaveLength(1);
      expect(result.brokerInterest[0].Amount).toBe('0.19');
    });

    it('returns empty arrays for no matching types', async () => {
      const rows: CashTransactionRow[] = [
        { Symbol: '', Description: '', 'Date/Time': '2025-01-15', Amount: '100', Type: 'Deposit' },
        { Symbol: '', Description: '', 'Date/Time': '2025-01-16', Amount: '-50', Type: 'Withdrawal' },
      ];
      mockedLoadCsv.mockResolvedValue(rows);

      const result = await repo.load(csvPath);

      expect(result.dividends).toEqual([]);
      expect(result.withholdingTax).toEqual([]);
      expect(result.brokerInterest).toEqual([]);
    });

    it('returns all three categories', async () => {
      mockedLoadCsv.mockResolvedValue([]);

      const result = await repo.load(csvPath);

      expect(result).toHaveProperty('dividends');
      expect(result).toHaveProperty('withholdingTax');
      expect(result).toHaveProperty('brokerInterest');
    });

    it('propagates CSV loader errors', async () => {
      const error = new Error('File not found');
      mockedLoadCsv.mockRejectedValue(error);

      await expect(repo.load(csvPath)).rejects.toThrow('File not found');
    });
  });
});
