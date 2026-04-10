

# Fix Admin Content Planner Access + Persist User Selection

## Problems
1. **Admin can't see other users' posts**: `scheduled_posts` table has no RLS policy for admin SELECT — only `user_id = auth.uid()` and super_admin exist
2. **Admin can't see other users' FB connections**: `fb_connections` also lacks admin SELECT policy
3. **Selected user resets on reload**: `selectedUserId` is plain `useState`, loses value on navigation/refresh

## Changes

### 1. Database Migration — Add Admin RLS Policies
Add SELECT policies for admins on `scheduled_posts` and `fb_connections` (scoped to same organization):

```sql
-- Admin can view org users' scheduled posts
CREATE POLICY "Admins can view org scheduled posts"
ON public.scheduled_posts FOR SELECT TO authenticated
USING (
  is_admin_or_above(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM profiles p1, profiles p2
    WHERE p1.user_id = auth.uid()
    AND p2.user_id = scheduled_posts.user_id
    AND p1.organization_id = p2.organization_id
    AND p1.organization_id IS NOT NULL
  )
);

-- Admin can view org users' fb connections
CREATE POLICY "Admins can view org fb connections"
ON public.fb_connections FOR SELECT TO authenticated
USING (
  is_admin_or_above(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM profiles p1, profiles p2
    WHERE p1.user_id = auth.uid()
    AND p2.user_id = fb_connections.user_id
    AND p1.organization_id = p2.organization_id
    AND p1.organization_id IS NOT NULL
  )
);
```

### 2. Persist Selected User — localStorage
**File: `src/pages/dashboard/ContentPlannerPage.tsx`**
- Initialize `selectedUserId` from `localStorage.getItem('planner_selected_user')`
- On change, save to `localStorage.setItem('planner_selected_user', id)`
- On "My Posts" selection, remove from localStorage

### 3. Filter Users by Organization (Admin)
**File: `src/pages/dashboard/ContentPlannerPage.tsx`**
- When fetching profiles for the user selector, filter by the admin's own `organization_id` so they only see their org's users (not all users — that's super_admin territory)

## Files Modified
1. **New migration** — RLS policies for admin access on `scheduled_posts` and `fb_connections`
2. `src/pages/dashboard/ContentPlannerPage.tsx` — localStorage persistence + org-scoped user fetch

