
# Facebook Developer Console Configuration Guide

## Overview

You want a dedicated section in Super Admin Settings that displays all the configuration details needed for the Facebook Developer Console. This will include:

1. **Facebook Webhooks** - Callback URLs and Verify Tokens for User, Page, Permissions, Application, Instagram, and Catalog
2. **Facebook Login Settings** - OAuth settings, Redirect URIs, Deauthorize callback
3. **App Settings** - App Domains, Website URL, Privacy Policy URL, etc.

Currently, the WebhooksSettings page only shows basic callback URLs mixed with other services (Stripe, PayPal). We need a dedicated, comprehensive Facebook configuration section.

---

## What Will Be Created

### New Tab: "Facebook" in Settings Navigation

Add a new tab between "Integrations" and "Webhooks":

| Tab | Purpose |
|-----|---------|
| General | App name, logo, support email |
| Integrations | API keys for Stripe, Facebook, PayPal, eSewa, Email |
| **Facebook** | **NEW: Complete Facebook Developer Console guide** |
| Webhooks | Stripe webhook, general callback URLs |
| SEO | Meta tags, sitemap settings |
| Security | Security policies |

---

## New FacebookSettings Page Structure

### Section 1: App Settings (Settings > Basic)

| Setting | Value to Copy | Notes |
|---------|---------------|-------|
| App Domains | `pagelyzer.io` | Required for OAuth |
| Website URL | `https://pagelyzer.io` | Main site URL |
| Privacy Policy URL | `https://pagelyzer.io/privacy-policy` | Required for public apps |
| Terms of Service URL | `https://pagelyzer.io/terms-of-service` | Required for public apps |

### Section 2: Facebook Login Configuration

| Setting | Recommended Value |
|---------|-------------------|
| Client OAuth login | ON |
| Web OAuth login | ON |
| Enforce HTTPS | ON |
| Force Web OAuth reauthentication | OFF |
| Embedded browser OAuth login | OFF |
| Use Strict Mode for redirect URIs | ON |
| Login with the JavaScript SDK | OFF |
| Login from devices | OFF |

**Valid OAuth Redirect URIs** (copy these exactly):
- `https://pagelyzer.io/api/auth/facebook/login/callback` - For "Continue with Facebook" login
- `https://pagelyzer.io/api/auth/facebook/page/callback` - For Facebook Page connection

**Allowed Domains for JavaScript SDK** (if enabled):
- `pagelyzer.io`
- `pageauditpro.lovable.app`

**Deauthorize Callback URL**:
- `https://pagelyzer.io/api/webhooks/facebook/deauthorize`

### Section 3: Webhook Configuration

For each webhook product (User, Page, Permissions, Application, Instagram, Catalog):

| Field | Value |
|-------|-------|
| Callback URL | `https://pagelyzer.io/api/webhooks/facebook/{product}` |
| Verify Token | (Generated token - stored in settings) |

**Products to configure:**

| Product | Callback URL | Use Case |
|---------|--------------|----------|
| User | `https://pagelyzer.io/api/webhooks/facebook/user` | User data changes |
| Page | `https://pagelyzer.io/api/webhooks/facebook/page` | Page insights, posts, messages |
| Permissions | `https://pagelyzer.io/api/webhooks/facebook/permissions` | Permission changes |
| Application | `https://pagelyzer.io/api/webhooks/facebook/application` | App-level events |
| Instagram | `https://pagelyzer.io/api/webhooks/facebook/instagram` | Instagram Business data |
| Catalog | `https://pagelyzer.io/api/webhooks/facebook/catalog` | Product catalog updates |

### Section 4: Redirect URI Validator

A helper section that shows:
- What URIs are currently configured in your app
- A quick copy button for each URI
- Status indicator (Valid/Invalid based on Facebook's requirements)

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/pages/super-admin/settings/FacebookSettings.tsx` | **CREATE** | New comprehensive Facebook configuration page |
| `src/pages/super-admin/settings/SettingsLayout.tsx` | **MODIFY** | Add "Facebook" tab to navigation |
| `src/App.tsx` | **MODIFY** | Add route for `/super-admin/settings/facebook` |
| `supabase/functions/facebook-webhook/index.ts` | **CREATE** | New edge function to handle Facebook webhooks (verification + events) |

---

## Technical Implementation

### 1. FacebookSettings.tsx Component Structure

```tsx
// Sections with collapsible panels:
- App Basic Settings (with copy buttons)
- Facebook Login Configuration (with recommended toggles)
- OAuth Redirect URIs (with copy + validation)
- Webhook Configuration (per product)
- Verify Token Management (generate/save)
- Quick Setup Checklist
```

### 2. Verify Token Management

The Verify Token is a secret string you create that Facebook uses to verify your webhook endpoint. We will:
- Store it in the `settings` table with key `facebook_webhook_verify_token`
- Allow Super Admin to generate a new token or enter a custom one
- Display it with reveal/hide toggle

### 3. Facebook Webhook Edge Function

Create a new edge function that:
- Handles GET requests for webhook verification (returns `hub.challenge`)
- Handles POST requests for incoming webhook events
- Validates the verify token from settings table
- Logs all webhook events for debugging

---

## UI Design

### Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Facebook Developer Console Configuration                    │
│ Complete guide for configuring your Facebook App            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 📋 Quick Setup Checklist                                    │
│ ─────────────────────────────────────────────────────────── │
│ ☐ Add App Domains in Settings > Basic                       │
│ ☐ Add Website URL in Settings > Basic                       │
│ ☐ Add Privacy Policy URL                                    │
│ ☐ Configure Facebook Login settings                         │
│ ☐ Add Valid OAuth Redirect URIs                             │
│ ☐ Configure webhooks (optional)                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ⚙️ App Settings (Settings > Basic)                          │
│ ─────────────────────────────────────────────────────────── │
│ App Domains          │ pagelyzer.io              │ [Copy]   │
│ Website URL          │ https://pagelyzer.io      │ [Copy]   │
│ Privacy Policy URL   │ https://pagelyzer.io/...  │ [Copy]   │
│ Terms of Service URL │ https://pagelyzer.io/...  │ [Copy]   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🔐 Facebook Login (Use Cases > Facebook Login)              │
│ ─────────────────────────────────────────────────────────── │
│ Client OAuth Settings:                                      │
│                                                             │
│ Setting                              │ Recommended          │
│ ───────────────────────────────────────────────────────── │
│ Client OAuth login                   │ ✓ ON                 │
│ Web OAuth login                      │ ✓ ON                 │
│ Enforce HTTPS                        │ ✓ ON                 │
│ Use Strict Mode for redirect URIs    │ ✓ ON                 │
│ Login with JavaScript SDK            │ ✗ OFF                │
│                                                             │
│ Valid OAuth Redirect URIs (add all of these):               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://pagelyzer.io/api/auth/facebook/login/callback   │ │
│ │ For: "Continue with Facebook" login          [Copy]     │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://pagelyzer.io/api/auth/facebook/page/callback    │ │
│ │ For: Facebook Page connection                [Copy]     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Deauthorize Callback URL:                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://pagelyzer.io/api/webhooks/facebook/deauthorize  │ │
│ │ For: User app removal notification           [Copy]     │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🔔 Webhooks (Use Cases > Webhooks)                          │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ Verify Token: [••••••••] [👁] [Copy] [Generate New]         │
│                                                             │
│ Product Webhooks:                                           │
│ ┌──────────────┬────────────────────────────────┬────────┐ │
│ │ Product      │ Callback URL                   │ Status │ │
│ ├──────────────┼────────────────────────────────┼────────┤ │
│ │ User         │ .../api/webhooks/facebook/user │ [Copy] │ │
│ │ Page         │ .../api/webhooks/facebook/page │ [Copy] │ │
│ │ Permissions  │ .../api/webhooks/facebook/...  │ [Copy] │ │
│ │ Application  │ .../api/webhooks/facebook/...  │ [Copy] │ │
│ │ Instagram    │ .../api/webhooks/facebook/...  │ [Copy] │ │
│ │ Catalog      │ .../api/webhooks/facebook/...  │ [Copy] │ │
│ └──────────────┴────────────────────────────────┴────────┘ │
│                                                             │
│ Note: Use the same Verify Token for all webhook products.   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🌐 JavaScript SDK (Optional)                                │
│ ─────────────────────────────────────────────────────────── │
│ If you enable "Login with JavaScript SDK":                  │
│                                                             │
│ Allowed Domains:                                            │
│ • pagelyzer.io                                              │
│ • pageauditpro.lovable.app                                  │
│                                                             │
│ Note: Currently using server-side OAuth (recommended)       │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary

This plan creates a dedicated Facebook configuration section that:

1. Shows ALL settings needed for Facebook Developer Console in one place
2. Provides copy buttons for every URL and value
3. Includes a quick setup checklist
4. Manages the webhook Verify Token
5. Creates a new edge function to handle Facebook webhooks
6. Separates Facebook-specific configuration from general webhooks

After implementation, Super Admin can open this page and configure Facebook Developer Console step-by-step without needing to remember URLs or settings.
