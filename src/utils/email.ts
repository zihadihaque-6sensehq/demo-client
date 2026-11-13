const EMAIL_MAX_LENGTH = 254;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateInviteEmail(
  raw: string,
): { valid: true; email: string } | { valid: false; message: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { valid: false, message: "Email is required." };
  }
  if (trimmed.length > EMAIL_MAX_LENGTH) {
    return { valid: false, message: "Please enter a valid email address." };
  }
  if (!EMAIL_PATTERN.test(trimmed)) {
    return { valid: false, message: "Please enter a valid email address." };
  }
  return { valid: true, email: trimmed };
}
