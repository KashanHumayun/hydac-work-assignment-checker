const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const logger = require('../utils/logger');

let matrixState = null;

/**
 * Parse a CSV file at the given filePath and return { countries, categories, data }
 * Throws if CSV is invalid or missing required structure.
 */
async function loadMatrixFromPath(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV file not found: ${filePath}`);
  }

  const csvContent = fs.readFileSync(filePath, 'utf8');

  // Parse with semicolon as delimiter (your matrix format)
  const rows = parse(csvContent, {
    delimiter: ';',
    skip_empty_lines: false, // keep empty rows, we handle them ourselves
    bom: true,               // handle UTF-8 BOM if present
    relax_column_count: true // tolerate uneven row lengths
  });

  if (!rows || rows.length === 0) {
    throw new Error('Matrix CSV has no data.');
  }

  // First row = header with country names (first 2 cells are empty)
  const headerRow = rows[0].map((cell) => (cell || '').trim());

  // country headers = everything from index 2 onwards
  const countryHeaders = headerRow
    .slice(2)
    .map((h) => (h || '').trim())
    .filter((h) => h.length > 0);

  if (countryHeaders.length === 0) {
    throw new Error(
      'Matrix CSV has no country headers (expected from column 3 onwards).'
    );
  }

  // Duplicate header check
  const seen = new Set();
  for (const h of countryHeaders) {
    if (seen.has(h)) {
      throw new Error(`Duplicate country header detected: "${h}"`);
    }
    seen.add(h);
  }

  // mapping index -> country key
  const columnIndexToCountryKey = {};
  for (let col = 2; col < headerRow.length; col += 1) {
    const key = (headerRow[col] || '').trim();
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

  // Iterate data rows (starting after header row)
  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];

    // skip empty/invalid rows
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
      if (!cell) continue;

      if (!data[countryKey]) data[countryKey] = {};
      if (!data[countryKey][category]) data[countryKey][category] = {};

      if (subcategory) {
        data[countryKey][category][subcategory] = cell;
      } else {
        data[countryKey][category]._value = cell;
      }
    }
  }

  if (categoriesSet.size === 0) {
    throw new Error('Matrix CSV has no categories in the first column.');
  }

  if (Object.keys(data).length === 0) {
    throw new Error('Matrix CSV contains no rule data (all cells are empty).');
  }

  const result = {
    countries,
    categories: Array.from(categoriesSet),
    data,
  };

  logger.info(
    `Matrix loaded from ${path.basename(filePath)}: ${countries.length} countries, ${result.categories.length} categories`
  );

  return result;
}

/**
 * Replace the in-memory matrix with a new object
 */
function setMatrix(matrixObj) {
  matrixState = matrixObj;
}

function getMatrix() {
  if (!matrixState) {
    throw new Error('Matrix not loaded yet. Call loadMatrix() first.');
  }
  return matrixState;
}

/**
 * Load matrix: use active version if exists, else fallback to default CSV in /data directory
 */
async function loadMatrix() {
  let activeVersion = null;
  let activePath = null;

  // 1) Try to find active version from rules meta (lazy require avoids startup issues)
  try {
    const { readMeta, getVersionPath } = require('../services/rulesService');
    const meta = readMeta();
    if (meta && meta.activeVersion) {
      activeVersion = meta.activeVersion;
      activePath = getVersionPath(activeVersion);
    }
  } catch (_) {
    // ignore if rulesService not ready or no active version
  }

  // 2) Determine fallback CSV (deterministic)
  const dataDir = path.join(__dirname, '../../data');
  const fallbackCsv = path.join(
    dataDir,
    'Ländermatrix_EU-Meldungen_Stand_10-2025(Hauptübersicht).csv'
  );

  let fileToLoad = null;

  if (activePath && fs.existsSync(activePath)) {
    fileToLoad = activePath;
    logger.info(`Loading active rules version: v${activeVersion}`);
  } else if (fs.existsSync(fallbackCsv)) {
    fileToLoad = fallbackCsv;
    logger.info(`Loading matrix from default CSV: ${path.basename(fallbackCsv)}`);
  } else {
    // last resort: pick any csv (kept only as safety net)
    const files = fs.readdirSync(dataDir);
    const csvFile = files.find((file) => file.toLowerCase().endsWith('.csv'));
    if (!csvFile) {
      throw new Error('No CSV file found in /data directory.');
    }
    fileToLoad = path.join(dataDir, csvFile);
    logger.info('Loading matrix from fallback CSV:', csvFile);
  }

  const parsed = await loadMatrixFromPath(fileToLoad);
  setMatrix(parsed);
  return parsed;
}

module.exports = { loadMatrix, getMatrix, loadMatrixFromPath, setMatrix };
