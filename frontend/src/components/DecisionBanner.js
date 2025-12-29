import React from "react";
import { useTranslation } from "react-i18next";

export default function DecisionBanner({ requiresNotification }) {
  const { t } = useTranslation();

  if (requiresNotification === true) {
    return (
      <div className="decision-banner decision-banner-warning">
        {t("decisionBanner.required")}
      </div>
    );
  }

  if (requiresNotification === false) {
    return (
      <div className="decision-banner decision-banner-success">
        {t("decisionBanner.notRequired")}
      </div>
    );
  }

  return (
    <div className="decision-banner decision-banner-unknown">
      {t("decisionBanner.unknown")}
    </div>
  );
}
