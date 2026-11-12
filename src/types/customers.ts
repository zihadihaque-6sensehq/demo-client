/** Shape aligned with feature-contract GET /customers response. */
export interface CustomerListItem {
  customerId: string;
  name?: string;
  email?: string;
  phone?: string;
  state?: string;
  region?: string;
  activityStatus?: string;
  activityLabel?: string;
  latestHaulCreated?: string;
  latestHaulStatus?: string;
  latestHaulId?: string;
}

export interface CustomersListResponse {
  customers: CustomerListItem[];
  totalCount?: number;
}

export interface CustomersListParams {
  state?: string;
  region?: string;
  activity?: string;
  sort?: string;
}

export interface ExportCustomersRequest {
  state?: string;
  region?: string;
  activity?: string;
}

export interface ExportCustomersResponse {
  exportJobId: string;
  accepted: boolean;
}

export type OverviewFilters = {
  state: string;
  region: string;
  activity: string;
};

export const DEFAULT_SORT = "latestHaulCreated";
export const ALL_FILTER = "All";

export type SortColumn =
  | "name"
  | "email"
  | "state"
  | "region"
  | "activityStatus"
  | "latestHaulCreated";

export type SortDirection = "asc" | "desc";
