/**
 * Currency Converter Service
 * Converts USD amounts to PLN using rate service with date handling
 */

/**
 * Format date from YYYYMMDD to YYYY-MM-DD
 * Handles formats like "20250122" or "20250122;123456"
 * @param {string} dateStr - Date string to format
 * @returns {string} Formatted date or original if invalid
 */
function formatDate(dateStr) {
  if (!dateStr || dateStr.length < 8) return dateStr;
  const cleanDate = dateStr.split(';')[0];
  if (cleanDate.length === 8) {
    return `${cleanDate.substring(0, 4)}-${cleanDate.substring(4, 6)}-${cleanDate.substring(6, 8)}`;
  }
  return cleanDate;
}

/**
 * Convert USD amount to PLN using rate service
 * @param {number} amountUsd - Amount in USD
 * @param {string} date - Trade date (YYYYMMDD or YYYY-MM-DD)
 * @param {Object} rateService - Rate service with getRateForPreviousDay method
 * @returns {Promise<Object>} Conversion result with amountPln, rate, rateDate, daysBack
 */
async function convertToPlnWithDate(amountUsd, date, rateService) {
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

module.exports = { convertToPlnWithDate, formatDate };
