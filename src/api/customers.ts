import {
  CustomersListParams,
  CustomersListResponse,
  DEFAULT_SORT,
  ExportCustomersRequest,
  ExportCustomersResponse,
} from "@/types/customers";
import { ApiError, apiFetch, parseJson } from "./http";

function buildCustomersQuery(params: CustomersListParams): string {
  const search = new URLSearchParams();
  if (params.state && params.state !== "All") {
    search.set("state", params.state);
  }
  if (params.region && params.region !== "All") {
    search.set("region", params.region);
  }
  if (params.activity && params.activity !== "All") {
    search.set("activity", params.activity);
  }
  const sort = params.sort ?? DEFAULT_SORT;
  search.set("sort", sort);
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function getCustomers(
  params: CustomersListParams = {},
): Promise<CustomersListResponse> {
  const response = await apiFetch(
    `/customers${buildCustomersQuery(params)}`,
    { method: "GET" },
  );

  if (!response.ok) {
    throw new ApiError(
      response.status === 401
        ? "Session ended"
        : response.status === 403
          ? "Forbidden"
          : "Failed to load customers",
      response.status,
    );
  }

  return parseJson<CustomersListResponse>(response);
}

export async function exportCustomers(
  body: ExportCustomersRequest,
): Promise<ExportCustomersResponse> {
  const payload: ExportCustomersRequest = {};
  if (body.state && body.state !== "All") payload.state = body.state;
  if (body.region && body.region !== "All") payload.region = body.region;
  if (body.activity && body.activity !== "All") payload.activity = body.activity;

  const response = await apiFetch("/customers/export", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new ApiError(
      response.status === 401
        ? "Session ended"
        : "Export could not be started",
      response.status,
    );
  }

  return parseJson<ExportCustomersResponse>(response);
}
