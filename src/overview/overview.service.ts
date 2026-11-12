import { randomUUID } from "node:crypto";
import { AuditService, auditService } from "../audit/audit.service";
import { AdminIdentity } from "../auth/admin-session.types";
import {
  CustomerRecord,
  CustomersListResponse,
  ExportCustomersDto,
  ExportCustomersResponse,
  GetCustomersQueryDto,
} from "./overview.types";

const SEED_CUSTOMERS: CustomerRecord[] = [
  {
    customerId: "cust-001",
    identityName: "Avery Chen",
    contactPhone: "+1 555-0101",
    contactEmail: "avery.chen@example.com",
    state: "California",
    region: "Bay Area",
    activityStatus: "Active",
    latestHaulCreated: "2025-11-10T14:30:00.000Z",
    latestHaulStatus: "Completed",
  },
  {
    customerId: "cust-002",
    identityName: "Jordan Lee",
    contactPhone: "+1 555-0102",
    contactEmail: "jordan.lee@example.com",
    state: "Texas",
    region: "Austin",
    activityStatus: "Active",
    latestHaulCreated: "2025-11-11T09:15:00.000Z",
    latestHaulStatus: "Scheduled",
  },
  {
    customerId: "cust-003",
    identityName: "Sam Rivera",
    contactEmail: "sam.rivera@example.com",
    state: "California",
    region: "Los Angeles",
    activityStatus: "Paused",
    latestHaulCreated: "2025-11-08T18:45:00.000Z",
    latestHaulStatus: "Completed",
  },
  {
    customerId: "cust-004",
    identityName: "Morgan Patel",
    contactPhone: "+1 555-0104",
    state: "New York",
    region: "NYC",
    activityStatus: "Active",
    latestHaulCreated: "2025-11-12T08:00:00.000Z",
    latestHaulStatus: "In progress",
  },
];

export class OverviewServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "OverviewServiceError";
  }
}

export class OverviewService {
  private readonly customers: CustomerRecord[] = this.loadCustomers();

  constructor(private readonly auditService: AuditService) {}

  listCustomers(query: GetCustomersQueryDto): CustomersListResponse {
    this.assertOperational();

    let results = [...this.customers];

    if (query.state && query.state !== "All") {
      results = results.filter(
        (c) => c.state?.toLowerCase() === query.state!.toLowerCase(),
      );
    }
    if (query.region && query.region !== "All") {
      results = results.filter(
        (c) => c.region?.toLowerCase() === query.region!.toLowerCase(),
      );
    }
    if (query.activity && query.activity !== "All") {
      results = results.filter(
        (c) =>
          c.activityStatus?.toLowerCase() === query.activity!.toLowerCase(),
      );
    }

    const sortField = query.sort ?? "latestHaulCreated";
    const order = query.order ?? "desc";

    if (sortField === "latestHaulCreated") {
      results.sort((a, b) => {
        const aTime = a.latestHaulCreated
          ? Date.parse(a.latestHaulCreated)
          : 0;
        const bTime = b.latestHaulCreated
          ? Date.parse(b.latestHaulCreated)
          : 0;
        return order === "desc" ? bTime - aTime : aTime - bTime;
      });
    }

    return {
      customers: results,
      totalCount: results.length,
    };
  }

  startExport(
    dto: ExportCustomersDto,
    adminIdentity: AdminIdentity,
  ): ExportCustomersResponse {
    this.assertOperational();

    if (this.customers.length === 0) {
      throw new OverviewServiceError("No customer accounts to export", 400);
    }

    const exportJobId = randomUUID();
    this.auditService.recordCustomerExportStarted({
      adminIdentity,
      exportJobId,
      filterContext: {
        state: dto.state,
        region: dto.region,
        activity: dto.activity,
      },
    });

    return {
      exportJobId,
      accepted: true,
    };
  }

  private loadCustomers(): CustomerRecord[] {
    const raw = process.env.OVERVIEW_CUSTOMERS_JSON;
    if (!raw) {
      return [...SEED_CUSTOMERS];
    }
    try {
      const parsed = JSON.parse(raw) as CustomerRecord[];
      if (!Array.isArray(parsed)) {
        throw new Error("OVERVIEW_CUSTOMERS_JSON must be a JSON array");
      }
      return parsed;
    } catch {
      throw new OverviewServiceError(
        "Invalid OVERVIEW_CUSTOMERS_JSON configuration",
        500,
      );
    }
  }

  private assertOperational(): void {
    if (process.env.OVERVIEW_SIMULATE_SERVER_ERROR === "true") {
      throw new OverviewServiceError("Overview service unavailable", 500);
    }
  }
}

export const overviewService = new OverviewService(auditService);
