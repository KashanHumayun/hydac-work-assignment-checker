const API_BASE_URL = "/api";

export async function fetchCountries() {
  const res = await fetch(`${API_BASE_URL}/countries`);
  if (!res.ok) {
    throw new Error("Failed to load countries");
  }
  const data = await res.json(); // [{ key, label }]
  // Adapt to what your frontend expects: { code, name }
  return data.map((c) => ({
    code: c.key,
    name: c.label
  }));
}

/**
 * input = {
 *   countryCode: string,
 *   activityType: 'business_meeting' | 'installation' | 'training' | 'mobile_only' | 'other',
 *   startDate: string,   // YYYY-MM-DD
 *   endDate: string,     // YYYY-MM-DD
 *   isMobileOnly: boolean,
 *   travellerRole: string
 * }
 */
export async function evaluate(input) {
  // Map frontend naming to backend API contract
  const payload = {
    countryKey: input.countryCode,
    typeOfActivity: input.activityType,
    travellerRole: input.travellerRole,
    startDate: input.startDate,
    endDate: input.endDate,
    isMobileOnly: Boolean(input.isMobileOnly)
  };

  const res = await fetch(`${API_BASE_URL}/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    let message = "Evaluation failed";
    try {
      const errBody = await res.json();
      if (errBody && errBody.message) {
        message = errBody.message;
      }
    } catch {
      const text = await res.text();
      if (text) message = text;
    }
    throw new Error(message);
  }

  // Backend returns:
  // {
  //   countryKey,
  //   typeOfActivity,
  //   travellerRole,
  //   startDate,
  //   endDate,
  //   durationDays,
  //   isMobileOnly,
  //   requiresNotification,
  //   ruleExplanation,
  //   details: { ...matrix categories... }
  // }
  return res.json();
}
