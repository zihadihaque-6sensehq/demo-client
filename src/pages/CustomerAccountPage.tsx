import { Link, useLocation, useParams } from "react-router-dom";
import type { OverviewFilters } from "@/types/customers";

export function CustomerAccountPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const location = useLocation();
  const overviewFilters = (location.state as { overviewFilters?: OverviewFilters } | null)
    ?.overviewFilters;

  return (
    <div className="customer-account-page">
      <Link
        to="/customers"
        state={overviewFilters ? { overviewFilters } : undefined}
        className="back-link"
      >
        ← Back to Customers
      </Link>
      <h1>Customer Account</h1>
      <p className="customer-account-id">
        Customer ID: {customerId ?? "—"}
      </p>
      <p className="tab-placeholder" role="status">
        Customer Account detail is out of scope for the Overview module.
      </p>
    </div>
  );
}
