import { useCallback, useEffect, useState } from "react";
import { getPartnerLogoAssets } from "@/api/logical";
import { FALLBACK_PARTNER_LOGOS } from "@/home/fallbacks";
import type { PartnerLogo } from "@/types/home";

function sortLogos(logos: PartnerLogo[]): PartnerLogo[] {
  return [...logos].sort((a, b) => a.displayOrder - b.displayOrder);
}

export function usePartnerLogos(enabled: boolean) {
  const [logos, setLogos] = useState<PartnerLogo[]>(
    sortLogos(FALLBACK_PARTNER_LOGOS),
  );
  const [loading, setLoading] = useState(enabled);
  const [progressive, setProgressive] = useState(false);

  const load = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setProgressive(false);
    try {
      const data = await getPartnerLogoAssets();
      const next =
        data.logos?.length ? sortLogos(data.logos) : FALLBACK_PARTNER_LOGOS;
      setLogos(next);
    } catch {
      setLogos(sortLogos(FALLBACK_PARTNER_LOGOS));
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  return { logos, loading, progressive, retry: load };
}