interface SystemEmptyProps {
  message?: string;
}

export function SystemWideEmpty({
  message = "No customer accounts yet. Accounts will appear here once customers sign up.",
}: SystemEmptyProps) {
  return (
    <div className="empty-state empty-state--system" role="status">
      <p className="empty-state__title">No customer accounts</p>
      <p className="empty-state__body">{message}</p>
    </div>
  );
}

interface FilteredEmptyProps {
  onClear: () => void;
}

export function FilteredEmpty({ onClear }: FilteredEmptyProps) {
  return (
    <div className="empty-state empty-state--filtered" role="status">
      <p className="empty-state__title">No customers match your filters</p>
      <p className="empty-state__body">
        Try adjusting State, Region, or Activity, or clear all filters to see
        every customer.
      </p>
      <button type="button" className="btn btn--link" onClick={onClear}>
        Clear Filters
      </button>
    </div>
  );
}

interface ListErrorProps {
  onRetry: () => void;
}

export function ListServerError({ onRetry }: ListErrorProps) {
  return (
    <div className="inline-error" role="alert">
      <p>We couldn’t load customers. Please try again.</p>
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

export function SessionEndedTreatment() {
  return (
    <div className="session-ended" role="alert">
      <h2 className="session-ended__title">Your session has ended</h2>
      <p className="session-ended__body">
        Sign in again to continue managing customers.
      </p>
      <a className="btn btn--primary" href="/login">
        Sign in
      </a>
    </div>
  );
}

export function ForbiddenTreatment() {
  return (
    <div className="forbidden" role="alert">
      <h2 className="forbidden__title">Access denied</h2>
      <p className="forbidden__body">
        You don’t have permission to view customer accounts.
      </p>
    </div>
  );
}
