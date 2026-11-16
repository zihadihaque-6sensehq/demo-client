import { useCallback, useEffect, useState } from "react";
import { getSiteNavigationRoutes } from "@/api/logical";
import { FALLBACK_NAV_ROUTES } from "@/home/fallbacks";
import type { SiteNavRoute } from "@/types/home";

export function useSiteNavigation() {
  const [routes, setRoutes] = useState<SiteNavRoute[]>(FALLBACK_NAV_ROUTES);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await getSiteNavigationRoutes();
      setRoutes(
        data.routes?.length ? data.routes : FALLBACK_NAV_ROUTES,
      );
    } catch {
      setRoutes(FALLBACK_NAV_ROUTES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { routes, loading, errorMessage, retry: load };
}