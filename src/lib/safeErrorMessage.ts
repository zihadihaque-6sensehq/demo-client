const SAFE_FALLBACK = "Something went wrong. Please try again.";

/** Strip control chars and cap length for safe UI display. */
export function toSafeDisplayMessage(raw: string | undefined, fallback = SAFE_FALLBACK): string {
  if (typeof raw !== "string" || raw.length === 0) {
    return fallback;
  }
  const stripped = raw.replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (!stripped) {
    return fallback;
  }
  return stripped.length > 240 ? `${stripped.slice(0, 237)}…` : stripped;
}

export const GENERIC_FORGOT_PASSWORD_ERROR =
  "If an account exists for this email, password recovery instructions will be sent.";

export const GENERIC_OAUTH_ERROR =
  "OAuth sign-in was denied or failed. Please try again.";
