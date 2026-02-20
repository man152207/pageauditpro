

# Fix: Posts Not Loading in Audit Reports

## Root Cause
The edge function logs reveal the exact error:
```
(#12) deprecate_post_aggregated_fields_for_attachement is deprecated for versions v3.3 and higher
```

The `attachments{media_type,media,url,subattachments}` field requested in the Facebook Graph API posts call is **deprecated in v21.0**. This causes the **entire posts request to fail**, returning 0 posts -- even though the page has 30+ published posts.

## Additional Issue Found
The `bestTimeToPost` heatmap data is **never computed** in the `run-audit` function. Even after fixing posts, the "Best Time to Post" section will remain empty.

---

## Changes Required

### 1. Fix Posts API Call (Critical)
**File: `supabase/functions/run-audit/index.ts` (lines 336-341)**

Remove the deprecated `attachments{media_type,media,url,subattachments}` field from the posts API request.

Before:
```
fields=id,message,created_time,shares,likes.summary(true),comments.summary(true),type,
permalink_url,full_picture,attachments{media_type,media,url,subattachments}&
```

After:
```
fields=id,message,created_time,shares,likes.summary(true),comments.summary(true),type,
permalink_url,full_picture&
```

### 2. Fix media_type Fallback (line 608)
Since `attachments` is removed, update the `media_type` extraction to only use `p.type`:

Before: `media_type: p.attachments?.data?.[0]?.media_type || p.type`
After: `media_type: p.type || 'status'`

### 3. Add Best Time to Post Heatmap Computation
**File: `supabase/functions/run-audit/index.ts`** (after post type analysis, around line 645)

Add logic to analyze post timestamps and engagement to generate heatmap data:
- For each post, extract the day of week (0-6) and hour (0-23)
- Aggregate engagement by day+hour slots
- Output as array of `{ day, hour, value }` objects
- Store in `computed_metrics.bestTimeToPost`

### 4. Store bestTimeToPost in audit_metrics
**File: `supabase/functions/run-audit/index.ts` (line 663)**

Add `bestTimeToPost` to the `computed_metrics` object stored in the database.

---

## Summary of Changes

| Action | File | What |
|--------|------|------|
| Fix deprecated field | `supabase/functions/run-audit/index.ts` | Remove `attachments` from posts API call |
| Fix media_type fallback | `supabase/functions/run-audit/index.ts` | Use `p.type` instead of `p.attachments` |
| Add heatmap computation | `supabase/functions/run-audit/index.ts` | Generate `bestTimeToPost` from post timestamps |
| Store heatmap data | `supabase/functions/run-audit/index.ts` | Include in `computed_metrics` |

No frontend changes needed -- all components already handle real data correctly. After deploying the fix, running a new audit will populate Posts Analysis, Post Type Performance, and Best Time to Post with real data.

