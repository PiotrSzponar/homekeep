# Delete Task - Plan Brief

> Full plan: `context/changes/delete-task/plan.md`

## What & Why

Build the roadmap S-04 slice: a signed-in homeowner can permanently delete one of their own maintenance tasks. This completes the PRD's FR-004 requirement while preserving the MVP's flat account-scoped access model.

## Starting Point

The data layer already has `deleteMaintenanceTask`, and the database has an own-row delete RLS policy. The store still needs a row-match contract so stale or cross-account task IDs do not look like successful deletes. The dashboard currently lists tasks and supports mark completed, but it has no delete action, delete route, or delete success feedback.

## Desired End State

Each saved task exposes a Delete action with browser confirmation. Confirming posts to a dedicated delete route, reloads the dashboard with a success banner, and the deleted task is absent from the refreshed list.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Delete confirmation | Browser confirm | Adds a guardrail without adding custom client state. |
| Route contract | `POST /api/tasks/delete` | Matches create/complete route style and keeps destructive behavior explicit. |
| Missing/stale task | Generic error | Preserves account-boundary opacity and matches current task failure patterns. |
| Success feedback | Redirect with `taskDeleted=1` banner | Matches existing mutation flows and reloads authoritative data. |
| Verification | Route tests plus lint/build | Covers the destructive POST contract without adding browser test infrastructure. |

## Scope

**In scope:**

- Dedicated delete POST route.
- Per-task Delete action on the dashboard.
- Browser confirmation before form submission.
- Dashboard success/error banners for delete outcomes.
- Focused route tests and final lint/build verification.
- Roadmap status sync to `planning`.

**Out of scope:**

- Soft delete, undo, restore, or trash.
- Bulk deletion.
- Schema changes or deletion metadata.
- Shared household or admin deletion behavior.
- Optimistic client-side removal.

## Architecture / Approach

Use the existing server-rendered dashboard and POST form pattern. The store first treats zero matched delete rows as a generic failure; then the task card submits `taskId` to `/api/tasks/delete`, the route calls `deleteMaintenanceTask` with the signed-in `userId`, and the dashboard reloads the owned task list from Supabase.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Delete route contract | Store row-match contract, dedicated delete POST route, and route tests | Failed deletes must not disclose ownership or missing-row details. |
| 2. Dashboard delete UI | Task-card Delete action and success banner | Destructive action needs confirmation and must not crowd existing controls. |
| 3. Verification and planning state | Final checks, manual destructive-flow verification, roadmap consistency | Manual testing must use disposable task data. |

**Prerequisites:** Existing S-01 create/view flow and task storage contract remain in place.
**Estimated effort:** One focused implementation session across three phases.

## Open Risks & Assumptions

- Assumes native browser confirmation is acceptable for MVP polish.
- Assumes route-level tests can avoid live Supabase via helper seams or mocks.
- Assumes permanent deletion is acceptable because PRD explicitly excludes preserving deleted tasks for the MVP.

## Success Criteria (Summary)

- A signed-in homeowner can delete one of their own saved tasks from the dashboard.
- Canceling confirmation does not submit deletion.
- Successful deletion reloads the list and the task no longer appears.
