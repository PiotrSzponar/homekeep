# Complete Task And Refresh Status - Plan Brief

> Full plan: `context/changes/complete-task-and-refresh-status/plan.md`

## What & Why

HomeKeep needs the next core maintenance loop: a homeowner marks a saved task as completed and immediately sees last completed date, next due date, and status update. This implements PRD `FR-005` while preserving the MVP rule that next due date and status are derived from canonical task fields.

## Starting Point

The create/list slice is already implemented and reviewed: `/dashboard` loads owned tasks, maps rows through derived-state helpers, and displays each task with status. The store already exposes an owner-scoped `updateMaintenanceTask()` helper, so completion can be a small vertical slice rather than a new data model.

## Desired End State

Each task row has a `Mark completed` action. Submitting it updates that task's `last_completed_date` to the app's current UTC date-only value, redirects back to the dashboard, and shows a success banner with recalculated next due date/status from fresh Supabase data.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Completion date | App current UTC date | Keeps completion consistent with existing date-only status helpers and leaves backdating to the later edit slice. |
| Success feedback | Dashboard banner | Matches the existing create-task redirect pattern and confirms a persisted refresh. |
| Repeat completion | Idempotent | Double-clicks or stale pages should not create false user-facing errors. |
| Failure copy | Generic error | Avoids leaking whether an inaccessible task ID exists. |
| Data model | No stored status fields | Preserves the existing derived-status contract from `last_completed_date` plus recurrence interval. |

## Scope

**In scope:**

- `POST /api/tasks/complete` protected by the existing `/api/tasks` middleware boundary.
- Per-row `Mark completed` form in the dashboard task list.
- Dashboard success/error query-state handling for completion.
- Focused tests for any exported date-only helper needed by the route.
- Manual smoke checks for refreshed status, repeat completion, and owner scoping.

**Out of scope:**

- Edit, delete, or backdated completion UI.
- Completion history or audit logging.
- Reminders, prebuilt task libraries, AI scheduling, or shared households.
- Database schema changes.

## Architecture / Approach

Use the existing server-rendered form-post pattern. The task row submits only `taskId`; the route gets the authenticated user from `Astro.locals`, computes the app's current UTC date-only value, calls `updateMaintenanceTask()`, and redirects to `/dashboard`. The dashboard reloads tasks from Supabase and reuses `toMaintenanceTaskDisplayItems()` for next due date/status.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Protected Completion Route | Owner-scoped POST route that writes today's completion date | Accidentally trusting browser-provided owner/date/status values |
| 2. Dashboard Completion Control | Per-task form and completion feedback banner | Crowding task rows or duplicating status logic in markup |
| 3. Verification And Closeout | Tests and smoke checklist for completion behavior | Missing the inaccessible-task or repeat-click edge cases |

**Prerequisites:** S-01 code is present and implementation-reviewed; hosted Supabase has the existing `maintenance_tasks` schema.
**Estimated effort:** One focused implementation session across 3 small phases.

## Open Risks & Assumptions

- Roadmap still shows S-01 as `in-progress`, but the S-01 implementation review is approved; S-02 assumes the current code is the available baseline.
- Production smoke depends on an environment with signed-in users and the hosted `maintenance_tasks` migration applied.

## Success Criteria (Summary)

- A signed-in homeowner can click `Mark completed` and return to the dashboard with a success banner.
- The task row shows the app's current UTC date as `Last done`, with next due date/status recalculated from persisted data.
- Invalid, missing, or cross-account task IDs do not update data and show only a generic dashboard error.
