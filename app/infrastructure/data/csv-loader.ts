import { promises as fs } from 'fs';

/**
 * Parse single CSV line into object using headers
 * @param line - CSV line to parse
 * @param headers - Column headers
 * @returns Parsed row object
 */
function parseCsvLine<T extends Record<string, string>>(
  line: string,
  headers: string[]
): T {
  const values = line.split(',');
  const obj: Record<string, string> = {};
  headers.forEach((header, index) => {
    obj[header] = values[index] || '';
  });
  return obj as T;
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

  const headers = lines[0].split(',');
  const rows: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim()) {
      rows.push(parseCsvLine<T>(line, headers));
    }
  }

  return rows;
}

export { parseCsvLine };
