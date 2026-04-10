

# Add SEO & Blog Management to Super Admin Sidebar

## What
Add two new navigation items to the Super Admin sidebar section so admins can quickly access SEO management and Blog management directly from the dashboard sidebar.

## Changes

### 1. Update `src/components/layout/DashboardLayout.tsx`
- Add `Globe` and `FileText` icons from lucide-react imports
- Add two new entries to `superAdminNavItems`:
  - `{ href: '/super-admin/settings/page-seo', label: 'SEO Manager', icon: Globe, roles: ['super_admin'] }`
  - `{ href: '/super-admin/blog', label: 'Blog Manager', icon: FileText, roles: ['super_admin'] }`

That's it — the routes and pages already exist (`PageSEOSettings` at `/super-admin/settings/page-seo` and `BlogManagementPage` at `/super-admin/blog`). This just adds sidebar links for quick access.

