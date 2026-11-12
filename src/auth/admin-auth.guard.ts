import { AdminIdentity } from "./admin-session.types";
import {
  AdminSessionService,
  UnauthorizedSessionError,
  adminSessionService,
} from "./admin-session.service";

export class UnauthorizedError extends Error {
  readonly status = 401 as const;

  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  readonly status = 403 as const;

  constructor() {
    super("Forbidden");
    this.name = "ForbiddenError";
  }
}

export class AdminAuthGuard {
  constructor(
    private readonly sessionService: AdminSessionService = adminSessionService,
  ) {}

  resolveAdminIdentity(authorizationHeader: string | undefined): AdminIdentity {
    if (!authorizationHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError();
    }

    const sessionToken = authorizationHeader.slice("Bearer ".length).trim();
    if (!sessionToken) {
      throw new UnauthorizedError();
    }

    let session;
    try {
      session = this.sessionService.validateBearerSession(sessionToken);
    } catch (error) {
      if (error instanceof UnauthorizedSessionError) {
        throw new UnauthorizedError();
      }
      throw new UnauthorizedError();
    }

    const adminIdentity = this.sessionService.attachIdentityFromSession(session);

    if (process.env.ADMIN_CUSTOMERS_ACCESS === "false") {
      throw new ForbiddenError();
    }

    return adminIdentity;
  }
}

export const adminAuthGuard = new AdminAuthGuard();
