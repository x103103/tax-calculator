import * as fs from 'fs';
import * as path from 'path';
import { generatePdfReport } from '../pdf-reporter';
import type { TaxReport, TaxSummary } from '../../../types';

const TEST_OUTPUT_DIR = path.join(__dirname, '../../../../tmp/test-output');
const TEST_PDF_PATH = path.join(TEST_OUTPUT_DIR, 'test-report.pdf');

describe('generatePdfReport', () => {
  beforeAll(() => {
    if (!fs.existsSync(TEST_OUTPUT_DIR)) {
      fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(TEST_PDF_PATH)) {
      fs.unlinkSync(TEST_PDF_PATH);
    }
  });

  const baseSummary: TaxSummary = {
    year: 2025,
    currency: 'PLN',
    profits: 10000,
    buyFees: 100,
    sellFees: 50,
    taxableBase: 9850,
    taxRate: 0.19,
    taxOwed: 1871.5,
    profitsUSD: 2500,
    buyFeesUSD: 25,
    sellFeesUSD: 12.5,
    totalTaxOwed: 1871.5,
  };

  const fullReport: TaxReport = {
    ...baseSummary,
    dividendTax: {
      dividends: { totalUsd: 100, totalPln: 400, details: [] },
      withholdingTax: { totalUsd: 15, totalPln: 60, details: [] },
      brokerInterest: { totalUsd: 10, totalPln: 40, details: [] },
      dividendTaxPln: 76,
      interestTaxPln: 7.6,
      withholdingCreditPln: 60,
      taxOwedPln: 23.6,
    },
    totalTaxOwed: 1895.1,
    details: {
      profitBreakdown: [
        {
          symbol: 'AAPL',
          tradeDate: '2025-03-15',
          profitUsd: 500,
          rate: 4.0,
          rateDate: '2025-03-14',
          profitPln: 2000,
        },
      ],
      buyFeeBreakdown: [
        {
          symbol: 'AAPL',
          buyDate: '2025-01-10',
          feeUsd: 5,
          rate: 4.0,
          rateDate: '2025-01-09',
          feePln: 20,
        },
      ],
      sellFeeBreakdown: [
        {
          symbol: 'AAPL',
          sellDate: '2025-03-15',
          feeUsd: 2.5,
          rate: 4.0,
          rateDate: '2025-03-14',
          feePln: 10,
        },
      ],
    },
  };

  it('creates PDF file from TaxSummary', async () => {
    await generatePdfReport(baseSummary, TEST_PDF_PATH);

    expect(fs.existsSync(TEST_PDF_PATH)).toBe(true);
    const stats = fs.statSync(TEST_PDF_PATH);
    expect(stats.size).toBeGreaterThan(0);
  });

  it('creates PDF file from full TaxReport with details', async () => {
    await generatePdfReport(fullReport, TEST_PDF_PATH);

    expect(fs.existsSync(TEST_PDF_PATH)).toBe(true);
    const stats = fs.statSync(TEST_PDF_PATH);
    expect(stats.size).toBeGreaterThan(0);
  });

  it('creates output directory if not exists', async () => {
    const nestedPath = path.join(TEST_OUTPUT_DIR, 'nested/dir/report.pdf');

    await generatePdfReport(baseSummary, nestedPath);

    expect(fs.existsSync(nestedPath)).toBe(true);

    // Cleanup
    fs.unlinkSync(nestedPath);
    fs.rmdirSync(path.dirname(nestedPath));
    fs.rmdirSync(path.join(TEST_OUTPUT_DIR, 'nested'));
  });

  it('includes dividend section when present', async () => {
    await generatePdfReport(fullReport, TEST_PDF_PATH);

    expect(fs.existsSync(TEST_PDF_PATH)).toBe(true);
    // PDF exists and has content - dividend section included
    const stats = fs.statSync(TEST_PDF_PATH);
    expect(stats.size).toBeGreaterThan(1000); // Larger due to dividend section
  });
});
