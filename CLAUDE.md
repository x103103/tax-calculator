# Poland Tax Calculator

A Node.js application that calculates Polish income tax on stock trading profits according to 2025 tax law. Automatically handles USD to PLN conversion using official NBP exchange rates.

## Features

- **Automated Tax Calculation**: Calculates 19% tax on net trading profits
- **Currency Conversion**: Converts USD amounts to PLN using previous-day exchange rates
- **Fee Handling**: Accounts for buy and sell commissions
- **FIFO Method**: Uses First-In-First-Out for position matching

## Formula

```
Tax = ((Profits) - (Buy Fees) - (Sell Fees)) × 19%
```

## Setup

Install dependencies:

```bash
npm install
```

## Usage

### Calculate Tax (CLI)

Run the tax calculator:

```bash
node app/presentation/cli/index.js
```

Or use the wrapper script:

```bash
node app/test-poland-tax.js
```

### Programmatic Usage

```javascript
const { generateReport } = require('./app/application');

async function main() {
  const report = await generateReport();
  console.log(`Tax Owed: ${report.taxOwed.toFixed(2)} PLN`);
}

main();
```

### Run Tests

```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

## Architecture

The v2 architecture follows Clean Architecture principles with clear separation of concerns:

### Layered Structure

```
┌─────────────────────────────────────────┐
│      Presentation Layer (CLI/API)       │  ← User interfaces
├─────────────────────────────────────────┤
│       Application Layer (Use Cases)     │  ← Orchestration
├─────────────────────────────────────────┤
│     Domain Layer (Business Logic)       │  ← Pure logic, no I/O
├─────────────────────────────────────────┤
│  Infrastructure Layer (Data/Services)   │  ← External dependencies
└─────────────────────────────────────────┘
```

### Directory Structure

```
app/
├── domain/                      # Business logic (framework-agnostic)
│   ├── calculators/
│   │   ├── profit-calculator.js
│   │   ├── buy-fee-calculator.js
│   │   ├── sell-fee-calculator.js
│   │   └── tax-calculator.js
│   ├── services/
│   │   └── currency-converter.js
│   └── __tests__/
│
├── application/                 # Use cases & orchestration
│   ├── calculate-tax/
│   │   ├── calculator.js
│   │   ├── index.js
│   │   └── __tests__/
│   └── index.js
│
├── infrastructure/              # External dependencies
│   ├── data/
│   │   ├── csv-loader.js
│   │   └── __tests__/
│   ├── repositories/
│   │   ├── trade-repository.js
│   │   └── __tests__/
│   └── services/
│       └── usd-pln-rate/
│           ├── rate-service.js
│           ├── index.js
│           └── __tests__/
│
├── presentation/                # User interfaces
│   ├── cli/
│   │   ├── console-reporter.js
│   │   └── index.js
│   └── api/                     # Future: REST API
│
├── config/
│   ├── default-config.js
│   └── index.js
│
└── services/
    └── fetch-spreadsheet.js     # Google Sheets utility
```

### Design Principles

**1. Dependency Inversion**
- Domain layer has no dependencies
- Infrastructure injects into application
- Configuration via constructor injection

**2. Single Responsibility**
- Each file handles one concern
- Calculators are pure functions
- Repositories handle data access only

**3. Testability**
- 84+ tests with >80% coverage
- Mocked dependencies in tests
- Integration tests with fixtures

**4. Extensibility**
The architecture supports future extensions:

**Adding REST API:**
```javascript
// app/presentation/api/routes/tax.js
router.post('/calculate-tax', async (req, res) => {
  const { calculateTax } = require('../../../application');
  const result = await calculateTax(req.body.config);
  res.json(result);
});
```

**Adding Database:**
```javascript
// app/infrastructure/database/trade-repository.js
class DbTradeRepository {
  async load() {
    // Query PostgreSQL instead of CSV
    return { closedPositions, buyTradesMap, sellTrades };
  }
}
```

**Adding Web UI:**
- Create `app/presentation/ui/` with Next.js/Remix
- Calls same application layer
- No domain/application changes needed

## Data Sources

The calculator requires 4 CSV files in `tmp/data/spreadsheet-tabs/`:

1. **closed_2025.csv** - Closed positions with realized P&L
2. **trades_2024.csv** - Buy transactions from 2024
3. **trades_2025.csv** - Buy and sell transactions from 2025
4. **rates.csv** - Daily USD/PLN exchange rates

All files are synced from Google Sheets using the fetch script (see below).

### Fetching Data from Google Spreadsheet

To sync the latest data from Google Sheets:

```bash
node fetch-all-tabs.js
```

This downloads all tabs from the spreadsheet and saves them as CSV files.

### Manual Google Spreadsheet CSV Fetch

```javascript
const { fetchGoogleSheetAsCSV } = require('./app/services/fetch-spreadsheet');

// Get the spreadsheet ID from the Google Sheets URL
// https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=SHEET_ID
const spreadsheetId = 'YOUR_SPREADSHEET_ID';
const gid = '0'; // Optional: specific sheet ID (default is first sheet)

fetchGoogleSheetAsCSV(spreadsheetId, gid)
  .then(csvData => {
    console.log('CSV Data:', csvData);
    // Process your CSV data here
  })
  .catch(err => console.error('Error:', err));
```

### Important Notes

- The Google Spreadsheet must be publicly accessible or shared with "anyone with the link"
- The `spreadsheetId` is the long string in the URL between `/d/` and `/edit`
- The `gid` parameter is optional and refers to a specific sheet within the spreadsheet (default is '0' for the first sheet)

## Requirements

- Node.js 24.13.0 LTS (managed via asdf)
- axios for HTTP requests
