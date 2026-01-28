
# Add Payment Method Selection to All Upgrade Paths

## Problem Identified

Currently, users can only select their preferred payment method (Stripe, PayPal, or eSewa) from the `/dashboard/billing` page. However, most "Upgrade" buttons throughout the app redirect to the `/pricing` page, which **only supports Stripe checkout** and has no payment method selector.

This creates a confusing user experience where:
- Clicking "Upgrade to Pro" from locked features → Goes to `/pricing` → Stripe only
- Clicking upgrade buttons from dashboard → Goes to `/pricing` → Stripe only  
- Only `/dashboard/billing` offers PayPal and eSewa options

Additionally, session issues occur when users switch between domains (preview vs published), causing "Session expired" errors during checkout.

---

## Solution Overview

### Option A: Redirect All Upgrade Buttons to Billing Page (Recommended)
Change all "Upgrade" buttons throughout the app to redirect to `/dashboard/billing` instead of `/pricing`. This ensures users always see the payment method selector.

**Pros:**
- Simple change (update link destinations)
- Billing page already has full functionality
- Logged-in users get the full experience

**Cons:**
- Requires login first (redirects unauthenticated users to login, then billing)

### Option B: Add Payment Method Selector to Pricing Page
Add the same payment method selector (Stripe/PayPal/eSewa) to the Pricing page itself.

**Pros:**
- Users can see pricing without login
- More flexible for browsing

**Cons:**
- More code duplication
- Need to handle authentication state for checkout

---

## Implementation Plan (Using Option A)

### 1. Update All Upgrade Button Links

| File | Current Link | New Link |
|------|-------------|----------|
| `src/pages/PricingPage.tsx` | Calls `create-checkout` directly | Redirect to `/dashboard/billing` |
| `src/components/ui/locked-feature.tsx` | `/pricing` | `/dashboard/billing` |
| `src/components/report/LockedSection.tsx` | `/pricing` | `/dashboard/billing` |
| `src/pages/dashboard/AuditReportPage.tsx` | `/pricing` (3 places) | `/dashboard/billing` |
| `src/pages/dashboard/UserDashboard.tsx` | `/pricing` | `/dashboard/billing` |

### 2. Update PricingPage.tsx Behavior

Instead of directly initiating Stripe checkout, the plan buttons on the Pricing page will:
- For **free plan**: Navigate to `/audit` (start auditing)
- For **paid plans**: Navigate to `/dashboard/billing?plan={plan_id}` to select payment method

This preserves the Pricing page as an informational page while routing checkout through the Billing page.

### 3. Enhance Billing Page to Accept Plan Parameter

Update `BillingPage.tsx` to:
- Read `?plan={plan_id}` from URL
- If a plan is specified, auto-scroll to that plan or highlight it
- Show a clear message like "Complete your upgrade to {Plan Name}"

### 4. Fix Session Issues Across Domains

The auth logs show `refresh_token_not_found` errors when users access from different domains. This happens because:
- Preview domain: `40febc51-xxx.lovableproject.com`
- Published domain: `pageauditpro.lovable.app`
- Each domain has separate localStorage for auth tokens

To mitigate:
- Ensure consistent domain usage in return URLs
- Add better error handling to redirect to login on session expiration

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/PricingPage.tsx` | Change plan click to redirect to billing page |
| `src/components/ui/locked-feature.tsx` | Update link from `/pricing` to `/dashboard/billing` |
| `src/components/report/LockedSection.tsx` | Update link from `/pricing` to `/dashboard/billing` |
| `src/pages/dashboard/AuditReportPage.tsx` | Update 3 links from `/pricing` to `/dashboard/billing` |
| `src/pages/dashboard/UserDashboard.tsx` | Update link from `/pricing` to `/dashboard/billing` |
| `src/pages/dashboard/BillingPage.tsx` | Read `?plan=` param and highlight selected plan |

---

## User Flow After Implementation

```text
User Journey for Upgrade:

1. User sees locked feature OR visits pricing page
2. Clicks "Upgrade to Pro"
3. If not logged in → Redirected to login → After login, goes to Billing
4. If logged in → Goes directly to Billing page
5. On Billing page:
   - Sees payment method selector (Credit Card / PayPal / eSewa)
   - Selects preferred method
   - Clicks upgrade button
   - Redirected to chosen payment gateway
```

---

## Technical Details

### PricingPage.tsx Changes

```typescript
// Current: Directly calls create-checkout (Stripe only)
const handlePlanClick = async (plan: DbPlan) => {
  // ... stripe checkout logic
};

// New: Redirect to billing with payment options
const handlePlanClick = (plan: DbPlan) => {
  if (plan.price === 0) {
    navigate('/audit');
    return;
  }
  
  if (!user) {
    // Store intended plan, redirect to login
    navigate('/auth?mode=signup&redirect=/dashboard/billing&plan=' + plan.id);
    return;
  }
  
  // Logged in users go to billing with plan pre-selected
  navigate('/dashboard/billing?plan=' + plan.id);
};
```

### BillingPage.tsx Enhancement

```typescript
// Read plan from URL params
const planId = searchParams.get('plan');

// If plan specified, scroll to plans section and show message
useEffect(() => {
  if (planId) {
    // Auto-scroll to plans section
    document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' });
  }
}, [planId]);
```

---

## Summary

This plan ensures that **every upgrade path** in the application routes through the Billing page, where users can choose between Stripe, PayPal, or eSewa. The Pricing page becomes purely informational, and the Billing page becomes the single source of truth for payment method selection.
