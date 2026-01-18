import { promises as fs } from 'fs';

import type { IRateService, RateInfo } from '../../../types';

/**
 * USD to PLN Rate Service
 * Retrieves exchange rates with recursive fallback to previous days
 */
export class UsdPlnRateService implements IRateService {
  #csvPath: string;
  #rates: Map<string, number> = new Map();
  #loaded: boolean = false;

  /**
   * @param csvPath - Path to the CSV file containing rates
   */
  constructor(csvPath: string) {
    if (!csvPath) {
      throw new Error('csvPath is required');
    }
    this.#csvPath = csvPath;
  }

  // Public accessors for testing (matching original behavior)
  get csvPath(): string {
    return this.#csvPath;
  }

  get rates(): Map<string, number> {
    return this.#rates;
  }

  get loaded(): boolean {
    return this.#loaded;
  }

  /**
   * Load rates from CSV file into memory
   * Must be called after construction before using other methods
   */
  async load(): Promise<void> {
    try {
      const csvData = await fs.readFile(this.#csvPath, 'utf-8');
      const lines = csvData.trim().split('\n');

      this.#rates.clear();

      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const [date, rate] = lines[i].split(',');
        if (date && rate) {
          this.#rates.set(date.trim(), parseFloat(rate.trim()));
        }
      }

      this.#loaded = true;
    } catch (error) {
      throw new Error(
        `Failed to load rates from ${this.#csvPath}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Get the previous day's date in YYYY-MM-DD format
   * @param date - Date as string (YYYY-MM-DD) or Date object
   * @returns Previous day in YYYY-MM-DD format
   */
  getPreviousDay(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const previousDay = new Date(dateObj);
    previousDay.setDate(previousDay.getDate() - 1);
    return previousDay.toISOString().split('T')[0];
  }

  /**
   * Recursively get the USD to PLN rate for the previous day
   * @param date - Date to get the rate for
   * @param maxAttempts - Maximum number of days to look back (default: 30)
   * @returns Object containing the date and rate found
   * @throws Error if no rate is found within maxAttempts days
   */
  getRateForPreviousDay(date: string | Date, maxAttempts = 30): RateInfo {
    this.#ensureLoaded();
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const previousDay = this.getPreviousDay(dateStr);
    return this.#getRateRecursive(previousDay, maxAttempts, 0);
  }

  /**
   * Internal recursive function to find the rate
   * @param dateStr - Date in YYYY-MM-DD format
   * @param maxAttempts - Maximum attempts
   * @param currentAttempt - Current attempt count
   * @returns Object containing the date and rate found
   */
  #getRateRecursive(dateStr: string, maxAttempts: number, currentAttempt: number): RateInfo {
    if (currentAttempt >= maxAttempts) {
      throw new Error(
        `No rate found for ${dateStr} after checking ${maxAttempts} days back`
      );
    }

    if (this.#rates.has(dateStr)) {
      const rate = this.#rates.get(dateStr);
      return {
        date: dateStr,
        rate: rate!,
        daysBack: currentAttempt + 1,
      };
    }

    const previousDay = this.getPreviousDay(dateStr);
    return this.#getRateRecursive(previousDay, maxAttempts, currentAttempt + 1);
  }

  /**
   * Get a rate for a specific date
   * @param date - Date to get the rate for
   * @param useFallback - Whether to use recursive fallback (default: false)
   * @returns Object containing date and rate, or null if not found
   */
  getRate(date: string | Date, useFallback = false): RateInfo | null {
    this.#ensureLoaded();
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];

    if (this.#rates.has(dateStr)) {
      const rate = this.#rates.get(dateStr);
      return {
        date: dateStr,
        rate: rate!,
        daysBack: 0,
      };
    }

    if (useFallback) {
      return this.#getRateRecursive(dateStr, 30, 0);
    }

    return null;
  }

  /**
   * Reload rates from CSV
   */
  async reload(): Promise<void> {
    await this.load();
  }

  /**
   * Ensure rates are loaded before accessing
   */
  #ensureLoaded(): void {
    if (!this.#loaded) {
      throw new Error('Rates not loaded. Call load() first.');
    }
  }
}
