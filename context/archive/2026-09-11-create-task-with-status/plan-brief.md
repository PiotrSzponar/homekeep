# Create Task And Show Calculated Status - Plan Brief

> Full plan: `context/changes/create-task-with-status/plan.md`

## What & Why

Build the first user-visible HomeKeep task loop. A signed-in homeowner can create a maintenance task from `/dashboard` and immediately see the saved task with calculated next due date and status.

## Starting Point

Auth, dashboard protection, Supabase client setup, the `maintenance_tasks` table contract, task store helpers, and status/date helpers already exist. The dashboard is still a placeholder and there is no task create route or task list UI.

## Desired End State

`/dashboard` becomes the MVP task surface: it contains an inline form, shows empty/success/error states, lists saved owned tasks, and displays `OK`, `Due soon`, or `Overdue` from the shared helper logic. A successful create redirects back to the dashboard and reloads the task from Supabase.

## Key Decisions Made

| Decision | Choice | Why |
| --- | --- | --- |
| Create flow | Inline dashboard form | Fastest path to the PRD's first value loop. |
| Submit path | `POST /api/tasks/create` | Matches existing Astro auth route pattern and works without client-side JS. |
| Ordering | Due-first | Supports fast scanning of what needs attention first. |
| Error UX | Query-string dashboard banner | Consistent with existing redirect-based auth errors. |
| Success UX | Redirect and reload from DB | Proves persistence instead of relying on optimistic UI. |
| Production schema | Manual prerequisite | Hosted Supabase must have the F-01 migration before production smoke. |
| Tests | Helper tests plus manual smoke | Good confidence without full auth E2E setup in this slice. |

## Scope

**In scope:**

- Protected task create route.
- Inline dashboard create form.
- Server-rendered owned task list.
- Calculated next due date and status display.
- Due-first sorting helper and tests.
- Manual production smoke checklist.

**Out of scope:**

- Edit, delete, and mark-completed flows.
- Shared homes, roles, invitations, admin surfaces.
- Reminders, calendar integrations, task templates, AI recommendations.
- Database schema changes.

## Architecture / Approach

The dashboard renders server-side. It uses `createClient`, `Astro.locals.user`, `listMaintenanceTasks`, and task domain helpers to load and present owned tasks. The create form posts to `/api/tasks/create`, which validates form data through the F-01 store helper, inserts with the authenticated `user.id`, and redirects back to `/dashboard`.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Protected Create Route | Auth-protected POST route that writes owned tasks | Accidentally trusting browser-provided owner data |
| 2. Dashboard Task Experience | Inline form, empty state, due-first list, status display | Duplicating status logic in UI instead of shared helpers |
| 3. Verification And Production Smoke | Tests and manual smoke checklist | Production smoke blocked if hosted migration is missing |

**Prerequisites:** F-01 migration exists in source; hosted Supabase migration must be applied before production smoke.
**Estimated effort:** ~2-3 focused sessions across 3 phases.

## Open Risks & Assumptions

- The archived F-01 notes say hosted Supabase migration application was not proven during that run; S-01 production smoke depends on applying it.
- Query-string error UX is intentionally simple and may be improved in later slices.
- Due-first sorting is in app code for MVP scale.

## Success Criteria (Summary)

- Signed-in user creates a task from `/dashboard`.
- Saved task displays name, calculated next due date, and exactly one status.
- Tasks are owner-scoped and sorted so urgent work is easiest to scan.
