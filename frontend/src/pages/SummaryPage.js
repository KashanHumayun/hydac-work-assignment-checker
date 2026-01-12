import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DecisionBanner from "../components/DecisionBanner";
import { useTranslation } from "react-i18next";

export default function SummaryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const data = location.state;

  if (!data) {
    return (
      <div className="page">
        <h1>{t("summary.title")}</h1>
        <div className="card">
          <p>{t("summary.noData")}</p>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            {t("summary.newAssessmentBtn")}
          </button>
        </div>
      </div>
    );
  }

  const { country, input, result } = data;

  // Helper to flatten category from result.details
  function getCategoryText(categoryName) {
    const cat = result.details?.[categoryName];
    if (!cat) return null;

    const parts = [];
    if (cat._value) parts.push(cat._value);

    const subKeys = Object.keys(cat).filter((k) => k !== "_value");
    for (const key of subKeys) {
      const text = cat[key];
      if (text) parts.push(`${key}: ${text}`);
    }

    return parts.length ? parts.join(" ") : null;
  }

  const notificationForm = getCategoryText("Form der Abgabe der Meldung");
  const notificationDeadline = getCategoryText("Frist der Meldung");
  const documentsSummary = getCategoryText("Mitzuführende Dokumente");
  const postStaySummary = getCategoryText(
    "Pflichten nach Aufenthalt für den entsendenden AG"
  );
  const sanctionsSummary = getCategoryText("Sanktionen");
  const localRepInfo = getCategoryText("Lokaler Ansprechpartner");

  // Fallback printable HTML for browser "Save as PDF"
  function buildPrintableHtml() {
    const escape = (s) =>
      s ? String(s).replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";

    const date = new Date().toLocaleString();

    const rows = (label, value) => `
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:8px 12px; font-weight:600; width:220px; vertical-align:top">${label}</td>
        <td style="padding:8px 12px; vertical-align:top">${escape(value) || "-"}</td>
      </tr>
    `;

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>HYDAC Assessment - ${escape(country?.name || country?.code || "assignment")}</title>
          <style>
            body { font-family: Inter, system-ui, -apple-system, Arial, sans-serif; color:#222; margin:24px; }
            .header { display:flex; align-items:center; gap:12px; }
            .logo { height:36px; }
            h1 { margin:12px 0 2px 0; font-size:20px; }
            .meta { color:#666; font-size:0.9rem; margin-bottom:12px; }
            table { border-collapse:collapse; width:100%; max-width:900px; }
            .section { margin-top:18px; }
            .section h3 { margin:8px 0; font-size:16px; }
            .block { padding:12px; border-radius:8px; background:#fafafa; border:1px solid #efefef; }
            .small { font-size:0.9rem; color:#666 }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/hydac-logo.png" alt="HYDAC" class="logo" />
            <div>
              <h1>${escape(t("summary.title"))} — ${escape(country?.name || country?.code)}</h1>
              <div class="meta">Exported: ${date}</div>
            </div>
          </div>

          <div class="section">
            <h3>${escape(t("summary.basicInfo"))}</h3>
            <div class="block">
              <table>
                ${rows(t("summary.country"), country?.name || country?.code)}
                ${rows(t("summary.activityType"), input.activityType)}
                ${rows(t("summary.duration"), `${input.durationDays} day(s)`)}
                ${rows(t("summary.travellerRole"), input.travellerRole)}
                ${rows(t("summary.mobileOnly"), input.isMobileOnly ? t("summary.yes") : t("summary.no"))}
              </table>
            </div>
          </div>

          <div class="section">
            <h3>${escape(t("summary.decision"))}</h3>
            <div class="block">
              <div style="margin-bottom:8px;">
                ${escape(result.ruleExplanation || t("summary.fallbackExplanation"))}
              </div>

              <table>
                ${rows("Requires notification", String(result.requiresNotification))}
                ${rows(t("summary.authorityForm"), notificationForm || t("summary.notSpecified"))}
                ${rows(t("summary.deadline"), notificationDeadline || t("summary.notSpecified"))}
                ${rows(t("summary.localRep"), localRepInfo || t("summary.notSpecified"))}
              </table>

              ${
                documentsSummary
                  ? `<div class="section"><h3>${escape(t("summary.documents"))}</h3><div class="block small">${escape(documentsSummary)}</div></div>`
                  : ""
              }
              ${
                postStaySummary
                  ? `<div class="section"><h3>${escape(t("summary.postStay"))}</h3><div class="block small">${escape(postStaySummary)}</div></div>`
                  : ""
              }
              ${
                sanctionsSummary
                  ? `<div class="section"><h3>${escape(t("summary.sanctions"))}</h3><div class="block small">${escape(sanctionsSummary)}</div></div>`
                  : ""
              }
            </div>
          </div>

          <div class="section small">${escape(t("summary.disclaimer"))}</div>
        </body>
      </html>
    `;
  }

  async function handleDownloadPdf() {
    try {
      const response = await fetch("/api/evaluate/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, input, result })
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const filename =
        `hydac-assessment-${
          (country?.name || country?.code || "assignment")
            .replace(/[^a-z0-9]+/gi, "-")
            .toLowerCase()
        }.pdf`;

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export to PDF failed", err);

      // fallback: browser print -> Save as PDF
      try {
        const html = buildPrintableHtml();
        const w = window.open("", "_blank", "noopener,noreferrer,width=1000,height=800");
        if (!w) {
          alert("Export failed and popup blocked. Please allow popups or try again.");
          return;
        }
        w.document.open();
        w.document.write(html);
        w.document.close();
        setTimeout(() => {
          w.focus();
          w.print();
        }, 400);
      } catch {
        alert("Export failed. Please try again or contact support.");
      }
    }
  }

  return (
    <div className="page">
      <h1>{t("summary.title")}</h1>

      <DecisionBanner requiresNotification={result.requiresNotification} />

      <div className="card summary-card">
        <section className="summary-section">
          <h2>{t("summary.basicInfo")}</h2>
          <div className="summary-grid">
            <div>
              <div className="summary-label">{t("summary.country")}</div>
              <div className="summary-value">{country?.name || country?.code}</div>
            </div>
            <div>
              <div className="summary-label">{t("summary.activityType")}</div>
              <div className="summary-value">{input.activityType}</div>
            </div>
            <div>
              <div className="summary-label">{t("summary.duration")}</div>
              <div className="summary-value">{input.durationDays} day(s)</div>
            </div>
            <div>
              <div className="summary-label">{t("summary.travellerRole")}</div>
              <div className="summary-value">{input.travellerRole}</div>
            </div>
            <div>
              <div className="summary-label">{t("summary.mobileOnly")}</div>
              <div className="summary-value">
                {input.isMobileOnly ? t("summary.yes") : t("summary.no")}
              </div>
            </div>
          </div>
        </section>

        <section className="summary-section">
          <h2>{t("summary.decision")}</h2>
          <p className="reasoning-text">
            {result.ruleExplanation || t("summary.fallbackExplanation")}
          </p>

          {result.requiresNotification === true && (
            <>
              <div className="summary-grid">
                <div>
                  <div className="summary-label">{t("summary.authorityForm")}</div>
                  <div className="summary-value">
                    {notificationForm || t("summary.notSpecified")}
                  </div>
                </div>
                <div>
                  <div className="summary-label">{t("summary.deadline")}</div>
                  <div className="summary-value">
                    {notificationDeadline || t("summary.notSpecified")}
                  </div>
                </div>
                <div>
                  <div className="summary-label">{t("summary.localRep")}</div>
                  <div className="summary-value">
                    {localRepInfo || t("summary.notSpecified")}
                  </div>
                </div>
              </div>

              {documentsSummary && (
                <div className="summary-block">
                  <div className="summary-label">{t("summary.documents")}</div>
                  <div className="summary-value">{documentsSummary}</div>
                </div>
              )}

              {postStaySummary && (
                <div className="summary-block">
                  <div className="summary-label">{t("summary.postStay")}</div>
                  <div className="summary-value">{postStaySummary}</div>
                </div>
              )}

              {sanctionsSummary && (
                <div className="summary-block">
                  <div className="summary-label">{t("summary.sanctions")}</div>
                  <div className="summary-value">{sanctionsSummary}</div>
                </div>
              )}
            </>
          )}

          {result.requiresNotification === false && (
            <p className="hint">{t("summary.noNotificationHint")}</p>
          )}

          {result.requiresNotification === null && (
            <p className="hint error-text">{t("summary.unknownHint")}</p>
          )}
        </section>

        <section className="summary-section">
          <h2>{t("summary.disclaimerTitle")}</h2>
          <p className="hint">{t("summary.disclaimer")}</p>
        </section>

        <div className="form-actions">
          <button className="btn btn-secondary" onClick={handleDownloadPdf}>
            {t("summary.downloadPdf")}
          </button>

          <button className="btn btn-primary" onClick={() => navigate("/")}>
            {t("summary.newAssessmentBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}
