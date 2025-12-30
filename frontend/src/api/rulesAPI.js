const API_BASE = "http://localhost:4000";

async function getActiveRules() {
  const res = await fetch(`${API_BASE}/api/rules/active`);
  if (!res.ok) {
    throw new Error("Failed to fetch active rules info.");
  }
  return res.json();
}

async function uploadRulesCsv(file) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${API_BASE}/api/rules/upload`, {
    method: "POST",
    body: fd,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || "Upload failed.");
    err.details = data.details || null;
    throw err;
  }

  return data;
}

module.exports = { getActiveRules, uploadRulesCsv };
