

# Fix Report Issues: Videos, Demographics, Heatmap, Score Display

## Issues Found

1. **Videos shown as "photo"**: The backend infers post type as `full_picture ? 'photo' : 'status'` (line 456/588 of run-audit). But many posts are actually reels/videos — their `permalink_url` contains `/reel/` or `/videos/`. The type detection is wrong.

2. **Best Time to Post shows nothing**: Data mismatch. Backend stores `day` as numbers (0=Sun, 1=Mon...) but `BestTimeHeatmap` component compares `d.day === 'Mon'` (string). They never match, so all cells are 0.

3. **Demographics stuck on "loading"**: Demographics is `null` in DB because Facebook returned error `(#100) The value must be a valid insights metric` for `page_follows_gender_age/city/country`. The UI shows a loading spinner when `demographics` is null — should show "Unavailable" with the actual reason instead.

4. **Score verification**: Scores ARE real. Data shows `followersSource: page_info`, `engagementSource: posts`, all 3 score components used. The scores (Engagement 10, Consistency 85, Readiness 71, Overall 52) are genuinely computed.

5. **"Why this score?" dropdown**: User wants the explanation items always visible, not hidden behind a collapsible accordion.

6. **Permalink URLs blocked**: Facebook reel/post URLs may be blocked by browser or content policy — this is likely a Facebook CDN/embed restriction, not something we can fix server-side.

## Implementation

### 1. Fix video type detection in `run-audit` (backend)
- In `run-audit/index.ts`, change type inference logic at lines 456 and 588:
  - Check `permalink_url` for `/reel/` or `/videos/` → type = `video`
  - Otherwise if `full_picture` exists → type = `photo`
  - Otherwise → type = `status`

### 2. Fix Best Time to Post heatmap (frontend)
- In `BestTimeHeatmap` (`EngagementChart.tsx`), change `getHeatValue` to match by day index instead of day name string:
  - Map day names to their numeric index (Mon=1, Tue=2, ..., Sun=0)
  - Compare `d.day === dayIndex` instead of `d.day === dayName`

### 3. Fix Demographics display (frontend + backend)
- **Backend** (`run-audit`): Try alternate demographic metrics — `page_fans_gender_age`, `page_fans_city`, `page_fans_country` (the `page_follows_*` variants may not be valid for all pages). If both fail, store the error reason.
- **Frontend** (`AuditReportPage.tsx`): When `demographics` is null, check `data_availability.demographicsError` and show "Demographics unavailable" with the reason, instead of an infinite loading spinner.

### 4. Remove "Why this score?" dropdown — always show details
- In `ScoreExplanations.tsx`: Remove the `Collapsible` wrapper. Render the explanation items directly below the score, always visible.

### 5. Redeploy edge function
- Deploy updated `run-audit`

## Files to modify
- `supabase/functions/run-audit/index.ts` — fix video type inference + demographics metric names
- `src/components/report/EngagementChart.tsx` — fix heatmap day matching
- `src/components/report/ScoreExplanations.tsx` — remove collapsible, always show details
- `src/pages/dashboard/AuditReportPage.tsx` — fix demographics null state to show "unavailable"
- `supabase/functions/get-audit-report/index.ts` — pass `data_availability` to frontend

