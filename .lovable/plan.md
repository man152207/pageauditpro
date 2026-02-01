

# Free Audit Grants Issue - Root Cause & Fix Plan

## समस्याको मूल कारण

**Database Grant Verification:**
```sql
-- Grant exists correctly:
user_id: 2e2034e4-6db0-4980-ae29-b85fa1465385
grant_month: 2026-02-01
email: binnymgr@gmail.com
```

**Problem Flow:**

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CURRENT BROKEN FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Super Admin grants free audit for February 2026 ✅                      │
│     └─ Saved to free_audit_grants table                                     │
│                                                                              │
│  2. User runs audit via run-audit function ✅                               │
│     └─ Checks free_audit_grants → Allows audit                              │
│     └─ BUT: Sets is_pro_unlocked = isPro (false) ❌                         │
│                                                                              │
│  3. User views report via get-audit-report function ❌                      │
│     └─ Checks ONLY subscription + is_pro_unlocked                           │
│     └─ Does NOT check free_audit_grants table!                              │
│     └─ Returns hasProAccess = false                                         │
│                                                                              │
│  4. Frontend shows "Upgrade to Pro" ❌                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Two Issues to Fix

### Issue 1: `run-audit` Function - Line 349

```typescript
// CURRENT (WRONG):
is_pro_unlocked: isPro,  // Only true if user has Pro subscription

// SHOULD BE:
is_pro_unlocked: isPro || hasFreeAuditGrant,  // True if Pro OR has grant
```

**Why this matters:** When audit is created, it should mark `is_pro_unlocked = true` if user has a free grant. This way, even when viewing old audits, they'll have Pro access.

### Issue 2: `get-audit-report` Function - Missing Grant Check

The function only checks:
1. Active subscription (line 78-83)
2. `audit.is_pro_unlocked` flag (line 89)

It does NOT check `free_audit_grants` table!

**Add this check after line 86:**

```typescript
// Check for free audit grant for this month
const startOfMonth = new Date();
startOfMonth.setDate(1);
startOfMonth.setHours(0, 0, 0, 0);
const monthStr = startOfMonth.toISOString().split('T')[0];

const { data: freeGrant } = await supabase
  .from("free_audit_grants")
  .select("id")
  .eq("user_id", userId)
  .eq("grant_month", monthStr)
  .maybeSingle();

const hasFreeAuditGrant = !!freeGrant;
logStep("Free audit grant check", { hasFreeAuditGrant, month: monthStr });

// Update hasProAccess to include free grant
const hasProAccess = isPro || audit.is_pro_unlocked || hasFreeAuditGrant;
```

---

## Technical Fix Summary

### File 1: `supabase/functions/run-audit/index.ts`

**Line 349** - Update `is_pro_unlocked` value:

```typescript
// Before
is_pro_unlocked: isPro,

// After
is_pro_unlocked: isPro || hasFreeAuditGrant,
```

**Line 364-384** - Store metrics for users with free grants too:

```typescript
// Before
if (isPro) {

// After
if (isPro || hasFreeAuditGrant) {
```

---

### File 2: `supabase/functions/get-audit-report/index.ts`

**After line 86** - Add free grant check:

```typescript
// Check for free audit grant for this month
const startOfMonth = new Date();
startOfMonth.setDate(1);
startOfMonth.setHours(0, 0, 0, 0);
const monthStr = startOfMonth.toISOString().split('T')[0];

const { data: freeGrant } = await supabase
  .from("free_audit_grants")
  .select("id")
  .eq("user_id", userId)
  .eq("grant_month", monthStr)
  .maybeSingle();

const hasFreeAuditGrant = !!freeGrant;
logStep("Free audit grant check", { hasFreeAuditGrant, month: monthStr });
```

**Line 89** - Update hasProAccess:

```typescript
// Before
const hasProAccess = isPro || audit.is_pro_unlocked;

// After
const hasProAccess = isPro || audit.is_pro_unlocked || hasFreeAuditGrant;
```

---

## Data Fix for Existing Audit

The existing audit for `binnymgr@gmail.com` was created with `is_pro_unlocked: false` because the fix wasn't in place. Two options:

**Option A (Recommended):** After code fix, the `get-audit-report` function will check `free_audit_grants` directly, so old audits will work.

**Option B (Optional):** Update the existing audit record:

```sql
UPDATE audits 
SET is_pro_unlocked = true 
WHERE user_id = '2e2034e4-6db0-4980-ae29-b85fa1465385' 
AND is_pro_unlocked = false;
```

---

## Expected Result After Fix

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FIXED FLOW                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Super Admin grants free audit for February 2026 ✅                      │
│                                                                              │
│  2. User runs NEW audit ✅                                                  │
│     └─ is_pro_unlocked = true (because hasFreeAuditGrant = true)           │
│     └─ Detailed metrics stored                                              │
│                                                                              │
│  3. User views report ✅                                                    │
│     └─ get-audit-report checks free_audit_grants                           │
│     └─ hasProAccess = true                                                  │
│     └─ Returns full Pro data                                                │
│                                                                              │
│  4. Frontend shows full report! ✅                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/run-audit/index.ts` | Set `is_pro_unlocked` based on grant, store metrics for grant users |
| `supabase/functions/get-audit-report/index.ts` | Add `free_audit_grants` check to determine Pro access |

---

## Testing Steps

1. Deploy updated edge functions
2. Have `binnymgr@gmail.com` run a NEW audit
3. View the report - should show full Pro access without "Upgrade" buttons
4. OR: Simply view the existing report - the grant check in `get-audit-report` will now give Pro access

