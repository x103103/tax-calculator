import path from 'path';

import { UsdPlnRateService } from './rate-service';
import type { RateInfo } from '../../../types';

// Create default instance for backward compat
const defaultPath = path.join(__dirname, '../../../data/spreadsheet-tabs/rates.csv');
const defaultInstance = new UsdPlnRateService(defaultPath);

export {
  UsdPlnRateService,
  defaultInstance,
};

export const getRateForPreviousDay = (date: string | Date, max?: number): RateInfo =>
  defaultInstance.getRateForPreviousDay(date, max);

export const getRate = (date: string | Date, fallback?: boolean): RateInfo | null =>
  defaultInstance.getRate(date, fallback);
