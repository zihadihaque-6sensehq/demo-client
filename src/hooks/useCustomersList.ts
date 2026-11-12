import { useCallback, useEffect, useRef, useState } from "react";
import { getCustomers } from "@/api/customers";
import { ApiError } from "@/api/http";
import {
  ALL_FILTER,
  CustomerListItem,
  DEFAULT_SORT,
  OverviewFilters,
  SortColumn,
  SortDirection,
} from "@/types/customers";

const CACHE_TTL_MS = 60_000;

type ListErrorKind = "session" | "forbidden" | "server" | null;

interface CacheEntry {
  customers: CustomerListItem[];
  totalCount: number | undefined;
  filterOptions: FilterOptions;
  fetchedAt: number;
  filtersKey: string;
}

export interface FilterOptions {
  states: string[];
  regions: string[];
  activities: string[];
}

interface UseCustomersListResult {
  customers: CustomerListItem[];
  displayCustomers: CustomerListItem[];
  totalCount: number | undefined;
  rowCount: number;
  loading: boolean;
  backgroundRefreshing: boolean;
  errorKind: ListErrorKind;
  systemWideEmpty: boolean;
  filteredEmpty: boolean;
  filterOptions: FilterOptions;
  filters: OverviewFilters;
  setFilter: (dimension: keyof OverviewFilters, value: string) => void;
  setAllFilters: (filters: OverviewFilters) => void;
  clearFilters: () => void;
  retry: () => void;
  sortColumn: SortColumn | null;
  sortDirection: SortDirection;
  toggleSort: (column: SortColumn) => void;
  filtersDisabled: boolean;
}

function filtersKey(filters: OverviewFilters): string {
  return `${filters.state}|${filters.region}|${filters.activity}`;
}

function emptyFilterOptions(): FilterOptions {
  return { states: [], regions: [], activities: [] };
}

function mergeFilterOptions(
  existing: FilterOptions,
  customers: CustomerListItem[],
): FilterOptions {
  const states = new Set(existing.states);
  const regions = new Set(existing.regions);
  const activities = new Set(existing.activities);
  for (const c of customers) {
    if (c.state) states.add(c.state);
    if (c.region) regions.add(c.region);
    if (c.activityStatus) activities.add(c.activityStatus);
  }
  return {
    states: [...states].sort(),
    regions: [...regions].sort(),
    activities: [...activities].sort(),
  };
}

function sortCustomers(
  rows: CustomerListItem[],
  column: SortColumn | null,
  direction: SortDirection,
): CustomerListItem[] {
  if (!column) return rows;
  const sorted = [...rows];
  sorted.sort((a, b) => {
    let av: string | number = "";
    let bv: string | number = "";
    switch (column) {
      case "name":
        av = a.name ?? "";
        bv = b.name ?? "";
        break;
      case "email":
        av = a.email ?? "";
        bv = b.email ?? "";
        break;
      case "state":
        av = a.state ?? "";
        bv = b.state ?? "";
        break;
      case "region":
        av = a.region ?? "";
        bv = b.region ?? "";
        break;
      case "activityStatus":
        av = a.activityStatus ?? "";
        bv = b.activityStatus ?? "";
        break;
      case "latestHaulCreated": {
        const at = a.latestHaulCreated
          ? new Date(a.latestHaulCreated).getTime()
          : 0;
        const bt = b.latestHaulCreated
          ? new Date(b.latestHaulCreated).getTime()
          : 0;
        av = at;
        bv = bt;
        break;
      }
    }
    if (av < bv) return direction === "asc" ? -1 : 1;
    if (av > bv) return direction === "asc" ? 1 : -1;
    return 0;
  });
  return sorted;
}

export function useCustomersList(
  initialFilters?: OverviewFilters,
): UseCustomersListResult {
  const [filters, setFilters] = useState<OverviewFilters>(
    initialFilters ?? {
      state: ALL_FILTER,
      region: ALL_FILTER,
      activity: ALL_FILTER,
    },
  );
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
  const [filterOptions, setFilterOptions] =
    useState<FilterOptions>(emptyFilterOptions());
  const [loading, setLoading] = useState(true);
  const [backgroundRefreshing, setBackgroundRefreshing] = useState(false);
  const [errorKind, setErrorKind] = useState<ListErrorKind>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const cacheRef = useRef<CacheEntry | null>(null);
  const requestIdRef = useRef(0);
  const [systemWideEmpty, setSystemWideEmpty] = useState(false);
  const [knownSystemHasCustomers, setKnownSystemHasCustomers] = useState(false);

  const applySuccess = useCallback(
    (
      data: Awaited<ReturnType<typeof getCustomers>>,
      key: string,
      isBackground: boolean,
    ) => {
      setCustomers(data.customers);
      setTotalCount(data.totalCount);
      setFilterOptions((prev) => mergeFilterOptions(prev, data.customers));

      const unfiltered =
        filters.state === ALL_FILTER &&
        filters.region === ALL_FILTER &&
        filters.activity === ALL_FILTER;
      if (unfiltered) {
        const count = data.totalCount ?? data.customers.length;
        setSystemWideEmpty(count === 0);
        if (count > 0) setKnownSystemHasCustomers(true);
      } else if ((data.totalCount ?? data.customers.length) > 0) {
        setKnownSystemHasCustomers(true);
      }

      cacheRef.current = {
        customers: data.customers,
        totalCount: data.totalCount,
        filterOptions: mergeFilterOptions(
          cacheRef.current?.filterOptions ?? emptyFilterOptions(),
          data.customers,
        ),
        fetchedAt: Date.now(),
        filtersKey: key,
      };

      if (!isBackground) {
        setLoading(false);
      }
      setBackgroundRefreshing(false);
      setErrorKind(null);
    },
    [filters],
  );

  const fetchList = useCallback(
    async (opts: { background?: boolean; fromRetry?: boolean } = {}) => {
      const key = filtersKey(filters);
      const id = ++requestIdRef.current;

      if (!opts.background) {
        const cached = cacheRef.current;
        if (
          !opts.fromRetry &&
          cached &&
          cached.filtersKey === key &&
          Date.now() - cached.fetchedAt < CACHE_TTL_MS
        ) {
          setCustomers(cached.customers);
          setTotalCount(cached.totalCount);
          setFilterOptions(cached.filterOptions);
          setTotalCount(cached.totalCount);
          setLoading(false);
          setErrorKind(null);
          setBackgroundRefreshing(true);
          opts.background = true;
        } else {
          setLoading(true);
          setErrorKind(null);
          setCustomers([]);
        }
      } else {
        setBackgroundRefreshing(true);
      }

      try {
        const data = await getCustomers({
          state: filters.state,
          region: filters.region,
          activity: filters.activity,
          sort: sortColumn ? `${sortColumn}:${sortDirection}` : DEFAULT_SORT,
        });
        if (id !== requestIdRef.current) return;
        applySuccess(data, key, Boolean(opts.background));
      } catch (e) {
        if (id !== requestIdRef.current) return;
        if (opts.background && cacheRef.current?.filtersKey === key) {
          setBackgroundRefreshing(false);
          return;
        }
        setLoading(false);
        setBackgroundRefreshing(false);
        setCustomers([]);
        if (e instanceof ApiError) {
          if (e.status === 401) setErrorKind("session");
          else if (e.status === 403) setErrorKind("forbidden");
          else if (e.status >= 500) setErrorKind("server");
          else setErrorKind("server");
        } else {
          setErrorKind("server");
        }
      }
    },
    [filters, sortColumn, sortDirection, applySuccess],
  );

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const setFilter = useCallback(
    (dimension: keyof OverviewFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [dimension]: value }));
    },
    [],
  );

  const setAllFilters = useCallback((next: OverviewFilters) => {
    setFilters(next);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      state: ALL_FILTER,
      region: ALL_FILTER,
      activity: ALL_FILTER,
    });
  }, []);

  const retry = useCallback(() => {
    void fetchList({ fromRetry: true });
  }, [fetchList]);

  const toggleSort = useCallback((column: SortColumn) => {
    setSortColumn((prev) => {
      if (prev === column) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
        return column;
      }
      setSortDirection(column === "latestHaulCreated" ? "desc" : "asc");
      return column;
    });
  }, []);

  const hasActiveFilters =
    filters.state !== ALL_FILTER ||
    filters.region !== ALL_FILTER ||
    filters.activity !== ALL_FILTER;

  const filteredEmpty =
    !loading &&
    !errorKind &&
    !systemWideEmpty &&
    customers.length === 0 &&
    (hasActiveFilters || knownSystemHasCustomers);

  const displayCustomers = sortColumn
    ? sortCustomers(customers, sortColumn, sortDirection)
    : customers;

  const rowCount = displayCustomers.length;

  return {
    customers,
    displayCustomers,
    totalCount,
    rowCount,
    loading,
    backgroundRefreshing,
    errorKind,
    systemWideEmpty,
    filteredEmpty,
    filterOptions,
    filters,
    setFilter,
    setAllFilters,
    clearFilters,
    retry,
    sortColumn,
    sortDirection,
    toggleSort,
    filtersDisabled: systemWideEmpty,
  };
}
