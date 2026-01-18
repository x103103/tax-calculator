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
      closed2025: path.join(DATA_DIR, 'closed_2025.csv'),
      trades2024: path.join(DATA_DIR, 'trades_2024.csv'),
      trades2025: path.join(DATA_DIR, 'trades_2025.csv'),
      rates: path.join(DATA_DIR, 'rates.csv'),
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
