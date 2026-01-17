const axios = require('axios');

/**
 * Fetch a Google Spreadsheet in CSV format
 * @param {string} spreadsheetId - The ID from the Google Sheets URL
 * @param {string} gid - Optional sheet ID (default is first sheet)
 * @returns {Promise<string>} CSV data as a string
 */
async function fetchGoogleSheetAsCSV(spreadsheetId, gid = '0') {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching spreadsheet:', error.message);
    throw error;
  }
}

// Example usage:
// const spreadsheetId = 'YOUR_SPREADSHEET_ID'; // From the URL
// fetchGoogleSheetAsCSV(spreadsheetId)
//   .then(csvData => console.log(csvData))
//   .catch(err => console.error(err));

module.exports = { fetchGoogleSheetAsCSV };
