const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const logger = require('../utils/logger');

let matrixState = null;

/**
 * Load CSV from /data (first .csv file) and turn it into:
 *
 * {
 *   countries: [ { key, label } ],
 *   categories: [ "Meldepflichtige Entsendetätigkeit", ... ],
 *   data: {
 *     [countryKey]: {
 *       [category]: {
 *         _value?: string,              // when there is no subcategory
 *         [subcategory: string]: string // when there is a subcategory
 *       }
 *     }
 *   }
 * }
 */
async function loadMatrix() {
  const dataDir = path.join(__dirname, '../../data');

  // 1) Pick the first .csv file in /data
  const files = fs.readdirSync(dataDir);
  const csvFile = files.find((file) => file.toLowerCase().endsWith('.csv'));

  if (!csvFile) {
    throw new Error('No CSV file found in /data directory.');
  }

  const csvPath = path.join(dataDir, csvFile);
  logger.info('Loading matrix from:', csvPath);

  const csvContent = fs.readFileSync(csvPath, 'utf8');

  // 2) Parse with semicolon as delimiter
  const rows = parse(csvContent, {
    delimiter: ';',
    skip_empty_lines: false, // keep empty rows, we handle them ourselves
  });

  if (!rows.length) {
    throw new Error('Matrix CSV has no data.');
  }

  // 3) First row = header with country names (first 2 cells are empty)
  const headerRow = rows[0].map((cell) => (cell || '').trim());

  // country headers = everything from index 2 onwards
  const countryHeaders = headerRow
    .slice(2)
    .map((h) => h.trim())
    .filter((h) => h.length > 0);

  // mapping index -> country key
  const columnIndexToCountryKey = {};
  for (let col = 2; col < headerRow.length; col += 1) {
    const key = headerRow[col] && headerRow[col].trim();
    if (!key) continue;
    columnIndexToCountryKey[col] = key;
  }

  const countries = countryHeaders.map((key) => {
    // Clean label: drop " (Erledigt)" etc.
    const label = key.replace(/\s*\(.*?\)\s*$/, '').trim();
    return { key, label };
  });

  const data = {};
  const categoriesSet = new Set();

  let currentCategory = null;

  // 4) Iterate data rows (starting after header row)
  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];

    // Defensive: skip if row is too short
    if (!row || row.length < 3) continue;

    const rawCategory = (row[0] || '').trim();
    const rawSubcategory = (row[1] || '').trim();

    // Category only set when non-empty; then repeated rows with empty category
    if (rawCategory) {
      currentCategory = rawCategory;
    }

    if (!currentCategory) {
      // still haven't hit the first category – skip
      continue;
    }

    const category = currentCategory;
    const subcategory = rawSubcategory || null;

    categoriesSet.add(category);

    // Loop over all country columns
    for (let col = 2; col < row.length; col += 1) {
      const countryKey = columnIndexToCountryKey[col];
      if (!countryKey) continue; // column with no country header

      const cell = (row[col] || '').trim();
      if (!cell) continue; // nothing for that country+category

      if (!data[countryKey]) {
        data[countryKey] = {};
      }
      if (!data[countryKey][category]) {
        data[countryKey][category] = {};
      }

      if (subcategory) {
        // e.g. "Inhalt der Meldung" → "Angaben zum entsendenden Arbeitgeber"
        data[countryKey][category][subcategory] = cell;
      } else {
        // category without subcategories → store under _value
        data[countryKey][category]._value = cell;
      }
    }
  }

  matrixState = {
    countries,
    categories: Array.from(categoriesSet),
    data,
  };

  logger.info(
    `Matrix loaded: ${countries.length} countries, ${matrixState.categories.length} categories`
  );

  return matrixState;
}

function getMatrix() {
  if (!matrixState) {
    throw new Error('Matrix not loaded yet. Call loadMatrix() first.');
  }
  return matrixState;
}

module.exports = { loadMatrix, getMatrix };
