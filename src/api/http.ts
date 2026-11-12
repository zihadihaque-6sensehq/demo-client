import { getAdminSessionToken } from "@/auth/admin-session.client";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL ?? "";
}

export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const base = getBaseUrl();
  const url = base ? `${base.replace(/\/$/, "")}${path}` : path;
  const sessionToken = getAdminSessionToken();
  const authHeaders: Record<string, string> = {};
  if (sessionToken) {
    authHeaders.Authorization = `Bearer ${sessionToken}`;
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...init?.headers,
    },
    credentials: "include",
  });
  return response;
}

export async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    return {} as T;
  }
  return JSON.parse(text) as T;
}
