const path = require('path');
const { UsdPlnRateService } = require('./rate-service');

// Create default instance for backward compat
const defaultPath = path.join(__dirname, '../../../data/spreadsheet-tabs/rates.csv');
const defaultInstance = new UsdPlnRateService(defaultPath);

module.exports = {
  UsdPlnRateService,
  defaultInstance,
  getRateForPreviousDay: (date, max) => defaultInstance.getRateForPreviousDay(date, max),
  getRate: (date, fallback) => defaultInstance.getRate(date, fallback)
};
