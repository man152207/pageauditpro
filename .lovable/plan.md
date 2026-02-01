

# Pagelyzer - बाँकी सबै Features को Complete Implementation Plan

## Overview

यो plan मा सबै missing features को technical implementation guide छ। तपाईंको requirement अनुसार सबै API keys/secrets Super Admin Settings मा manage हुनेछन्।

---

## 📊 Current Status & Required Work

| Feature | Status | Priority | Work Required |
|---------|--------|----------|---------------|
| PDF Export | 🔶 Partial | HIGH | Frontend download button + client-side PDF conversion |
| AI Insights | ❌ Locked | HIGH | Lovable AI integration + new edge function |
| Demographics | ❌ Locked | HIGH | Facebook Insights API call + UI |
| Share Report | 🔶 Disabled | MEDIUM | Shareable URL system + public view page |
| Auto Audit | ❌ Missing | MEDIUM | Cron job + notification system |
| Report Comparison | ❌ Missing | LOW | Compare UI + logic |
| Export History CSV | ❌ Missing | LOW | CSV generation + download |

---

## Part 1: PDF Export (HIGH Priority)

### Current State
- `generate-pdf-report` edge function already exists - returns HTML
- Frontend "Export PDF" button is disabled

### Implementation

**No new secrets required** - uses existing data

#### 1.1 Add html2pdf.js Library

```bash
npm install html2pdf.js
```

#### 1.2 Create PDF Download Hook

**New File:** `src/hooks/usePdfExport.ts`

```typescript
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPdf = async (auditId: string) => {
    setIsExporting(true);
    try {
      // Call edge function to get HTML
      const { data, error } = await supabase.functions.invoke('generate-pdf-report', {
        body: { audit_id: auditId },
      });

      if (error || !data?.html) throw new Error(error?.message || 'Failed to generate report');

      // Dynamically import html2pdf
      const html2pdf = (await import('html2pdf.js')).default;

      // Create temp container
      const container = document.createElement('div');
      container.innerHTML = data.html;
      document.body.appendChild(container);

      // Generate PDF
      await html2pdf()
        .set({
          margin: 10,
          filename: `${data.audit.page_name || 'audit'}-report.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(container)
        .save();

      document.body.removeChild(container);
      return true;
    } finally {
      setIsExporting(false);
    }
  };

  return { exportToPdf, isExporting };
}
```

#### 1.3 Update AuditReportPage.tsx

Enable the Export PDF button:

```typescript
// Import hook
import { usePdfExport } from '@/hooks/usePdfExport';

// In component
const { exportToPdf, isExporting } = usePdfExport();

// Update button
<Button 
  variant="outline" 
  onClick={() => exportToPdf(auditId!)}
  disabled={isExporting}
>
  {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
  Export PDF
</Button>
```

---

## Part 2: AI-Powered Insights (HIGH Priority)

### What It Does
Pro users get personalized AI analysis of their Facebook page data with actionable recommendations.

### Secrets Required
**None** - Lovable AI is pre-configured with `LOVABLE_API_KEY` (already exists)

### Implementation

#### 2.1 Create AI Insights Edge Function

**New File:** `supabase/functions/generate-ai-insights/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, ...",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth check...
    const { audit_id } = await req.json();

    // Fetch audit data
    const { data: audit } = await supabase
      .from("audits")
      .select("*, audit_metrics(*)")
      .eq("id", audit_id)
      .single();

    // Build prompt with page data
    const prompt = `
      Analyze this Facebook page performance and provide 3-5 actionable insights:
      
      Page: ${audit.page_name}
      Followers: ${audit.input_data.followers}
      Engagement Rate: ${audit.audit_metrics?.computed_metrics?.engagementRate}%
      Posts/Week: ${audit.input_data.postsPerWeek}
      Score Breakdown: ${JSON.stringify(audit.score_breakdown)}
      
      Provide specific, actionable recommendations to improve page performance.
    `;

    // Call Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a Facebook marketing expert..." },
          { role: "user", content: prompt },
        ],
      }),
    });

    const aiData = await response.json();
    const insights = aiData.choices[0].message.content;

    // Store insights
    await supabase
      .from("audit_metrics")
      .update({ ai_insights: insights })
      .eq("audit_id", audit_id);

    return new Response(JSON.stringify({ success: true, insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    // Error handling...
  }
});
```

#### 2.2 Add AI Insights Column

```sql
ALTER TABLE audit_metrics ADD COLUMN ai_insights TEXT;
```

#### 2.3 Update AuditReportPage.tsx

Replace the locked AI section with conditional rendering:

```typescript
{hasProAccess && report.ai_insights ? (
  <ReportSection title="AI-Powered Insights" ...>
    <div className="prose prose-sm max-w-none">
      {/* Render markdown insights */}
    </div>
  </ReportSection>
) : hasProAccess && !report.ai_insights ? (
  <ReportSection title="AI-Powered Insights" ...>
    <Button onClick={() => generateInsights(auditId)}>
      <Sparkles className="mr-2" /> Generate AI Insights
    </Button>
  </ReportSection>
) : (
  <LockedSection title="AI-Powered Insights" ... />
)}
```

---

## Part 3: Audience Demographics (HIGH Priority)

### What It Does
Shows age, gender, location breakdown of page audience from Facebook Insights API.

### Secrets Required
Already configured: `facebook_app_id`, `facebook_app_secret` in settings table

### Implementation

#### 3.1 Update run-audit Function

Add demographics fetch in `supabase/functions/run-audit/index.ts`:

```typescript
// After posts fetch, add:
let demographics: any = null;

if (hasProAccess) {
  try {
    const demoUrl = `https://graph.facebook.com/v19.0/${pageId}/insights?` +
      `metric=page_fans_gender_age,page_fans_city,page_fans_country&` +
      `period=lifetime&access_token=${pageToken}`;
    
    const demoRes = await fetch(demoUrl);
    const demoData = await demoRes.json();
    demographics = demoData.data || null;
    dataAvailability.demographics = !demoData.error;
  } catch (e) {
    dataAvailability.demographics = false;
  }
}

// Store in audit_metrics
await supabase.from("audit_metrics").insert({
  ...
  demographics: demographics,
});
```

#### 3.2 Add Demographics Column

```sql
ALTER TABLE audit_metrics ADD COLUMN demographics JSONB;
```

#### 3.3 Update get-audit-report Function

Include demographics in Pro response:

```typescript
const proResponse = {
  ...baseResponse,
  demographics: metrics?.demographics || null,
  // ...
};
```

#### 3.4 Create Demographics UI Component

**New File:** `src/components/report/DemographicsSection.tsx`

Displays:
- Age/Gender pie charts using Recharts
- Top countries/cities table
- Visual breakdown cards

---

## Part 4: Share Report (MEDIUM Priority)

### What It Does
Creates a shareable public URL for Pro users to share their reports.

### Secrets Required
**None** - uses existing database

### Implementation

#### 4.1 Add Share Slug Generation

The `reports` table already has `share_slug` and `is_public` columns.

#### 4.2 Create Share Edge Function

**New File:** `supabase/functions/share-report/index.ts`

```typescript
// Actions: 'create', 'revoke'
// Creates unique slug, updates is_public = true
// Returns: { share_url: 'https://pagelyzer.io/r/abc123' }
```

#### 4.3 Create Public Report Page

**New File:** `src/pages/PublicReportPage.tsx`

- Route: `/r/:shareSlug`
- Fetches report by slug (no auth required)
- Displays read-only report view
- Increments `views_count`

#### 4.4 Update AuditReportPage.tsx

Enable Share button:

```typescript
<Button variant="outline" onClick={() => handleShare()}>
  <Share2 className="mr-2 h-4 w-4" />
  Share
</Button>

// Dialog to show/copy share URL
```

---

## Part 5: Auto Audit / Scheduled Audits (MEDIUM Priority)

### What It Does
Pro users can schedule automatic weekly/monthly audits with email notifications.

### Database Schema

```sql
CREATE TABLE audit_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES fb_connections(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly')),
  next_run_at TIMESTAMPTZ NOT NULL,
  last_run_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Implementation

#### 5.1 Create Cron Edge Function

Extend `weekly-email-cron` or create new `auto-audit-cron`:

```typescript
// Runs every hour via pg_cron
// Checks audit_schedules where next_run_at <= now() AND is_active = true
// Calls run-audit for each
// Sends email notification
// Updates next_run_at based on frequency
```

#### 5.2 Create Schedule Management UI

In Settings page, add "Auto Audit" section:
- Enable/disable toggle
- Frequency selector (weekly/monthly)
- Connected page selector

---

## Part 6: Report Comparison (LOW Priority)

### What It Does
Compare two audits side-by-side to see score changes.

### Implementation

#### 6.1 Create Comparison Page

**New File:** `src/pages/dashboard/CompareReportsPage.tsx`

- Select two audits from dropdown
- Side-by-side score cards with delta indicators
- Recommendation changes

#### 6.2 Add to Navigation

Add "Compare" button in History page.

---

## Part 7: Export History CSV (LOW Priority)

### What It Does
Download audit history as CSV file.

### Implementation

#### 7.1 Add Export Button in HistoryPage.tsx

```typescript
const exportToCSV = () => {
  const headers = ['Date', 'Page Name', 'Score', 'Engagement', 'Consistency', 'Readiness'];
  const rows = audits.map(a => [
    format(new Date(a.created_at), 'yyyy-MM-dd'),
    a.page_name,
    a.score_total,
    a.score_breakdown?.engagement,
    a.score_breakdown?.consistency,
    a.score_breakdown?.readiness,
  ]);
  
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'audit-history.csv';
  a.click();
};

// Button in header
<Button variant="outline" onClick={exportToCSV}>
  <Download className="mr-2 h-4 w-4" />
  Export CSV
</Button>
```

---

## 🔑 API Keys Management Summary

तपाईंले Super Admin Settings मा manage गर्न सक्नुहुने keys:

| Integration | Keys | Already in Settings? | Used By |
|-------------|------|---------------------|---------|
| Facebook | App ID, App Secret | ✅ Yes | OAuth, Insights API |
| Stripe | Secret Key, Publishable Key | ✅ Yes | Payments |
| PayPal | Client ID, Client Secret | ✅ Yes | Payments |
| eSewa | Merchant ID, Secret | ✅ Yes | Payments |
| Resend | API Key, From Email/Name | ✅ Yes | Email notifications |
| Lovable AI | LOVABLE_API_KEY | ✅ Auto-configured | AI Insights (No user action needed) |

**Note:** Lovable AI key is auto-provisioned - you don't need to add it manually.

---

## 📁 Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/usePdfExport.ts` | PDF download hook |
| `supabase/functions/generate-ai-insights/index.ts` | AI insights generation |
| `supabase/functions/share-report/index.ts` | Report sharing management |
| `src/pages/PublicReportPage.tsx` | Public shared report view |
| `src/components/report/DemographicsSection.tsx` | Demographics charts UI |
| `src/pages/dashboard/CompareReportsPage.tsx` | Report comparison |

## 📁 Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/run-audit/index.ts` | Add demographics fetch |
| `supabase/functions/get-audit-report/index.ts` | Include demographics & AI insights |
| `src/pages/dashboard/AuditReportPage.tsx` | Enable PDF/Share buttons, add AI/Demographics sections |
| `src/pages/dashboard/HistoryPage.tsx` | Add CSV export button |
| `src/App.tsx` | Add public report route |
| `supabase/config.toml` | Add new edge functions |

## Database Migrations

```sql
-- Add new columns
ALTER TABLE audit_metrics ADD COLUMN ai_insights TEXT;
ALTER TABLE audit_metrics ADD COLUMN demographics JSONB;

-- Add audit schedules table
CREATE TABLE audit_schedules (...);
```

---

## Implementation Order (Recommended)

1. **PDF Export** - Quick win, high value
2. **AI Insights** - Uses existing Lovable AI
3. **Demographics** - Facebook API already connected
4. **Share Report** - Database structure exists
5. **CSV Export** - Simple frontend feature
6. **Auto Audit** - Needs cron setup
7. **Report Comparison** - Nice-to-have

के तपाईं यी सबै implement गर्न तयार हुनुहुन्छ? म एक-एक गरेर implement गर्न सक्छु।

