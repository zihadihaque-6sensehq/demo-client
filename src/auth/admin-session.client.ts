const SESSION_STORAGE_KEY = "easygig.admin.sessionToken";

export function getAdminSessionToken(): string | undefined {
  if (typeof sessionStorage !== "undefined") {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      return stored;
    }
  }
  const fromEnv = import.meta.env.VITE_ADMIN_SESSION_TOKEN;
  return fromEnv || undefined;
}

export function setAdminSessionToken(token: string): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  sessionStorage.setItem(SESSION_STORAGE_KEY, token);
}
