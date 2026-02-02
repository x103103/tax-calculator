import { promises as fs } from 'fs';

/**
 * Strip surrounding quotes from a string
 */
function stripQuotes(value: string): string {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  return value;
}

/**
 * Parse CSV line handling quoted fields with commas
 */
function parseQuotedCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === ',' && !inQuotes) {
      result.push(stripQuotes(current));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(stripQuotes(current));
  return result;
}

/**
 * Parse single CSV line into object using headers
 * @param line - CSV line to parse
 * @param headers - Column headers
 * @returns Parsed row object
 */
function parseCsvLine(
  line: string,
  headers: string[]
): Record<string, string> {
  const hasQuotes = line.includes('"');
  const values = hasQuotes ? parseQuotedCsvLine(line) : line.split(',');
  const obj: Record<string, string> = {};
  headers.forEach((header, index) => {
    obj[header] = values[index] || '';
  });
  return obj;
}

/**
 * Load CSV file and return array of row objects
 * @param filePath - Absolute path to CSV file
 * @returns Array of parsed row objects
 * @throws Error if file read fails or file is empty
 */
export async function loadCsv<T extends Record<string, string> = Record<string, string>>(
  filePath: string
): Promise<T[]> {
  const data = await fs.readFile(filePath, 'utf-8');
  const trimmed = data.trim();

  if (!trimmed) {
    return [];
  }

  const lines = trimmed.split('\n');
  if (lines.length < 2) {
    return []; // Header only or empty
  }

  const hasQuotes = lines[0].includes('"');
  const headers = hasQuotes ? parseQuotedCsvLine(lines[0]) : lines[0].split(',');
  const rows: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim()) {
      rows.push(parseCsvLine(line, headers) as T);
    }
  }

  return rows;
}

export { parseCsvLine };
