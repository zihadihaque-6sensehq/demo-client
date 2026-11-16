import { Navigate, Route, Routes } from "react-router-dom";
import { AdminApp } from "@/AdminApp";
import { MarketingLayout } from "@/layouts/MarketingLayout";
import { HomePage } from "@/pages/HomePage";
import { MarketingSectionPage } from "@/pages/MarketingSectionPage";

export function App() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<MarketingSectionPage title="Services" />} />
        <Route path="work" element={<MarketingSectionPage title="Work" />} />
        <Route path="process" element={<MarketingSectionPage title="Process" />} />
        <Route path="about" element={<MarketingSectionPage title="About" />} />
        <Route path="careers" element={<MarketingSectionPage title="Careers" />} />
      </Route>
      <Route path="/customers/*" element={<AdminApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}