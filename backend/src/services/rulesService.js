const fs = require("fs");
const path = require("path");
const { loadMatrixFromPath, setMatrix } = require("../data/matrixLoader");

const RULES_DIR = path.join(process.cwd(), "data", "rules");
const VERSIONS_DIR = path.join(RULES_DIR, "versions");
const META_PATH = path.join(RULES_DIR, "meta.json");

function ensureRulesStorage() {
  if (!fs.existsSync(RULES_DIR)) fs.mkdirSync(RULES_DIR, { recursive: true });
  if (!fs.existsSync(VERSIONS_DIR)) fs.mkdirSync(VERSIONS_DIR, { recursive: true });

  if (!fs.existsSync(META_PATH)) {
    fs.writeFileSync(
      META_PATH,
      JSON.stringify({ activeVersion: null, latestVersion: 0, history: [] }, null, 2),
      "utf-8"
    );
  }
}

function readMeta() {
  ensureRulesStorage();
  return JSON.parse(fs.readFileSync(META_PATH, "utf-8"));
}

function writeMeta(meta) {
  fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2), "utf-8");
}

function getVersionPath(version) {
  return path.join(VERSIONS_DIR, `v${version}.csv`);
}

function normalizeUploadChecks({ originalName }) {
  if (!originalName || !originalName.toLowerCase().endsWith(".csv")) {
    const e = new Error("Only .csv files are allowed.");
    e.details = { originalName };
    throw e;
  }
}

function getActiveInfo() {
  const meta = readMeta();
  return {
    activeVersion: meta.activeVersion,
    latestVersion: meta.latestVersion,
    history: meta.history?.slice(0, 10) || [],
  };
}

async function uploadAndActivateRules({ originalName, mimeType, buffer }) {
  ensureRulesStorage();
  normalizeUploadChecks({ originalName });

  // 1) Write to a temp file first
  const meta = readMeta();
  const newVersion = (meta.latestVersion || 0) + 1;

  const tmpPath = path.join(VERSIONS_DIR, `__tmp_v${newVersion}.csv`);
  fs.writeFileSync(tmpPath, buffer);

  // 2) VALIDATE by trying to load/parse it with your existing matrix loader logic
  // If this throws, we keep activeVersion unchanged.
  let parsed;
  try {
    parsed = await loadMatrixFromPath(tmpPath); // returns {countries,data} (we'll implement below)
  } catch (err) {
    // remove temp file and reject
    try { fs.unlinkSync(tmpPath); } catch (_) {}
    const e = new Error("CSV validation failed. Keeping previous active rules.");
    e.details = { reason: err.message || String(err) };
    throw e;
  }

  // 3) Rename temp file to final version file
  const finalPath = getVersionPath(newVersion);
  fs.renameSync(tmpPath, finalPath);

  // 4) Activate version (only after validation success)
  meta.latestVersion = newVersion;
  meta.activeVersion = newVersion;
  meta.history = meta.history || [];
  meta.history.unshift({
    version: newVersion,
    filename: `v${newVersion}.csv`,
    uploadedAt: new Date().toISOString(),
    originalName,
    mimeType,
    countriesCount: parsed.countries?.length || 0,
  });
  writeMeta(meta);

  // 5) Hot-reload in memory immediately so evaluations use new rules without restart
  setMatrix(parsed);

  return {
    message: `Rules uploaded and activated as v${newVersion}.`,
    activeVersion: meta.activeVersion,
    latestVersion: meta.latestVersion,
    countriesCount: parsed.countries?.length || 0,
  };
}

module.exports = { uploadAndActivateRules, getActiveInfo, readMeta, getVersionPath };
