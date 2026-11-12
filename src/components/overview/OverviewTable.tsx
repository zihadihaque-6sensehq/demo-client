import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CustomerListItem,
  OverviewFilters,
  SortColumn,
  SortDirection,
} from "@/types/customers";
import { displayOptional, formatDateTime } from "@/utils/format";
import { StatusTag } from "./StatusTag";

interface OverviewTableProps {
  customers: CustomerListItem[];
  sortColumn: SortColumn | null;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
  scrollToTopToken: number;
  overviewFilters: OverviewFilters;
}

function SortHeader({
  column,
  label,
  sortColumn,
  sortDirection,
  onSort,
}: {
  column: SortColumn;
  label: string;
  sortColumn: SortColumn | null;
  sortDirection: SortDirection;
  onSort: (c: SortColumn) => void;
}) {
  const active = sortColumn === column;
  const ariaSort = active
    ? sortDirection === "asc"
      ? "ascending"
      : "descending"
    : "none";
  return (
    <th scope="col" aria-sort={ariaSort}>
      <button
        type="button"
        className="sort-header"
        onClick={() => onSort(column)}
      >
        {label}
        {active && (
          <span className="sort-header__indicator" aria-hidden>
            {sortDirection === "asc" ? "↑" : "↓"}
          </span>
        )}
      </button>
    </th>
  );
}

export function OverviewTable({
  customers,
  sortColumn,
  sortDirection,
  onSort,
  scrollToTopToken,
  overviewFilters,
}: OverviewTableProps) {
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    wrapRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [scrollToTopToken]);

  const openAccount = (customerId: string) => {
    navigate(`/customers/${customerId}`, {
      state: { fromOverview: true, overviewFilters },
    });
  };

  return (
    <div className="overview-table-wrap" ref={wrapRef}>
      <table className="overview-table">
        <thead>
          <tr>
            <SortHeader
              column="name"
              label="Customer"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortHeader
              column="email"
              label="Email"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <th scope="col">Phone</th>
            <SortHeader
              column="state"
              label="State"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortHeader
              column="region"
              label="Region"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortHeader
              column="activityStatus"
              label="Activity"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortHeader
              column="latestHaulCreated"
              label="Latest haul"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
            />
          </tr>
        </thead>
        <tbody>
          {customers.map((row) => {
            const activityLabel =
              row.activityLabel ?? row.activityStatus ?? null;
            return (
              <tr
                key={row.customerId}
                className="overview-row"
                onClick={() => openAccount(row.customerId)}
              >
                <td>{displayOptional(row.name)}</td>
                <td>{displayOptional(row.email)}</td>
                <td>{displayOptional(row.phone)}</td>
                <td>{displayOptional(row.state)}</td>
                <td>{displayOptional(row.region)}</td>
                <td>
                  {activityLabel ? (
                    <StatusTag label={activityLabel} />
                  ) : (
                    displayOptional(undefined)
                  )}
                </td>
                <td>
                  <span className="latest-haul-cell">
                    <span>{formatDateTime(row.latestHaulCreated)}</span>
                    {row.latestHaulStatus && (
                      <StatusTag
                        label={row.latestHaulStatus}
                        variant="active"
                      />
                    )}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
