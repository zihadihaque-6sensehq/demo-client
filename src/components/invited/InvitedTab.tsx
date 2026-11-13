import type { ReactNode } from "react";
import type { useInvitedList } from "@/hooks/useInvitedList";
import {
  InvitedFilteredEmpty,
  InvitedForbiddenTreatment,
  InvitedListServerError,
  InvitedListTimeoutError,
  InvitedSessionEndedTreatment,
  InvitedSystemWideEmpty,
} from "./InvitedEmptyStates";
import { InvitedSkeleton } from "./InvitedSkeleton";
import { InvitedTable } from "./InvitedTable";

type InvitedListState = ReturnType<typeof useInvitedList>;

interface InvitedTabProps {
  list: InvitedListState;
  panelId: string;
  tabId: string;
}

export function InvitedTab({ list, panelId, tabId }: InvitedTabProps) {
  const showSkeleton = list.loading && list.items.length === 0;

  let body: ReactNode;
  if (list.errorKind === "session") {
    body = <InvitedSessionEndedTreatment />;
  } else if (list.errorKind === "forbidden") {
    body = <InvitedForbiddenTreatment />;
  } else if (showSkeleton) {
    body = <InvitedSkeleton />;
  } else if (list.errorKind === "timeout") {
    body = <InvitedListTimeoutError onRetry={list.retry} />;
  } else if (list.errorKind === "server") {
    body = <InvitedListServerError onRetry={list.retry} />;
  } else if (list.systemWideEmpty) {
    body = <InvitedSystemWideEmpty />;
  } else if (list.filteredEmpty) {
    body = <InvitedFilteredEmpty onClear={list.clearFilters} />;
  } else {
    body = <InvitedTable items={list.items} />;
  }

  const showCount =
    !list.loading &&
    !list.errorKind &&
    !list.systemWideEmpty &&
    !list.filteredEmpty &&
    list.items.length > 0;

  const showZeroCount =
    (list.systemWideEmpty || list.filteredEmpty) &&
    !list.errorKind &&
    !list.loading;

  const count =
    list.totalCount !== undefined ? list.totalCount : list.items.length;

  return (
    <div
      className="overview-tab invited-tab"
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
    >
      {(showCount || showZeroCount) && (
        <p className="customer-count" aria-live="polite">
          {showCount ? count : 0} invited
        </p>
      )}
      {list.backgroundRefreshing && !list.loading && (
        <p className="refresh-hint" aria-live="polite">
          Refreshing…
        </p>
      )}
      {body}
    </div>
  );
}
