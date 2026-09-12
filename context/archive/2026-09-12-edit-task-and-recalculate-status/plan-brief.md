# Edit Task and Recalculate Status - Plan Brief

> Full plan: `context/changes/edit-task-and-recalculate-status/plan.md`

## What & Why

Build the roadmap S-03 slice: a signed-in homeowner can edit an existing maintenance task and see recalculated next due date and status. This completes the PRD's FR-003 edit requirement while preserving the MVP business rule that status is derived from last completed date plus recurrence interval.

## Starting Point

The task storage and calculation baseline already exists. `updateMaintenanceTask` can update owned rows, and the dashboard already maps stored rows through shared helpers to derive next due date and status; the missing surface is edit UI plus an update route.

## Desired End State

Each task card exposes an inline edit form prefilled with name, last completed date, and recurrence interval. Saving posts to a dedicated update route, redirects back to the dashboard with a success banner, and the refreshed list shows recalculated derived fields and sorting.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Edit location | Inline expand form | Keeps the task context visible and matches the single-dashboard MVP shape. |
| Editable fields | Name, last completed date, recurrence interval | Fully satisfies FR-003 and proves recalculation from either scheduling input. |
| Save behavior | Redirect with `taskUpdated=1` banner | Matches create/complete flows and reloads authoritative server data. |
| Failure behavior | Generic task error banner | Keeps account-boundary details opaque and consistent with completion. |
| Missing/stale task | Generic failure | Avoids exposing whether a task belongs to another user or disappeared. |
| Route contract | `POST /api/tasks/update` | Keeps general editing separate from the fast completion action. |
| Verification | Helper plus route tests | Covers the highest-risk contract without needing live Supabase. |

## Scope

**In scope:**

- Dedicated update POST route.
- Inline edit form per task card.
- Editing task name, last completed date, and recurrence interval.
- Dashboard success/error banners for edit outcomes.
- Focused helper and route tests.
- Roadmap status sync to `planning`.

**Out of scope:**

- Database schema changes or stored derived status.
- Separate edit page, modal editor, or optimistic client-side save.
- Delete behavior.
- Shared households, reminders, templates, or AI scheduling.

## Architecture / Approach

Use the existing server-rendered dashboard and POST form pattern. The inline form submits source fields to `/api/tasks/update`; the route calls `updateMaintenanceTask` with the signed-in `userId`; the dashboard reload lists owned tasks and recalculates display state through `toMaintenanceTaskDisplayItems`.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Update route contract | Dedicated edit POST route and route tests | Route tests may need a small test seam around Astro context. |
| 2. Inline edit UI | Dashboard task-card editing and success banner | The expanded form must stay usable on mobile and not disrupt task actions. |
| 3. Verification and planning state | Helper coverage, full checks, roadmap consistency | Avoid adding duplicate status logic while broadening tests. |

**Prerequisites:** Existing S-01 create/view flow and S-02 completion baseline remain in place.
**Estimated effort:** One focused implementation session across three phases.

## Open Risks & Assumptions

- Assumes route-level tests can be written without live Supabase by mocking the store/Supabase seams or testing route-local helpers.
- Assumes inline native HTML disclosure or a similarly lightweight pattern is sufficient; no React state island is required unless implementation proves otherwise.
- Assumes generic edit errors are acceptable for MVP even when field-specific validation could be friendlier.

## Success Criteria (Summary)

- A signed-in homeowner can edit all task source fields from the dashboard.
- Saving reloads the task list with recalculated next due date, status, and urgency sorting.
- Account-scoped update behavior remains enforced by route auth, store filtering, and existing RLS.
