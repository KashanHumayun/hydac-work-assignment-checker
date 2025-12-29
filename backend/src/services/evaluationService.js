const { getMatrix } = require('../data/matrixLoader');

/**
 * Compute duration in days (inclusive).
 */
function getDurationDays(startDateStr, endDateStr) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  const ms = end.getTime() - start.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
  return days;
}

/**
 * Very basic decision logic:
 * - If mobile-only and "Mobile Arbeit" explicitly says "keine Meldepflicht" -> false
 * - Else if "Meldepflichtige Entsendetätigkeit" has any text -> true
 * - Otherwise -> false
 *
 * TODO: later refine per country / activity type with HYDAC legal.
 */
function evaluateAssignment({
  countryKey,
  typeOfActivity,
  travellerRole,
  startDate,
  endDate,
  isMobileOnly,
}) {
  const matrix = getMatrix();
  const countryData = matrix.data[countryKey];

  if (!countryData) {
    return {
      error: `Unknown country key: ${countryKey}`,
    };
  }

  const durationDays = getDurationDays(startDate, endDate);

  const mobileInfo = countryData['Mobile Arbeit'];
  const baseInfo = countryData['Meldepflichtige Entsendetätigkeit'];

  let requiresNotification = false;
  let ruleExplanation = '';

  if (isMobileOnly && mobileInfo) {
    const text = mobileInfo._value || Object.values(mobileInfo).join(' ');
    if (/keine\s+meldepflicht/i.test(text) || /nicht\s+meldepflichtig/i.test(text)) {
      requiresNotification = false;
      ruleExplanation =
        'Laut Matrix besteht für reine mobile Arbeit keine Meldepflicht (siehe Abschnitt "Mobile Arbeit").';
    } else {
      requiresNotification = true;
      ruleExplanation =
        'Die Matrix enthält besondere Regelungen für mobile Arbeit; konservativ wird eine Meldepflicht angenommen.';
    }
  } else if (baseInfo) {
    const text = baseInfo._value || Object.values(baseInfo).join(' ');
    if (text && text.trim().length > 0) {
      requiresNotification = true;
      ruleExplanation =
        'Für die im Land hinterlegte Entsendetätigkeit besteht grundsätzlich eine Meldepflicht (siehe Abschnitt "Meldepflichtige Entsendetätigkeit").';
    }
  } else {
    requiresNotification = false;
    ruleExplanation =
      'In der Matrix ist keine meldepflichtige Entsendetätigkeit hinterlegt; daher wird keine Meldepflicht angenommen.';
  }

  // You can log or store typeOfActivity / travellerRole if later needed
  return {
    countryKey,
    typeOfActivity,
    travellerRole,
    startDate,
    endDate,
    durationDays,
    isMobileOnly,
    requiresNotification,
    ruleExplanation,
    // full matrix data for frontend to render details:
    details: countryData,
  };
}

module.exports = { evaluateAssignment };
