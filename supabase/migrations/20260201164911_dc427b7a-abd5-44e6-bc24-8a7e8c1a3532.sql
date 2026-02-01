-- Add AI insights and demographics columns to audit_metrics
ALTER TABLE public.audit_metrics ADD COLUMN IF NOT EXISTS ai_insights TEXT;
ALTER TABLE public.audit_metrics ADD COLUMN IF NOT EXISTS demographics JSONB;

-- Create audit_schedules table for auto-audits
CREATE TABLE IF NOT EXISTS public.audit_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  connection_id UUID REFERENCES public.fb_connections(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly')),
  next_run_at TIMESTAMPTZ NOT NULL,
  last_run_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on audit_schedules
ALTER TABLE public.audit_schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for audit_schedules
CREATE POLICY "Users can manage own schedules" 
  ON public.audit_schedules 
  FOR ALL 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admins can view all schedules" 
  ON public.audit_schedules 
  FOR SELECT 
  USING (is_super_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_audit_schedules_updated_at
  BEFORE UPDATE ON public.audit_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();