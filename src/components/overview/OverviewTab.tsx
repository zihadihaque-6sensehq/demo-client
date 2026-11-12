import { useEffect, useRef, useState, type ReactNode } from "react";
import type { useCustomersList } from "@/hooks/useCustomersList";
import { OverviewFiltersBar } from "./OverviewFilters";
import {
  FilteredEmpty,
  ForbiddenTreatment,
  ListServerError,
  SessionEndedTreatment,
  SystemWideEmpty,
} from "./OverviewEmptyStates";
import { OverviewSkeleton } from "./OverviewSkeleton";
import { OverviewTable } from "./OverviewTable";

type ListState = ReturnType<typeof useCustomersList>;

interface OverviewTabProps {
  list: ListState;
  panelId: string;
  tabId: string;
}

export function OverviewTab({ list, panelId, tabId }: OverviewTabProps) {
  const [scrollToken, setScrollToken] = useState(0);
  const prevFilters = useRef(list.filters);

  useEffect(() => {
    const key = `${list.filters.state}|${list.filters.region}|${list.filters.activity}`;
    const prevKey = `${prevFilters.current.state}|${prevFilters.current.region}|${prevFilters.current.activity}`;
    if (key !== prevKey) {
      setScrollToken((t) => t + 1);
      prevFilters.current = list.filters;
    }
  }, [list.filters]);

  const showSkeleton = list.loading && list.displayCustomers.length === 0;

  let body: ReactNode;
  if (list.errorKind === "session") {
    body = <SessionEndedTreatment />;
  } else if (list.errorKind === "forbidden") {
    body = <ForbiddenTreatment />;
  } else if (showSkeleton) {
    body = <OverviewSkeleton />;
  } else if (list.errorKind === "server") {
    body = <ListServerError onRetry={list.retry} />;
  } else if (list.systemWideEmpty) {
    body = <SystemWideEmpty />;
  } else if (list.filteredEmpty) {
    body = <FilteredEmpty onClear={list.clearFilters} />;
  } else {
    body = (
      <OverviewTable
        customers={list.displayCustomers}
        sortColumn={list.sortColumn}
        sortDirection={list.sortDirection}
        onSort={list.toggleSort}
        scrollToTopToken={scrollToken}
        overviewFilters={list.filters}
      />
    );
  }

  const showCount =
    !list.loading &&
    !list.errorKind &&
    !list.systemWideEmpty &&
    !list.filteredEmpty &&
    list.displayCustomers.length > 0;

  const showZeroFilteredCount =
    list.filteredEmpty && !list.errorKind && !list.loading;

  return (
    <div
      className="overview-tab"
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
    >
      <OverviewFiltersBar
        filters={list.filters}
        options={list.filterOptions}
        disabled={list.filtersDisabled}
        onChange={list.setFilter}
      />
      {(showCount || showZeroFilteredCount) && (
        <p className="customer-count" aria-live="polite">
          {showCount ? list.rowCount : 0} customers
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
