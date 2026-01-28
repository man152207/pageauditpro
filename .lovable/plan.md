
# Pagelyzer Complete Implementation Plan

## Current State Assessment

After thorough exploration, here's what's **implemented vs missing**:

### Already Implemented
- Authentication system with RBAC (user, admin, super_admin)
- Marketing pages (Home, Features, Pricing, FAQ, Sample Report)
- User Dashboard with mock data
- Admin/Super Admin dashboards (with mock data)
- Facebook OAuth edge function (basic flow)
- Stripe checkout and webhook handling
- Manual Audit page (requires manual data input)
- Billing page structure
- PDF report generation edge function

### Missing/Incomplete Components

1. **No subscription status tracking in AuthContext** - Cannot determine if user is Pro
2. **Manual audit flow not connected to Facebook** - Still requires manual input
3. **No automatic audit via Facebook data** - Core feature missing
4. **No freemium report gating** - All data ships to client
5. **No check-subscription edge function** - Cannot verify Pro status server-side
6. **No run-audit edge function** - Automatic audit not implemented
7. **No individual audit report page** - Only sample report exists
8. **Dashboard uses mock data** - Not connected to real database
9. **No report filtering/filtering UI** - Missing
10. **Facebook App credentials not configured** - FACEBOOK_APP_ID/SECRET missing

---

## Implementation Plan

### Phase 1: Subscription Infrastructure

**1.1 Create `check-subscription` Edge Function**
Create `supabase/functions/check-subscription/index.ts` to:
- Verify user authentication
- Check `subscriptions` table for active subscription
- Return subscription status, plan features, and limits
- This is the source of truth for Pro features

**1.2 Update AuthContext with Subscription State**
Modify `src/contexts/AuthContext.tsx` to:
- Add `subscription`, `isPro`, `planFeatures`, `usageLimits` to context
- Call `check-subscription` on login and periodically (every 5 min)
- Provide `refreshSubscription()` method
- Cache subscription state

**1.3 Create Subscription Hook**
Create `src/hooks/useSubscription.ts` for:
- Convenient access to subscription status
- Feature flag checking (`canExport`, `canAutoAudit`, etc.)
- Usage limit checking

---

### Phase 2: Secure Freemium Report API

**2.1 Create `get-audit-report` Edge Function**
Create `supabase/functions/get-audit-report/index.ts` to:
- Fetch audit data from database
- Check user's subscription status
- Return FULL data for Pro users
- Return LIMITED/SANITIZED data for Free users:
  - Overall score (yes)
  - Basic score breakdown (yes)
  - Top 2 recommendations (yes)
  - Detailed metrics (NO - Pro only)
  - AI recommendations (NO - Pro only)
  - Top/worst posts (NO - Pro only)
  - Demographics (NO - Pro only)
- Never ship Pro-only data to Free users

**2.2 Create `run-audit` Edge Function**
Create `supabase/functions/run-audit/index.ts` to:
- Accept `connection_id` parameter
- Fetch Facebook data via stored access token
- Calculate all scores and metrics
- Store audit in database
- For Pro users: store full metrics in `audit_metrics` table
- For Free users: store limited metrics only
- Return audit_id for report viewing

---

### Phase 3: New Audit Flow (Connect → Auto Audit)

**3.1 Refactor ManualAuditPage to ConnectedAuditPage**
Transform `src/pages/dashboard/ManualAuditPage.tsx` to:
- Remove all manual input forms
- Show FacebookConnect component instead
- After page connection, automatically trigger audit
- Show loading state during audit
- Redirect to report page when complete

**3.2 Update FacebookConnect Component**
Modify `src/components/facebook/FacebookConnect.tsx` to:
- Add "Run Audit" button after connection
- Trigger `run-audit` edge function
- Show audit progress indicator
- Navigate to report on completion

**3.3 Create New Audit Flow Component**
Create `src/components/audit/AuditFlow.tsx` with steps:
1. Connect Facebook (if not connected)
2. Select Page (if multiple)
3. Running Audit (loading)
4. View Report (redirect)

---

### Phase 4: Freemium Report Page

**4.1 Create AuditReportPage**
Create `src/pages/dashboard/AuditReportPage.tsx` with:
- Fetch report via `get-audit-report` edge function
- Display all available data (varies by plan)
- Lock Pro sections with `LockedFeature` component
- Lock shows blurred placeholder data (not real data)
- Add filter controls for metrics/recommendations
- Add PDF export button (Pro only)
- Add share button (Pro only)

**4.2 Update LockedFeature Component**
Modify `src/components/ui/locked-feature.tsx` to:
- Accept `placeholderContent` prop for safe preview
- Never render actual Pro data inside blur
- Use static/mock placeholder for teaser

**4.3 Create ReportFilters Component**
Create `src/components/report/ReportFilters.tsx` with:
- Category filter (Engagement, Content, Audience)
- Metric type filter
- Recommendation priority filter
- Date range (Pro only)

---

### Phase 5: Dashboard Real Data Integration

**5.1 Create Audit Hooks**
Create `src/hooks/useAudits.ts` with:
- `useRecentAudits()` - Fetch user's recent audits
- `useAuditStats()` - Fetch aggregate stats
- `useAudit(id)` - Fetch single audit
- Proper loading/error states

**5.2 Update UserDashboard**
Modify `src/pages/dashboard/UserDashboard.tsx` to:
- Use real data from hooks
- Show actual audit history
- Display real usage limits
- Show connected pages status

**5.3 Update Admin Dashboards**
Modify admin/super-admin dashboards to:
- Fetch real aggregate data
- Show actual user counts
- Display real revenue (from payments table)

---

### Phase 6: Missing Secrets & Configuration

**6.1 Add Facebook App Secrets**
Add required secrets:
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`

**6.2 Add Stripe Webhook Secret**
Add for production:
- `STRIPE_WEBHOOK_SECRET`

---

### Phase 7: Routing & Navigation Updates

**7.1 Add Report Route**
Update `src/App.tsx` to add:
- `/dashboard/reports/:auditId` → AuditReportPage
- Ensure proper auth guards

**7.2 Update Navigation Links**
Ensure all "View Report" links navigate to proper report pages.

---

## Security Guarantees

| Data Type | Free Users | Pro Users |
|-----------|------------|-----------|
| Overall Score | Yes | Yes |
| Basic Breakdown | Yes | Yes |
| 2 Recommendations | Yes | Yes |
| Full Recommendations | NO | Yes |
| Detailed Metrics | NO | Yes |
| AI Insights | NO | Yes |
| Post Analysis | NO | Yes |
| Demographics | NO | Yes |
| PDF Export | NO | Yes |
| Share Link | NO | Yes |

**Backend Enforcement:**
- `get-audit-report` function checks subscription BEFORE returning data
- Pro-only fields are never included in response for Free users
- Frontend `LockedFeature` shows placeholder content only
- No bypass possible via Inspect Element

---

## File Changes Summary

### New Files
```text
supabase/functions/check-subscription/index.ts
supabase/functions/get-audit-report/index.ts
supabase/functions/run-audit/index.ts
src/hooks/useSubscription.ts
src/hooks/useAudits.ts
src/pages/dashboard/AuditReportPage.tsx
src/components/audit/AuditFlow.tsx
src/components/report/ReportFilters.tsx
src/components/report/ReportSection.tsx
src/components/report/LockedSection.tsx
```

### Modified Files
```text
src/contexts/AuthContext.tsx (add subscription state)
src/pages/dashboard/ManualAuditPage.tsx (refactor to connected flow)
src/components/facebook/FacebookConnect.tsx (add auto-audit trigger)
src/components/ui/locked-feature.tsx (placeholder content)
src/pages/dashboard/UserDashboard.tsx (real data)
src/App.tsx (add report route)
supabase/config.toml (new functions)
```

---

## Expected User Flow (Post-Implementation)

### Free User
1. Sign up/Login
2. Navigate to Audit page
3. Connect Facebook page
4. Audit runs automatically
5. View report with:
   - Overall score visible
   - Basic breakdown visible
   - 2 recommendations visible
   - Pro sections locked with blurred placeholders
6. Click "Upgrade" on locked sections → Pricing page

### Pro User
1. Login (subscription verified)
2. Navigate to Audit page
3. Connect/Select Facebook page
4. Audit runs automatically
5. View FULL report with all metrics
6. Filter by category/type
7. Export PDF
8. Share public link

---

## Dependencies
- Facebook App credentials must be configured
- Stripe products/prices must exist in Stripe dashboard
- User must complete checkout for Pro access
