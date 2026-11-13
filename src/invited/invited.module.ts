import { auditService } from "../audit/audit.module";
import { InvitedService } from "./invited.service";

export const invitedService = new InvitedService(auditService);
