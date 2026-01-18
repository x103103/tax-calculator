# USD to PLN Rate Service

A Node.js service that retrieves USD to PLN exchange rates with recursive fallback logic for missing dates (weekends, holidays, etc.).

## Features

- **Recursive Fallback**: If a date is missing in the rates.csv, automatically searches previous days
- **Flexible Input**: Accepts both Date objects and string dates (YYYY-MM-DD format)
- **Efficient Lookup**: Loads all rates into memory for fast access
- **Singleton Pattern**: Single instance shared across the application

## Installation

The service is already set up in the project. Just require it:

```javascript
const { getRateForPreviousDay, getRate } = require('./app/services/usd-pln-rate');
```

## Usage

### Get Rate for Previous Day

Get the exchange rate for the day before a given date:

```javascript
const { getRateForPreviousDay } = require('./app/services/usd-pln-rate');

// Using a string date
const result = getRateForPreviousDay('2025-01-20');
console.log(result);
// { date: '2025-01-17', rate: 4.1462, daysBack: 3 }

// Using a Date object
const result2 = getRateForPreviousDay(new Date('2025-01-10'));
console.log(result2);
// { date: '2025-01-09', rate: 4.1523, daysBack: 1 }
```

### Get Rate for Specific Date

Get the rate for a specific date with optional fallback:

```javascript
const { getRate } = require('./app/services/usd-pln-rate');

// Without fallback - returns null if date doesn't exist
const result = getRate('2025-01-16', false);
console.log(result);
// { date: '2025-01-16', rate: 4.1433, daysBack: 0 }

// With fallback - searches previous days if date doesn't exist
const result2 = getRate('2025-01-18', true); // Saturday (missing)
console.log(result2);
// { date: '2025-01-17', rate: 4.1462, daysBack: 2 }
```

### Using the Class Directly

For more control, use the `UsdPlnRateService` class:

```javascript
const { UsdPlnRateService } = require('./app/services/usd-pln-rate');

const service = new UsdPlnRateService();

// Get rate with custom max attempts
const result = service.getRateForPreviousDay('2025-01-20', 60);

// Reload rates from CSV
service.reload();
```

## API Reference

### `getRateForPreviousDay(date, maxAttempts = 30)`

Returns the exchange rate for the previous day.

**Parameters:**
- `date` (string|Date): The reference date
- `maxAttempts` (number): Maximum number of days to look back (default: 30)

**Returns:** Object with:
- `date` (string): The date the rate was found for (YYYY-MM-DD)
- `rate` (number): The USD to PLN exchange rate
- `daysBack` (number): How many days back from the input date

**Throws:** Error if no rate is found within maxAttempts days

### `getRate(date, useFallback = false)`

Returns the exchange rate for a specific date.

**Parameters:**
- `date` (string|Date): The date to look up
- `useFallback` (boolean): Whether to use recursive fallback (default: false)

**Returns:** Object with date, rate, and daysBack, or null if not found

## How It Works

1. **Initialization**: Loads all rates from `data/spreadsheet-tabs/rates.csv` into a Map
2. **Lookup**: When requested, checks if the previous day exists in the Map
3. **Recursive Fallback**: If not found, recursively checks the day before that
4. **Result**: Returns the first available rate found, along with how many days back it was

## Example Scenarios

### Weekend Handling

```javascript
// Request previous day from Monday
getRateForPreviousDay('2025-01-20');
// Returns Friday's rate (2025-01-17), skipping Saturday and Sunday
```

### Holiday Handling

```javascript
// Request after a 3-day weekend
getRateForPreviousDay('2025-01-07');
// Skips back 4 days to find the last available rate (2025-01-03)
```

## Testing

Run the included test file:

```bash
node test-usd-pln-rate.js
```

## Data Source

The service reads from `/data/spreadsheet-tabs/rates.csv`, which contains historical USD to PLN exchange rates in the format:

```csv
Date,USD to PLN Rate
2025-01-16,4.1433
2025-01-17,4.1462
```

## Performance

- **Load time**: ~1ms for 500+ rates
- **Lookup time**: O(1) for direct date lookup
- **Recursive lookup**: O(n) where n is the number of missing days (typically 2-4)
