# Poland Tax Calculator for 2025

## Overview

This service calculates the taxes you need to pay in Poland for stock trading profits in 2025. It follows Polish tax law by applying a 19% tax rate on net profits after deducting all trading fees.

## Tax Formula

```
Tax Owed = ((Total Profit) - (Buy Fees) - (Sell Fees)) × 19%
```

Where:
- **Total Profit**: Sum of all realized profits from closed positions (FifoPnlRealized)
- **Buy Fees**: Sum of all commissions paid when buying stocks (matched by trade ID)
- **Sell Fees**: Sum of all commissions paid when selling stocks in 2025

## Currency Conversion

All amounts are converted from USD to PLN using the exchange rate from the **previous day** of each transaction. This is handled automatically by the `usd-pln-rate.js` service, which includes fallback logic to find the nearest available rate if the previous day is a weekend or holiday.

## How It Works

1. **Load Data**: Reads CSV files containing:
   - `closed_2025.csv`: Closed positions with realized P&L
   - `trades_2024.csv`: Buy transactions from 2024
   - `trades_2025.csv`: Buy and sell transactions from 2025

2. **Calculate Profits**:
   - Extracts profit from each closed position
   - Converts to PLN using previous day's exchange rate

3. **Calculate Buy Fees**:
   - For each closed position, finds the original buy transaction using `OpenDateTime`
   - Extracts commission from the buy transaction
   - Converts to PLN using previous day's exchange rate from the buy date

4. **Calculate Sell Fees**:
   - Sums all commissions from sell transactions in 2025
   - Converts each to PLN using previous day's exchange rate from the sell date

5. **Calculate Tax**:
   - Applies the formula: `(Profit - Buy Fees - Sell Fees) × 19%`

## Usage

### Command Line

```bash
# Run the tax calculator
node app/test-poland-tax.js
```

### Programmatic Usage

```javascript
const { generateReport } = require('./app/services/poland-tax-calculator');

// Generate a complete tax report
const report = generateReport();

console.log(`Tax Owed: ${report.taxOwed.toFixed(2)} PLN`);
console.log(`Taxable Base: ${report.taxableBase.toFixed(2)} PLN`);
```

## Example Output

```
=== TAX CALCULATION ===

Formula: ((Profit) - (Buy Fees) - (Sell Fees)) × 19%

Profit:          47405.51 PLN
Buy Fees:      - 61.66 PLN
Sell Fees:     - 18.94 PLN
==================================================
Taxable Base:    47324.91 PLN
Tax Rate:        19%
==================================================
TAX OWED:        8991.73 PLN
==================================================
```

## 2025 Tax Summary

Based on the current data:

- **Closed Positions**: 21 trades
- **Total Profit**: $12,888.27 USD → 47,405.51 PLN
- **Buy Fees**: $15.77 USD → 61.66 PLN
- **Sell Fees**: $5.05 USD → 18.94 PLN
- **Taxable Base**: 47,324.91 PLN
- **Tax Owed**: **8,991.73 PLN** (19%)

## Data Files Required

The calculator expects the following CSV files in `/data/spreadsheet-tabs/`:

- `closed_2025.csv`: Closed positions with realized P&L
- `trades_2024.csv`: Trading history from 2024 (for buy fees)
- `trades_2025.csv`: Trading history from 2025 (for buy/sell fees)
- `rates.csv`: Daily USD to PLN exchange rates

## Implementation Details

### File Location
- Service: `/app/services/poland-tax-calculator.js`
- Test Script: `/app/test-poland-tax.js`

### Dependencies
- `usd-pln-rate.js`: Handles currency conversion with previous day rate lookup

### Key Features
- ✅ Automatic date format conversion (YYYYMMDD → YYYY-MM-DD)
- ✅ Previous day exchange rate lookup with fallback
- ✅ Detailed breakdown of profits, fees, and conversions
- ✅ Matches buy transactions by symbol and timestamp
- ✅ Comprehensive error handling and validation

## Notes

1. **Date Convention**: Exchange rates are taken from the day BEFORE each transaction, as per Polish tax requirements.

2. **Commission Handling**: All commission values in the CSV are negative (costs), so we use `Math.abs()` to convert them to positive values.

3. **Trade Matching**: Buy fees are matched to closed positions using the `OpenDateTime` field, which corresponds to the original purchase date/time.

4. **Tax Year**: This calculator is specifically designed for the 2025 tax year.

## Future Enhancements

Potential improvements for future versions:

- Support for multiple tax years
- PDF report generation
- Integration with Polish tax forms (PIT-38)
- Support for cryptocurrency transactions
- Multi-currency support beyond USD/PLN
