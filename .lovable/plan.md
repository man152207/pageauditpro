
# Run Facebook Page Audit - Comprehensive UI & Feature Enhancement Plan

## Overview

तपाईंको request अनुसार तीनवटा मुख्य changes implement गर्नुपर्छ:

1. **Audit Page UI Redesign**: Connected pages list देखाउने, auto-run हटाउने, basic report यही page मा देखाउने
2. **Super Admin Free Audit Feature**: Hidden feature जसले selected user लाई selected month मा free audits दिन्छ
3. **Detailed Metrics 10% Preview**: Pro users को लागि भएको detailed metrics को 10% मात्र देखाउने

---

## Part 1: Audit Page UI Redesign

### Current State

```text
┌───────────────────────────────────────────────────────────────────┐
│ Run Page Audit                                                     │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  STEP 1: Connect Facebook Page → STEP 2: Auto-Run Audit → Done   │
│                                                                   │
│  (Direct navigation to reports page after audit)                 │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Proposed New State

```text
┌───────────────────────────────────────────────────────────────────┐
│ Run Facebook Page Audit                                           │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Connected Pages                                                   │
│ ┌─────────────────────────────────────────────────────────────┐  │
│ │ ✓ My Business Page     │ Connected │ [Run Audit] │ [Remove] │  │
│ │ ✓ Personal Blog Page   │ Connected │ [Run Audit] │ [Remove] │  │
│ │                                                             │  │
│ │ [+ Connect Another Page]                                    │  │
│ └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│ ─────────────────────────────────────────────────────────────── │
│                                                                   │
│ Basic Report (after audit)                                       │
│ ┌─────────────────────────────────────────────────────────────┐  │
│ │ Page: My Business Page                                      │  │
│ │ Overall Score: 75/100                                       │  │
│ │                                                             │  │
│ │ [Engagement: 80] [Consistency: 70] [Readiness: 75]          │  │
│ │                                                             │  │
│ │ Top 2 Recommendations:                                      │  │
│ │ • Improve posting frequency                                 │  │
│ │ • Increase engagement rate                                  │  │
│ │                                                             │  │
│ │ [View Full Report →]                                        │  │
│ └─────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

### Technical Changes

#### 1.1 Rename Page Title

**File:** `src/pages/dashboard/ManualAuditPage.tsx`

```typescript
// Before
title="Run Page Audit"

// After
title="Run Facebook Page Audit"
```

#### 1.2 Restructure AuditFlow Component

**File:** `src/components/audit/AuditFlow.tsx`

**Major Changes:**
- Remove auto-run audit on page connect (line 186-189)
- Add new state to store last completed audit for inline preview
- Show connected pages in a table-like list with status column
- Add "Run Audit" button per page (instead of auto-triggering)
- After audit complete, show basic report inline (score cards + top 2 recommendations)
- Add "View Full Report" button to navigate to reports page

**New State Variables:**
```typescript
const [lastAuditResult, setLastAuditResult] = useState<{
  auditId: string;
  pageName: string;
  score: number;
  breakdown: { engagement: number; consistency: number; readiness: number };
  recommendations: any[];
} | null>(null);
```

**New UI Sections:**
1. **Connected Pages List** - Table showing all connected pages with Status + Actions
2. **Running State** - Shows when audit is in progress (existing)
3. **Basic Report Preview** - Shows inline after audit completes (NEW)

#### 1.3 Component Structure

```typescript
// New simplified flow:
// 1. Show all connected pages in a list
// 2. Each page has "Run Audit" button
// 3. When running, show loading state
// 4. After complete, show basic report inline + "View Full Report" CTA
```

---

## Part 2: Super Admin Free Audit Feature (Hidden)

### Database Schema

**New Table:** `free_audit_grants`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Target user who gets free audits |
| granted_by | uuid | Super Admin who granted this |
| grant_month | date | Month for which audits are free (first day of month) |
| created_at | timestamp | When grant was created |

**SQL Migration:**
```sql
CREATE TABLE public.free_audit_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by UUID NOT NULL REFERENCES auth.users(id),
  grant_month DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, grant_month)
);

-- RLS: Only super_admin can read/write
ALTER TABLE public.free_audit_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access" ON public.free_audit_grants
  FOR ALL USING (public.is_super_admin(auth.uid()));
```

### Backend Changes

**File:** `supabase/functions/run-audit/index.ts`

Add check before usage limit validation:
```typescript
// Check if user has free audit grant for this month
const currentMonth = new Date();
currentMonth.setDate(1);
currentMonth.setHours(0, 0, 0, 0);

const { data: freeGrant } = await supabase
  .from("free_audit_grants")
  .select("id")
  .eq("user_id", userId)
  .eq("grant_month", currentMonth.toISOString().split('T')[0])
  .maybeSingle();

const hasFreeAuditGrant = !!freeGrant;

// Modify the limit check:
if (!isPro && !hasFreeAuditGrant) {
  // existing usage limit check...
}
```

### Super Admin UI

**New Settings Tab:** "Promotions" or add to existing "General Settings"

**File:** `src/pages/super-admin/settings/PromotionsSettings.tsx` (NEW)

**UI Features:**
- User search/select dropdown
- Month picker
- "Grant Free Audits" button
- List of active grants with remove option

**Important:** This tab is only visible in Super Admin settings, not exposed to regular users.

### Route Addition

**File:** `src/App.tsx`

```typescript
// Add to SettingsLayout children:
<Route path="promotions" element={<PromotionsSettings />} />
```

**File:** `src/pages/super-admin/settings/SettingsLayout.tsx`

```typescript
// Add to settingsTabs array:
{ id: 'promotions', label: 'Promotions', icon: Gift, path: '/super-admin/settings/promotions' },
```

---

## Part 3: Detailed Metrics 10% Preview for Non-Pro Users

### Current Behavior
- Free users: Completely locked (LockedSection component)
- Pro users: Full detailed metrics visible

### Proposed Behavior
- Free users: Show 10% of metrics (1 out of 4 cards) clearly visible, rest blurred
- This creates a "teaser" effect showing real data sample

### Implementation

**File:** `src/pages/dashboard/AuditReportPage.tsx`

```typescript
// In the Detailed Metrics section:
{report.detailed_metrics ? (
  <ReportSection title="Detailed Metrics" ...>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Show first metric (10% = 1 of ~10) without blur */}
      <div className="p-4 rounded-lg bg-muted/50">
        <p className="text-sm text-muted-foreground mb-1">Engagement Rate</p>
        <p className="text-2xl font-bold text-primary">
          {report.detailed_metrics.engagementRate?.toFixed(2)}%
        </p>
      </div>
      
      {/* Remaining metrics blurred for non-Pro */}
      {!hasProAccess ? (
        <div className="col-span-3 relative">
          <div className="grid gap-4 sm:grid-cols-3 blur-sm pointer-events-none">
            {/* Placeholder metrics */}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Button asChild>
              <Link to="/dashboard/billing">
                <Sparkles className="mr-2" /> Unlock All Metrics
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        /* Full metrics for Pro users */
      )}
    </div>
  </ReportSection>
) : hasProAccess ? null : (
  <LockedSection ... />
)}
```

### Backend Adjustment

**File:** `supabase/functions/get-audit-report/index.ts`

For FREE users, return partial detailed_metrics (10%):
```typescript
// Instead of returning NO detailed_metrics for free users,
// return a subset (teaser):
const partialMetrics = {
  engagementRate: metrics?.computed_metrics?.engagementRate || null,
  // Only this one field for preview
};

return new Response(JSON.stringify({
  ...baseResponse,
  detailed_metrics_preview: partialMetrics, // New field
  // ... rest
}));
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/super-admin/settings/PromotionsSettings.tsx` | Super Admin UI for granting free audits |
| `src/components/audit/ConnectedPagesList.tsx` | Reusable component for listing connected pages |
| `src/components/audit/BasicReportPreview.tsx` | Inline basic report preview after audit |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/dashboard/ManualAuditPage.tsx` | Update title to "Run Facebook Page Audit" |
| `src/components/audit/AuditFlow.tsx` | Major restructure - connected pages list, manual audit trigger, inline report |
| `src/pages/super-admin/settings/SettingsLayout.tsx` | Add "Promotions" tab |
| `src/App.tsx` | Add PromotionsSettings route |
| `supabase/functions/run-audit/index.ts` | Check for free audit grants |
| `supabase/functions/get-audit-report/index.ts` | Return 10% metrics preview for free users |
| `src/pages/dashboard/AuditReportPage.tsx` | Show 10% detailed metrics for free users |

## Database Migration

New table `free_audit_grants` with RLS for super_admin only access.

---

## Summary

| Feature | Description | Hidden? |
|---------|-------------|---------|
| Page Title Rename | "Run Page Audit" → "Run Facebook Page Audit" | No |
| Connected Pages List | Show all pages with status column | No |
| Manual Audit Trigger | "Run Audit" button instead of auto-run | No |
| Inline Basic Report | Show score + recommendations on audit page | No |
| Multiple Pages Support | List all connected pages | No |
| Free Audit Grants | Super Admin grants free monthly audits | Yes (Super Admin only) |
| Detailed Metrics 10% | Show 1 metric, blur rest for free users | No |
