

# Fix: Facebook Post Publishing Permission Error

## Problem
Your "Hello Namaste" post failed because the Facebook Page token for OptimizeHive lacks the `pages_manage_posts` permission. The Facebook API requires both `pages_read_engagement` AND `pages_manage_posts` to publish posts to a page.

Currently, the OAuth flow only requests these scopes:
- `pages_show_list`
- `pages_read_engagement`
- `pages_read_user_content`
- `read_insights`

Missing: **`pages_manage_posts`** — without this, Facebook rejects any attempt to post.

## Fix

### 1. Add `pages_manage_posts` scope to OAuth flows

**`supabase/functions/facebook-oauth/index.ts`** (line 93-98):
Add `pages_manage_posts` to the scopes array.

**`supabase/functions/facebook-auth-login/index.ts`** (line 154-160):
Add `pages_manage_posts` to the scopes array.

Both files also store scopes in the `fb_connections` record — update those arrays too.

### 2. Update stored scopes reference

In both `save-connection` and `savePages` sections, update the `scopes` array to include `pages_manage_posts`.

### 3. Deploy both edge functions

### 4. User action required
After deployment, you will need to **reconnect your Facebook pages** so the new permission is granted. Existing tokens don't have the `pages_manage_posts` permission.

**Note:** If your Facebook App is still in Development mode, `pages_manage_posts` works only for App Admins/Testers. For production users, you'll need to submit this permission for App Review in the Facebook Developer Console.

## Files Modified

| File | Change |
|------|--------|
| `supabase/functions/facebook-oauth/index.ts` | Add `pages_manage_posts` to scopes |
| `supabase/functions/facebook-auth-login/index.ts` | Add `pages_manage_posts` to scopes |

