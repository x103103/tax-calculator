jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

const fs = require('fs').promises;

const { loadCsv, parseCsvLine } = require('../csv-loader');

describe('csv-loader', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('parseCsvLine', () => {
    it('parses line into object with headers', () => {
      const headers = ['Symbol', 'DateTime', 'Quantity'];
      const line = 'GOOG,20250101,100';

      const result = parseCsvLine(line, headers);

      expect(result).toEqual({
        Symbol: 'GOOG',
        DateTime: '20250101',
        Quantity: '100',
      });
    });

    it('handles missing values with empty strings', () => {
      const headers = ['A', 'B', 'C'];
      const line = 'val1,val2';

      const result = parseCsvLine(line, headers);

      expect(result).toEqual({ A: 'val1', B: 'val2', C: '' });
    });

    it('handles extra values (ignores them)', () => {
      const headers = ['A', 'B'];
      const line = 'val1,val2,val3';

      const result = parseCsvLine(line, headers);

      expect(result).toEqual({ A: 'val1', B: 'val2' });
    });
  });

  describe('loadCsv', () => {
    it('loads and parses CSV file', async () => {
      const csvContent = `Symbol,DateTime,Quantity
GOOG,20250101,100
AAPL,20250102,50`;

      fs.readFile.mockResolvedValue(csvContent);

      const result = await loadCsv('/path/to/file.csv');

      expect(fs.readFile).toHaveBeenCalledWith('/path/to/file.csv', 'utf-8');
      expect(result).toEqual([
        { Symbol: 'GOOG', DateTime: '20250101', Quantity: '100' },
        { Symbol: 'AAPL', DateTime: '20250102', Quantity: '50' },
      ]);
    });

    it('returns empty array for empty file', async () => {
      fs.readFile.mockResolvedValue('');

      const result = await loadCsv('/path/to/empty.csv');

      expect(result).toEqual([]);
    });

    it('returns empty array for whitespace-only file', async () => {
      fs.readFile.mockResolvedValue('   \n\n  ');

      const result = await loadCsv('/path/to/whitespace.csv');

      expect(result).toEqual([]);
    });

    it('returns empty array for header-only file', async () => {
      fs.readFile.mockResolvedValue('Symbol,DateTime,Quantity');

      const result = await loadCsv('/path/to/header-only.csv');

      expect(result).toEqual([]);
    });

    it('skips empty lines in CSV', async () => {
      const csvContent = `Symbol,DateTime
GOOG,20250101

AAPL,20250102
`;

      fs.readFile.mockResolvedValue(csvContent);

      const result = await loadCsv('/path/to/file.csv');

      expect(result).toEqual([
        { Symbol: 'GOOG', DateTime: '20250101' },
        { Symbol: 'AAPL', DateTime: '20250102' },
      ]);
    });

    it('throws on file read error', async () => {
      const error = new Error('ENOENT: file not found');
      fs.readFile.mockRejectedValue(error);

      await expect(loadCsv('/invalid/path.csv')).rejects.toThrow('ENOENT');
    });

    it('handles malformed CSV with missing columns', async () => {
      const csvContent = `A,B,C
val1
val2,val3`;

      fs.readFile.mockResolvedValue(csvContent);

      const result = await loadCsv('/path/to/malformed.csv');

      expect(result).toEqual([
        { A: 'val1', B: '', C: '' },
        { A: 'val2', B: 'val3', C: '' },
      ]);
    });
  });
});
