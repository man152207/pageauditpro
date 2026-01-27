-- =============================================
-- Smart Facebook Page Audit Platform Schema
-- RBAC + Secure Architecture
-- =============================================

-- 1. Create role enum for RBAC
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'user');

-- 2. Create plan billing type enum
CREATE TYPE public.billing_type AS ENUM ('free', 'one_time', 'monthly', 'yearly');

-- 3. Create audit type enum
CREATE TYPE public.audit_type AS ENUM ('manual', 'automatic');

-- 4. Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'expired', 'pending');

-- 5. Create payment status enum
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- =============================================
-- CORE TABLES
-- =============================================

-- Organizations table (for agency/team plans)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  branding_settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate for security - prevents privilege escalation)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Plans table
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_type billing_type NOT NULL DEFAULT 'free',
  feature_flags JSONB DEFAULT '{}',
  limits JSONB DEFAULT '{"audits_per_month": 3, "pdf_exports": 0, "history_days": 0}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES public.plans(id) ON DELETE RESTRICT NOT NULL,
  status subscription_status NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  renews_at TIMESTAMPTZ,
  gateway TEXT,
  gateway_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status payment_status NOT NULL DEFAULT 'pending',
  gateway TEXT NOT NULL,
  gateway_payment_id TEXT,
  gateway_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Facebook connections table
CREATE TABLE public.fb_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  page_id TEXT NOT NULL,
  page_name TEXT NOT NULL,
  access_token_encrypted TEXT,
  scopes TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, page_id)
);

-- Audits table
CREATE TABLE public.audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  fb_connection_id UUID REFERENCES public.fb_connections(id) ON DELETE SET NULL,
  audit_type audit_type NOT NULL DEFAULT 'manual',
  page_name TEXT,
  page_url TEXT,
  input_data JSONB NOT NULL DEFAULT '{}',
  score_total INTEGER,
  score_breakdown JSONB,
  recommendations JSONB,
  is_pro_unlocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit metrics table (for automatic audits)
CREATE TABLE public.audit_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES public.audits(id) ON DELETE CASCADE NOT NULL,
  raw_metrics JSONB,
  computed_metrics JSONB,
  data_availability JSONB,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES public.audits(id) ON DELETE CASCADE NOT NULL,
  pdf_url TEXT,
  share_slug TEXT UNIQUE,
  is_public BOOLEAN NOT NULL DEFAULT false,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Settings table (encrypted values)
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL DEFAULT 'global',
  scope_id UUID,
  key TEXT NOT NULL,
  value_encrypted TEXT,
  is_sensitive BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (scope, scope_id, key)
);

-- Audit logs table (security)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Security events table
CREATE TABLE public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  ip_address INET,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- SECURITY DEFINER FUNCTIONS (for RLS)
-- =============================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'super_admin')
$$;

-- Check if user is admin or super admin
CREATE OR REPLACE FUNCTION public.is_admin_or_above(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'super_admin')
  )
$$;

-- Get user's organization ID
CREATE OR REPLACE FUNCTION public.get_user_org_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.profiles
  WHERE user_id = _user_id
$$;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fb_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Super admins can manage all orgs" ON public.organizations
  FOR ALL USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can view their org" ON public.organizations
  FOR SELECT USING (id = public.get_user_org_id(auth.uid()));

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Admins can view org profiles" ON public.profiles
  FOR SELECT USING (
    public.is_admin_or_above(auth.uid()) 
    AND organization_id = public.get_user_org_id(auth.uid())
  );

-- User roles policies (only super admin can manage)
CREATE POLICY "Super admins can manage roles" ON public.user_roles
  FOR ALL USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Plans policies (public read, super admin write)
CREATE POLICY "Anyone can view active plans" ON public.plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Super admins can manage plans" ON public.plans
  FOR ALL USING (public.is_super_admin(auth.uid()));

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all subscriptions" ON public.subscriptions
  FOR ALL USING (public.is_super_admin(auth.uid()));

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all payments" ON public.payments
  FOR SELECT USING (public.is_super_admin(auth.uid()));

-- FB Connections policies
CREATE POLICY "Users can manage own connections" ON public.fb_connections
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all connections" ON public.fb_connections
  FOR SELECT USING (public.is_super_admin(auth.uid()));

-- Audits policies
CREATE POLICY "Users can view own audits" ON public.audits
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own audits" ON public.audits
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admins can view all audits" ON public.audits
  FOR SELECT USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Admins can view org audits" ON public.audits
  FOR SELECT USING (
    public.is_admin_or_above(auth.uid())
    AND organization_id = public.get_user_org_id(auth.uid())
  );

-- Audit metrics policies
CREATE POLICY "Users can view own audit metrics" ON public.audit_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.audits
      WHERE audits.id = audit_metrics.audit_id
      AND audits.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can view all metrics" ON public.audit_metrics
  FOR SELECT USING (public.is_super_admin(auth.uid()));

-- Reports policies
CREATE POLICY "Public reports are viewable" ON public.reports
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage own reports" ON public.reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.audits
      WHERE audits.id = reports.audit_id
      AND audits.user_id = auth.uid()
    )
  );

-- Settings policies (super admin only for global)
CREATE POLICY "Super admins can manage global settings" ON public.settings
  FOR ALL USING (
    public.is_super_admin(auth.uid())
    AND scope = 'global'
  );

CREATE POLICY "Admins can manage org settings" ON public.settings
  FOR ALL USING (
    public.is_admin_or_above(auth.uid())
    AND scope = 'organization'
    AND scope_id = public.get_user_org_id(auth.uid())
  );

-- Audit logs (super admin only)
CREATE POLICY "Super admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_super_admin(auth.uid()));

-- Security events (super admin only)
CREATE POLICY "Super admins can view security events" ON public.security_events
  FOR SELECT USING (public.is_super_admin(auth.uid()));

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply update triggers
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fb_connections_updated_at
  BEFORE UPDATE ON public.fb_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- SEED DATA: Default Plans
-- =============================================

INSERT INTO public.plans (name, description, price, billing_type, feature_flags, limits, sort_order) VALUES
('Free', 'Basic manual audit with limited features', 0, 'free', 
  '{"manual_audit": true, "pro_audit": false, "pdf_export": false, "share_report": false, "history": false}',
  '{"audits_per_month": 5, "pdf_exports": 0, "history_days": 0}', 1),
('Pro One-Time', 'Single professional automatic audit', 29.99, 'one_time',
  '{"manual_audit": true, "pro_audit": true, "pdf_export": true, "share_report": true, "history": false}',
  '{"audits_per_month": 1, "pdf_exports": 1, "history_days": 0}', 2),
('Pro Monthly', 'Unlimited professional audits per month', 49.99, 'monthly',
  '{"manual_audit": true, "pro_audit": true, "pdf_export": true, "share_report": true, "history": true}',
  '{"audits_per_month": 100, "pdf_exports": 50, "history_days": 90}', 3),
('Agency', 'For teams and agencies with white-label', 199.99, 'monthly',
  '{"manual_audit": true, "pro_audit": true, "pdf_export": true, "share_report": true, "history": true, "white_label": true, "team": true}',
  '{"audits_per_month": 500, "pdf_exports": 200, "history_days": 365, "team_members": 10}', 4);