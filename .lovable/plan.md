

# Complete Implementation Plan: OpenAI Integration + Feature Testing + Sidebar Update

## Overview

तपाईंको request अनुसार:
1. **OpenAI ChatGPT** use गर्ने (Lovable AI को सट्टा)
2. PDF Export, Share, AI Insights, Compare Reports test गर्ने
3. Auto Audit cron job implement गर्ने
4. Compare link sidebar मा add गर्ने

---

## Part 1: OpenAI API Key - Super Admin Settings मा Add गर्ने

### 1.1 IntegrationsSettings.tsx Update

**File:** `src/pages/super-admin/settings/IntegrationsSettings.tsx`

Add `openai_api_key` to the settings state:

```typescript
const [settings, setSettings] = useState<Record<string, string>>({
  // ... existing settings
  openai_api_key: '',  // NEW
});
```

### 1.2 IntegrationSettings Component Update

**File:** `src/components/settings/IntegrationSettings.tsx`

Add new OpenAI Integration Card after Resend:

```typescript
{/* OpenAI / ChatGPT */}
<IntegrationCard
  title="OpenAI (ChatGPT)"
  icon={<Brain className="h-5 w-5 text-[#10A37F]" />}
  isConfigured={isConfigured('openai_api_key')}
  onSave={() => saveSettings([
    { key: 'openai_api_key', value: settings.openai_api_key || '', is_sensitive: true },
  ])}
  saving={saving}
>
  <div className="p-3 rounded-lg bg-muted/50 text-sm mb-4">
    <p className="text-muted-foreground">
      Get your API key from{' '}
      <a href="https://platform.openai.com/api-keys" target="_blank" className="text-primary hover:underline">
        OpenAI Platform
      </a>
    </p>
  </div>
  <SecretInput 
    id="openai-key" 
    label="OpenAI API Key" 
    value={settings.openai_api_key || ''} 
    onChange={(v) => updateSetting('openai_api_key', v)} 
    placeholder="sk-..." 
    helpText="From platform.openai.com/api-keys" 
  />
</IntegrationCard>
```

---

## Part 2: Update AI Insights Edge Function for OpenAI

### 2.1 Modify generate-ai-insights Edge Function

**File:** `supabase/functions/generate-ai-insights/index.ts`

Replace Lovable AI Gateway with OpenAI API:

```typescript
// Fetch OpenAI API key from settings
const { data: apiKeySetting } = await supabase
  .from("settings")
  .select("value_encrypted")
  .eq("scope", "global")
  .eq("key", "openai_api_key")
  .maybeSingle();

const openaiApiKey = apiKeySetting?.value_encrypted;

if (!openaiApiKey) {
  return new Response(
    JSON.stringify({ 
      error: "OpenAI API key not configured",
      is_config_issue: true,
      fix_steps: ["Go to Super Admin → Settings → Integrations", "Add your OpenAI API key"]
    }),
    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Call OpenAI API (ChatGPT)
const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${openaiApiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-4o-mini",  // Cost-effective, fast model
    messages: [
      {
        role: "system",
        content: "You are a Facebook marketing expert providing personalized insights. Be specific, actionable, and data-driven. Format your response with clear section headers using ## for each insight title.",
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 1500,
    temperature: 0.7,
  }),
});
```

---

## Part 3: Add Compare Reports Link to Sidebar

### 3.1 Update DashboardLayout.tsx

**File:** `src/components/layout/DashboardLayout.tsx`

Add GitCompare icon import and Compare link:

```typescript
import {
  // ... existing imports
  GitCompare,  // Add this
} from 'lucide-react';

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/audit', label: 'Run Audit', icon: Sparkles },
  { href: '/dashboard/reports', label: 'Reports', icon: FileBarChart },
  { href: '/dashboard/compare', label: 'Compare', icon: GitCompare },  // NEW
  { href: '/dashboard/history', label: 'History', icon: History },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
];
```

---

## Part 4: Auto Audit Cron Job Implementation

### 4.1 Create Auto Audit Edge Function

**New File:** `supabase/functions/auto-audit-cron/index.ts`

```typescript
// Runs every hour via pg_cron
// 1. Query audit_schedules WHERE next_run_at <= now() AND is_active = true
// 2. For each schedule:
//    - Get fb_connection details
//    - Call run-audit function
//    - Send email notification
//    - Update last_run_at and next_run_at
```

### 4.2 Setup pg_cron Job

```sql
SELECT cron.schedule(
  'auto-audit-hourly',
  '0 * * * *',  -- Every hour
  $$
  SELECT net.http_post(
    url:='https://wrjqheztddmazlifbzbi.supabase.co/functions/v1/auto-audit-cron',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ANON_KEY"}'::jsonb
  );
  $$
);
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/pages/super-admin/settings/IntegrationsSettings.tsx` | Add `openai_api_key` to state |
| `src/components/settings/IntegrationSettings.tsx` | Add OpenAI card with API key input |
| `supabase/functions/generate-ai-insights/index.ts` | Replace Lovable AI with OpenAI API |
| `src/components/layout/DashboardLayout.tsx` | Add Compare link to sidebar navigation |
| `supabase/functions/auto-audit-cron/index.ts` | NEW: Cron job for scheduled audits |
| `supabase/config.toml` | Add auto-audit-cron function config |

---

## Testing Notes

During browser testing, I found:
- **Reports page showing "No reports found"** - This may need investigation of the `reports` table vs `audits` table query
- **History page works correctly** - Shows all audits with data

---

## Implementation Order

1. Add OpenAI API key field to Super Admin Settings
2. Update `generate-ai-insights` to use OpenAI
3. Add Compare link to sidebar
4. Implement Auto Audit cron job
5. Fix Reports page data fetching (if needed)

