

# Plan: Super Admin Pro Access + Content Planner Fixes + Image Upload

## Issues Identified

1. **Super Admin has no Pro access** — `isPro` in AuthContext only checks subscriptions/free grants, not roles
2. **Content Planner slow** — every action (list, create, update, delete) calls an edge function instead of direct DB queries; the edge function boots ~25ms but network round-trip adds latency
3. **No image upload in Post Composer** — the composer has no image picker/upload UI
4. **PostComposer state not reset** — `useState` initializers only run on mount; reopening with different post/date keeps stale state
5. **Console warning** — missing `aria-describedby` on DialogContent in PostComposer

---

## Changes

### 1. Super Admin = Pro everywhere (frontend + backend)

**`src/contexts/AuthContext.tsx`** (line 344):
```typescript
const isPro = isSuperAdmin 
  || (subscription?.subscribed === true && subscription?.plan?.billing_type !== 'free') 
  || subscription?.hasFreeAuditGrant === true;
```

**`supabase/functions/schedule-post/index.ts`** — add super_admin role check before usage limit:
```typescript
// After getting user, check if super_admin
const { data: roleData } = await supabase
  .from("user_roles")
  .select("role")
  .eq("user_id", user.id)
  .eq("role", "super_admin")
  .maybeSingle();

const isSuperAdmin = !!roleData;
const isPro = isSuperAdmin || !!sub?.plans;
```

**`supabase/functions/check-subscription/index.ts`** — same pattern: check `user_roles` for super_admin, treat as Pro.

### 2. Speed up Content Planner — use direct DB queries for list

**`src/hooks/useScheduledPosts.ts`** — replace the "list" action edge function call with a direct Supabase query:
```typescript
queryFn: async () => {
  const { data, error } = await supabase
    .from("scheduled_posts")
    .select("*, fb_connections(page_name)")
    .eq("user_id", user!.id)
    .order("scheduled_at", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data || []) as ScheduledPost[];
},
```

This eliminates the edge function cold-start and auth overhead for reads. Create/update/delete still go through the edge function for validation.

### 3. Add image upload to Post Composer

**Create Supabase Storage bucket** — migration to create `post-media` bucket with RLS.

**`src/components/planner/PostComposer.tsx`**:
- Add image upload section with file input + preview thumbnails
- Upload files to `post-media/{user_id}/{filename}` bucket
- Store public URLs in `media_urls` array
- Show image previews with remove buttons
- Pass `media_urls` to the submit handler

### 4. Fix PostComposer stale state

Reset form state when `open` changes or `editPost` changes using `useEffect`:
```typescript
useEffect(() => {
  if (open) {
    setContent(editPost?.content || "");
    setConnectionId(editPost?.fb_connection_id || "");
    setScheduledDate(/* compute from editPost or initialDate */);
    setMediaUrls(editPost?.media_urls || []);
  }
}, [open, editPost?.id]);
```

### 5. Fix console warning

Add `DialogDescription` to PostComposer's DialogContent.

---

## Files Modified

| File | Change |
|------|--------|
| `src/contexts/AuthContext.tsx` | Add `isSuperAdmin` to `isPro` check |
| `supabase/functions/check-subscription/index.ts` | Add super_admin role bypass |
| `supabase/functions/schedule-post/index.ts` | Add super_admin role bypass for limits |
| `src/hooks/useScheduledPosts.ts` | Direct DB query for listing posts |
| `src/components/planner/PostComposer.tsx` | Image upload UI, state reset fix, DialogDescription |
| New migration | Create `post-media` storage bucket |

