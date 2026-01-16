# Claude Phone

A Node.js project for fetching Google Spreadsheets in CSV format.

## Setup

Install dependencies:

```bash
npm install
```

## Usage

### Fetching a Google Spreadsheet as CSV

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
