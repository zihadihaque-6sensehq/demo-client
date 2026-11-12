import {
  GENERIC_FORGOT_PASSWORD_ERROR,
  GENERIC_OAUTH_ERROR,
  toSafeDisplayMessage,
} from "../lib/safeErrorMessage";
import type {
  ApiErrorBody,
  AuthStatusResponse,
  ForgotPasswordResponse,
  LegalContentResponse,
  LoginResponse,
  OAuthCallbackResponse,
  RedirectUrlResponse,
} from "./types";

const DEFAULT_TIMEOUT_MS = 30_000;

function getBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL ?? "";
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as ApiErrorBody;
    return toSafeDisplayMessage(
      body.errorMessage ?? body.message,
      `Request failed (${res.status})`,
    );
  } catch {
    return `Request failed (${res.status})`;
  }
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Network timeout. Please try again.");
    }
    throw err;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function getAuthStatus(): Promise<AuthStatusResponse> {
  const res = await fetchWithTimeout(`${getBaseUrl()}/session/auth-status`, {
    method: "GET",
    credentials: "include",
  });
  if (res.status === 503) {
    const message = await parseErrorMessage(res);
    throw new Error(message);
  }
  if (!res.ok) {
    const message = await parseErrorMessage(res);
    throw new Error(message);
  }
  return (await res.json()) as AuthStatusResponse;
}

export async function postLogin(email: string, password: string): Promise<LoginResponse> {
  const res = await fetchWithTimeout(`${getBaseUrl()}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = (await res.json()) as LoginResponse & ApiErrorBody;
  if (res.status === 401 || res.status === 403 || res.status === 500) {
    throw new Error(body.errorMessage ?? `Request failed (${res.status})`);
  }
  if (!res.ok) {
    throw new Error(body.errorMessage ?? `Request failed (${res.status})`);
  }
  return body;
}

export async function getSsoInit(params?: {
  returnUrl?: string;
  tenantHint?: string;
}): Promise<RedirectUrlResponse> {
  const search = new URLSearchParams();
  if (params?.returnUrl) search.set("returnUrl", params.returnUrl);
  if (params?.tenantHint) search.set("tenantHint", params.tenantHint);
  const qs = search.toString();
  const url = `${getBaseUrl()}/auth/sso/init${qs ? `?${qs}` : ""}`;
  const res = await fetchWithTimeout(url, { method: "GET", credentials: "include" });
  if (res.status === 502) {
    throw new Error(await parseErrorMessage(res));
  }
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return (await res.json()) as RedirectUrlResponse;
}

type OAuthProvider = "google" | "facebook" | "apple";

export async function getOAuthInit(
  provider: OAuthProvider,
  redirectUri: string,
  state: string,
): Promise<RedirectUrlResponse> {
  const search = new URLSearchParams({ redirectUri, state });
  const res = await fetchWithTimeout(
    `${getBaseUrl()}/auth/oauth/${provider}?${search.toString()}`,
    { method: "GET", credentials: "include" },
  );
  if (res.status === 502) {
    throw new Error(await parseErrorMessage(res));
  }
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return (await res.json()) as RedirectUrlResponse;
}

export async function getOAuthCallback(params: {
  authorizationCode?: string;
  state?: string;
}): Promise<OAuthCallbackResponse> {
  const search = new URLSearchParams();
  if (params.authorizationCode) search.set("authorizationCode", params.authorizationCode);
  if (params.state) search.set("state", params.state);
  const res = await fetchWithTimeout(
    `${getBaseUrl()}/auth/oauth/callback?${search.toString()}`,
    { method: "GET", credentials: "include" },
  );
  const body = (await res.json()) as OAuthCallbackResponse & ApiErrorBody;
  if (res.status === 400 || res.status === 401) {
    throw new Error(
      toSafeDisplayMessage(body.errorMessage, GENERIC_OAUTH_ERROR),
    );
  }
  if (!res.ok) {
    throw new Error(body.errorMessage ?? `Request failed (${res.status})`);
  }
  return body;
}

export async function getForgotPassword(emailPrefill?: string): Promise<ForgotPasswordResponse> {
  const search = new URLSearchParams();
  if (emailPrefill) search.set("emailPrefill", emailPrefill);
  const qs = search.toString();
  const url = `${getBaseUrl()}/auth/forgot-password${qs ? `?${qs}` : ""}`;
  const res = await fetchWithTimeout(url, { method: "GET", credentials: "include" });
  const body = (await res.json()) as ForgotPasswordResponse & ApiErrorBody;
  if (res.status === 404) {
    throw new Error(GENERIC_FORGOT_PASSWORD_ERROR);
  }
  if (res.status === 503) {
    throw new Error(
      toSafeDisplayMessage(
        body.errorMessage,
        "Password recovery is temporarily unavailable.",
      ),
    );
  }
  if (!res.ok) {
    throw new Error(body.errorMessage ?? `Request failed (${res.status})`);
  }
  return body;
}

export async function getLegalTerms(locale?: string): Promise<LegalContentResponse> {
  const search = new URLSearchParams();
  if (locale) search.set("locale", locale);
  const qs = search.toString();
  const res = await fetchWithTimeout(
    `${getBaseUrl()}/legal/terms${qs ? `?${qs}` : ""}`,
    { method: "GET" },
  );
  const body = (await res.json()) as LegalContentResponse & ApiErrorBody;
  if (res.status === 404) {
    throw new Error(body.errorMessage ?? "Terms not found");
  }
  if (!res.ok) {
    throw new Error(body.errorMessage ?? `Request failed (${res.status})`);
  }
  return body;
}

export async function getLegalPrivacy(locale?: string): Promise<LegalContentResponse> {
  const search = new URLSearchParams();
  if (locale) search.set("locale", locale);
  const qs = search.toString();
  const res = await fetchWithTimeout(
    `${getBaseUrl()}/legal/privacy${qs ? `?${qs}` : ""}`,
    { method: "GET" },
  );
  const body = (await res.json()) as LegalContentResponse & ApiErrorBody;
  if (res.status === 404) {
    throw new Error(body.errorMessage ?? "Privacy policy not found");
  }
  if (!res.ok) {
    throw new Error(body.errorMessage ?? `Request failed (${res.status})`);
  }
  return body;
}
