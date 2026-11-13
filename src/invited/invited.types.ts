export interface SendInviteResponse {
  inviteId: string;
  email: string;
  status: string;
}

export interface StoredInviteRecord {
  id: string;
  email: string;
  invitedAt: string;
  emailNormalized: string;
}
