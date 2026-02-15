

# Add Demo Data Mode for Meta App Review Screencast

## Problem
Meta keeps rejecting `pages_read_user_content` because the screencast shows **empty sections** for Posts Analysis, Post Type Performance, and Best Time to Post. The reviewer cannot see the "end-to-end experience of the use case" when all post-related sections are blank.

This is a chicken-and-egg problem: you need the permission to get data, but you need to show data usage to get the permission approved.

## Solution
Add a **demo data mode** that populates these sections with realistic sample data so the screencast clearly shows how `pages_read_user_content` data powers each feature. This is a standard practice for Meta App Review.

## What Will Change

### 1. Add Demo Data Generator
Create a new file `src/lib/demoData.ts` with realistic sample post data including:
- 10 sample posts with varied types (photo, video, link, status)
- Realistic engagement numbers (likes, comments, shares, reach)
- Post type performance breakdown (photo vs video vs link vs status)
- Best time to post heatmap data
- Sample dates and messages

### 2. Add Demo Mode Toggle to Audit Report Page
In `src/pages/dashboard/AuditReportPage.tsx`:
- Add a small "Demo Mode" toggle (only visible to the page owner/admin) at the top of the report
- When enabled, replace empty post-related sections with demo data
- Add a subtle banner: "Demo Mode - Showing sample data for demonstration purposes"

### 3. Populate These Sections with Demo Data
When demo mode is ON:
- **Posts Analysis** (PostsTabView): Shows 5 top posts and 5 underperforming posts with thumbnails, engagement metrics, and "Why it worked/failed" tooltips
- **Post Type Performance** (PostTypeChart): Shows bar chart comparing photo, video, link, status engagement
- **Best Time to Post** (BestTimeHeatmap): Shows heatmap with posting time recommendations
- **Creative Preview**: Shows sample thumbnails with engagement overlays

### 4. Add Captions/Tooltips for Screencast
Add visible tooltip-style annotations on the post sections explaining:
- "This section uses pages_read_user_content to fetch published posts"
- "Post engagement data helps identify top-performing content types"
- "Timing analysis helps optimize posting schedule"

These annotations only show in demo mode.

## Technical Details

### New File: `src/lib/demoData.ts`
Contains:
- `generateDemoPosts()` - Returns 10 realistic sample posts
- `generateDemoPostTypeStats()` - Returns post type performance data
- `generateDemoHeatmapData()` - Returns best time to post heatmap
- All data is clearly labeled as sample/demo

### Modified File: `src/pages/dashboard/AuditReportPage.tsx`
- Add `demoMode` state with toggle button
- When `demoMode` is true AND real data is empty, use demo data instead
- Add a "Demo Mode" banner at the top
- Add permission explanation captions on post-related sections

### No Backend Changes
This is purely a frontend feature for the screencast. No edge functions or database changes needed.

## Screencast Strategy After Implementation
With demo mode ON, your screencast will show:
1. Login with Facebook (already working)
2. Permission grant dialog (already shown)
3. Page connection (already working)
4. Run audit (already working)
5. **Posts Analysis section - POPULATED with data** and caption explaining it uses `pages_read_user_content`
6. **Post Type Performance - POPULATED** showing chart with caption
7. **Best Time to Post - POPULATED** showing heatmap with caption
8. Recommendations based on post data

This directly addresses Meta's requirement: "the end-to-end experience of the use case for the requested permission/feature"
