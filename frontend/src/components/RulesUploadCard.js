import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
const { getActiveRules, uploadRulesCsv } = require("../api/rulesAPI.js");

export default function RulesUploadCard() {
  const { t } = useTranslation();

  const [activeInfo, setActiveInfo] = useState(null);
  const [file, setFile] = useState(null);

  const [loadingInfo, setLoadingInfo] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorDetails, setErrorDetails] = useState(null);

  async function refreshActive() {
    setLoadingInfo(true);
    try {
      const info = await getActiveRules();
      setActiveInfo(info);
    } catch (e) {
      setActiveInfo(null);
    } finally {
      setLoadingInfo(false);
    }
  }

  useEffect(() => {
    refreshActive();
  }, []);

  async function onUpload() {
    setSuccessMsg("");
    setErrorMsg("");
    setErrorDetails(null);

    if (!file) {
      setErrorMsg(t("rulesUpload.noFile"));
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErrorMsg(t("rulesUpload.onlyCsv"));
      return;
    }

    setUploading(true);
    try {
      const result = await uploadRulesCsv(file);
      setSuccessMsg(
        t("rulesUpload.success", {
          version: result.activeVersion ?? "-",
          countries: result.countriesCount ?? "-",
        })
      );
      setFile(null);
      await refreshActive();
    } catch (e) {
      setErrorMsg(e.message || t("rulesUpload.failed"));
      setErrorDetails(e.details || null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="card rules-card">
      <div className="card-title">{t("rulesUpload.title")}</div>

      <div className="rules-meta">
        {loadingInfo ? (
          <div className="muted">{t("rulesUpload.loading")}</div>
        ) : activeInfo ? (
          <div className="muted">
            {t("rulesUpload.activeInfo", {
              active: activeInfo.activeVersion ?? "-",
              latest: activeInfo.latestVersion ?? "-",
            })}
          </div>
        ) : (
          <div className="muted">{t("rulesUpload.noActiveInfo")}</div>
        )}
      </div>

      <div className="rules-row">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={uploading}
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={onUpload}
          disabled={uploading || !file}
        >
          {uploading ? t("rulesUpload.uploading") : t("rulesUpload.uploadBtn")}
        </button>
      </div>

      <div className="muted rules-hint">{t("rulesUpload.hint")}</div>

      {successMsg ? <div className="alert success">{successMsg}</div> : null}

      {errorMsg ? (
        <div className="alert error">
          <div>{errorMsg}</div>

          {errorDetails ? (
            <pre className="error-details">
              {JSON.stringify(errorDetails, null, 2)}
            </pre>
          ) : null}

          <div className="muted">
            {t("rulesUpload.fallbackNote")}
          </div>
        </div>
      ) : null}
    </div>
  );
}
