/**
 * Default Configuration
 * Centralized config with factory for overrides
 */

import path from 'path';

import type { TaxConfig, ConfigOverrides } from '../types';

const DATA_DIR = path.join(__dirname, '../../tmp/data/alex');
const RATES_DIR = path.join(__dirname, '../../tmp/data/rates');

export function createConfig(overrides?: ConfigOverrides): TaxConfig {
  const dataDir = overrides?.dataDir ?? DATA_DIR;

  const defaults: TaxConfig = {
    dataDir,
    csvPaths: {
      closedPositions: path.join(dataDir, 'all_closed_trades.csv'),
      trades: [path.join(dataDir, 'all_trades_2024.csv'), path.join(dataDir, 'all_trades_2025.csv')],
      rates: [path.join(RATES_DIR, 'rates_2024.csv'), path.join(RATES_DIR, 'rates_2025.csv')],
      cashTransactions: path.join(dataDir, 'all_cash_transactions.csv'),
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
