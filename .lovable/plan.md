
# Facebook Page Connect "Connecting..." Issue Fix Plan

## समस्याको सारांश

"Run Page Audit" मा "Connect with Facebook" click गर्दा Facebook OAuth successful हुन्छ, तर app मा "Connecting..." मा अड्किन्छ। यो event name mismatch को कारण हो।

---

## Root Cause Analysis

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW DIAGRAM                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  AuditFlow.tsx                        FacebookPageCallback.tsx               │
│  ─────────────                        ────────────────────────               │
│                                                                               │
│  Listens for:                         Sends:                                 │
│  'fb-oauth-success' ─────────X─────── 'fb-page-success'  ← MISMATCH!        │
│  'fb-oauth-error'   ─────────X─────── 'fb-page-error'    ← MISMATCH!        │
│                                                                               │
│  Result: Event never received, "Connecting..." forever                       │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Solution

### File: `src/components/audit/AuditFlow.tsx`

**Location:** Lines 54-64 (message event listener)

**Change:** Add fallback to listen for both event name formats (like `FacebookConnect.tsx` already does)

**Before:**
```typescript
if (event.data.type === 'fb-oauth-success') {
  setConnecting(false);
  handleOAuthSuccess(event.data.pages);
} else if (event.data.type === 'fb-oauth-error') {
  setConnecting(false);
  toast({...});
}
```

**After:**
```typescript
// Accept both legacy + current callback event names
if (event.data.type === 'fb-oauth-success' || event.data.type === 'fb-page-success') {
  setConnecting(false);
  handleOAuthSuccess(event.data.pages);
} else if (event.data.type === 'fb-oauth-error' || event.data.type === 'fb-page-error') {
  setConnecting(false);
  toast({...});
}
```

---

## Technical Details

| File | Line | Current | Fix |
|------|------|---------|-----|
| `AuditFlow.tsx` | 54 | `'fb-oauth-success'` | `'fb-oauth-success' \|\| 'fb-page-success'` |
| `AuditFlow.tsx` | 57 | `'fb-oauth-error'` | `'fb-oauth-error' \|\| 'fb-page-error'` |

---

## Why `FacebookConnect.tsx` Works But `AuditFlow.tsx` Doesn't

`FacebookConnect.tsx` (line 59) already has the fix:
```typescript
if (event.data.type === 'fb-oauth-success' || event.data.type === 'fb-page-success') {
```

But `AuditFlow.tsx` was not updated with this same pattern.

---

## Implementation Steps

1. **Update `AuditFlow.tsx`**: Add OR conditions for both event name formats
2. **Deploy**: Changes will auto-deploy
3. **Test**: Go to Run Page Audit → Connect with Facebook → Verify pages load

---

## Expected Result After Fix

1. Click "Connect with Facebook" in Run Page Audit
2. Complete Facebook OAuth flow
3. Popup closes and sends `fb-page-success` event
4. `AuditFlow.tsx` now catches this event
5. Pages dialog shows OR auto-selects page
6. Audit runs successfully

---

## Optional Enhancement (Future)

Standardize all event names to one format across the entire codebase to prevent future confusion:
- Choose either `fb-oauth-*` OR `fb-page-*` as the standard
- Update all senders and listeners to use the same format
