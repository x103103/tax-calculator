import path from 'path';

import { UsdPlnRateService } from './rate-service';

// Create default instance for backward compat
const defaultPath = path.join(__dirname, '../../../data/spreadsheet-tabs/rates.csv');
const defaultInstance = new UsdPlnRateService(defaultPath);

export {
  UsdPlnRateService,
  defaultInstance,
};

export const getRateForPreviousDay = (date: string | Date, max?: number) =>
  defaultInstance.getRateForPreviousDay(date, max);

export const getRate = (date: string | Date, fallback?: boolean) =>
  defaultInstance.getRate(date, fallback);
