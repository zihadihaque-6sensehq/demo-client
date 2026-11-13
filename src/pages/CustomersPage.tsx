import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useLocation } from "react-router-dom";
import { exportCustomers } from "@/api/customers";
import { ApiError } from "@/api/http";
import { InvitedTab } from "@/components/invited/InvitedTab";
import { SendInviteModal } from "@/components/invited/SendInviteModal";
import { OverviewTab } from "@/components/overview/OverviewTab";
import { useToast } from "@/context/ToastContext";
import { useCustomersList } from "@/hooks/useCustomersList";
import { useInvitedList } from "@/hooks/useInvitedList";
import { ALL_FILTER, OverviewFilters } from "@/types/customers";
type CustomersTab = "overview" | "abandoned" | "invited";

const CUSTOMERS_TABS: CustomersTab[] = ["overview", "abandoned", "invited"];

function customersTabId(tab: CustomersTab): string {
  return `customers-tab-${tab}`;
}

function customersPanelId(tab: CustomersTab): string {
  return `customers-panel-${tab}`;
}

function readOverviewFiltersFromState(state: unknown): OverviewFilters | undefined {
  if (!state || typeof state !== "object") return undefined;
  const s = state as { overviewFilters?: OverviewFilters };
  if (!s.overviewFilters) return undefined;
  const f = s.overviewFilters;
  return {
    state: f.state ?? ALL_FILTER,
    region: f.region ?? ALL_FILTER,
    activity: f.activity ?? ALL_FILTER,
  };
}

export function CustomersPage() {
  const location = useLocation();
  const { showToast } = useToast();
  const inviteButtonRef = useRef<HTMLButtonElement>(null);
  const initialFilters = useMemo(
    () => readOverviewFiltersFromState(location.state),
    [location.state],
  );
  const list = useCustomersList(initialFilters);
  const { setAllFilters } = list;
  const [activeTab, setActiveTab] = useState<CustomersTab>("overview");
  const invitedList = useInvitedList({ enabled: activeTab === "invited" });
  const { resetFilters: resetInvitedFilters, refresh: refreshInvitedList } =
    invitedList;
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  useEffect(() => {
    const restored = readOverviewFiltersFromState(location.state);
    if (restored) {
      setAllFilters(restored);
    }
  }, [location.state, setAllFilters]);

  const handleTabSelect = useCallback(
    (tab: CustomersTab) => {
      if (tab === activeTab) return;
      setActiveTab(tab);
      setAllFilters({
        state: ALL_FILTER,
        region: ALL_FILTER,
        activity: ALL_FILTER,
      });
      resetInvitedFilters();
    },
    [activeTab, setAllFilters, resetInvitedFilters],
  );

  const handleExport = useCallback(async () => {
    if (list.systemWideEmpty) return;
    try {
      const result = await exportCustomers({
        state: list.filters.state,
        region: list.filters.region,
        activity: list.filters.activity,
      });
      if (result.accepted) {
        showToast("Export started. We’ll email you when the file is ready.", "success");
      } else {
        showToast("Export could not be started.", "error");
      }
    } catch (e) {
      const msg =
        e instanceof ApiError && e.status === 401
          ? "Your session has ended. Sign in to export."
          : "Export could not be started. Try again.";
      showToast(msg, "error");
    }
  }, [list.filters, list.systemWideEmpty, showToast]);

  const exportHidden = list.systemWideEmpty;

  const handleInviteSuccess = useCallback(() => {
    showToast("Invite Sent", "success");
    if (activeTab === "invited") {
      refreshInvitedList();
    }
  }, [activeTab, refreshInvitedList, showToast]);

  const handleInviteError = useCallback(
    (message: string) => {
      showToast(message, "error");
    },
    [showToast],
  );

  const handleTabKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, tab: CustomersTab) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const index = CUSTOMERS_TABS.indexOf(tab);
      const offset = event.key === "ArrowRight" ? 1 : -1;
      const nextTab = CUSTOMERS_TABS.at(
        (index + offset + CUSTOMERS_TABS.length) % CUSTOMERS_TABS.length,
      );
      if (!nextTab) return;
      handleTabSelect(nextTab);
      document.getElementById(customersTabId(nextTab))?.focus();
    },
    [handleTabSelect],
  );

  return (
    <div className="customers-page">
      <header className="customers-header">
        <h1 className="customers-heading">Customers</h1>
        <div className="customers-header__actions">
          {!exportHidden && (
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => void handleExport()}
            >
              Export
            </button>
          )}
          <button
            ref={inviteButtonRef}
            type="button"
            className="btn btn--primary"
            onClick={() => setInviteModalOpen(true)}
          >
            Invite
          </button>
        </div>
      </header>

      <div className="tab-bar" role="tablist" aria-label="Customers views">
        <button
          type="button"
          id={customersTabId("overview")}
          role="tab"
          aria-selected={activeTab === "overview"}
          aria-controls={customersPanelId("overview")}
          tabIndex={activeTab === "overview" ? 0 : -1}
          className={`tab-bar__tab ${activeTab === "overview" ? "tab-bar__tab--active" : ""}`}
          onClick={() => handleTabSelect("overview")}
          onKeyDown={(e) => handleTabKeyDown(e, "overview")}
        >
          Overview
        </button>
        <button
          type="button"
          id={customersTabId("abandoned")}
          role="tab"
          aria-selected={activeTab === "abandoned"}
          aria-controls={customersPanelId("abandoned")}
          tabIndex={activeTab === "abandoned" ? 0 : -1}
          className={`tab-bar__tab ${activeTab === "abandoned" ? "tab-bar__tab--active" : ""}`}
          onClick={() => handleTabSelect("abandoned")}
          onKeyDown={(e) => handleTabKeyDown(e, "abandoned")}
        >
          Abandoned Bookings
        </button>
        <button
          type="button"
          id={customersTabId("invited")}
          role="tab"
          aria-selected={activeTab === "invited"}
          aria-controls={customersPanelId("invited")}
          tabIndex={activeTab === "invited" ? 0 : -1}
          className={`tab-bar__tab ${activeTab === "invited" ? "tab-bar__tab--active" : ""}`}
          onClick={() => handleTabSelect("invited")}
          onKeyDown={(e) => handleTabKeyDown(e, "invited")}
        >
          Invited
        </button>
      </div>

      {activeTab === "overview" && (
        <OverviewTab
          list={list}
          panelId={customersPanelId("overview")}
          tabId={customersTabId("overview")}
        />
      )}
      {activeTab === "abandoned" && (
        <div
          id={customersPanelId("abandoned")}
          role="tabpanel"
          aria-labelledby={customersTabId("abandoned")}
          tabIndex={0}
        >
          <p className="tab-placeholder" role="status">
            Abandoned Bookings is not in scope for this module.
          </p>
        </div>
      )}
      {activeTab === "invited" && (
        <InvitedTab
          list={invitedList}
          panelId={customersPanelId("invited")}
          tabId={customersTabId("invited")}
        />
      )}

      <SendInviteModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSuccess={handleInviteSuccess}
        onError={handleInviteError}
        returnFocusRef={inviteButtonRef}
      />
    </div>
  );
}
