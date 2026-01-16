const fs = require('fs');
const path = require('path');

/**
 * USD to PLN Rate Service
 * Retrieves exchange rates with recursive fallback to previous days
 */
class UsdPlnRateService {
  constructor() {
    this.rates = new Map();
    this.csvPath = path.join(__dirname, '../../data/spreadsheet-tabs/rates.csv');
    this.loadRates();
  }

  /**
   * Load rates from CSV file into memory
   */
  loadRates() {
    try {
      const csvData = fs.readFileSync(this.csvPath, 'utf-8');
      const lines = csvData.trim().split('\n');

      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const [date, rate] = lines[i].split(',');
        if (date && rate) {
          this.rates.set(date.trim(), parseFloat(rate.trim()));
        }
      }

      console.log(`Loaded ${this.rates.size} exchange rates from ${this.csvPath}`);
    } catch (error) {
      console.error('Error loading rates:', error.message);
      throw error;
    }
  }

  /**
   * Get the previous day's date in YYYY-MM-DD format
   * @param {string|Date} date - Date as string (YYYY-MM-DD) or Date object
   * @returns {string} Previous day in YYYY-MM-DD format
   */
  getPreviousDay(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const previousDay = new Date(dateObj);
    previousDay.setDate(previousDay.getDate() - 1);

    return previousDay.toISOString().split('T')[0];
  }

  /**
   * Recursively get the USD to PLN rate for the previous day
   * If the previous day doesn't exist, checks the day before that, and so on
   * @param {string|Date} date - Date to get the rate for (YYYY-MM-DD or Date object)
   * @param {number} maxAttempts - Maximum number of days to look back (default: 30)
   * @returns {Object} Object containing the date and rate found
   * @throws {Error} If no rate is found within maxAttempts days
   */
  getRateForPreviousDay(date, maxAttempts = 30) {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const previousDay = this.getPreviousDay(dateStr);

    return this._getRateRecursive(previousDay, maxAttempts, 0);
  }

  /**
   * Internal recursive function to find the rate
   * @param {string} dateStr - Date in YYYY-MM-DD format
   * @param {number} maxAttempts - Maximum attempts
   * @param {number} currentAttempt - Current attempt count
   * @returns {Object} Object containing the date and rate found
   * @private
   */
  _getRateRecursive(dateStr, maxAttempts, currentAttempt) {
    // Base case: exceeded maximum attempts
    if (currentAttempt >= maxAttempts) {
      throw new Error(
        `No rate found for ${dateStr} after checking ${maxAttempts} days back`
      );
    }

    // Check if rate exists for this date
    if (this.rates.has(dateStr)) {
      return {
        date: dateStr,
        rate: this.rates.get(dateStr),
        daysBack: currentAttempt + 1
      };
    }

    // Recursive case: try the previous day
    const previousDay = this.getPreviousDay(dateStr);
    return this._getRateRecursive(previousDay, maxAttempts, currentAttempt + 1);
  }

  /**
   * Get a rate for a specific date (not necessarily previous day)
   * This is a convenience method for direct lookups with fallback
   * @param {string|Date} date - Date to get the rate for
   * @param {boolean} useFallback - Whether to use recursive fallback (default: false)
   * @returns {Object|null} Object containing date and rate, or null if not found
   */
  getRate(date, useFallback = false) {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];

    if (this.rates.has(dateStr)) {
      return {
        date: dateStr,
        rate: this.rates.get(dateStr),
        daysBack: 0
      };
    }

    if (useFallback) {
      return this._getRateRecursive(dateStr, 30, 0);
    }

    return null;
  }

  /**
   * Reload rates from CSV (useful if the file is updated)
   */
  reload() {
    this.rates.clear();
    this.loadRates();
  }
}

// Create a singleton instance
const rateService = new UsdPlnRateService();

module.exports = {
  UsdPlnRateService,
  rateService,
  getRateForPreviousDay: (date, maxAttempts) =>
    rateService.getRateForPreviousDay(date, maxAttempts),
  getRate: (date, useFallback) =>
    rateService.getRate(date, useFallback)
};
