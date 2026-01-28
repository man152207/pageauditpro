

# Fix PayPal Sandbox "Something went wrong" Error

## Root Cause Identified
The PayPal order creation is working perfectly (logs show successful order IDs). The error "Sorry, something went wrong" appears on **PayPal's checkout page** because:

1. **Domain Mismatch**: The `return_url` uses the Lovable preview domain (`40febc51-8966-4181-a674-0cb4cbe114ee.lovableproject.com`), but PayPal Sandbox may be rejecting it because:
   - The domain is not added to the PayPal app's "Return URLs" allowlist
   - PayPal Sandbox has strict validation for return URLs

2. **PayPal Sandbox Limitation**: PayPal's Sandbox environment requires the return URL domain to be registered in the PayPal Developer Dashboard under your app settings.

---

## Solution: Two-Part Fix

### Part 1: PayPal Developer Dashboard Configuration (Required)
You must add your domains to PayPal's allowed return URLs:

1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Navigate to **Apps & Credentials** > Select your Sandbox app
3. Under **"Return URL"** (or **"Redirect URIs"**), add:
   - `https://40febc51-8966-4181-a674-0cb4cbe114ee.lovableproject.com` (preview domain)
   - `https://pagelyzer.io` (production domain)
   - `https://pageauditpro.lovable.app` (published domain)

### Part 2: Code Enhancement for Production Stability
Update the edge function to use the production domain as the default origin instead of relying on the request origin header. This ensures consistent behavior across environments.

**File: `supabase/functions/paypal-checkout/index.ts`**

```text
Current code (line 165):
  const origin = req.headers.get("origin") || "https://pagelyzer.io";

Enhanced code:
  // For PayPal, always use a consistent production domain that's registered in PayPal
  // This avoids issues with dynamic preview domains not being whitelisted
  const PAYPAL_REDIRECT_DOMAIN = "https://pagelyzer.io";
  
  // Use the provided success_url directly if it matches a known domain,
  // otherwise fall back to production domain
  const origin = success_url?.startsWith("https://pagelyzer.io") 
    ? "https://pagelyzer.io"
    : success_url?.startsWith("https://pageauditpro.lovable.app")
    ? "https://pageauditpro.lovable.app"
    : PAYPAL_REDIRECT_DOMAIN;
```

However, the **primary fix** is adding the domains to PayPal's dashboard.

---

## Alternative Quick Fix: Use Production Domain

If you want to test immediately without modifying PayPal dashboard settings:

1. Test from your **published domain** (`https://pageauditpro.lovable.app/dashboard/billing`)
2. Or modify the BillingPage to always send the production return URL

---

## Files to Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/paypal-checkout/index.ts` | **Modify** | Use passed-in `success_url` directly without rebuilding it from origin |

The current code reconstructs the URL from origin:
```typescript
return_url: success_url || `${origin}/dashboard?payment=success&gateway=paypal`
```

This should use the `success_url` passed from the frontend directly (which it already does), but we need to ensure the frontend passes a valid PayPal-whitelisted domain.

---

## Recommended Testing Steps

1. **Immediate Fix**: Test from your published URL: `https://pageauditpro.lovable.app/dashboard/billing`
2. **Permanent Fix**: Add all domains to PayPal Developer Dashboard
3. **Code Enhancement**: Optionally hardcode production domain for PayPal redirects

---

## Summary

The code implementation is correct. The issue is a **PayPal Sandbox configuration** requirement - you must whitelist your return URL domains in the PayPal Developer Portal. This is a standard PayPal security measure that applies to all sandbox apps.

