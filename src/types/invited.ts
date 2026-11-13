/** Shape aligned with feature-contract GET /customers/invited response. */
export interface InvitedListItem {
  id: string;
  email: string | null;
  invitedAt?: string | null;
  status?: string | null;
}

export interface InvitedListResponse {
  items: InvitedListItem[];
  totalCount?: number;
}

export interface InvitedListParams {
  state?: string;
  region?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export interface SendInviteRequest {
  email: string;
}

export interface SendInviteResponse {
  inviteId: string;
  email: string;
  status: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface CustomerFiltersResponse {
  states: FilterOption[];
  regions: FilterOption[];
}

export type InvitedFilters = {
  state: string;
  region: string;
};

export const INVITED_ALL_FILTER = "All";
