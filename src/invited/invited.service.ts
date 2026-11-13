import { randomUUID } from "node:crypto";
import { AuditService } from "../audit/audit.service";
import { AdminIdentity } from "../auth/admin-session.types";
import { SendInviteResponse, StoredInviteRecord } from "./invited.types";

export class InvitedServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "InvitedServiceError";
  }
}

export class InvitedService {
  private readonly invites: StoredInviteRecord[] = [];
  private readonly registeredEmails = new Set(
    [
      "avery.chen@example.com",
      "jordan.lee@example.com",
      "sam.rivera@example.com",
      "morgan.patel@example.com",
    ].map((email) => email.toLowerCase()),
  );

  constructor(private readonly auditService: AuditService) {}

  sendInvite(
    emailInput: string,
    adminIdentity: AdminIdentity,
  ): SendInviteResponse {
    this.assertOperational();

    const email = emailInput.trim();
    const normalized = email.toLowerCase();

    if (this.registeredEmails.has(normalized)) {
      throw new InvitedServiceError(
        "This email is already associated with an existing customer account.",
        409,
        "EMAIL_ALREADY_REGISTERED",
      );
    }

    const existingInvite = this.invites.find(
      (invite) => invite.emailNormalized === normalized,
    );
    if (existingInvite) {
      throw new InvitedServiceError(
        "An invite has already been sent to this email address.",
        409,
        "INVITE_ALREADY_SENT",
      );
    }

    const inviteId = randomUUID();
    const invitedAt = new Date().toISOString();
    this.invites.unshift({
      id: inviteId,
      email,
      invitedAt,
      emailNormalized: normalized,
    });

    this.auditService.recordInviteSent({
      adminIdentity,
      inviteId,
      email,
    });

    return {
      inviteId,
      email,
      status: "pending",
    };
  }

  private assertOperational(): void {
    if (process.env.INVITED_SIMULATE_SERVER_ERROR === "true") {
      throw new InvitedServiceError("Invited service unavailable", 500);
    }
  }
}
