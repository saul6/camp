import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthLayout } from "./layouts/AuthLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import ProfilePage from "./pages/auth/ProfilePage";
import MessagesPage from "./pages/auth/MessagesPage";
import { MyStoreSection } from "./components/sections/MyStoreSection";
import { FeedSection } from "./components/sections/FeedSection";
import { NetworkSection } from "./components/sections/NetworkSection";
import { MarketplaceSection } from "./components/sections/MarketplaceSection";
import { BuyersSection } from "./components/sections/BuyersSection";
import { InsightsSection } from "./components/sections/InsightsSection";
import { EventsSection } from "./components/sections/EventsSection";
import { SettingsSection } from "./components/sections/SettingsSection";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route path="/feed" element={<FeedSection />} />
          <Route path="/network" element={<NetworkSection />} />
          <Route path="/marketplace" element={<MarketplaceSection />} />
          <Route path="/my-store" element={<MyStoreSection />} />
          <Route path="/buyers" element={<BuyersSection />} />
          <Route path="/insights" element={<InsightsSection />} />
          <Route path="/events" element={<EventsSection />} />
          <Route path="/settings" element={<SettingsSection />} />
          <Route path="/profile/:id?" element={<ProfilePage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:userId" element={<MessagesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
