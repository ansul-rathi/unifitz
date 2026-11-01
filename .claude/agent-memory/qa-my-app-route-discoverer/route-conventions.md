---
name: route-conventions
description: Unifitz web route gating — single Protected(role) wrapper in src/App.jsx, preview-mode bypass for /app, no feature flags
metadata:
  type: project
---

All routes are declared in one `<Routes>` tree in src/App.jsx; there is no separate router file. Role gating is done only by the `Protected({role})` wrapper in that file. `/app/*` = client, `/teacher/*` = teacher, `/admin/*` = admin. Every subtree is wrapped in DashboardLayout.

**Why:** I checked it once on 2026-10-31. Pages under src/pages/staff and some under src/pages/admin (SeriesDetail, SeriesMembersPage, Notifications, LiveClasses/Detail) are mounted under both teacher and admin. Inside the page they branch on `profile.role === 'admin'`, not through the route.

**How to apply:**
- Teacher/admin with `ViewModeContext.preview` (localStorage `uf_preview_student=1`) can enter `/app`.
- A client whose `!onboarding_complete` is true gets redirected to /onboarding.
- The real data boundary is Supabase RLS, not the routes.
- When this was checked there were no feature-flag hooks and no HTTP handlers, because it is a pure SPA.
