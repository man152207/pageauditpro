
# Fix the audit so the full report is honest and range-accurate

## What I verified
- The full report page currently does not render a proper Key Metrics section, even though the inline preview does.
- The backend is still using misleading fallbacks:
  - `postsCount = posts.length || 1`
  - `postsPerWeek = 3` when posts are missing
  - Growth is shown in the UI by reusing readiness
  - Readiness checklist checkmarks are inferred from score thresholds, not real page fields
- The selected duration is not fully analyzed today:
  - posts fetch stops at one page (`limit=100`) instead of paginating the full selected range
  - post-level enrichment only samples the first 25 posts
- There is also a frontend wiring bug: the report page passes `report.input_summary`, but the payload returns `input_data`.

## Goal
Make the report 100% honest to the real Facebook data:
- show current followers clearly
- count all retrievable page activity inside the selected range
- remove invented numbers
- only show scores/sections backed by real data
- if Facebook does not return something, show “Unavailable” instead of fabricating it

## Implementation plan
1. Rebuild the audit metric pipeline in `run-audit`
- paginate through all posts inside the selected `since/until` window
- compute posts analyzed, total reactions/comments/shares, engagement rate, posts/week, and totals from the full selected range
- keep follower count as a real current page metric
- remove fake defaults like `1 post` and `3 posts/week`
- distinguish:
  - no posts in selected range
  - permission/API failure
  - metric unavailable from Facebook

2. Make scoring genuine
- calculate engagement/consistency/readiness only from real fetched inputs
- exclude unavailable categories from the overall score instead of pretending data exists
- compute a real Growth score only if follower-trend data is actually available; otherwise hide Growth entirely

3. Make readiness/checklist real
- fetch actual readiness-related page fields from Facebook
- save a readiness checklist object in computed metrics
- render checklist rows from real booleans, not score thresholds

4. Add Key Metrics to the full report
- add a dedicated Key Metrics section to `AuditReportPage`
- show at minimum:
  - Followers
  - Posts analyzed
  - Engagement rate
  - Avg. engagement/post
  - Total engagements
- use `—` only when the backend truly did not return that metric

5. Fix report data wiring
- use `input_data` instead of nonexistent `input_summary`
- pass score inputs, readiness checklist, and range metadata from `get-audit-report`
- keep the inline preview and full report on the same metric mapping

6. Stop overstating data in the UI
- remove the fake Growth fallback from the hero section
- replace the fake readiness checklist logic
- update alerts/empty states so they explain exactly why something is missing
- update the date-range note so it reflects the real post-fix behavior

7. Real verification after implementation
- re-run an audit on the connected page with the chosen duration
- compare the report with the actual page for:
  - current follower count
  - total posts inside the selected range
  - engagement totals
  - overall score after fake defaults are removed
- verify that missing Facebook data shows as “Unavailable”, not as made-up values

## Technical details
Files to modify:
- `supabase/functions/run-audit/index.ts`
- `supabase/functions/get-audit-report/index.ts`
- `src/pages/dashboard/AuditReportPage.tsx`
- `src/components/report/ScoreExplanations.tsx`
- `src/components/report/HeroScoreSection.tsx`
- `src/components/audit/BasicReportPreview.tsx`
- `src/components/audit/AuditFlow.tsx`
- `src/components/audit/DateRangeSelector.tsx`

Expected result:
- Full report shows Key Metrics properly
- Overall score is recalculated from real data only
- Selected duration reflects all retrievable activity in that window
- No more fake “1 post”, fake “3 posts/week”, fake Growth, or fake readiness checklist
