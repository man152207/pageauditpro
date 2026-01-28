
## Goal (what you are seeing + why)
You configured Facebook “Valid OAuth Redirect URIs” as:

- `https://pagelyzer.io/api/auth/facebook/login/callback`

But when Facebook redirects to that URL, your app shows **404 “Oops! Page not found”**.

That happens because:
1) The React router currently has **no route** for `/api/auth/facebook/login/callback` (or `/api/auth/facebook/page/callback`), so it falls into the global `*` route → `NotFound`.
2) The existing `.htaccess` proxy rules might not run in your hosting setup (or are not being applied to the built `dist`), so the request is not forwarded to the backend callback handler.

Also, there is another hidden issue in the current backend login/page-connect functions:
- They build redirect URIs like `${url.origin}/facebook-auth-login?action=callback` and `${url.origin}/facebook-oauth?action=callback`
- This is missing `/functions/v1/...`, so even if the user reaches the backend domain, the redirect URI can be wrong.

So we need to fix both:
- Add proper “callback routes” in the frontend so `/api/auth/.../callback` is not 404.
- Ensure the backend generates the correct redirect URI and is easy to configure in Facebook settings.

---

## What you should set in Facebook Developer Console (copy/paste checklist)
### A) Facebook Login → Client OAuth Settings
Turn ON:
- Client OAuth login: ON
- Web OAuth login: ON
- Enforce HTTPS: ON
- Use Strict Mode for redirect URIs: ON

Turn OFF (recommended):
- Login with the JavaScript SDK: OFF (we are using popup + server-side token exchange, not the JS SDK)

### B) “Valid OAuth Redirect URIs” (must match EXACTLY)
Add these 2 (no trailing slash, no extra parameters):
1. `https://pagelyzer.io/api/auth/facebook/login/callback`
2. `https://pagelyzer.io/api/auth/facebook/page/callback`

Important notes (common mistakes):
- Must be exactly the same as the one used in the login flow (case-sensitive, slash-sensitive).
- After adding, click **Save changes**. The validator can still show “invalid” until saved.
- If you use `www.pagelyzer.io` anywhere, you must add that version too (Facebook treats them as different).

### C) Settings → Basic (app-level)
Make sure:
- App Domains includes: `pagelyzer.io` (and `www.pagelyzer.io` if you use it)
- Website URL includes: `https://pagelyzer.io`

(If Facebook forces “Required actions”, it often requires Privacy Policy URL / Terms URL too.)

---

## Implementation approach (what I will change in your code)
### 1) Add dedicated callback routes in the React app (fixes the 404 immediately)
Add two new routes in `src/App.tsx`:
```tsx
// These routes do NOT need to be wrapped in <AuthGuard> because they are triggered during the OAuth flow
<Route path="/api/auth/facebook/login/callback" element={<FacebookLoginCallback />} />
<Route path="/api/auth/facebook/page/callback" element={<FacebookPageCallback />} />
```

Each will be a minimal component that does this:
1. Calls the backend edge function with `?action=callback&code=...` (manually forward the query params)
2. For the **login callback**: Shows the received data in `postMessage` to `window.opener` to finalize the login (same as before)
3. For the **page callback**: Same but for page connection

This is needed because you're calling the backend from `pagelyzer.io`, but Facebook redirects back to `pagelyzer.io/api/...`, so currently there is no frontend route to handle it.

With these routes, the React router will see `/api/auth/facebook/login/callback` as a valid route (no 404), and it can call your backend logic.

### 2) Update backend callback logic (ensures it uses correct redirect_uri)
In both edge functions:
- `supabase/functions/facebook-auth-login/index.ts`
- `supabase/functions/facebook-oauth/index.ts`

Instead of:
```ts
const redirectUri = `${url.origin}/facebook-auth-login?action=callback`;
```

Use:
```ts
// Fixed production redirect URIs (must match Facebook console exactly)
const redirectUri = "https://pagelyzer.io/api/auth/facebook/login/callback"; // for auth-login
const redirectUri = "https://pagelyzer.io/api/auth/facebook/page/callback"; // for oauth
```

This ensures:
- The URI passed to Facebook matches exactly what you registered in "Valid OAuth Redirect URIs"
- No dynamic Supabase URLs
- No `.htaccess` proxy magic needed

The frontend callback route you created in step 1 will then call the backend function with the `code` param.

### 3) Create new frontend callback handler components
Create two new files:
- `src/pages/callbacks/FacebookLoginCallback.tsx`
- `src/pages/callbacks/FacebookPageCallback.tsx`

These components will:
1. Read `code` and `error` from URL query params
2. Call the respective edge function with `action=callback` + `code`
3. Show loading state
4. On success:
   - For login: Use `postMessage` to send data to `window.opener`, then close the window (same as current flow)
   - For page connect: Same pattern
5. On error: Show error message (or `postMessage` error + close)

This is essentially what your edge function was doing in the HTML `<script>` block, but now it's a proper React component route.

### 4) Update `.htaccess` as backup (optional, for production server compatibility)
Keep the `.htaccess` proxy rules for edge cases where the React app is not deployed yet or a direct backend call is needed, but the primary solution is step 1 (React router callback routes).

If you prefer to rely entirely on `.htaccess` (skip step 1), that is also fine, but you must ensure your web server:
- Supports `mod_rewrite` and `mod_proxy`
- Has those modules enabled
- Copies `.htaccess` to the `dist` folder during build

For Lovable Cloud, the best solution is step 1 (React router) because it is client-side and works everywhere.

---

## Flow diagram (end-to-end with fixes)
```text
┌─────────────────────────────────────────────────────────────────┐
│ User clicks "Continue with Facebook"                            │
└────┬────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Frontend calls: GET /functions/v1/facebook-auth-login            │
│                    ?action=get-login-url                          │
└────┬────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Edge function returns:                                           │
│ {                                                                │
│   "authUrl": "https://facebook.com/v19.0/dialog/oauth?           │
│               client_id=...&                                     │
│               redirect_uri=https://pagelyzer.io/api/auth/        │
│                           facebook/login/callback                │
│               &scope=email,public_profile"                        │
│ }                                                                │
└────┬────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Frontend opens popup:                                            │
│ window.open(authUrl, "facebook-login", "width=600,height=700")  │
└────┬────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│ User logs in to Facebook                                         │
│ Facebook redirects to:                                           │
│ https://pagelyzer.io/api/auth/facebook/login/callback?code=ABC  │
└────┬────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│ React router matches route:                                      │
│ <Route path="/api/auth/facebook/login/callback"                 │
│        element={<FacebookLoginCallback />} />                    │
│                                                                  │
│ Component reads code from URL and calls:                         │
│ POST /functions/v1/facebook-auth-login?action=callback&code=ABC │
└────┬────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Edge function:                                                   │
│ 1) Exchanges code for FB access token                           │
│ 2) Gets user info from Facebook Graph API                       │
│ 3) Creates/updates user in Supabase auth                         │
│ 4) Returns { success: true, userData: {...} }                   │
└────┬────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Frontend callback component sends postMessage:                   │
│ window.opener.postMessage({                                      │
│   type: "fb-login-success",                                      │
│   userData: {...}                                                │
│ }, "*");                                                         │
│ window.close();                                                  │
└────┬────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Main window (AuthPage.tsx) receives postMessage                 │
│ → Finalizes login via magic link token                           │
│ → Shows toast: "Welcome!"                                        │
│ → Redirects to /dashboard                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Files I will modify
| File | Change |
|------|--------|
| `src/App.tsx` | Add 2 callback routes: `/api/auth/facebook/login/callback` and `/api/auth/facebook/page/callback` |
| `src/pages/callbacks/FacebookLoginCallback.tsx` | **NEW**: Handle login callback (read code, call edge function, postMessage) |
| `src/pages/callbacks/FacebookPageCallback.tsx` | **NEW**: Handle page connect callback (same pattern) |
| `supabase/functions/facebook-auth-login/index.ts` | Change `redirectUri` from `${url.origin}/facebook-auth-login?action=callback` to `https://pagelyzer.io/api/auth/facebook/login/callback` |
| `supabase/functions/facebook-oauth/index.ts` | Change `redirectUri` from `${url.origin}/facebook-oauth?action=callback` to `https://pagelyzer.io/api/auth/facebook/page/callback` |

---

## What you need to do (manual steps)
### A) Configure Facebook Developer Console (required)
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Select your app
3. **Settings → Basic**:
   - App Domains: `pagelyzer.io`
   - Website URL: `https://pagelyzer.io`
4. **Facebook Login → Settings**:
   - Valid OAuth Redirect URIs:
     - Add: `https://pagelyzer.io/api/auth/facebook/login/callback`
     - Add: `https://pagelyzer.io/api/auth/facebook/page/callback`
   - Client OAuth login: ON
   - Web OAuth login: ON
   - Enforce HTTPS: ON
   - Use Strict Mode: ON
   - Login with JS SDK: OFF
5. Click **Save changes**

### B) Test the login flow
After deployment:
1. Go to `/auth` page
2. Click "Continue with Facebook"
3. Verify:
   - Popup opens to Facebook
   - After login, redirects to `https://pagelyzer.io/api/auth/facebook/login/callback?code=...`
   - No 404 error
   - Popup closes automatically
   - You are logged in

If you see "invalid redirect URI" in Facebook popup:
- Check if you saved changes in Facebook console
- Check if you used the exact same URL (case-sensitive, no trailing slash)
- Check browser console for redirect_uri mismatch error

---

## Common pitfalls + fixes
### 1) "invalid redirect URI" in Facebook popup
**Cause**: The redirect URI you added in Facebook console does NOT match the one sent by the backend.

**Fix**:
- Check the actual redirect URI in the edge function logs (console logs in edge function will show the exact URL it's using)
- Compare it character-by-character with the one in Facebook console
- Make sure you clicked "Save changes" in Facebook console

### 2) 404 even after adding the routes
**Cause**: Your React app is not deployed yet (you're testing on preview domain), or the build process did not include the new routes.

**Fix**:
- Make sure you're testing on the **published domain** (`https://pageauditpro.lovable.app` or `https://pagelyzer.io`)
- If using preview domain, the `.htaccess` proxy rules might not apply
- Re-deploy the app after making changes

### 3) "Session expired" 401 error after login
**Cause**: Cross-domain token storage issue (preview domain vs published domain).

**Fix**: Already implemented in previous changes (using `getClaims()` instead of `getUser()`).

### 4) Facebook says "app not configured"
**Cause**: Facebook App ID / App Secret are not in the `settings` table.

**Fix**: Go to Super Admin → Settings → Integrations → Facebook API and enter your credentials.

---

## Summary of what you need to check in Facebook console
```text
Settings → Basic:
  App Domains: pagelyzer.io
  Website URL: https://pagelyzer.io

Facebook Login → Settings:
  Client OAuth login: ✓ ON
  Web OAuth login: ✓ ON
  Enforce HTTPS: ✓ ON
  Use Strict Mode: ✓ ON
  Login with JavaScript SDK: ✗ OFF

  Valid OAuth Redirect URIs:
    ✓ https://pagelyzer.io/api/auth/facebook/login/callback
    ✓ https://pagelyzer.io/api/auth/facebook/page/callback

Allowed Domains for JS SDK (if you later enable JS SDK):
    pagelyzer.io
    pageauditpro.lovable.app
```

After saving these settings, the login flow should work without 404 errors.

---

## Alternative approach (if you prefer .htaccess proxy only)
If you want to rely on `.htaccess` proxy rules instead of React routes:

**Pros**:
- No frontend changes needed
- Works even if React app has a bug

**Cons**:
- Depends on web server config (mod_rewrite, mod_proxy)
- Harder to debug (no React component to log issues)
- Might not work on all hosting platforms

**If you choose this approach**, you must:
1. Ensure `.htaccess` is copied to `dist/` during build
2. Verify your web server supports `[P]` (proxy) flag
3. Update backend to use the correct Supabase function URLs (not just `/facebook-auth-login?action=callback`)

For **Lovable Cloud** (and most modern SPA hosting), the React router approach (step 1 of this plan) is more reliable.
