import type { PartnerLogo } from "@/types/home";
import { PartnerLogoRow } from "./PartnerLogoRow";

interface TrustBandProps {
  trustBadgeText: string;
  logos: PartnerLogo[];
  progressive?: boolean;
}

export function TrustBand({
  trustBadgeText,
  logos,
  progressive,
}: TrustBandProps) {
  return (
    <section className="marketing-trust" aria-labelledby="trust-heading">
      <h2 id="trust-heading" className="visually-hidden">
        Trust and partners
      </h2>
      <p className="marketing-trust__badge">{trustBadgeText}</p>
      <PartnerLogoRow logos={logos} progressive={progressive} />
    </section>
  );
}