import { useCallback, useEffect, useState } from "react";
import { getMarketingContentBundle } from "@/api/logical";
import {
  FALLBACK_MARKETING_BUNDLE,
  MISSING_TEXT_FALLBACK,
} from "@/home/fallbacks";
import type { MarketingContentBundle } from "@/types/home";
import { DEFAULT_LOCALE, HOME_PAGE_KEY } from "@/types/home";

function withFieldFallbacks(
  bundle: Partial<MarketingContentBundle>,
): MarketingContentBundle {
  return {
    headline: bundle.headline?.trim() || MISSING_TEXT_FALLBACK,
    forLabel: bundle.forLabel?.trim() || FALLBACK_MARKETING_BUNDLE.forLabel,
    segmentTags:
      bundle.segmentTags?.length ?
        bundle.segmentTags.map((tag) => tag?.trim() || MISSING_TEXT_FALLBACK)
      : FALLBACK_MARKETING_BUNDLE.segmentTags,
    trustBadgeText:
      bundle.trustBadgeText?.trim() ||
      FALLBACK_MARKETING_BUNDLE.trustBadgeText,
  };
}

export function useMarketingContent(enabled: boolean) {
  const [bundle, setBundle] = useState<MarketingContentBundle>(
    FALLBACK_MARKETING_BUNDLE,
  );
  const [loading, setLoading] = useState(enabled);
  const [partialError, setPartialError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setPartialError(null);
    try {
      const data = await getMarketingContentBundle(DEFAULT_LOCALE, HOME_PAGE_KEY);
      setBundle(withFieldFallbacks(data));
    } catch {
      setBundle(FALLBACK_MARKETING_BUNDLE);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  return { bundle, loading, partialError, retry: load };
}