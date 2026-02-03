

# Pagelyzer - Complete Feature Documentation
## Comprehensive System Documentation in Nepali + English

---

## Overview

Yo documentation file create garincha `docs/FEATURES.md` ma. Yo file ma Pagelyzer ko sabai main functions ra features explain garincha with full technical details.

---

## File to Create: `docs/FEATURES.md`

### Content Structure:

```markdown
# Pagelyzer - Complete Feature Documentation

## Table of Contents
1. Application Overview
2. Core Features  
3. User Roles & Permissions
4. Edge Functions (Backend APIs)
5. Database Schema
6. Authentication Flow
7. Payment Integration
8. Facebook Integration

---

## 1. Application Overview (Overview)

Pagelyzer is a **Facebook Page Audit Platform** that analyzes Facebook business pages and provides:
- Engagement metrics analysis
- Performance scoring (0-100)
- AI-powered recommendations
- Detailed analytics for Pro users
- PDF report generation
- Shareable public reports

### Tech Stack:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (Lovable Cloud)
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Payments**: Stripe + PayPal + eSewa (Nepal)

---

## 2. Core Features

### 2.1 Facebook Page Connection
**Functionality**: Users connect their Facebook pages via OAuth

**Flow**:
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

**What it does**:
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

**Usage Limits**:
- Free users: 3 audits/month
- Pro users: Unlimited
- Users with free grants: Unlimited for that month

---

### 2.3 View Audit Report
**Functionality**: Displays audit results with gated content

**Edge Function**: `get-audit-report`

**Free User Gets**:
- Overall score and breakdown
- 2 basic recommendations
- Basic metrics (followers, posts analyzed)
- 10% preview of engagement rate

**Pro User Gets**:
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
2. Calls OpenAI GPT-4 API
3. Generates 5 strategic insights:
   - Content strategy improvements
   - Optimal posting timing
   - Audience growth tactics
   - Engagement boosting techniques
   - One "quick win"
4. Stores insights in `audit_metrics.ai_insights`

**Requires**: OpenAI API key configured in settings

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
- `create`: Generates unique 8-character slug, makes report public
- `revoke`: Removes public access

**Public URL format**: `https://pagelyzer.io/r/{slug}`

**Edge Function**: `get-public-report` serves the public report

---

### 2.7 Subscription Management
**Functionality**: Freemium model with Pro upgrades

**Edge Function**: `check-subscription`

**Checks**:
1. Active subscription in `subscriptions` table
2. Free audit grants in `free_audit_grants` table
3. Plan limits from `plans` table

**Returns**:
- `isPro`: boolean
- `hasFreeAuditGrant`: boolean
- `planName`: string
- `features`: object (what user can access)
- `limits`: object (monthly quotas)
- `usage`: object (current usage stats)

---

### 2.8 Stripe Payment
**Functionality**: Credit card payments via Stripe Checkout

**Edge Functions**:
- `create-checkout`: Creates Stripe Checkout session
- `stripe-webhook`: Handles Stripe events

**Webhook Events Handled**:
- `checkout.session.completed`: Creates subscription
- `customer.subscription.updated`: Updates status
- `customer.subscription.deleted`: Cancels subscription
- `invoice.payment_failed`: Marks as expired

---

### 2.9 Scheduled Audits (Cron)
**Functionality**: Automatic recurring audits

**Edge Function**: `auto-audit-cron`

**What it does**:
1. Finds due schedules from `audit_schedules` table
2. Runs audit for each
3. Updates `next_run_at` based on frequency (weekly/monthly)
4. Sends email notification with results

---

### 2.10 Email Notifications
**Functionality**: Sends audit completion emails

**Edge Functions**:
- `send-audit-email`: Sends single audit email
- `weekly-email-cron`: Sends weekly digest emails

**Uses**: Resend API (configured in settings)

---

## 3. User Roles & Permissions

### Role Hierarchy:
```
super_admin > admin > user
```

### super_admin:
- All admin permissions
- Manage all users across system
- Configure system settings (Facebook, Stripe, etc.)
- Manage subscription plans
- View all audits and security logs
- Grant free audits to users

### admin:
- View users in their organization
- View audits in their organization  
- Manage organization branding

### user:
- Connect own Facebook pages
- Run audits on own pages
- View own reports
- Manage own profile

---

## 4. Edge Functions Summary

| Function | Purpose | Auth Required |
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

### Core Tables:
- `profiles`: User profile data (name, avatar, org)
- `user_roles`: Role assignments (user/admin/super_admin)
- `organizations`: Multi-tenant organizations

### Audit Tables:
- `fb_connections`: Connected Facebook pages
- `audits`: Audit records with scores/recommendations
- `audit_metrics`: Detailed metrics (Pro only)
- `audit_schedules`: Recurring audit schedules
- `reports`: Share settings for audits

### Billing Tables:
- `plans`: Subscription plan definitions
- `subscriptions`: User subscriptions
- `payments`: Payment history
- `free_audit_grants`: Monthly free Pro grants

### System Tables:
- `settings`: Global/org/user settings (encrypted)
- `audit_logs`: Admin action logs
- `security_events`: Security event tracking

---

## 6. Authentication Flow

### Email/Password:
1. User signs up with email + password
2. Email verification sent
3. User clicks verification link
4. Session created, tokens issued

### Facebook Login:
1. User clicks "Continue with Facebook"
2. OAuth flow via `facebook-auth-login`
3. Account created/linked
4. Session created

### Session Management:
- JWT tokens with auto-refresh
- 5-minute subscription check interval
- Silent token refresh on 401

---

## 7. Freemium Model

### Free Tier:
- 3 audits per month
- Basic score and 2 recommendations
- 7-day history
- No exports, no sharing

### Pro Tier:
- Unlimited audits
- Full recommendations
- Demographics data
- AI insights
- PDF export
- Shareable links
- Full history
- Priority support

### Free Audit Grants:
- Super Admin can grant Pro access for 1 month
- Stored in `free_audit_grants` table
- Same features as Pro subscription

---

## 8. Settings Configuration

All API keys stored in `settings` table with `scope = 'global'`:

| Key | Purpose |
|-----|---------|
| `facebook_app_id` | Facebook OAuth App ID |
| `facebook_app_secret` | Facebook OAuth Secret |
| `stripe_secret_key` | Stripe API Key |
| `stripe_webhook_secret` | Stripe Webhook Signing |
| `paypal_client_id` | PayPal Client ID |
| `paypal_client_secret` | PayPal Secret |
| `esewa_merchant_id` | eSewa (Nepal) Merchant |
| `esewa_secret_key` | eSewa Secret |
| `openai_api_key` | OpenAI for AI Insights |
| `resend_api_key` | Resend for Emails |
| `email_from_address` | Sender email address |
| `facebook_webhook_verify_token` | FB webhook verification |

---

## 9. Page Routes

### Public Routes:
- `/` - Landing page
- `/features` - Features page
- `/pricing` - Pricing page
- `/faq` - FAQ page
- `/sample-report` - Demo report
- `/auth` - Login/Signup
- `/r/:slug` - Public shared report

### Dashboard Routes (Auth Required):
- `/dashboard` - User dashboard
- `/dashboard/audit` - Run new audit
- `/dashboard/reports` - All reports
- `/dashboard/reports/:id` - Single report
- `/dashboard/history` - Audit history
- `/dashboard/compare` - Compare reports
- `/dashboard/billing` - Subscription/billing
- `/dashboard/profile` - User profile
- `/dashboard/settings` - User settings

### Admin Routes:
- `/admin` - Admin dashboard
- `/admin/users` - Org user management
- `/admin/audits` - Org audit list
- `/admin/branding` - Org branding

### Super Admin Routes:
- `/super-admin` - SA dashboard
- `/super-admin/users` - All users
- `/super-admin/plans` - Plan management
- `/super-admin/settings/*` - System settings
```

---

## Summary

This documentation file will be saved at `docs/FEATURES.md` containing:

1. **Application Overview** - What Pagelyzer does
2. **10 Core Features** - Detailed explanation of each feature
3. **User Roles** - super_admin, admin, user permissions
4. **20 Edge Functions** - Full API reference table
5. **Database Schema** - All tables explained
6. **Auth Flow** - Email + Facebook login
7. **Freemium Model** - Free vs Pro features
8. **Settings Keys** - All configurable API keys
9. **Routes** - Complete URL structure

File Size: ~15KB of comprehensive documentation

