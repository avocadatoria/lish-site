import { stringify } from 'csv-stringify';

/**
 * Create a readable stream of CSV data from an array of objects.
 *
 * @param {Array<Object>} data    - Array of row objects
 * @param {Array<{ key: string, header: string }>} columns - Column definitions
 * @returns {import(`stream`).Readable} Readable stream emitting CSV bytes
 */
export function createCsvStream(data, columns) {
  const stringifier = stringify({
    header: true,
    columns: columns.map((col) => ({
      key: col.key,
      header: col.header,
    })),
  });

  // Write all rows into the stringifier, then end
  for (const row of data) {
    stringifier.write(row);
  }
  stringifier.end();

  return stringifier;
}
