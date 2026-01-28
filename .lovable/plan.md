

# Fix PayPal Payment Completion Flow

## Problem Identified
The PayPal integration is creating orders successfully, but the **payment capture step is missing**. When a user approves the payment on PayPal, they're redirected directly to a success page without actually capturing (completing) the payment.

PayPal's "Sorry, something went wrong" error is likely because:
1. The sandbox environment detected an incomplete flow
2. OR the return URL handling isn't properly configured

## Solution

### 1. Create PayPal Callback Handler Component
Create a new page component that handles the PayPal return flow:

**File: `src/pages/dashboard/PayPalCallback.tsx`**
- Extract the `token` parameter from the URL (PayPal sends the order ID as `token`)
- Call the `paypal-checkout` edge function with `action: "capture-order"` and the order ID
- Show loading state while capturing
- Redirect to billing page with success/failure message

### 2. Update PayPal Checkout URLs
Modify `BillingPage.tsx` to use the callback URL instead of direct success URL:

```typescript
// Current (broken):
success_url: `${window.location.origin}/dashboard/billing?payment=success&gateway=paypal`

// Fixed:
success_url: `${window.location.origin}/dashboard/paypal-callback`
```

### 3. Add Route for PayPal Callback
Update `App.tsx` to add the new route:
```typescript
<Route path="paypal-callback" element={<PayPalCallback />} />
```

## Technical Details

### PayPal Return Flow
When PayPal redirects back after user approval, the URL contains:
- `token` - The PayPal Order ID
- `PayerID` - The payer's ID

Example: `/dashboard/paypal-callback?token=8U604424F7890774C&PayerID=ABC123`

### PayPalCallback Component Logic
```typescript
1. On mount, extract `token` from URL params
2. Call supabase.functions.invoke('paypal-checkout', {
     body: { action: 'capture-order', order_id: token }
   })
3. If successful → redirect to /dashboard/billing?payment=success&gateway=paypal
4. If failed → redirect to /dashboard/billing?payment=failed&gateway=paypal
```

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/pages/dashboard/PayPalCallback.tsx` | **Create** - New callback handler |
| `src/pages/dashboard/BillingPage.tsx` | **Modify** - Update success_url |
| `src/App.tsx` | **Modify** - Add route |

## Testing After Implementation
1. Go to Billing page and select PayPal
2. Click on a Pro plan
3. Login with a **separate PayPal sandbox buyer account** (not the merchant account)
4. Approve the payment
5. Verify redirect to callback page → capture → success redirect

