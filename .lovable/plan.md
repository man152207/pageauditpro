
# Site Audit: Admin Sidebar र Routing Issues

## 🔍 Problem Summary

तपाईंले रिपोर्ट गर्नुभएको issue सही छ! Sidebar मा multiple menu items देखिन्छन् तर **सबै routes मा एउटै page render हुन्छ**।

### Current Issue Analysis

| Section | Sidebar Menu | Route | Actual Page Component |
|---------|--------------|-------|----------------------|
| **User** | Overview | `/dashboard` | ✅ UserDashboard.tsx |
| | Run Audit | `/dashboard/audit` | ✅ ManualAuditPage.tsx |
| | Reports | `/dashboard/reports` | ❌ **UserDashboard.tsx** (गलत!) |
| | History | `/dashboard/history` | ❌ **UserDashboard.tsx** (गलत!) |
| | Billing | `/dashboard/billing` | ✅ BillingPage.tsx |
| **Admin** | Dashboard | `/admin` | ✅ AdminDashboard.tsx |
| | Users | `/admin/users` | ❌ **AdminDashboard.tsx** (गलत!) |
| | All Audits | `/admin/audits` | ❌ **AdminDashboard.tsx** (गलत!) |
| | Branding | `/admin/branding` | ❌ **AdminDashboard.tsx** (गलत!) |
| **Super Admin** | System | `/super-admin` | ✅ SuperAdminDashboard.tsx |
| | Users | `/super-admin/users` | ✅ UsersManagementPage.tsx |
| | Plans | `/super-admin/plans` | ✅ PlansManagementPage.tsx |
| | Settings | `/super-admin/settings/*` | ✅ SettingsLayout + nested |

---

## 📊 Architecture Diagram

```text
┌──────────────────────────────────────────────────────────────┐
│                    DASHBOARD LAYOUT                          │
│  ┌────────────────┐  ┌─────────────────────────────────────┐ │
│  │   SIDEBAR      │  │           MAIN CONTENT              │ │
│  │                │  │                                     │ │
│  │ ─ User ───────│  │   <Outlet /> renders:                │ │
│  │   Overview    │  │   ├── /dashboard → UserDashboard     │ │
│  │   Run Audit   │  │   ├── /dashboard/audit → ManualAudit │ │
│  │   Reports  ❌ │  │   ├── /dashboard/reports → ???       │ │
│  │   History  ❌ │  │   ├── /dashboard/history → ???       │ │
│  │   Billing     │  │   └── /dashboard/billing → Billing   │ │
│  │                │  │                                     │ │
│  │ ─ Admin ──────│  │   Admin Routes:                      │ │
│  │   Dashboard   │  │   ├── /admin → AdminDashboard        │ │
│  │   Users    ❌ │  │   ├── /admin/users → ???             │ │
│  │   Audits   ❌ │  │   ├── /admin/audits → ???            │ │
│  │   Branding ❌ │  │   └── /admin/branding → ???          │ │
│  │                │  │                                     │ │
│  └────────────────┘  └─────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
           ❌ = Page component missing or incorrectly mapped
```

---

## 🔴 Root Cause: App.tsx Routing

`App.tsx` मा routing configuration मा placeholder pages छन्:

```typescript
// Current problematic routes:
<Route path="reports" element={<UserDashboard />} />   // ← WRONG!
<Route path="history" element={<UserDashboard />} />   // ← WRONG!
<Route path="profile" element={<UserDashboard />} />   // ← WRONG!
<Route path="settings" element={<UserDashboard />} />  // ← WRONG!

<Route path="users" element={<AdminDashboard />} />    // ← WRONG!
<Route path="audits" element={<AdminDashboard />} />   // ← WRONG!
<Route path="branding" element={<AdminDashboard />} /> // ← WRONG!
```

---

## 📝 Missing Pages List

### User Panel (Priority: High)
| Page | Purpose | Complexity |
|------|---------|------------|
| `ReportsListPage.tsx` | List all audit reports with filters | Medium |
| `HistoryPage.tsx` | Audit history timeline | Medium |
| `ProfilePage.tsx` | User profile settings | Low |
| `UserSettingsPage.tsx` | User preferences (email, notifications) | Low |

### Admin Panel (Priority: Medium)
| Page | Purpose | Complexity |
|------|---------|------------|
| `AdminUsersPage.tsx` | Manage organization users, invite | Medium |
| `AdminAuditsPage.tsx` | View all audits from org users | Medium |
| `AdminBrandingPage.tsx` | Agency branding (logo, colors) | Low-Medium |

---

## ✅ What's Working Correctly

1. **Super Admin Panel** - पूर्ण रूपमा काम गर्छ:
   - Dashboard (`/super-admin`)
   - Users Management (`/super-admin/users`)
   - Plans Management (`/super-admin/plans`)
   - Settings with nested routes (`/super-admin/settings/*`)

2. **Authentication System** - Role-based access control सही छ:
   - `AuthContext` correctly loads roles from `user_roles` table
   - `isAdmin` र `isSuperAdmin` flags properly computed
   - `RoleGuard` component correctly protects routes

3. **Sidebar Navigation** - Menu structure सही छ:
   - Correct role-based visibility
   - Active state highlighting works
   - Navigation links are correct

---

## 🛠️ Implementation Plan

### Phase 1: User Panel Pages (Est: 2-3 hours)

**1. ReportsListPage.tsx**
- All audits list with pagination
- Filters: date range, score, status
- Link to individual report

**2. HistoryPage.tsx**
- Timeline view of audit activity
- Quick stats summary
- Export functionality (Pro only)

**3. ProfilePage.tsx**
- Edit full name, avatar
- Connected Facebook pages list
- Account actions (delete, export data)

**4. UserSettingsPage.tsx**
- Email notification preferences
- Timezone/language settings

### Phase 2: Admin Panel Pages (Est: 3-4 hours)

**5. AdminUsersPage.tsx**
- List org users with roles
- Invite new user form
- Edit/disable user actions

**6. AdminAuditsPage.tsx**
- All audits from org users
- Filter by user, date, status
- Bulk export CSV

**7. AdminBrandingPage.tsx**
- Logo upload
- Brand colors picker
- Preview branded report

### Phase 3: Routing Updates (Est: 30 min)
- Update `App.tsx` with correct component mappings
- Add any missing guards

---

## 🔒 Security Considerations

All pages will need:
1. **RLS Policies** - Already in place for most tables
2. **Role Checks** - Frontend guards + edge function verification
3. **Organization Scope** - Admin sees only their org's data

---

## 📋 Recommendation

**Option A: Full Implementation** (Recommended)
- Create all 7 missing pages
- Complete, production-ready panels
- Est. time: 5-7 hours

**Option B: MVP First**
- Create only Reports + History pages
- Admin pages as placeholders
- Est. time: 2-3 hours

---

## Technical Details

### Database Tables Already Available
- `audits` - Has `user_id`, `organization_id` for filtering
- `profiles` - User profile data
- `user_roles` - Role assignments
- `organizations` - Org settings (branding storage needed)

### Hooks to Create
- `useOrganizationAudits()` - Admin level audit fetching
- `useOrganizationUsers()` - Admin level user management
- `useBrandingSettings()` - Agency branding CRUD

