

# Content Planner: Admin Features + Edge Function Error Fix

## What We're Building

1. **Admin/Super Admin ले users को connected pages को लागि content plan गर्न सक्ने** — Admin ले सबै users को FB connections देख्न सक्ने, user select गर्ने, र तिनीहरूको page मा post schedule गर्ने
2. **Calendar मा posts popup भएर देखिने** — Post card hover/click मा detailed popup preview
3. **Edge function error fix** — `supabase.functions.invoke()` ले non-2xx status मा generic error throw गर्छ; response body बाट actual error message extract गर्ने

---

## Changes

### 1. Admin User-Page Selector (ContentPlannerPage + PostComposer)

**`src/pages/dashboard/ContentPlannerPage.tsx`**:
- Admin/Super Admin हो भने सबै users को FB connections fetch गर्ने (not just own)
- User selector dropdown थप्ने — admin ले user choose गर्छ, त्यसको pages देखिन्छ
- Selected user को `user_id` pass गर्ने PostComposer मा
- Non-admin users ले आफ्नै connections मात्र देख्ने (existing behavior)

**`src/components/planner/PostComposer.tsx`**:
- Optional `targetUserId` prop accept गर्ने — admin ले अर्को user को behalf मा post बनाउँदा
- Connection dropdown मा selected user को pages देखाउने

**`src/hooks/useScheduledPosts.ts`**:
- Admin/Super Admin हो भने optional `targetUserId` filter support गर्ने
- Admin ले सबै posts वा specific user को posts हेर्न सक्ने

### 2. Edge Function: Admin Support

**`supabase/functions/schedule-post/index.ts`**:
- Admin/Super Admin ले `target_user_id` field send गर्न सक्ने
- Edge function मा role check गरेर admin भए `target_user_id` को behalf मा post create/update गर्ने
- Non-admin ले `target_user_id` send गर्दा reject गर्ने

### 3. Calendar Post Popup Preview

**`src/components/planner/CalendarGrid.tsx`**:
- Post card click मा detailed popup (Popover/HoverCard) देखाउने
- Post content, status, scheduled time, page name, images preview
- Edit र Delete buttons popup भित्र

### 4. Edge Function Error Fix

**`src/hooks/useScheduledPosts.ts`**:
- `supabase.functions.invoke()` returns `{ data, error }` — when edge function returns non-2xx, `error` is generic but `data` contains the actual error body
- Fix: Check `data?.error` first before checking `error`, extract meaningful message
- Pattern: 
```typescript
const { data, error } = await supabase.functions.invoke("schedule-post", { body });
if (data?.error) throw new Error(data.error);
if (error) throw error;
```
This is already done correctly in the hook. The real issue is likely that the edge function isn't deployed yet. We need to deploy it.

---

## Files to Modify/Create

| File | Change |
|------|--------|
| `src/pages/dashboard/ContentPlannerPage.tsx` | Add user selector for admins, fetch all connections |
| `src/components/planner/PostComposer.tsx` | Accept `targetUserId` prop |
| `src/hooks/useScheduledPosts.ts` | Add admin filtering support |
| `src/components/planner/CalendarGrid.tsx` | Add post detail popup on click |
| `supabase/functions/schedule-post/index.ts` | Support `target_user_id` for admins |
| Deploy edge function | Fix "failed to send request" error |

