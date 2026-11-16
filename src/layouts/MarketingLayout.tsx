import { Outlet, useLocation } from "react-router-dom";
import { ContactModal } from "@/components/home/ContactModal";
import { MarketingHeader } from "@/components/home/MarketingHeader";
import { useContactFlow } from "@/hooks/useContactFlow";
import { useSiteNavigation } from "@/hooks/useSiteNavigation";
import type { SiteNavRoute } from "@/types/home";
import { FALLBACK_NAV_ROUTES } from "@/home/fallbacks";

function findWorkRoute(routes: SiteNavRoute[]): string {
  const work =
    routes.find((r) => r.label.toLowerCase() === "work") ??
    FALLBACK_NAV_ROUTES.find((r) => r.label === "Work");
  return work?.path ?? "/work";
}

export function MarketingLayout() {
  const location = useLocation();
  const { routes, errorMessage } = useSiteNavigation();
  const contact = useContactFlow();
  const workRoute = findWorkRoute(routes);
  const isHome = location.pathname === "/" || location.pathname === "/home";

  const handleContact = () => {
    void contact.startContact({ formId: "marketing-contact" });
  };

  return (
    <div className="marketing-shell">
      <MarketingHeader
        routes={routes}
        navError={errorMessage}
        onContact={handleContact}
        contactPending={contact.pending}
      />
      <main className="marketing-main">
        <Outlet
          context={{
            workRoute,
            isHome,
            onContact: handleContact,
            onOurWorks: () => contact.navigateToRoute(workRoute),
            contact,
          }}
        />
      </main>
      <ContactModal
        open={contact.modalOpen}
        contentRef={contact.modalContentRef}
        onClose={contact.closeModal}
      />
    </div>
  );
}

export interface MarketingOutletContext {
  workRoute: string;
  isHome: boolean;
  onContact: () => void;
  onOurWorks: () => void;
}