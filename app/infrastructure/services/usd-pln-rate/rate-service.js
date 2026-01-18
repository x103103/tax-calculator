const fs = require('fs').promises;

/**
 * USD to PLN Rate Service
 * Retrieves exchange rates with recursive fallback to previous days
 */
class UsdPlnRateService {
  /**
   * @param {string} csvPath - Path to the CSV file containing rates
   */
  constructor(csvPath) {
    if (!csvPath) {
      throw new Error('csvPath is required');
    }
    this.csvPath = csvPath;
    this.rates = new Map();
    this.loaded = false;
  }

  /**
   * Load rates from CSV file into memory
   * Must be called after construction before using other methods
   * @returns {Promise<void>}
   */
  async load() {
    try {
      const csvData = await fs.readFile(this.csvPath, 'utf-8');
      const lines = csvData.trim().split('\n');

      this.rates.clear();

      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const [date, rate] = lines[i].split(',');
        if (date && rate) {
          this.rates.set(date.trim(), parseFloat(rate.trim()));
        }
      }

      this.loaded = true;
    } catch (error) {
      throw new Error(`Failed to load rates from ${this.csvPath}: ${error.message}`);
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
   * @param {string|Date} date - Date to get the rate for
   * @param {number} maxAttempts - Maximum number of days to look back (default: 30)
   * @returns {Object} Object containing the date and rate found
   * @throws {Error} If no rate is found within maxAttempts days
   */
  getRateForPreviousDay(date, maxAttempts = 30) {
    this._ensureLoaded();
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
    if (currentAttempt >= maxAttempts) {
      throw new Error(
        `No rate found for ${dateStr} after checking ${maxAttempts} days back`
      );
    }

    if (this.rates.has(dateStr)) {
      return {
        date: dateStr,
        rate: this.rates.get(dateStr),
        daysBack: currentAttempt + 1
      };
    }

    const previousDay = this.getPreviousDay(dateStr);
    return this._getRateRecursive(previousDay, maxAttempts, currentAttempt + 1);
  }

  /**
   * Get a rate for a specific date
   * @param {string|Date} date - Date to get the rate for
   * @param {boolean} useFallback - Whether to use recursive fallback (default: false)
   * @returns {Object|null} Object containing date and rate, or null if not found
   */
  getRate(date, useFallback = false) {
    this._ensureLoaded();
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
   * Reload rates from CSV
   * @returns {Promise<void>}
   */
  async reload() {
    await this.load();
  }

  /**
   * Ensure rates are loaded before accessing
   * @private
   */
  _ensureLoaded() {
    if (!this.loaded) {
      throw new Error('Rates not loaded. Call load() first.');
    }
  }
}

module.exports = { UsdPlnRateService };
