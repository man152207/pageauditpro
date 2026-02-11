

# Fix Facebook Data Fetching - Root Cause & Solution

## Problem Identified

### Root Cause 1: Wrong Date Format for Facebook API (CRITICAL)
The `run-audit` edge function sends ISO timestamp strings (e.g., `2026-01-12T19:52:47.210Z`) as `since`/`until` parameters to the Facebook Graph API. However, **Facebook requires Unix timestamps (seconds since epoch)** for these parameters. Facebook silently returns empty arrays instead of throwing an error, which is why all insights, posts, and demographics come back empty.

This affects ALL data: insights, posts, demographics, and trend data.

### Root Cause 2: `pages_read_user_content` Not Approved
Your Meta App Review shows this permission was rejected twice. This permission is needed for the `/{page_id}/posts` endpoint. Even after fixing the date format, posts will remain empty until Meta approves this permission. However, **insights and demographics should work** once the date format is fixed, since `read_insights` and `pages_read_engagement` are already approved.

### Root Cause 3: No Error Logging from Facebook
The code checks `!insightsData.error` but never logs what the actual error message is, making debugging impossible.

## Solution

### Step 1: Fix Date Format in `run-audit` Edge Function

**File:** `supabase/functions/run-audit/index.ts`

Changes:
- Convert ISO date strings to Unix timestamps (seconds) before passing to Facebook API
- Add a helper function `toUnixTimestamp()` that handles both ISO strings and date-only strings
- Apply conversion to all Facebook API calls (insights, posts, demographics)

```text
Before: since=2026-01-12T19:52:47.210Z
After:  since=1768266767
```

### Step 2: Log Actual Facebook API Error Responses

**File:** `supabase/functions/run-audit/index.ts`

Changes:
- Log the full Facebook API response when errors occur (error code, message, type)
- Store error details in `data_availability` object so the frontend can show specific reasons
- This will immediately help diagnose any remaining issues

Example enhanced logging:
```
[RUN-AUDIT] Insights API error - {"code":190,"type":"OAuthException","message":"..."}
```

### Step 3: Handle `pages_read_user_content` Gracefully

**File:** `supabase/functions/run-audit/index.ts`

Changes:
- When the posts API returns a permission error (code 10 or 200), store a specific reason like `"permission_not_granted"` in `data_availability`
- The existing frontend alert already shows permission-related messaging, so this will make it more specific

### Step 4: Fix `getDateRangeFromPreset` to Return Unix Timestamps

**File:** `supabase/functions/run-audit/index.ts`

Changes:
- Update the preset converter to also return Unix timestamps
- Ensure both custom ranges and presets produce the same format

## Technical Details

### Date Conversion Helper
```typescript
function toUnixTimestamp(dateStr: string): number {
  return Math.floor(new Date(dateStr).getTime() / 1000);
}
```

### Files Modified
1. `supabase/functions/run-audit/index.ts` - Fix date format, add error logging, handle permission errors

### Expected Results After Fix
- **Insights**: Should populate (read_insights is approved)
- **Demographics**: Should populate (read_insights covers this)  
- **Trend charts**: Should show real data (page_impressions, page_engaged_users)
- **Posts**: Will remain empty until `pages_read_user_content` is approved by Meta
- **Post-level analysis**: Same as above

### About `pages_read_user_content`
This permission was rejected by Meta twice. To get it approved:
1. Provide a detailed use case explaining why your app needs to read page posts
2. Include a screencast showing how the data is used in Pagelyzer
3. Ensure your Privacy Policy and Terms of Service URLs are accessible
4. Re-submit via Meta App Review

Without this permission, the "Posts Analysis", "Post Type Performance", and "Best Time to Post" sections will show empty states - but insights-based sections (Engagement Over Time, Health Summary, Demographics) should work correctly after the date fix.
