-- Create free_audit_grants table for Super Admin to grant free audit months to users
CREATE TABLE public.free_audit_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  granted_by UUID NOT NULL,
  grant_month DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, grant_month)
);

-- Enable RLS
ALTER TABLE public.free_audit_grants ENABLE ROW LEVEL SECURITY;

-- Only super_admin can manage grants
CREATE POLICY "Super admin full access" ON public.free_audit_grants
  FOR ALL USING (public.is_super_admin(auth.uid()));