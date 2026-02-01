

# Free Audit Grants - Complete Fix Plan

## समस्याको पूर्ण विश्लेषण

`binnymgr@gmail.com` लाई February 2026 को लागि free audit grant दिइएको छ, तर 3 audits पछि "Limit Reached" error देखिँदैछ।

### Root Cause

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PROBLEM FLOW                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. check-subscription edge function                                         │
│     └─ Calculates: auditsUsed=3, auditsLimit=3, auditsRemaining=0           │
│     └─ DOES NOT check free_audit_grants table! ❌                            │
│                                                                              │
│  2. Frontend (AuditFlow.tsx) calls hasReachedLimit('audits')                │
│     └─ Returns true (because auditsRemaining=0)                             │
│     └─ Shows toast: "Audit Limit Reached" ❌                                 │
│     └─ NEVER calls run-audit edge function                                  │
│                                                                              │
│  3. run-audit edge function (never reached!)                                │
│     └─ This DOES check free_audit_grants correctly ✅                        │
│     └─ But frontend blocks before we get here                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Solution Overview

Two approaches to fix this:

**Approach 1 (Recommended):** Update `check-subscription` to check for free audit grants and return unlimited usage for those users.

**Approach 2 (Alternative):** Remove frontend limit check and let backend handle it.

I recommend **Approach 1** because it provides a consistent experience and shows accurate information in the UI.

---

## Technical Changes

### File 1: `supabase/functions/check-subscription/index.ts`

Add free audit grant check and modify response for users with grants:

**After line 91 (after limits calculation), add:**

```typescript
// Check for free audit grant for this month
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

**Modify line 104-108 (usageStats calculation):**

```typescript
// For users with free audit grants, show unlimited audits
const usageStats = hasFreeAuditGrant ? {
  auditsUsed: auditsThisMonth || 0,
  auditsLimit: Infinity,
  auditsRemaining: Infinity,
} : {
  auditsUsed: auditsThisMonth || 0,
  auditsLimit: limits.audits_per_month || 3,
  auditsRemaining: Math.max(0, (limits.audits_per_month || 3) - (auditsThisMonth || 0)),
};
```

**Modify line 136-141 (features) to include hasFreeAuditGrant:**

```typescript
// For users with free grants, give them Pro-like features
const hasProAccess = isPro || hasFreeAuditGrant;

features: {
  canAutoAudit: hasProAccess || featureFlags.auto_audit === true,
  canExportPdf: hasProAccess || featureFlags.pdf_export === true,
  canShareReport: hasProAccess || featureFlags.share_report === true,
  canViewFullMetrics: hasProAccess || featureFlags.full_metrics === true,
  canViewDemographics: hasProAccess || featureFlags.demographics === true,
  canViewAIInsights: hasProAccess || featureFlags.ai_insights === true,
},
```

**Also add `hasFreeAuditGrant` to the response:**

```typescript
const response = {
  subscribed: hasActiveSubscription,
  isPro,
  hasFreeAuditGrant,  // NEW: include this flag
  // ... rest of response
};
```

---

### File 2: `src/contexts/AuthContext.tsx`

Update the `isPro` determination to include users with free audit grants:

**Line 303:**

```typescript
// Before
const isPro = subscription?.subscribed === true && subscription?.plan?.billing_type !== 'free';

// After
const isPro = (subscription?.subscribed === true && subscription?.plan?.billing_type !== 'free') 
  || subscription?.hasFreeAuditGrant === true;
```

---

### File 3: `src/hooks/useSubscription.ts`

Update `hasReachedLimit` to check for free audit grants:

**Line 60-68:**

```typescript
const hasReachedLimit = (limitType: 'audits' | 'pdf_exports'): boolean => {
  // Users with Pro or free audit grants have no limits
  if (isPro || subscription?.hasFreeAuditGrant) return false;
  
  if (limitType === 'audits') {
    return usage.auditsRemaining <= 0;
  }
  
  return false;
};
```

---

### File 4: `src/components/audit/AuditFlow.tsx`

Update the usage display for users with free audit grants:

**Line 311-316 (usage info display):**

```typescript
{/* Usage info for free users */}
{!isPro && !subscription?.hasFreeAuditGrant && (
  <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
    <p>
      <strong>Free Plan:</strong> {usage.auditsRemaining} of {usage.auditsLimit} audits remaining this month
    </p>
  </div>
)}
{subscription?.hasFreeAuditGrant && !isPro && (
  <div className="bg-success/10 rounded-lg p-4 text-sm text-success">
    <p>
      <strong>Free Audit Grant:</strong> Unlimited audits this month
    </p>
  </div>
)}
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `supabase/functions/check-subscription/index.ts` | Add `free_audit_grants` check, return unlimited usage for granted users, include `hasFreeAuditGrant` in response |
| `src/contexts/AuthContext.tsx` | Include `hasFreeAuditGrant` in `isPro` logic |
| `src/hooks/useSubscription.ts` | Update `hasReachedLimit` to bypass limits for granted users |
| `src/components/audit/AuditFlow.tsx` | Show "Unlimited audits" message for granted users |

---

## Expected Result After Fix

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FIXED FLOW                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. check-subscription edge function                                         │
│     └─ Checks free_audit_grants table                                       │
│     └─ Returns: hasFreeAuditGrant=true, auditsRemaining=Infinity ✅          │
│                                                                              │
│  2. Frontend (AuditFlow.tsx) calls hasReachedLimit('audits')                │
│     └─ Returns false (because hasFreeAuditGrant=true)                       │
│     └─ Shows: "Unlimited audits this month" ✅                               │
│     └─ Allows audit to proceed                                              │
│                                                                              │
│  3. run-audit edge function                                                 │
│     └─ Also checks free_audit_grants (redundant but safe)                   │
│     └─ Creates audit with is_pro_unlocked=true ✅                            │
│                                                                              │
│  4. User sees full Pro report ✅                                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Testing Steps

1. Deploy updated `check-subscription` edge function
2. Have `binnymgr@gmail.com` refresh the Run Audit page
3. Should see "Unlimited audits this month" instead of "0 of 3 audits remaining"
4. Run Audit button should work without "Limit Reached" error
5. Full Pro report should be visible

