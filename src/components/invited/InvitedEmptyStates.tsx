interface FilteredEmptyProps {
  onClear: () => void;
}

export function InvitedFilteredEmpty({ onClear }: FilteredEmptyProps) {
  return (
    <div className="empty-state empty-state--filtered" role="status">
      <p className="empty-state__title">No invited records match your filters.</p>
      <p className="empty-state__body">
        Try adjusting filters or clear all filters to see every invite.
      </p>
      <button type="button" className="btn btn--link" onClick={onClear}>
        Clear Filters
      </button>
    </div>
  );
}

export function InvitedSystemWideEmpty() {
  return (
    <div className="empty-state empty-state--system" role="status">
      <p className="empty-state__illustration" aria-hidden>
        ✉️
      </p>
      <p className="empty-state__title">No invites sent yet</p>
      <p className="empty-state__body">
        Invites you send will appear here so you can track who has been invited.
      </p>
    </div>
  );
}

interface ListErrorProps {
  onRetry: () => void;
}

export function InvitedListServerError({ onRetry }: ListErrorProps) {
  return (
    <div className="inline-error" role="alert">
      <p>We couldn’t load invites. Please try again.</p>
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        Try Again
      </button>
    </div>
  );
}

export function InvitedListTimeoutError({ onRetry }: ListErrorProps) {
  return (
    <div className="inline-error" role="alert">
      <p>This is taking longer than expected.</p>
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

export function InvitedSessionEndedTreatment() {
  return (
    <div className="session-ended" role="alert">
      <h2 className="session-ended__title">Your session has expired. Please sign in again.</h2>
      <a className="btn btn--primary" href="/login">
        Sign In
      </a>
    </div>
  );
}

export function InvitedForbiddenTreatment() {
  return (
    <div className="forbidden" role="alert">
      <p className="forbidden__body">You don&apos;t have permission to view this page.</p>
    </div>
  );
}
