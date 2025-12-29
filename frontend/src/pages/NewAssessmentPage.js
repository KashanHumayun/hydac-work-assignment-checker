import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCountries, evaluate } from "../api/evaluationApi";
import { useTranslation } from "react-i18next";

export default function NewAssessmentPage() {
  const { t } = useTranslation();

  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [errorCountries, setErrorCountries] = useState(null);

  const [form, setForm] = useState({
    countryCode: "",
    activityType: "business_meeting",
    startDate: "",
    endDate: "",
    isMobileOnly: false,
    travellerRole: "employee"
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadCountries() {
      setLoadingCountries(true);
      setErrorCountries(null);
      try {
        const data = await fetchCountries();
        setCountries(data);
      } catch (err) {
        console.error(err);
        setErrorCountries(t("newAssessment.loadCountriesError"));
      } finally {
        setLoadingCountries(false);
      }
    }
    loadCountries();
  }, [t]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function computeDurationDays(startDateStr, endDateStr) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (!startDateStr || !endDateStr || isNaN(start) || isNaN(end)) {
      return null;
    }

    const diffMs = end.getTime() - start.getTime();
    const raw = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return raw > 0 ? raw : null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);

    const durationDays = computeDurationDays(form.startDate, form.endDate);
    if (!durationDays) {
      setSubmitError(t("newAssessment.endDateError"));
      return;
    }

    // Build input for backend
    const apiInput = {
      countryCode: form.countryCode,
      activityType: form.activityType,
      startDate: form.startDate,
      endDate: form.endDate,
      isMobileOnly: form.isMobileOnly,
      travellerRole: form.travellerRole
    };

    setSubmitting(true);
    try {
      const result = await evaluate(apiInput);

      const country =
        countries.find((c) => c.code === form.countryCode) || {
          code: form.countryCode,
          name: form.countryCode
        };

      const inputForSummary = {
        ...apiInput,
        durationDays
      };

      navigate("/summary", {
        state: {
          country,
          input: inputForSummary,
          result
        }
      });
    } catch (err) {
      console.error(err);
      setSubmitError(
        err.message || "Evaluation failed. Please check the data and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const previewDays =
    form.startDate && form.endDate
      ? computeDurationDays(form.startDate, form.endDate)
      : null;

  return (
    <div className="page">
      <h1>{t("newAssessment.title")}</h1>
      <p className="page-intro">{t("newAssessment.intro")}</p>

      <form className="card form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="countryCode">{t("newAssessment.country")}</label>
            {loadingCountries ? (
              <div className="hint">Loading countries...</div>
            ) : errorCountries ? (
              <div className="error-text">{errorCountries}</div>
            ) : (
              <select
                id="countryCode"
                name="countryCode"
                value={form.countryCode}
                onChange={handleChange}
                required
              >
                <option value="">{t("newAssessment.selectCountry")}</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="activityType">{t("newAssessment.activity")}</label>
            <select
              id="activityType"
              name="activityType"
              value={form.activityType}
              onChange={handleChange}
            >
              <option value="business_meeting">
                {t("activityOptions.business_meeting")}
              </option>
              <option value="installation">
                {t("activityOptions.installation")}
              </option>
              <option value="training">{t("activityOptions.training")}</option>
              <option value="mobile_only">
                {t("activityOptions.mobile_only")}
              </option>
              <option value="other">{t("activityOptions.other")}</option>
            </select>
            <div className="hint">{t("newAssessment.activityHint")}</div>
          </div>

          <div className="form-group">
            <label htmlFor="travellerRole">
              {t("newAssessment.travellerRole")}
            </label>
            <select
              id="travellerRole"
              name="travellerRole"
              value={form.travellerRole}
              onChange={handleChange}
            >
              <option value="employee">{t("roleOptions.employee")}</option>
              <option value="contractor">{t("roleOptions.contractor")}</option>
              <option value="trainee">{t("roleOptions.trainee")}</option>
              <option value="external">{t("roleOptions.external")}</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="startDate">{t("newAssessment.startDate")}</label>
            <input
              id="startDate"
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">{t("newAssessment.endDate")}</label>
            <input
              id="endDate"
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              required
            />
            <div className="hint">{t("newAssessment.durationHint")}</div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isMobileOnly"
                checked={form.isMobileOnly}
                onChange={handleChange}
              />
              {t("newAssessment.mobileOnly")}
            </label>
            <div className="hint">{t("newAssessment.mobileHint")}</div>
          </div>
        </div>

        {previewDays !== null && (
          <div className="duration-preview">
            {t("newAssessment.durationCalculated", {
              days: previewDays || "-"
            })}
          </div>
        )}

        {submitError && <div className="error-text">{submitError}</div>}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? t("newAssessment.evaluating") : t("newAssessment.evaluate")}
          </button>
        </div>
      </form>
    </div>
  );
}
