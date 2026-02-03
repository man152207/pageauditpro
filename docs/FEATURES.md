# Pagelyzer - Complete Feature Documentation
## Comprehensive System Documentation in Nepali + English

---

## Table of Contents
1. [Application Overview](#1-application-overview)
2. [Core Features](#2-core-features)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [Edge Functions (Backend APIs)](#4-edge-functions-summary)
5. [Database Schema](#5-database-tables)
6. [Authentication Flow](#6-authentication-flow)
7. [Freemium Model](#7-freemium-model)
8. [Settings Configuration](#8-settings-configuration)
9. [Page Routes](#9-page-routes)

---

## 1. Application Overview

Pagelyzer is a **Facebook Page Audit Platform** that analyzes Facebook business pages and provides:
- Engagement metrics analysis
- Performance scoring (0-100)
- AI-powered recommendations
- Detailed analytics for Pro users
- PDF report generation
- Shareable public reports

### Tech Stack:
| Layer | Technology |
|-------|------------|
| **Frontend** | React + TypeScript + Vite + Tailwind CSS |
| **Backend** | Supabase (Lovable Cloud) |
| **Database** | PostgreSQL |
| **Authentication** | Supabase Auth |
| **Payments** | Stripe + PayPal + eSewa (Nepal) |

---

## 2. Core Features

### 2.1 Facebook Page Connection
**Functionality (के गर्छ)**: Users connect their Facebook pages via OAuth

**Flow (कसरी काम गर्छ)**:
1. User clicks "Connect Facebook Page"
2. Redirects to Facebook OAuth dialog
3. User grants page permissions
4. Callback saves access token to `fb_connections` table
5. User can now run audits on that page

**Edge Function**: `facebook-oauth`

**Permissions Required**: 
- `pages_show_list`
- `pages_read_engagement`  
- `pages_read_user_content`
- `read_insights`

---

### 2.2 Run Page Audit
**Functionality**: Analyzes a connected Facebook page

**Edge Function**: `run-audit`

**What it does (के गर्छ)**:
1. Validates user authentication and subscription
2. Fetches page info from Facebook Graph API
3. Fetches page insights (impressions, engagement)
4. Fetches recent posts (last 20)
5. Calculates scores:
   - **Engagement Score** (40% weight): Based on likes/comments/shares per follower
   - **Consistency Score** (35% weight): Based on posts per week
   - **Readiness Score** (25% weight): Based on profile completeness
6. Generates recommendations based on scores
7. Stores results in `audits` and `audit_metrics` tables

**Usage Limits (Limit कति छ)**:
| User Type | Audits Per Month |
|-----------|------------------|
| Free users | 3 audits/month |
| Pro users | Unlimited |
| Users with free grants | Unlimited (for that month) |

---

### 2.3 View Audit Report
**Functionality**: Displays audit results with gated content

**Edge Function**: `get-audit-report`

**Free User Gets (Free User लाई के देखिन्छ)**:
- Overall score and breakdown
- 2 basic recommendations
- Basic metrics (followers, posts analyzed)
- 10% preview of engagement rate

**Pro User Gets (Pro User लाई के देखिन्छ)**:
- All recommendations
- Full detailed metrics
- Post-by-post analysis
- Demographics (age, gender, location)
- AI insights
- Share link capability
- PDF export

---

### 2.4 AI Insights Generation
**Functionality**: GPT-powered personalized marketing advice

**Edge Function**: `generate-ai-insights`

**What it does**:
1. Compiles audit data into a prompt
2. Calls OpenAI GPT-4 API (via Lovable AI Gateway)
3. Generates 5 strategic insights:
   - Content strategy improvements
   - Optimal posting timing
   - Audience growth tactics
   - Engagement boosting techniques
   - One "quick win"
4. Stores insights in `audit_metrics.ai_insights`

**Requires**: OpenAI API key configured in settings OR Lovable AI Gateway

---

### 2.5 PDF Report Export
**Functionality**: Generates downloadable PDF reports

**Edge Function**: `generate-pdf-report`

**Output includes**:
- Page name and audit date
- Overall score with color indicator
- Score breakdown (Engagement, Consistency, Readiness)
- Key metrics table
- Recommendations list
- Pagelyzer branding

**Uses**: html2pdf.js on client-side for PDF generation

---

### 2.6 Share Report (Public Link)
**Functionality**: Creates shareable public links for reports

**Edge Function**: `share-report`

**Actions**:
| Action | Description |
|--------|-------------|
| `create` | Generates unique 8-character slug, makes report public |
| `revoke` | Removes public access |

**Public URL format**: `https://pagelyzer.io/r/{slug}`

**Edge Function**: `get-public-report` serves the public report

---

### 2.7 Subscription Management
**Functionality**: Freemium model with Pro upgrades

**Edge Function**: `check-subscription`

**Checks (के check गर्छ)**:
1. Active subscription in `subscriptions` table
2. Free audit grants in `free_audit_grants` table
3. Plan limits from `plans` table

**Returns (के return गर्छ)**:
```json
{
  "isPro": boolean,
  "hasFreeAuditGrant": boolean,
  "planName": string,
  "features": {
    "canAutoAudit": boolean,
    "canExportPdf": boolean,
    "canShareReport": boolean,
    "canViewFullMetrics": boolean,
    "canViewDemographics": boolean,
    "canViewAIInsights": boolean
  },
  "limits": {
    "audits_per_month": number,
    "pdf_exports": number,
    "history_days": number
  },
  "usage": {
    "auditsUsed": number,
    "auditsLimit": number,
    "auditsRemaining": number
  }
}
```

---

### 2.8 Stripe Payment
**Functionality**: Credit card payments via Stripe Checkout

**Edge Functions**:
- `create-checkout`: Creates Stripe Checkout session
- `stripe-webhook`: Handles Stripe events

**Webhook Events Handled**:
| Event | Action |
|-------|--------|
| `checkout.session.completed` | Creates subscription |
| `customer.subscription.updated` | Updates status |
| `customer.subscription.deleted` | Cancels subscription |
| `invoice.payment_failed` | Marks as expired |

---

### 2.9 PayPal Payment
**Functionality**: PayPal payments for international users

**Edge Function**: `paypal-checkout`

**Flow**:
1. User selects PayPal on billing page
2. Creates PayPal order
3. User completes payment on PayPal
4. Callback verifies and creates subscription

---

### 2.10 eSewa Payment (Nepal)
**Functionality**: Local payment gateway for Nepali users

**Edge Function**: `esewa-checkout`

**Flow**:
1. User selects eSewa on billing page
2. Redirects to eSewa payment page
3. User pays via eSewa mobile/web
4. Callback verifies and creates subscription

---

### 2.11 Scheduled Audits (Cron)
**Functionality**: Automatic recurring audits

**Edge Function**: `auto-audit-cron`

**What it does**:
1. Finds due schedules from `audit_schedules` table
2. Runs audit for each
3. Updates `next_run_at` based on frequency (weekly/monthly)
4. Sends email notification with results

---

### 2.12 Email Notifications
**Functionality**: Sends audit completion emails

**Edge Functions**:
- `send-audit-email`: Sends single audit email
- `weekly-email-cron`: Sends weekly digest emails

**Uses**: Resend API (configured in settings)

---

## 3. User Roles & Permissions

### Role Hierarchy (Role को Level):
```
super_admin > admin > user
```

### super_admin (सबैभन्दा माथिको Role):
- All admin permissions
- Manage all users across system
- Configure system settings (Facebook, Stripe, etc.)
- Manage subscription plans
- View all audits and security logs
- Grant free audits to users
- Access: `/super-admin/*` routes

### admin (Organization को Admin):
- View users in their organization
- View audits in their organization  
- Manage organization branding
- Access: `/admin/*` routes

### user (Normal User):
- Connect own Facebook pages
- Run audits on own pages
- View own reports
- Manage own profile
- Access: `/dashboard/*` routes

---

## 4. Edge Functions Summary

| Function | Purpose (के काम गर्छ) | Auth Required |
|----------|---------|---------------|
| `check-subscription` | Get user's plan status | Yes |
| `run-audit` | Execute Facebook page audit | Yes |
| `get-audit-report` | Fetch gated report data | Yes |
| `get-public-report` | Fetch shared report | No |
| `generate-ai-insights` | Create GPT insights | Yes (Pro) |
| `generate-pdf-report` | Create PDF HTML | Yes (Pro) |
| `share-report` | Create/revoke share link | Yes (Pro) |
| `facebook-oauth` | OAuth flow + page connect | Partial |
| `facebook-auth-login` | Social login with Facebook | No |
| `facebook-webhook` | Handle FB deauth callbacks | No |
| `create-checkout` | Stripe checkout session | Yes |
| `stripe-webhook` | Handle Stripe events | No (signed) |
| `paypal-checkout` | PayPal payment flow | Yes |
| `esewa-checkout` | eSewa (Nepal) payments | Yes |
| `auto-audit-cron` | Scheduled audit runner | No (cron) |
| `send-audit-email` | Email notifications | Yes |
| `weekly-email-cron` | Weekly digest emails | No (cron) |
| `admin-delete-user` | Delete user (cascade) | Yes (SA) |
| `seed-test-users` | Create test users | Yes (SA) |
| `sitemap` | Dynamic XML sitemap | No |

---

## 5. Database Tables

### Core Tables (Main Tables):

#### `profiles`
User profile data (name, avatar, org)
| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | Reference to auth.users |
| full_name | text | User's display name |
| email | text | User's email |
| avatar_url | text | Profile picture URL |
| organization_id | uuid | FK to organizations |
| is_active | boolean | Account status |

#### `user_roles`
Role assignments (user/admin/super_admin)
| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | Reference to auth.users |
| role | enum | 'user', 'admin', 'super_admin' |

#### `organizations`
Multi-tenant organizations
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Organization name |
| slug | text | URL-friendly identifier |
| logo_url | text | Org logo |
| branding_settings | jsonb | Custom colors, etc. |

---

### Audit Tables (Audit सम्बन्धी Tables):

#### `fb_connections`
Connected Facebook pages
| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | Owner of connection |
| page_id | text | Facebook page ID |
| page_name | text | Facebook page name |
| access_token_encrypted | text | Encrypted page token |
| is_active | boolean | Connection status |
| scopes | text[] | Granted permissions |

#### `audits`
Audit records with scores/recommendations
| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | Audit owner |
| fb_connection_id | uuid | FK to fb_connections |
| page_name | text | Page name at audit time |
| score_total | integer | Overall score (0-100) |
| score_breakdown | jsonb | Engagement, Consistency, Readiness |
| recommendations | jsonb | Array of recommendations |
| audit_type | enum | 'manual' or 'automatic' |
| is_pro_unlocked | boolean | Has Pro data |

#### `audit_metrics`
Detailed metrics (Pro only)
| Column | Type | Description |
|--------|------|-------------|
| audit_id | uuid | FK to audits |
| computed_metrics | jsonb | Detailed metrics data |
| demographics | jsonb | Age, gender, location data |
| ai_insights | text | GPT-generated insights |
| raw_metrics | jsonb | Raw Facebook API response |

#### `audit_schedules`
Recurring audit schedules
| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | Schedule owner |
| connection_id | uuid | FK to fb_connections |
| frequency | text | 'weekly' or 'monthly' |
| next_run_at | timestamp | Next scheduled run |
| is_active | boolean | Schedule status |

#### `reports`
Share settings for audits
| Column | Type | Description |
|--------|------|-------------|
| audit_id | uuid | FK to audits |
| share_slug | text | 8-char unique slug |
| is_public | boolean | Public visibility |
| views_count | integer | Number of views |
| pdf_url | text | Stored PDF URL |

---

### Billing Tables (Payment सम्बन्धी Tables):

#### `plans`
Subscription plan definitions
| Column | Type | Description |
|--------|------|-------------|
| name | text | Plan name (Free, Pro) |
| price | numeric | Price amount |
| currency | text | USD, NPR, etc. |
| billing_type | enum | 'free', 'monthly', 'yearly' |
| feature_flags | jsonb | Enabled features |
| limits | jsonb | Usage limits |

#### `subscriptions`
User subscriptions
| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | Subscriber |
| plan_id | uuid | FK to plans |
| status | enum | 'active', 'cancelled', 'expired' |
| gateway | text | 'stripe', 'paypal', 'esewa' |
| gateway_subscription_id | text | External subscription ID |
| expires_at | timestamp | Expiration date |

#### `payments`
Payment history
| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | Payer |
| subscription_id | uuid | FK to subscriptions |
| amount | numeric | Payment amount |
| currency | text | Payment currency |
| gateway | text | Payment gateway used |
| status | enum | 'pending', 'completed', 'failed' |

#### `free_audit_grants`
Monthly free Pro grants (Super Admin ले दिने)
| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | Grant recipient |
| grant_month | date | Month of grant (YYYY-MM-01) |
| granted_by | uuid | Super Admin who granted |

---

### System Tables:

#### `settings`
Global/org/user settings (encrypted)
| Column | Type | Description |
|--------|------|-------------|
| key | text | Setting key |
| value_encrypted | text | Encrypted value |
| scope | text | 'global', 'organization', 'user' |
| scope_id | uuid | Org or user ID |
| is_sensitive | boolean | Should be masked in UI |

#### `audit_logs`
Admin action logs
| Column | Type | Description |
|--------|------|-------------|
| actor_id | uuid | Who performed action |
| entity | text | Table name affected |
| entity_id | uuid | Row ID affected |
| action | text | 'create', 'update', 'delete' |
| changes | jsonb | Before/after data |

#### `security_events`
Security event tracking
| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | Related user |
| event_type | text | 'login', 'password_reset', etc. |
| ip_address | inet | Client IP |
| metadata | jsonb | Additional details |

---

## 6. Authentication Flow

### Email/Password (Email बाट Login):
```
1. User signs up with email + password
2. Email verification sent
3. User clicks verification link
4. Session created, tokens issued
5. Redirect to /dashboard
```

### Facebook Login (Facebook बाट Login):
```
1. User clicks "Continue with Facebook"
2. OAuth flow via `facebook-auth-login` edge function
3. Account created/linked
4. Session created
5. Redirect to /dashboard
```

### Session Management:
- JWT tokens with auto-refresh
- 5-minute subscription check interval
- Silent token refresh on 401
- Secure httpOnly cookies (where applicable)

---

## 7. Freemium Model

### Free Tier (Free Plan मा के पाइन्छ):
| Feature | Limit |
|---------|-------|
| Audits per month | 3 |
| Recommendations shown | 2 basic |
| History retention | 7 days |
| PDF exports | ❌ |
| Share links | ❌ |
| Demographics | ❌ |
| AI insights | ❌ |

### Pro Tier (Pro Plan मा के पाइन्छ):
| Feature | Limit |
|---------|-------|
| Audits per month | Unlimited |
| Recommendations shown | All |
| History retention | Unlimited |
| PDF exports | ✅ |
| Share links | ✅ |
| Demographics | ✅ |
| AI insights | ✅ |
| Scheduled audits | ✅ |
| Priority support | ✅ |

### Free Audit Grants (Super Admin ले दिने Free Access):
- Super Admin can grant Pro access for 1 month
- Stored in `free_audit_grants` table
- Same features as Pro subscription
- Hidden feature (Promotions tab in SA settings)

---

## 8. Settings Configuration

All API keys stored in `settings` table with `scope = 'global'`:

| Key | Purpose (के को लागि) | Required |
|-----|---------|----------|
| `facebook_app_id` | Facebook OAuth App ID | Yes |
| `facebook_app_secret` | Facebook OAuth Secret | Yes |
| `stripe_secret_key` | Stripe API Key | For payments |
| `stripe_webhook_secret` | Stripe Webhook Signing | For payments |
| `stripe_publishable_key` | Stripe Public Key | For payments |
| `paypal_client_id` | PayPal Client ID | For PayPal |
| `paypal_client_secret` | PayPal Secret | For PayPal |
| `esewa_merchant_id` | eSewa (Nepal) Merchant | For eSewa |
| `esewa_secret_key` | eSewa Secret | For eSewa |
| `openai_api_key` | OpenAI for AI Insights | Optional |
| `resend_api_key` | Resend for Emails | For emails |
| `email_from_address` | Sender email address | For emails |
| `facebook_webhook_verify_token` | FB webhook verification | Optional |

### How to Configure (कसरी Configure गर्ने):
1. Login as Super Admin
2. Go to `/super-admin/settings/integrations`
3. Enter API keys in respective fields
4. Save - keys are encrypted in database

---

## 9. Page Routes

### Public Routes (Login बिना पनि Access):
| Route | Page |
|-------|------|
| `/` | Landing page (Home) |
| `/features` | Features page |
| `/pricing` | Pricing page |
| `/faq` | FAQ page |
| `/sample-report` | Demo report |
| `/auth` | Login/Signup |
| `/r/:slug` | Public shared report |
| `/privacy-policy` | Privacy Policy |
| `/terms-of-service` | Terms of Service |
| `/contact` | Contact page |
| `/data-deletion` | Data deletion info |

### Dashboard Routes (Login चाहिन्छ):
| Route | Page |
|-------|------|
| `/dashboard` | User dashboard |
| `/dashboard/audit` | Run new audit |
| `/dashboard/reports` | All reports list |
| `/dashboard/reports/:id` | Single report view |
| `/dashboard/history` | Audit history |
| `/dashboard/compare` | Compare reports |
| `/dashboard/billing` | Subscription/billing |
| `/dashboard/profile` | User profile |
| `/dashboard/settings` | User settings |

### Admin Routes (Admin Role चाहिन्छ):
| Route | Page |
|-------|------|
| `/admin` | Admin dashboard |
| `/admin/users` | Org user management |
| `/admin/audits` | Org audit list |
| `/admin/branding` | Org branding settings |

### Super Admin Routes (Super Admin Role चाहिन्छ):
| Route | Page |
|-------|------|
| `/super-admin` | SA dashboard |
| `/super-admin/users` | All users management |
| `/super-admin/plans` | Plan management |
| `/super-admin/settings/general` | General settings |
| `/super-admin/settings/facebook` | Facebook App settings |
| `/super-admin/settings/integrations` | API keys settings |
| `/super-admin/settings/security` | Security settings |
| `/super-admin/settings/seo` | SEO settings |
| `/super-admin/settings/webhooks` | Webhook settings |
| `/super-admin/settings/promotions` | Free audit grants |

---

## 10. Security Features

### Row Level Security (RLS):
All tables have RLS policies:
- Users can only see their own data
- Admins can see their organization's data
- Super Admins can see all data

### Token Encryption:
- Facebook access tokens stored encrypted
- API keys stored encrypted in settings table
- Uses PostgreSQL pgcrypto extension

### Audit Logging:
- All admin actions logged to `audit_logs`
- Security events logged to `security_events`
- Includes IP address and user agent

---

## 11. Error Handling

### Standard Error Response:
```json
{
  "error": "Error message here",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes:
| Code | Meaning |
|------|---------|
| `AUTH_REQUIRED` | User not authenticated |
| `FORBIDDEN` | User lacks permission |
| `NOT_FOUND` | Resource not found |
| `LIMIT_REACHED` | Usage limit exceeded |
| `CONFIG_MISSING` | API key not configured |
| `FB_TOKEN_EXPIRED` | Facebook token expired |
| `PAYMENT_FAILED` | Payment processing failed |

---

## Summary (सारांश)

Yo documentation file ma Pagelyzer ko sabai main features explain gariyeko cha:

1. **Application Overview** - Pagelyzer के हो
2. **12 Core Features** - Detailed explanation of each feature
3. **User Roles** - super_admin, admin, user permissions
4. **20 Edge Functions** - Full API reference table
5. **Database Schema** - All tables explained with columns
6. **Auth Flow** - Email + Facebook login
7. **Freemium Model** - Free vs Pro features comparison
8. **Settings Keys** - All configurable API keys
9. **Routes** - Complete URL structure
10. **Security** - RLS, encryption, logging

---

*Last Updated: February 2026*
*Documentation Version: 1.0*
