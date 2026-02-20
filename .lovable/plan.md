
# Demo Mode Cleanup + Real Data Activation

## Background
All Meta permissions (`pages_read_user_content`, `pages_show_list`, `read_insights`, `pages_read_engagement`) are now **approved**. The demo mode toggle and sample data were only needed for the Meta App Review screencast. Now it's time to clean up and let real data flow through.

## What Will Change

### 1. Remove Demo Mode from Audit Report Page
**File: `src/pages/dashboard/AuditReportPage.tsx`**
- Remove `demoMode` state and the toggle UI (the dashed border section with Switch)
- Remove the "Demo Mode Active" warning banner
- Remove all `demoMode` conditional captions/annotations in Performance Trends, Posts Analysis, and Creative Preview sections
- Remove all `effective*` variables (effectivePosts, effectivePostTypeData, etc.) -- use real data directly
- Remove imports of `generateDemoPosts`, `generateDemoPostTypeStats`, `generateDemoHeatmapData`, `generateDemoCreatives`
- Remove imports of `Switch` and `Label` (if unused elsewhere)

### 2. Delete Demo Data File
**File: `src/lib/demoData.ts`** -- Delete entirely. No longer needed.

### 3. Simplify Data Flow in Report Page
After removing demo mode, the data variables become simpler:
- `postsForDisplay` used directly instead of `effectivePosts`
- `hasRealPostTypeData` / `postTypeData` used directly instead of `effectiveHasPostTypeData` / `effectivePostTypeData`
- `hasRealHeatmapData` / `heatmapData` used directly instead of `effectiveHasHeatmapData` / `effectiveHeatmapData`
- `creatives` used directly instead of `effectiveCreatives`

### 4. Update "Post Analysis Unavailable" Alert
**File: `src/pages/dashboard/AuditReportPage.tsx`** (lines 432-442)
- The alert that says "Post-level analysis requires `pages_read_user_content` permission" is now outdated since the permission is approved
- Update the message to say something like: "No posts found in the selected date range. Try a longer date range or check that the page has published content."

## What Stays the Same
- The `run-audit` edge function already fetches real posts from `/{page_id}/posts` -- no changes needed
- `PostsTabView`, `PostTypeChart`, `BestTimeHeatmap`, `CreativePreview` components work with real data already -- no changes needed
- All other report sections (Executive Summary, Score Breakdown, AI Insights, Demographics) are unchanged

## Summary of Changes
| Action | File |
|--------|------|
| Clean up demo mode code | `src/pages/dashboard/AuditReportPage.tsx` |
| Delete file | `src/lib/demoData.ts` |

No backend changes. No database changes. Purely frontend cleanup.
