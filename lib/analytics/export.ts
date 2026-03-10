/**
 * CSV Export Utility
 * Generates CSV files from data arrays with proper escaping
 */

type CsvRow = Record<string, unknown>;

/**
 * Escape a value for CSV output
 */
function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // If value contains comma, newline, or quotes, wrap in quotes and escape existing quotes
  if (
    stringValue.includes(",") ||
    stringValue.includes("\n") ||
    stringValue.includes('"')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Generate CSV from array of objects
 * @param data - Array of objects to convert to CSV
 * @param headers - Array of header names (keys to extract from objects)
 * @returns CSV string
 */
export function generateCSV(data: CsvRow[], headers: string[]): string {
  if (data.length === 0) {
    return headers.join(",");
  }

  // Header row
  const headerRow = headers.map((h) => escapeCSVValue(h)).join(",");

  // Data rows
  const dataRows = data.map((row) => {
    return headers
      .map((header) => {
        const value = row[header];
        // Handle nested objects/arrays by JSON stringifying
        if (typeof value === "object" && value !== null) {
          return escapeCSVValue(JSON.stringify(value));
        }
        return escapeCSVValue(value);
      })
      .join(",");
  });

  return [headerRow, ...dataRows].join("\n");
}

/**
 * Generate CSV with custom column names
 * @param data - Array of objects to convert to CSV
 * @param columns - Array of {key: string, label: string} for mapping and labeling columns
 * @returns CSV string
 */
export function generateCSVWithLabels(
  data: CsvRow[],
  columns: Array<{ key: string; label: string }>,
): string {
  if (data.length === 0) {
    return columns.map((c) => escapeCSVValue(c.label)).join(",");
  }

  // Header row with custom labels
  const headerRow = columns.map((c) => escapeCSVValue(c.label)).join(",");

  // Data rows
  const dataRows = data.map((row) => {
    return columns
      .map((column) => {
        const value = row[column.key];
        // Handle nested objects/arrays by JSON stringifying
        if (typeof value === "object" && value !== null) {
          return escapeCSVValue(JSON.stringify(value));
        }
        return escapeCSVValue(value);
      })
      .join(",");
  });

  return [headerRow, ...dataRows].join("\n");
}
