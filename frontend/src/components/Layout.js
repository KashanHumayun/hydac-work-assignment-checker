import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Layout({ children }) {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const isDE = i18n.language === "de";

  function toggleLang() {
    const next = isDE ? "en" : "de";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header-left">
          <div className="logo-container">
            <img
              src="/hydac-logo.png"
              alt="HYDAC Logo"
              className="hydac-logo"
            />
          </div>
          <div>
            <div className="app-title">{t("app.title")}</div>
            <div className="app-subtitle">{t("app.subtitle")}</div>
          </div>
        </div>

        <nav className="app-nav">
<div
  className={`lang-toggle ${isDE ? "is-on" : "is-off"}`}
  role="switch"
  aria-checked={isDE}
  tabIndex={0}
  onClick={toggleLang}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") toggleLang();
  }}
  title={t("lang.title")}
  aria-label={t("lang.aria")}
>
  <span className={`lang-toggle-label ${!isDE ? "active" : ""}`}>EN</span>

  <span className="lang-toggle-track">
    <span className="lang-toggle-thumb" />
  </span>

  <span className={`lang-toggle-label ${isDE ? "active" : ""}`}>DE</span>
</div>



          <Link
            to="/"
            className={
              location.pathname === "/"
                ? "nav-link btn btn-primary"
                : "nav-link btn btn-outline"
            }
          >
            {t("app.newAssessment")}
          </Link>
        </nav>
      </header>

      <main className="app-main">{children}</main>

      <footer className="app-footer">{t("app.footer")}</footer>
    </div>
  );
}
