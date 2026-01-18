const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const { UsdPlnRateService } = require('../rate-service');

describe('UsdPlnRateService', () => {
  let tempDir;
  let csvPath;

  const createCsv = async (content) => {
    await fs.writeFile(csvPath, content, 'utf-8');
  };

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'rate-service-test-'));
    csvPath = path.join(tempDir, 'rates.csv');
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('constructor', () => {
    it('throws if csvPath not provided', () => {
      expect(() => new UsdPlnRateService()).toThrow('csvPath is required');
    });

    it('accepts custom csvPath', () => {
      const service = new UsdPlnRateService('/custom/path.csv');
      expect(service.csvPath).toBe('/custom/path.csv');
    });

    it('does not load rates in constructor', () => {
      const service = new UsdPlnRateService(csvPath);
      expect(service.loaded).toBe(false);
      expect(service.rates.size).toBe(0);
    });
  });

  describe('load()', () => {
    it('loads rates from CSV', async () => {
      await createCsv('date,rate\n2025-01-15,4.05\n2025-01-16,4.10');
      const service = new UsdPlnRateService(csvPath);

      await service.load();

      expect(service.loaded).toBe(true);
      expect(service.rates.size).toBe(2);
      expect(service.rates.get('2025-01-15')).toBe(4.05);
    });

    it('throws for missing file', async () => {
      const service = new UsdPlnRateService('/nonexistent/file.csv');

      await expect(service.load()).rejects.toThrow('Failed to load rates');
    });

    it('handles empty CSV (header only)', async () => {
      await createCsv('date,rate\n');
      const service = new UsdPlnRateService(csvPath);

      await service.load();

      expect(service.rates.size).toBe(0);
    });

    it('skips malformed lines', async () => {
      await createCsv('date,rate\n2025-01-15,4.05\nbadline\n2025-01-16,4.10');
      const service = new UsdPlnRateService(csvPath);

      await service.load();

      expect(service.rates.size).toBe(2);
    });
  });

  describe('getRateForPreviousDay()', () => {
    let service;

    beforeEach(async () => {
      // Mon-Fri rates, no weekend
      await createCsv([
        'date,rate',
        '2025-01-13,4.01', // Mon
        '2025-01-14,4.02', // Tue
        '2025-01-15,4.03', // Wed
        '2025-01-16,4.04', // Thu
        '2025-01-17,4.05', // Fri
      ].join('\n'));
      service = new UsdPlnRateService(csvPath);
      await service.load();
    });

    it('throws if not loaded', async () => {
      const unloaded = new UsdPlnRateService(csvPath);
      expect(() => unloaded.getRateForPreviousDay('2025-01-16'))
        .toThrow('Rates not loaded');
    });

    it('returns previous day rate when available', () => {
      const result = service.getRateForPreviousDay('2025-01-16');

      expect(result.date).toBe('2025-01-15');
      expect(result.rate).toBe(4.03);
      expect(result.daysBack).toBe(1);
    });

    it('accepts Date object', () => {
      const result = service.getRateForPreviousDay(new Date('2025-01-16'));

      expect(result.date).toBe('2025-01-15');
    });

    it('falls back for weekend (Mon -> Fri)', () => {
      // 2025-01-20 is Monday, prev day is Sunday (no rate), should get Friday
      const result = service.getRateForPreviousDay('2025-01-20');

      expect(result.date).toBe('2025-01-17'); // Friday
      expect(result.rate).toBe(4.05);
      expect(result.daysBack).toBe(3); // Sun(1), Sat(2), Fri(3) found
    });

    it('throws when maxAttempts exceeded', () => {
      // 2025-01-10 not in data, need to go back past our earliest date
      expect(() => service.getRateForPreviousDay('2025-01-10', 2))
        .toThrow('No rate found');
    });

    it('respects custom maxAttempts', () => {
      // Need to go back 3 days from 2025-01-20 to find 2025-01-17
      const result = service.getRateForPreviousDay('2025-01-20', 4);
      expect(result.date).toBe('2025-01-17');
    });
  });

  describe('getRate()', () => {
    let service;

    beforeEach(async () => {
      await createCsv([
        'date,rate',
        '2025-01-13,4.01',
        '2025-01-15,4.03',
      ].join('\n'));
      service = new UsdPlnRateService(csvPath);
      await service.load();
    });

    it('throws if not loaded', async () => {
      const unloaded = new UsdPlnRateService(csvPath);
      expect(() => unloaded.getRate('2025-01-15')).toThrow('Rates not loaded');
    });

    it('returns rate for exact date', () => {
      const result = service.getRate('2025-01-15');

      expect(result.date).toBe('2025-01-15');
      expect(result.rate).toBe(4.03);
      expect(result.daysBack).toBe(0);
    });

    it('returns null for missing date without fallback', () => {
      const result = service.getRate('2025-01-14');
      expect(result).toBeNull();
    });

    it('uses fallback when enabled', () => {
      const result = service.getRate('2025-01-14', true);

      expect(result.date).toBe('2025-01-13');
      expect(result.rate).toBe(4.01);
      expect(result.daysBack).toBe(2); // 14(1)->13(2) found
    });

    it('accepts Date object', () => {
      const result = service.getRate(new Date('2025-01-15'));
      expect(result.rate).toBe(4.03);
    });
  });

  describe('reload()', () => {
    it('reloads rates from file', async () => {
      await createCsv('date,rate\n2025-01-15,4.00');
      const service = new UsdPlnRateService(csvPath);
      await service.load();

      expect(service.rates.get('2025-01-15')).toBe(4.00);

      // Update file
      await createCsv('date,rate\n2025-01-15,4.50\n2025-01-16,4.60');
      await service.reload();

      expect(service.rates.get('2025-01-15')).toBe(4.50);
      expect(service.rates.get('2025-01-16')).toBe(4.60);
    });
  });

  describe('getPreviousDay()', () => {
    it('returns previous day for string date', () => {
      const service = new UsdPlnRateService(csvPath);
      expect(service.getPreviousDay('2025-01-15')).toBe('2025-01-14');
    });

    it('returns previous day for Date object', () => {
      const service = new UsdPlnRateService(csvPath);
      expect(service.getPreviousDay(new Date('2025-01-15'))).toBe('2025-01-14');
    });

    it('handles month boundary', () => {
      const service = new UsdPlnRateService(csvPath);
      expect(service.getPreviousDay('2025-02-01')).toBe('2025-01-31');
    });

    it('handles year boundary', () => {
      const service = new UsdPlnRateService(csvPath);
      expect(service.getPreviousDay('2025-01-01')).toBe('2024-12-31');
    });
  });
});
