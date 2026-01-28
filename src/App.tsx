import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import SampleReportPage from "@/pages/SampleReportPage";
import FAQPage from "@/pages/FAQPage";
import ContactPage from "@/pages/ContactPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsOfServicePage from "@/pages/TermsOfServicePage";
import NotFound from "@/pages/NotFound";
import SitemapPage from "@/pages/SitemapPage";

// Dashboard Pages
import UserDashboard from "@/pages/dashboard/UserDashboard";
import ManualAuditPage from "@/pages/dashboard/ManualAuditPage";
import AuditReportPage from "@/pages/dashboard/AuditReportPage";
import BillingPage from "@/pages/dashboard/BillingPage";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";

// Super Admin Pages
import SuperAdminDashboard from "@/pages/super-admin/SuperAdminDashboard";
import PlansManagementPage from "@/pages/super-admin/PlansManagementPage";
import UsersManagementPage from "@/pages/super-admin/UsersManagementPage";

// Super Admin Settings (with nested routes)
import SettingsLayout from "@/pages/super-admin/settings/SettingsLayout";
import GeneralSettings from "@/pages/super-admin/settings/GeneralSettings";
import IntegrationsSettings from "@/pages/super-admin/settings/IntegrationsSettings";
import WebhooksSettings from "@/pages/super-admin/settings/WebhooksSettings";
import SEOSettings from "@/pages/super-admin/settings/SEOSettings";
import SecuritySettings from "@/pages/super-admin/settings/SecuritySettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Sitemap (serves XML) */}
            <Route path="/sitemap.xml" element={<SitemapPage />} />

            {/* Auth Page (standalone) */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Marketing Pages */}
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/sample-report" element={<SampleReportPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              {/* Legacy routes - redirect to new paths */}
              <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
              <Route path="/terms" element={<Navigate to="/terms-of-service" replace />} />
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
              <Route path="reports/:auditId" element={<AuditReportPage />} />
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
              <Route path="users" element={<UsersManagementPage />} />
              <Route path="plans" element={<PlansManagementPage />} />
              <Route path="integrations" element={<Navigate to="/super-admin/settings/integrations" replace />} />
              <Route path="security" element={<Navigate to="/super-admin/settings/security" replace />} />
              <Route path="logs" element={<SuperAdminDashboard />} />
              
              {/* Settings with nested routes */}
              <Route path="settings" element={<SettingsLayout />}>
                <Route index element={<Navigate to="/super-admin/settings/general" replace />} />
                <Route path="general" element={<GeneralSettings />} />
                <Route path="integrations" element={<IntegrationsSettings />} />
                <Route path="webhooks" element={<WebhooksSettings />} />
                <Route path="seo" element={<SEOSettings />} />
                <Route path="security" element={<SecuritySettings />} />
              </Route>
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
