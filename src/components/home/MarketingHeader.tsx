import { NavLink } from "react-router-dom";
import type { SiteNavRoute } from "@/types/home";
import { BrandLogo } from "./BrandLogo";

interface MarketingHeaderProps {
  routes: SiteNavRoute[];
  navError?: string | null;
  onContact: () => void;
  contactPending?: boolean;
}

export function MarketingHeader({
  routes,
  navError,
  onContact,
  contactPending,
}: MarketingHeaderProps) {
  return (
    <header className="marketing-header">
      <div className="marketing-header__inner">
        <BrandLogo />
        <div className="marketing-header__center">
          {navError ? (
            <p className="marketing-header__nav-fallback" role="status">
              {navError}
            </p>
          ) : null}
          <nav className="marketing-nav" aria-label="Primary">
            <ul className="marketing-nav__list">
              {routes.map((route) => (
                <li key={`${route.label}-${route.path}`}>
                  <NavLink
                    to={route.path}
                    end={route.path === "/" || route.path === "/home"}
                    className={({ isActive }) =>
                      isActive ?
                        "marketing-nav__link marketing-nav__link--active"
                      : "marketing-nav__link"
                    }
                  >
                    {route.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <button
          type="button"
          className="marketing-btn marketing-btn--primary marketing-header__contact"
          onClick={onContact}
          disabled={contactPending}
        >
          Contact Us
        </button>
      </div>
    </header>
  );
}