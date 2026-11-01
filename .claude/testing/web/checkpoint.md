# Web checkpoint

Last baseline: _none yet_ (routes discovered 2026-10-31, 59 routes → `.qa-catalog/routes.json`).

| Area | Routes | Tasks | Last result | Commit | Date |
|---|---|---|---|---|---|
| public (anonymous) | 19 | – | – | – | – |
| onboarding | 1 | – | – | – | – |
| client `/app` | 15 | – | – | – | – |
| teacher `/teacher` | 11 | – | – | – | – |
| admin `/admin` | 19 | – | – | – | – |

7 routes are redirect-only. Test them as one-line redirect checks, not full tasks.

Cross-cutting cases to cover:
- Staff preview mode (`localStorage uf_preview_student=1`) lets teacher/admin into `/app/*`.
- Shared staff pages branch on role (LiveClasses, LiveClassDetail, SeriesDetail, SeriesMembersPage,
  Notifications, StaffProfile, Recipes). Test as teacher and as admin. Admin must not see ratings.
- `/app/live/:id` is RLS-private. A non-roster client must see an empty page, not data.
- Wrong role → own home. Signed-out → `/auth`. Client with onboarding not done → `/onboarding`.
