/**
 * Default Configuration
 * Centralized config with factory for overrides
 */

import path from 'path';

import type { TaxConfig, ConfigOverrides } from '../types';

const DATA_DIR = path.join(__dirname, '../../tmp/data/spreadsheet-tabs');

export function createConfig(overrides?: ConfigOverrides): TaxConfig {
  const defaults: TaxConfig = {
    dataDir: DATA_DIR,
    csvPaths: {
      closedPositions: path.join(DATA_DIR, 'closed_2025.csv'),
      trades: [path.join(DATA_DIR, 'trades_2024.csv'), path.join(DATA_DIR, 'trades_2025.csv')],
      rates: path.join(DATA_DIR, 'rates.csv'),
      cashTransactions: path.join(DATA_DIR, 'all_cash_transactions.csv'),
    },
    taxRate: 0.19,
    year: 2025,
  };

  return {
    ...defaults,
    ...overrides,
    csvPaths: { ...defaults.csvPaths, ...overrides?.csvPaths },
  };
}

export const defaultConfig: TaxConfig = createConfig();
