import { ConversionResult, IRateService } from '../../types/index';

/**
 * Format date from YYYYMMDD to YYYY-MM-DD
 * Handles formats like "20250122" or "20250122;123456"
 * @param dateStr - Date string to format
 * @returns Formatted date or original if invalid
 */
export function formatDate(dateStr: string): string {
  if (!dateStr || dateStr.length < 8) return dateStr;
  const cleanDate = dateStr.split(';')[0];
  if (cleanDate.length === 8) {
    return `${cleanDate.substring(0, 4)}-${cleanDate.substring(4, 6)}-${cleanDate.substring(6, 8)}`;
  }
  return cleanDate;
}

/**
 * Convert USD amount to PLN using rate service
 * @param amountUsd - Amount in USD
 * @param date - Trade date (YYYYMMDD or YYYY-MM-DD)
 * @param rateService - Rate service with getRateForPreviousDay method
 * @returns Conversion result with amountPln, rate, rateDate, daysBack
 */
export async function convertToPlnWithDate(
  amountUsd: number,
  date: string,
  rateService: IRateService
): Promise<ConversionResult> {
  const formattedDate = formatDate(date);
  const rateInfo = await rateService.getRateForPreviousDay(formattedDate);
  const amountPln = amountUsd * rateInfo.rate;

  return {
    amountPln,
    rate: rateInfo.rate,
    rateDate: rateInfo.date,
    daysBack: rateInfo.daysBack
  };
}
