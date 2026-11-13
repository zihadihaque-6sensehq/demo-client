import {
  CustomerFiltersResponse,
  InvitedListParams,
  InvitedListResponse,
  SendInviteRequest,
  SendInviteResponse,
} from "@/types/invited";
import { ApiError, apiFetch, parseJson } from "./http";

const LIST_TIMEOUT_MS = 30_000;

function buildInvitedQuery(params: InvitedListParams): string {
  const search = new URLSearchParams();
  if (params.state && params.state !== "All") {
    search.set("state", params.state);
  }
  if (params.region && params.region !== "All") {
    search.set("region", params.region);
  }
  if (params.sort) {
    search.set("sort", params.sort);
  }
  if (params.page !== undefined) {
    search.set("page", String(params.page));
  }
  if (params.pageSize !== undefined) {
    search.set("pageSize", String(params.pageSize));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function fetchWithTimeout(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), LIST_TIMEOUT_MS);
  try {
    return await apiFetch(path, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

export async function getInvitedList(
  params: InvitedListParams = {},
): Promise<InvitedListResponse> {
  try {
    const response = await fetchWithTimeout(
      `/customers/invited${buildInvitedQuery(params)}`,
      { method: "GET" },
    );

    if (!response.ok) {
      const body = await parseJson<{ message?: string }>(response).catch(
        () => ({}) as { message?: string },
      );
      throw new ApiError(
        body.message ??
          (response.status === 401
            ? "Session ended"
            : response.status === 403
              ? "Forbidden"
              : "Failed to load invited list"),
        response.status,
      );
    }

    return parseJson<InvitedListResponse>(response);
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new ApiError("timeout", 0);
    }
    throw e;
  }
}

export async function sendInvite(
  body: SendInviteRequest,
): Promise<SendInviteResponse> {
  const response = await apiFetch("/customers/invites", {
    method: "POST",
    body: JSON.stringify({ email: body.email.trim() }),
  });

  if (!response.ok) {
    const bodyJson = await parseJson<{ message?: string; code?: string }>(
      response,
    ).catch(() => ({}) as { message?: string; code?: string });
    throw new ApiError(
      bodyJson.message ??
        (response.status === 401
          ? "Session ended"
          : response.status === 403
            ? "Forbidden"
            : response.status === 409
              ? "Conflict"
              : "Failed to send invite"),
      response.status,
      bodyJson.code,
    );
  }

  return parseJson<SendInviteResponse>(response);
}

export async function getCustomerFilters(
  state?: string,
): Promise<CustomerFiltersResponse> {
  const search = new URLSearchParams();
  if (state && state !== "All") {
    search.set("state", state);
  }
  const query = search.toString();
  const path = `/customers/filters${query ? `?${query}` : ""}`;

  const response = await apiFetch(path, { method: "GET" });

  if (!response.ok) {
    throw new ApiError(
      response.status === 401
        ? "Session ended"
        : response.status === 403
          ? "Forbidden"
          : "Failed to load filters",
      response.status,
    );
  }

  return parseJson<CustomerFiltersResponse>(response);
}
