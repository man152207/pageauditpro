

# Fix Stripe Integration — Wrong Key Type in Database

## Problem
The `stripe_secret_key` setting in the database contains a **webhook signing secret** (`whsec_...`) instead of the actual **Stripe Secret Key** (`sk_live_...`). This causes all checkout attempts to fail with `StripeAuthenticationError`.

The user's provided key `mk_1QkVZPLvZyJzjm3L2aCBq88j` is also not a valid Stripe key format.

## What the User Needs to Do
1. Go to [Stripe Dashboard → API Keys](https://dashboard.stripe.com/apikeys)
2. Copy the **Secret key** (starts with `sk_live_...`)
3. Paste it in **Super Admin → Settings → Integrations → Stripe Secret Key**
4. Save, then Test Connection

## Code Fix (to prevent this mistake in future)
Add **key format validation** in the IntegrationSettings UI and the create-checkout edge function:

### 1. `src/components/settings/IntegrationSettings.tsx`
- Add validation before saving Stripe Secret Key: must start with `sk_test_` or `sk_live_`
- Show inline error if user pastes a `pk_`, `whsec_`, `rk_`, or `mk_` key
- Add helper text: "Secret key starts with sk_live_ or sk_test_"

### 2. `supabase/functions/create-checkout/index.ts`
- Add a pre-flight check on the fetched `stripeSecretKey`: if it doesn't start with `sk_`, return a clear error before initializing Stripe
- Include the key prefix in the error message so the admin knows what's wrong

### 3. Database cleanup
- Update the `stripe_secret_key` row in settings with the correct `sk_live_...` value once the user provides it

## Technical Details

**Validation function** (reusable for both frontend and edge function):
```text
if key starts with "pk_"  → "This is a PUBLISHABLE key. Use the SECRET key (sk_...)"
if key starts with "whsec_" → "This is a webhook secret. Use the SECRET key (sk_...)"  
if key starts with "rk_"  → "This is a RESTRICTED key. Use the full Secret key"
if not starts with "sk_test_" or "sk_live_" → "Invalid format"
if length < 20 → "Key appears too short"
```

**Files to modify:**
- `src/components/settings/IntegrationSettings.tsx` — add save-time validation
- `supabase/functions/create-checkout/index.ts` — add runtime key format check

