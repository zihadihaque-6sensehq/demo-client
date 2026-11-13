import { useCallback, useEffect, useRef, useState } from "react";
import { getCustomerFilters, getInvitedList } from "@/api/invited";
import { ApiError } from "@/api/http";
import {
  INVITED_ALL_FILTER,
  InvitedFilters,
  InvitedListItem,
} from "@/types/invited";

const CACHE_TTL_MS = 60_000;

type ListErrorKind = "session" | "forbidden" | "server" | "timeout" | null;

interface CacheEntry {
  items: InvitedListItem[];
  totalCount: number | undefined;
  fetchedAt: number;
  filtersKey: string;
}

interface UseInvitedListOptions {
  enabled: boolean;
}

interface UseInvitedListResult {
  items: InvitedListItem[];
  totalCount: number | undefined;
  loading: boolean;
  backgroundRefreshing: boolean;
  errorKind: ListErrorKind;
  systemWideEmpty: boolean;
  filteredEmpty: boolean;
  filters: InvitedFilters;
  setAllFilters: (filters: InvitedFilters) => void;
  clearFilters: () => void;
  retry: () => void;
  refresh: () => void;
  resetFilters: () => void;
  filtersDisabled: boolean;
}

function filtersKey(filters: InvitedFilters): string {
  return `${filters.state}|${filters.region}`;
}

const defaultFilters = (): InvitedFilters => ({
  state: INVITED_ALL_FILTER,
  region: INVITED_ALL_FILTER,
});

export function useInvitedList({
  enabled,
}: UseInvitedListOptions): UseInvitedListResult {
  const [filters, setFilters] = useState<InvitedFilters>(defaultFilters);
  const [items, setItems] = useState<InvitedListItem[]>([]);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [backgroundRefreshing, setBackgroundRefreshing] = useState(false);
  const [errorKind, setErrorKind] = useState<ListErrorKind>(null);
  const [systemWideEmpty, setSystemWideEmpty] = useState(false);
  const [knownSystemHasInvites, setKnownSystemHasInvites] = useState(false);

  const cacheRef = useRef<CacheEntry | null>(null);
  const requestIdRef = useRef(0);

  const applySuccess = useCallback(
    (
      data: Awaited<ReturnType<typeof getInvitedList>>,
      key: string,
      isBackground: boolean,
    ) => {
      setItems(data.items);
      setTotalCount(data.totalCount);

      const unfiltered =
        filters.state === INVITED_ALL_FILTER &&
        filters.region === INVITED_ALL_FILTER;
      if (unfiltered) {
        const count = data.totalCount ?? data.items.length;
        setSystemWideEmpty(count === 0);
        if (count > 0) setKnownSystemHasInvites(true);
      } else if ((data.totalCount ?? data.items.length) > 0) {
        setKnownSystemHasInvites(true);
      }

      cacheRef.current = {
        items: data.items,
        totalCount: data.totalCount,
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
      if (!enabled) return;

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
          setItems(cached.items);
          setTotalCount(cached.totalCount);
          setLoading(false);
          setErrorKind(null);
          setBackgroundRefreshing(true);
          opts.background = true;
        } else {
          setLoading(true);
          setErrorKind(null);
          setItems([]);
        }
      } else {
        setBackgroundRefreshing(true);
      }

      try {
        const data = await getInvitedList({
          state: filters.state,
          region: filters.region,
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
        setItems([]);
        if (e instanceof ApiError) {
          if (e.status === 0 && e.message === "timeout") {
            setErrorKind("timeout");
          } else if (e.status === 401) setErrorKind("session");
          else if (e.status === 403) setErrorKind("forbidden");
          else setErrorKind("server");
        } else {
          setErrorKind("server");
        }
      }
    },
    [filters, enabled, applySuccess],
  );

  useEffect(() => {
    if (enabled) {
      void fetchList();
    }
  }, [fetchList, enabled]);

  useEffect(() => {
    if (!enabled) return;
    void getCustomerFilters(filters.state).catch(() => {
      /* filter options reserved for future Invited filter UI */
    });
  }, [enabled, filters.state]);

  const setAllFilters = useCallback((next: InvitedFilters) => {
    setFilters(next);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters());
  }, []);

  const clearFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  const retry = useCallback(() => {
    void fetchList({ fromRetry: true });
  }, [fetchList]);

  const refresh = useCallback(() => {
    void fetchList({ fromRetry: true });
  }, [fetchList]);

  const hasActiveFilters =
    filters.state !== INVITED_ALL_FILTER ||
    filters.region !== INVITED_ALL_FILTER;

  const filteredEmpty =
    enabled &&
    !loading &&
    !errorKind &&
    !systemWideEmpty &&
    items.length === 0 &&
    (hasActiveFilters || knownSystemHasInvites);

  return {
    items,
    totalCount,
    loading: enabled && loading,
    backgroundRefreshing,
    errorKind: enabled ? errorKind : null,
    systemWideEmpty: enabled && systemWideEmpty,
    filteredEmpty,
    filters,
    setAllFilters,
    clearFilters,
    retry,
    refresh,
    resetFilters,
    filtersDisabled: systemWideEmpty,
  };
}
