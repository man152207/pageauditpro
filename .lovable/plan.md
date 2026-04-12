

# Root Cause: Facebook Token is Expired/Invalid

## What I Found

The edge function logs show **every single Facebook API call fails** with:
```
OAuthException code 190: "Any of the pages_read_engagement... permission(s) 
must be granted before impersonating a user's page."
```

This means the **page access token stored in the database is invalid/expired**. Here's why:

1. The page was connected on **Apr 9** — 3 days ago
2. `token_expires_at` is **NULL** (we never track expiry)
3. During OAuth, if the long-lived token exchange fails silently, short-lived page tokens (~1-2 hours) get stored instead of permanent ones
4. The frontend **never passes `expires_in`** to `save-connection`, so expiry is never recorded

The result: the stored token expired hours after connection, and every audit since then returns empty data — 0 followers (defaults to 1000), 0 engagement, 0 posts.

## Immediate Fix: Reconnect + Token Handling

### 1. Fix token expiry tracking in `facebook-oauth` (save-connection)
- When saving a page connection, also exchange the page token for a long-lived page token using `oauth/access_token?grant_type=fb_exchange_token`
- Store the actual `expires_in` value from Facebook's response

### 2. Fix frontend to pass `expires_in` in `AuditFlow.tsx`
- When calling `save-connection`, include `expires_in` from the OAuth response

### 3. Add token validation before audit in `run-audit`
- Before making API calls, do a quick `GET /{pageId}?fields=name&access_token=...` validation
- If token is expired, return a clear error: "Your Facebook connection has expired. Please reconnect."

### 4. Add "Reconnect" button in the UI
- In the connected pages list, show a warning when token might be expired
- Add a "Reconnect" action that re-initiates OAuth to get fresh tokens

### 5. Fix the `run-audit` fallback data
- Currently when page info fails, `followers` defaults to `1000` (fake!) — should be `0` or `null`
- When ALL API calls fail, return a clear error instead of a fake report with made-up scores

## Files to Modify
- `supabase/functions/facebook-oauth/index.ts` — exchange page token for long-lived version in save-connection
- `supabase/functions/run-audit/index.ts` — add token validation, fix fake defaults
- `src/components/audit/AuditFlow.tsx` — pass expires_in, add reconnect flow
- `src/components/audit/ConnectedPagesList.tsx` — show token status warning + reconnect button

## Immediate Action Required
The user should **disconnect and reconnect** their Facebook page right now to get a fresh token. After reconnecting, re-run the audit to get real data.

