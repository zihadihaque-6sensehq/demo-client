import { useState } from "react";
import type { PartnerLogo } from "@/types/home";

interface PartnerLogoRowProps {
  logos: PartnerLogo[];
  progressive?: boolean;
}

function LogoItem({ logo }: { logo: PartnerLogo }) {
  const [failed, setFailed] = useState(!logo.url);

  return (
    <li className="partner-logo-row__item">
      {failed || !logo.url ?
        <span className="partner-logo-row__fallback" title={logo.brandName}>
          {logo.altText || logo.brandName}
        </span>
      : <img
          src={logo.url}
          alt={logo.altText || logo.brandName}
          className="partner-logo-row__img"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      }
    </li>
  );
}

export function PartnerLogoRow({ logos, progressive }: PartnerLogoRowProps) {
  return (
    <div className="partner-logo-row">
      {progressive ? (
        <p className="partner-logo-row__progressive" role="status">
          Some partner logos are still loading.
        </p>
      ) : null}
      <ul className="partner-logo-row__list" aria-label="Partner brands">
        {logos.map((logo) => (
          <LogoItem key={`${logo.brandName}-${logo.displayOrder}`} logo={logo} />
        ))}
      </ul>
    </div>
  );
}