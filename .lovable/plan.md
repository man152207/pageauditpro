
# Fix Plan: Complete All Remaining Configuration Issues

## Summary
After thorough analysis, I've identified the remaining issues that need to be fixed to ensure all features work correctly.

---

## Issues Found

### 1. Database Issues
- **Duplicate settings entries**: There are duplicate rows for `stripe_publishable_key` and `stripe_secret_key` in the settings table
- **SEO settings not saved**: The default SEO values are used but never saved to database

### 2. Missing Webhook Secret
- **Stripe Webhook Secret** (`whsec_...`) is not configured
- This causes errors when Stripe sends webhook events (as seen in logs: "Unexpected end of JSON input")

### 3. Code Improvements Needed
- The IntegrationsSettings component saves settings one by one but doesn't handle duplicates
- Need to clean up duplicate settings entries

---

## Implementation Plan

### Step 1: Clean Up Duplicate Database Entries
Create a SQL migration to remove duplicate settings entries:
```sql
-- Remove duplicate settings keeping only the most recent
DELETE FROM settings a
USING settings b
WHERE a.id < b.id
AND a.key = b.key
AND a.scope = b.scope
AND a.scope_id IS NOT DISTINCT FROM b.scope_id;
```

### Step 2: Fix IntegrationsSettings Save Logic
Update `src/components/settings/IntegrationSettings.tsx` to:
- Use proper upsert logic that prevents duplicates
- Add better error handling
- Show loading states per-section

### Step 3: Add Missing SEO Default Values to Database
The SEO settings need to be auto-saved on first load or explicitly saved. Add a one-time initialization that saves default SEO values if they don't exist.

### Step 4: Improve Webhook Settings UX
Update `WebhooksSettings.tsx` to:
- Show clearer status indicators (Configured vs Not Configured)
- Add test webhook button for Stripe

### Step 5: Add "Test Connection" Functionality
For each integration (Stripe, PayPal, eSewa, Facebook):
- Add a "Test Connection" button
- Validate credentials and show success/failure
- Provide actionable error messages

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/settings/IntegrationSettings.tsx` | Fix upsert logic, add test connection buttons |
| `src/pages/super-admin/settings/SEOSettings.tsx` | Add auto-save for defaults, improve UX |
| `src/pages/super-admin/settings/WebhooksSettings.tsx` | Add status indicators, test webhook button |
| `src/pages/super-admin/settings/IntegrationsSettings.tsx` | Minor improvements |

---

## Database Migration
Remove duplicate entries from settings table to prevent future issues.

---

## User Actions Required (cannot be automated)

1. **Stripe Webhook Secret**: 
   - Go to Stripe Dashboard → Developers → Webhooks
   - Create endpoint pointing to: `https://wrjqheztddmazlifbzbi.supabase.co/functions/v1/stripe-webhook`
   - Copy the `whsec_...` signing secret
   - Paste in Super Admin → Settings → Webhooks

2. **Test Payment Flow**:
   - Go to Billing page
   - Try checkout with Pro plan
   - Verify it redirects to Stripe

---

## Expected Outcome
- All settings save without creating duplicates
- Stripe webhook processes events correctly (with signing secret)
- SEO defaults are saved to database
- Test connection buttons provide immediate feedback
- Clear status indicators show what's configured vs missing
