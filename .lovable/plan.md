

# Content Planner Improvements + Lifetime Grants

## Summary
Six changes: (1) Free users get view-only Content Planner, (2) show admin/agency service notice, (3) show connected pages info, (4) remove New Post button for free users, (5) auto-publish toggle view-only for free users, (6) add "Lifetime" option to Promotions grants.

---

## Changes

### 1. Free User View-Only Mode
**File: `src/pages/dashboard/ContentPlannerPage.tsx`**
- Hide "New Post" button for free (non-Pro, non-admin) users
- Disable `onDateClick` for free users (no composer opens on calendar click)
- Pass `readOnly` prop to `CalendarGrid` and `PostCard`
- Show a banner: "Your content is being managed by your service provider. Upgrade to Pro for full access."

### 2. Admin Service Notice
**File: `src/pages/dashboard/ContentPlannerPage.tsx`**
- Below the free plan alert, if the user has posts created by an admin (posts exist but user is free), show:
  - "📋 MPG Solution is managing your content calendar"
  - Or dynamically: show the organization name if available, otherwise "Your service provider"

### 3. Connected Pages Info
**File: `src/pages/dashboard/ContentPlannerPage.tsx`**
- Show a small info section displaying connected Facebook pages count and names
- E.g., "Connected Pages: Page A, Page B (2 pages)"
- Visible to all users so they know which pages have plans

### 4. CalendarGrid Read-Only Mode
**File: `src/components/planner/CalendarGrid.tsx`**
- Accept new prop `readOnly?: boolean`
- When `readOnly=true`:
  - Hide Edit/Delete buttons in popover
  - Disable date click (no composer)
  - Keep popover for viewing post details

### 5. Auto-Publish Toggle — Free = Disabled
**File: `src/pages/dashboard/ContentPlannerPage.tsx`**
- For non-admin, non-Pro users: show the auto-publish switch but disabled with a lock icon
- Tooltip: "Available on Pro plan"

### 6. Promotions: Lifetime Grant Option
**File: `src/pages/super-admin/settings/PromotionsSettings.tsx`**
- Add "Lifetime" option in the month selector dropdown (value: `"lifetime"`)
- When "Lifetime" selected, insert `grant_month = '9999-01-01'` (a sentinel date)

**File: `supabase/functions/check-subscription/index.ts`**
- Update free grant query: check for EITHER `grant_month = currentMonth` OR `grant_month = '9999-01-01'`

**File: `supabase/functions/run-audit/index.ts`**
- Same change: check for lifetime grant (`9999-01-01`) in addition to current month

**File: `supabase/functions/get-audit-report/index.ts`**
- Same change: check for lifetime grant

**File: Active Grants table in PromotionsSettings**
- Display "Lifetime" instead of a date when `grant_month = '9999-01-01'`

---

## Database Changes
- **No schema changes needed** — the `grant_month` column is a `date` type; `'9999-01-01'` is a valid date value used as a sentinel for "lifetime"

---

## Technical Details
- Free user detection: `!isPro && !canManageOthers` (existing pattern)
- The `readOnly` prop flows from ContentPlannerPage → CalendarGrid to disable interactions
- Lifetime grant uses sentinel date `9999-01-01` — simple, no schema change, backward compatible
- Edge functions use OR condition: `.or('grant_month.eq.{monthStr},grant_month.eq.9999-01-01')` or raw SQL filter

## Files Modified
1. `src/pages/dashboard/ContentPlannerPage.tsx` — view-only mode, service notice, connected pages, button hiding
2. `src/components/planner/CalendarGrid.tsx` — `readOnly` prop
3. `src/pages/super-admin/settings/PromotionsSettings.tsx` — lifetime option
4. `supabase/functions/check-subscription/index.ts` — lifetime grant check
5. `supabase/functions/run-audit/index.ts` — lifetime grant check
6. `supabase/functions/get-audit-report/index.ts` — lifetime grant check

