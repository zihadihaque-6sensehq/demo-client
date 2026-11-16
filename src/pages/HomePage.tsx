import { HeroSection } from "@/components/home/HeroSection";
import { TrustBand } from "@/components/home/TrustBand";
import { useMarketingContent } from "@/hooks/useMarketingContent";
import { usePartnerLogos } from "@/hooks/usePartnerLogos";
import { useOutletContext } from "react-router-dom";
import type { MarketingOutletContext } from "@/layouts/MarketingLayout";

export function HomePage() {
  const { onContact, onOurWorks, workRoute } =
    useOutletContext<MarketingOutletContext>();
  const { bundle, partialError } = useMarketingContent(true);
  const { logos, progressive } = usePartnerLogos(true);

  return (
    <>
      <HeroSection
        bundle={bundle}
        workRoute={workRoute}
        onContact={onContact}
        onOurWorks={onOurWorks}
        contentNotice={partialError}
      />
      <TrustBand
        trustBadgeText={bundle.trustBadgeText}
        logos={logos}
        progressive={progressive}
      />
    </>
  );
}