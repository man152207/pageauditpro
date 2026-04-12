

# Fix: Real Facebook Data Not Showing in Audit Reports

## Root Causes Found

1. **Metrics not stored for free users**: `run-audit` only stores to `audit_metrics` table when `hasProAccess` is true (line 668). Free users get NO metrics row at all — so the report page has nothing to display.

2. **Field name mismatches in BasicReportPreview**: `extractKeyMetrics()` looks for `inputData.engagement_rate` but `run-audit` stores `engagementRate`. Same for `posts_count` vs `postsAnalyzed`.

3. **`input_data` is too sparse**: Only stores `followers, postsPerWeek, totalLikes, totalComments, totalShares, postsAnalyzed, dateRange`. Missing `engagementRate`, `avgEngagementPerPost`, etc.

4. **Report page shows empty for free users**: `get-audit-report` returns `detailed_metrics: null` for free users — only a tiny `metricsPreview` with just `engagementRate`. All charts, posts, breakdown rely on `detailed_metrics`.

## Plan

### 1. Update `supabase/functions/run-audit/index.ts`
- **Always store `audit_metrics`** (not just for Pro) — store basic computed metrics for all users
- Enrich `input_data` with ALL calculated values: `engagementRate`, `avgEngagementPerPost`, `totalEngagements`
- Pro users still get the full `raw_metrics` with posts; free users get `raw_metrics: null`

### 2. Update `supabase/functions/get-audit-report/index.ts`
- For FREE users: return basic `detailed_metrics` (followers, engagement rate, posts count, score breakdown) from `audit_metrics.computed_metrics`
- Keep Pro-only data gated (posts analysis, demographics, AI insights, trend data, heatmap)
- This way free users see real numbers, not empty dashes

### 3. Fix `src/components/audit/BasicReportPreview.tsx`
- Fix `extractKeyMetrics()` field mapping to match actual `input_data` keys:
  - `followers` ✓ (already correct)
  - `engagementRate` (not `engagement_rate`)
  - `postsAnalyzed` (not `posts_count` or `total_posts`)
  - Add `postsPerWeek` as a metric

### 4. Update `src/components/audit/AuditFlow.tsx`
- After audit completes, pass the `input_data` and `metrics` from the run-audit response correctly
- The response includes `scores` but not `input_data` — fetch it from the created audit row

### 5. Redeploy both edge functions
- `run-audit` — always store metrics
- `get-audit-report` — return basic metrics for free users

## Files to Modify
- `supabase/functions/run-audit/index.ts` — store metrics for ALL users
- `supabase/functions/get-audit-report/index.ts` — return basic metrics for free users
- `src/components/audit/BasicReportPreview.tsx` — fix field name mapping
- `src/components/audit/AuditFlow.tsx` — ensure data flows correctly after audit

