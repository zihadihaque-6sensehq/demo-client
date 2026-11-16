import { Link, Route, Routes } from "react-router-dom";
import { CustomersPage } from "@/pages/CustomersPage";
import { CustomerAccountPage } from "@/pages/CustomerAccountPage";

export function AdminApp() {
  return (
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="Main navigation">
        <div className="welcome-block">
          <p className="welcome-block__label">Welcome</p>
          <p className="welcome-block__name">Admin</p>
        </div>
        <nav>
          <Link className="nav-link nav-link--active" to="/customers">
            Customers
          </Link>
        </nav>
      </aside>
      <main className="app-main">
        <Routes>
          <Route index element={<CustomersPage />} />
          <Route path=":customerId" element={<CustomerAccountPage />} />
        </Routes>
      </main>
    </div>
  );
}