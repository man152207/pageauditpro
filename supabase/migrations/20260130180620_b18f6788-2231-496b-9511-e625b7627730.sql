-- Add RLS policy for users to manage their own settings
CREATE POLICY "Users can manage own settings" 
ON public.settings 
FOR ALL
USING (scope = 'user' AND scope_id = auth.uid())
WITH CHECK (scope = 'user' AND scope_id = auth.uid());

-- Add unique constraint for settings upsert if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'settings_scope_scope_id_key_unique'
  ) THEN
    CREATE UNIQUE INDEX settings_scope_scope_id_key_unique 
    ON public.settings (scope, scope_id, key);
  END IF;
END $$;