const fs = require('fs').promises;

/**
 * Parse single CSV line into object using headers
 * @param {string} line - CSV line to parse
 * @param {string[]} headers - Column headers
 * @returns {Object} Parsed row object
 */
function parseCsvLine(line, headers) {
  const values = line.split(',');
  const obj = {};
  headers.forEach((header, index) => {
    obj[header] = values[index] || '';
  });
  return obj;
}

/**
 * Load CSV file and return array of row objects
 * @param {string} filePath - Absolute path to CSV file
 * @returns {Promise<Object[]>} Array of parsed row objects
 * @throws {Error} If file read fails or file is empty
 */
async function loadCsv(filePath) {
  const data = await fs.readFile(filePath, 'utf-8');
  const trimmed = data.trim();

  if (!trimmed) {
    return [];
  }

  const lines = trimmed.split('\n');
  if (lines.length < 2) {
    return []; // Header only or empty
  }

  const headers = lines[0].split(',');
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim()) {
      rows.push(parseCsvLine(line, headers));
    }
  }

  return rows;
}

module.exports = {
  loadCsv,
  parseCsvLine,
};
