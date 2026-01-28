
# Pagelyzer Domain & Integration Fixes

## Issues Identified

### 1. Webhook URL Issues
The current webhook URLs use incorrect domain patterns. Need to update to use the correct Supabase project domain:
- **Current Wrong Pattern**: `https://40febc51-8966-4181-a674-0cb4cbe114ee.lovableproject.com/functions/v1/...`
- **Correct Pattern**: `https://wrjqheztddmazlifbzbi.supabase.co/functions/v1/...`

The production domain is **pagelyzer.io**

### 2. Missing Implementations

| Feature | Status | Required Action |
|---------|--------|-----------------|
| Stripe Integration | Working | Update webhook URL display |
| PayPal Integration | Backend Done | Add UI payment option in BillingPage |
| eSewa Integration | Backend Done | Add UI payment option in BillingPage |
| Facebook OAuth Login | Backend Done | Needs complete-login flow integration |
| Email Reports | Backend Done | Add cron/scheduling for recurring emails |
| SEO Settings | Done | No changes needed |
| Error Handling Framework | Done | Already implemented |
| IntegrationSettings Component | Created | Not integrated into SuperAdminSettingsPage |

---

## Implementation Plan

### Phase 1: Fix Webhook URL Display in Super Admin Settings

Update `SuperAdminSettingsPage.tsx` to show correct webhook URLs:

```text
Stripe Webhook URL:
https://wrjqheztddmazlifbzbi.supabase.co/functions/v1/stripe-webhook

Facebook OAuth Callback:
https://wrjqheztddmazlifbzbi.supabase.co/functions/v1/facebook-oauth?action=callback

Facebook Login Callback:
https://wrjqheztddmazlifbzbi.supabase.co/functions/v1/facebook-auth-login?action=callback

PayPal Return URL:
https://pagelyzer.io/dashboard?payment=success&gateway=paypal

eSewa Success Callback:
https://wrjqheztddmazlifbzbi.supabase.co/functions/v1/esewa-checkout?action=success
```

### Phase 2: Integrate IntegrationSettings Component

Add the already-created `IntegrationSettings` component to SuperAdminSettingsPage Integrations tab. This provides:
- PayPal key management (Client ID, Secret, Sandbox toggle)
- eSewa key management (Merchant ID, Secret Key, Sandbox toggle)
- Email provider (Resend) key management
- Facebook API key management
- Test Connection buttons for each integration

### Phase 3: Add Multiple Payment Gateway Options to BillingPage

Update `BillingPage.tsx` to offer payment method selection:
- Stripe (default)
- PayPal (for international users)
- eSewa (for Nepal users - shows NPR pricing)

Add a payment gateway selector before checkout.

### Phase 4: Complete Facebook Login Integration

Update `AuthPage.tsx` to properly handle the Facebook login callback and complete the authentication flow using the `complete-login` action.

### Phase 5: Add Stripe Key Management to Settings

Currently Stripe uses env-only key. Update:
1. `create-checkout` edge function to fetch `stripe_secret_key` from settings first
2. Add Stripe key fields to IntegrationSettings component
3. Keep env fallback for backward compatibility

### Phase 6: Add Recurring Email Scheduling

Create a scheduled function endpoint that Super Admin can trigger or set up as a cron job for weekly email summaries.

---

## File Changes Summary

### Modified Files

| File | Changes |
|------|---------|
| `src/pages/super-admin/SuperAdminSettingsPage.tsx` | Replace Integrations tab with IntegrationSettings component, fix webhook URLs |
| `src/pages/dashboard/BillingPage.tsx` | Add multi-gateway payment selector (Stripe, PayPal, eSewa) |
| `src/pages/AuthPage.tsx` | Complete Facebook login flow with complete-login action |
| `src/components/settings/IntegrationSettings.tsx` | Add Stripe key management section |
| `supabase/functions/create-checkout/index.ts` | Fetch stripe_secret_key from settings table first |

### New Files

| File | Purpose |
|------|---------|
| `supabase/functions/weekly-email-cron/index.ts` | Scheduled function to send weekly summary emails |

---

## Technical Details

### Correct Supabase Edge Function URLs

```text
Base URL: https://wrjqheztddmazlifbzbi.supabase.co/functions/v1/

Endpoints:
- /stripe-webhook (POST, no JWT)
- /facebook-oauth?action=callback (GET, no JWT)
- /facebook-auth-login?action=callback (GET, no JWT)
- /paypal-checkout?action=capture-order (POST)
- /esewa-checkout?action=success (GET)
- /create-checkout (POST, requires auth)
- /run-audit (POST, requires auth)
- /get-audit-report (POST, requires auth)
- /send-audit-email (POST)
- /check-subscription (POST, requires auth)
```

### Payment Gateway Integration in BillingPage

```tsx
// Payment method selector
const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'esewa'>('stripe');

// Handle checkout based on selected gateway
const handleCheckout = async (plan: Plan) => {
  switch (paymentMethod) {
    case 'stripe':
      // Existing Stripe flow
      break;
    case 'paypal':
      // Call paypal-checkout?action=create-order
      // Redirect to PayPal approval URL
      break;
    case 'esewa':
      // Call esewa-checkout?action=initiate
      // Submit form to eSewa payment page
      break;
  }
};
```

### Settings-Driven Stripe Key Fetch

```typescript
// In create-checkout edge function
const { data: stripeKeyData } = await supabaseAdmin
  .from("settings")
  .select("key, value_encrypted")
  .eq("scope", "global")
  .eq("key", "stripe_secret_key");

const stripeSecretKey = stripeKeyData?.[0]?.value_encrypted || 
  Deno.env.get("STRIPE_SECRET_KEY");
```

---

## Production URLs Summary

| Purpose | URL |
|---------|-----|
| Main Domain | https://pagelyzer.io |
| Supabase Functions | https://wrjqheztddmazlifbzbi.supabase.co/functions/v1/ |
| Stripe Webhook | https://wrjqheztddmazlifbzbi.supabase.co/functions/v1/stripe-webhook |
| FB OAuth Callback | https://wrjqheztddmazlifbzbi.supabase.co/functions/v1/facebook-oauth?action=callback |
| FB Login Callback | https://wrjqheztddmazlifbzbi.supabase.co/functions/v1/facebook-auth-login?action=callback |
| PayPal Success | https://pagelyzer.io/dashboard?payment=success&gateway=paypal |
| eSewa Success | https://wrjqheztddmazlifbzbi.supabase.co/functions/v1/esewa-checkout?action=success |
| Sitemap | https://wrjqheztddmazlifbzbi.supabase.co/functions/v1/sitemap |
