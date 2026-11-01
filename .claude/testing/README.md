# Unifitz testing

One folder per app. Same layout in each, so a test written for web can be ported to the
matching mobile app without re-deriving it.

```
.claude/testing/
  README.md                 this file
  web/                      web app (qa-my-app plugin catalog; `QA-tests` at repo root symlinks here)
    catalog.md              human index: route → auth → roles → tasks
    catalog.json            machine index (plugin, v3)
    checkpoint.md           what was tested, when, result, at which git commit
    routes/<slug>.md        element inventory per page (forms, buttons, modals)
    tasks/T<NN>-<slug>.md   executable test per page/flow (happy path, validation, modals, edge cases)
    results/                per-run results + history.json / latest.json (plugin)
    .qa-catalog/
      fingerprints.json     sha256 of every source file a task covers  ← the checkpoint
      auth.local.json       test logins per role (gitignored, passwords are ${ENV_VAR} refs)
      state/                saved browser sessions (gitignored)
  mobile-admin/             ../unifitz_admin   (same layout, later)
  mobile-student/           ../unifitz_student (same layout, later)
  mobile-teacher/           ../unifitz_teacher (same layout, later)
```

Task files are grouped by area through their slug: `public-*`, `client-*`, `teacher-*`,
`staff-*` (teacher + admin shared pages), `admin-*`, `shared-*` (e.g. Notifications).

## Checkpoint rule (don't retest what hasn't changed)
1. Every task lists the source files it covers; their hashes live in `.qa-catalog/fingerprints.json`.
2. After a change, run `/qa-my-app:status` → shows drifted routes.
3. Run `/qa-my-app:verify` (current diff) or `/qa-my-app:sync` (re-author drifted tasks only).
4. Only drifted tasks re-run. Untouched tasks keep their last PASS from `checkpoint.md`.
5. After a run, update `checkpoint.md` with commit SHA + result per task.

A task is re-run anyway when: shared code it imports changed (`ui.jsx`, `DashboardLayout.jsx`,
`lib/*`), an SQL migration touching its tables ran, or it last FAILED/BLOCKED.

## Commands
| Command | Use |
|---|---|
| `/qa-my-app:status` | health, drift, last results (read-only) |
| `/qa-my-app:run-all` | full suite (first baseline, or before a release) |
| `/qa-my-app:run T07-client-home` | one task |
| `/qa-my-app:verify` | only what the current diff touches |
| `/qa-my-app:sync` | rescan drifted pages, re-author their tasks |

## Safety rules (tests run against production Supabase)
- Log in only as the QA test accounts in `auth.local.json`; never as a real member.
- Everything a test creates is named `QA-<thing>-<date>` so it can be found and cleaned.
- Destructive confirms (delete/remove/end class) only when a task's step says so, and only on `QA-` items.
- Roster/remark/notification tests use QA accounts as the students, so no real member gets notified.

## Logging in (automation)
Login is email OTP. The runner logs in with the master code (`master-login` edge fn):
- `MASTER_LOGIN_CODE` Supabase secret = `VITE_MASTER_CODE` in local `.env` only.
- `export QA_CRED_CLIENT_PASSWORD=<code> QA_CRED_TEACHER_PASSWORD=<code> QA_CRED_ADMIN_PASSWORD=<code>`
- Never set `VITE_MASTER_CODE` on Vercel: every `VITE_*` var ships in the public JS bundle.

## Porting to mobile
Copy a web task, keep its ID and acceptance list, swap steps for the Flutter screen.
Mark per-task parity in each app's `checkpoint.md` (`web PASS @sha → mobile ?`).
