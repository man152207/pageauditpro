import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Pages
import HomePage from "@/pages/HomePage";
import AuthPage from "@/pages/AuthPage";
import PricingPage from "@/pages/PricingPage";
import FeaturesPage from "@/pages/FeaturesPage";
import NotFound from "@/pages/NotFound";

// Dashboard Pages
import UserDashboard from "@/pages/dashboard/UserDashboard";
import ManualAuditPage from "@/pages/dashboard/ManualAuditPage";
import BillingPage from "@/pages/dashboard/BillingPage";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";

// Super Admin Pages
import SuperAdminDashboard from "@/pages/super-admin/SuperAdminDashboard";
import SuperAdminSettingsPage from "@/pages/super-admin/SuperAdminSettingsPage";
import PlansManagementPage from "@/pages/super-admin/PlansManagementPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Page (standalone) */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Marketing Pages */}
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/sample-report" element={<HomePage />} />
              <Route path="/faq" element={<HomePage />} />
              <Route path="/contact" element={<HomePage />} />
              <Route path="/privacy" element={<HomePage />} />
              <Route path="/terms" element={<HomePage />} />
            </Route>

            {/* Public Audit (no auth required) */}
            <Route path="/audit" element={<MarketingLayout />}>
              <Route index element={<ManualAuditPage />} />
            </Route>

            {/* Dashboard Routes (Auth Required) */}
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <DashboardLayout />
                </AuthGuard>
              }
            >
              <Route index element={<UserDashboard />} />
              <Route path="audit" element={<ManualAuditPage />} />
              <Route path="reports" element={<UserDashboard />} />
              <Route path="history" element={<UserDashboard />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="profile" element={<UserDashboard />} />
              <Route path="settings" element={<UserDashboard />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <RoleGuard allowedRoles={['admin', 'super_admin']}>
                  <DashboardLayout />
                </RoleGuard>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminDashboard />} />
              <Route path="audits" element={<AdminDashboard />} />
              <Route path="branding" element={<AdminDashboard />} />
            </Route>

            {/* Super Admin Routes */}
            <Route
              path="/super-admin"
              element={
                <RoleGuard allowedRoles={['super_admin']} fallbackPath="/dashboard">
                  <DashboardLayout />
                </RoleGuard>
              }
            >
              <Route index element={<SuperAdminDashboard />} />
              <Route path="plans" element={<PlansManagementPage />} />
              <Route path="integrations" element={<SuperAdminSettingsPage />} />
              <Route path="security" element={<SuperAdminSettingsPage />} />
              <Route path="settings" element={<SuperAdminSettingsPage />} />
              <Route path="logs" element={<SuperAdminDashboard />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
