

# Pagelyzer मा Metricool-जस्ता Features थप्ने Plan

User ले चाहेका सबै features: **Post Scheduling + Content Planner Calendar**, **Competitor Analysis**, **Multi-Platform Support**, र **Unified Inbox**।

यी features ठूला छन्, तर एक-एक गरेर implement गर्न सकिन्छ। तल प्रत्येक feature को plan छ।

---

## Phase 1: Content Planner + Post Scheduling (Calendar View)

Users ले calendar मा posts plan गर्न सक्ने, schedule गर्न सक्ने, र auto-publish हुने।

### Database Changes
- New table: `scheduled_posts` (id, user_id, fb_connection_id, content, media_urls, scheduled_at, status [draft/scheduled/published/failed], published_at, platform, created_at)
- New table: `content_calendar` (id, user_id, title, color, date, post_id nullable — for planning without actual post)

### Backend (Edge Functions)
- `schedule-post/index.ts` — saves post to DB, validates time
- `publish-scheduled-posts/index.ts` — cron function that checks `scheduled_at <= now()` and calls Facebook Graph API `POST /{page-id}/feed` to publish
- Cron job: every minute check for due posts

### Frontend
- New page: `/dashboard/planner` — full calendar view (monthly/weekly)
- Drag-and-drop post cards on calendar
- Post composer dialog: text, image upload, schedule time picker
- Status indicators: draft (grey), scheduled (blue), published (green), failed (red)
- Quick view on hover showing post preview

### Pro Feature
- Free: 3 scheduled posts/month
- Pro: Unlimited scheduling

---

## Phase 2: Competitor Analysis

Users ले competitors को public pages सँग compare गर्न सक्ने।

### Database Changes
- New table: `competitor_pages` (id, user_id, page_id, page_name, page_url, added_at)
- New table: `competitor_snapshots` (id, competitor_page_id, followers, posts_count, engagement_estimate, captured_at)

### Backend
- `track-competitor/index.ts` — Facebook Graph API बाट public page data fetch (followers, post count)
- Periodic snapshot via cron (weekly)

### Frontend
- New page: `/dashboard/competitors`
- Add competitor by Facebook page URL/name
- Side-by-side comparison cards: your page vs competitor
- Charts: follower growth comparison, posting frequency comparison
- Table view with sortable metrics

### Pro Feature
- Free: 1 competitor
- Pro: Up to 10 competitors with historical tracking

---

## Phase 3: Multi-Platform Support (Instagram, TikTok, LinkedIn)

### Database Changes
- New table: `social_connections` (id, user_id, platform [facebook/instagram/tiktok/linkedin], platform_user_id, access_token_encrypted, account_name, created_at)
- Modify `audits` table: add `platform` column

### Backend
- `instagram-oauth/index.ts` — Instagram Business API connection (via Facebook Graph API)
- `run-audit/index.ts` — extend to handle different platforms
- Platform-specific metric fetchers

### Frontend
- Updated connection page: multi-platform selector
- Platform badges on audit reports
- Unified dashboard showing all platforms
- Platform filter on analytics page

### Implementation Note
- Instagram easiest (same Facebook Graph API)
- TikTok र LinkedIn require separate API registrations
- Phase 3 can be split: Instagram first, then others

---

## Phase 4: Unified Inbox

सबै platforms का comments र messages एकै ठाउँमा।

### Database Changes
- New table: `inbox_messages` (id, user_id, platform, sender_name, sender_avatar, message_text, message_type [comment/dm/mention], post_id, is_read, replied_at, created_at)
- New table: `inbox_replies` (id, message_id, reply_text, sent_at)

### Backend
- `sync-inbox/index.ts` — Facebook/Instagram comments र messages fetch
- `send-reply/index.ts` — reply via Graph API
- Facebook Webhook (`facebook-webhook`) extend to receive real-time notifications

### Frontend
- New page: `/dashboard/inbox`
- Left panel: message list with filters (all/unread/platform)
- Right panel: conversation thread with reply composer
- Real-time updates via Supabase Realtime
- Badge count on sidebar nav

### Pro Feature
- Free: View only (no reply)
- Pro: Reply + auto-response templates

---

## Recommended Build Order

| Order | Feature | Effort | Value |
|-------|---------|--------|-------|
| 1 | Content Planner + Scheduling | ~3-4 sessions | High — users can act on audit recommendations |
| 2 | Competitor Analysis | ~2-3 sessions | High — unique differentiator |
| 3 | Instagram Support | ~2 sessions | Medium — same API, easy win |
| 4 | Unified Inbox | ~3-4 sessions | Medium — complex but sticky |

---

## Technical Notes
- All new tables will have RLS policies matching the existing pattern (user_id = auth.uid())
- Tokens encrypted using existing `token-encryption.ts` shared module
- New features gated behind Pro subscription using existing `useSubscription` hook
- Calendar UI built with existing calendar component + custom grid
- All edge functions follow existing CORS + auth patterns

