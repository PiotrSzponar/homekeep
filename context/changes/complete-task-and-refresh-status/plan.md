# Implementation Plan: Complete Task And Refresh Status

## Overview

Build the next HomeKeep maintenance loop: a signed-in homeowner can mark a saved maintenance task as completed, and the dashboard refreshes to show the updated last completed date, next due date, and derived status. This implements roadmap slice `S-02` and reuses the owner-scoped task storage and derived-status helpers already established by `F-01` and consumed by `S-01`.

## Current State Analysis

- `S-02` is defined in `context/foundation/roadmap.md` as "Mark task completed" with PRD references `FR-005`, `FR-002`, `FR-006`, and Business Logic.
- `S-01` is implemented, implementation-reviewed, and present in code: `/dashboard` lists authenticated user tasks, shows derived status, and posts creates through `/api/tasks/create`.
- `context/foundation/roadmap.md` still marks `S-01` as `in-progress`, but `context/changes/create-task-with-status/reviews/impl-review.md` approved that implementation with no findings.
- `src/middleware.ts` already protects `/api/tasks`, so a completion route under that prefix inherits the existing authenticated boundary.
- `src/lib/maintenance-task-store.ts` already exports `updateMaintenanceTask(supabase, userId, taskId, input)`, which updates only rows matching the authenticated user's ID.
- `src/lib/maintenance-tasks.ts` derives `nextDueDate` and `status` from `last_completed_date` plus `recurrence_interval_days`; this slice should not store derived status fields.
- The dashboard already uses redirect query parameters for task create success and error feedback, so completion should follow the same form-post and redirect pattern.

## Implementation Approach

Keep completion as a server-rendered form action. Add a protected `POST /api/tasks/complete` route that accepts a task ID, writes the app's current UTC date-only value as `last_completed_date` through `updateMaintenanceTask`, and redirects back to `/dashboard` with completion success or generic error state. Add a "Mark completed" control to each task row and let the existing dashboard reload path recalculate next due date/status from Supabase rows.

## Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Completion date | App current UTC date (`YYYY-MM-DD`) | Supports the PRD's fast completion action, matches the existing date-only helper semantics, and avoids adding date-entry UI that belongs in the later edit slice. |
| Success feedback | Redirect banner on `/dashboard` | Matches the existing create-task UX and proves refreshed persistence by reloading from Supabase. |
| Repeat completion | Idempotent if already completed today | Handles double-clicks or stale pages without false failures. |
| Inaccessible task failure | Generic dashboard error | Avoids leaking whether another user's task ID exists while keeping form-post UX consistent. |
| Derived status | Recalculate on dashboard render | Preserves the existing rule that next due date and status are computed, not stored. |
| Ownership | Authenticated `user.id` plus store filter/RLS | Reuses the existing flat homeowner access model and never trusts owner data from the browser. |

## What We're Not Doing

- No edit task flow or backdated completion form.
- No delete task flow.
- No reminders, calendars, or notifications.
- No prebuilt task library or AI-generated schedule suggestions.
- No shared homes, household members, roles, invitations, or admin views.
- No stored `next_due_date`, stored `status`, completion history, or audit log.
- No optimistic client-side mutation; the dashboard should show persisted state after redirect.

## Phase 1: Protected Completion Route

### Overview

Add the server write path that marks one owned maintenance task completed.

### Changes Required:

#### 1. Completion API route

**File**: `src/pages/api/tasks/complete.ts`

**Intent**: Accept task-row completion form posts and update only the authenticated homeowner's matching task.

**Contract**: Export `POST: APIRoute`. The handler must:
- require `context.locals.user?.id`;
- create the Supabase client with `createClient(context.request.headers, context.cookies)`;
- read `taskId` from `FormData` as a string;
- use the app's current UTC date formatted as `YYYY-MM-DD` as the new `lastCompletedDate`;
- call `updateMaintenanceTask(supabase, user.id, taskId, { lastCompletedDate })`;
- never accept `user_id`, `lastCompletedDate`, `nextDueDate`, or `status` from the browser for this action;
- redirect to `/dashboard?taskCompleted=1` on success;
- redirect to `/dashboard?taskError=<encoded generic message>` for missing ID, inaccessible task, store failure, or configuration failure after an authenticated request reaches the handler.

#### 2. Completion date helper if needed

**File**: `src/lib/maintenance-tasks.ts`

**Intent**: Avoid duplicating date-only formatting logic in the API route if the existing private helper needs to be reused.

**Contract**: If the route needs a shared formatter, export a narrowly named helper for producing the app's current UTC `YYYY-MM-DD` date from a `Date`. Keep existing behavior and tests intact.

### Success Criteria:

#### Automated Verification:

- `src/pages/api/tasks/complete.ts` exists and exports a POST handler.
- The route calls `updateMaintenanceTask` with `context.locals.user.id`, not a browser-provided owner value.
- The route does not read completion date, next due date, or status from form data.
- Completion success redirects to `/dashboard?taskCompleted=1`.
- Completion failure redirects to `/dashboard?taskError=<encoded generic message>`.
- `npm run lint` passes.
- `npm run build` passes.

#### Manual Verification:

- Review confirms an anonymous completion POST cannot update a task.
- Review confirms a forged task ID owned by another account receives only a generic dashboard error path.

---

## Phase 2: Dashboard Completion Control

### Overview

Expose the completion action in the existing task list and show refreshed dashboard feedback after redirect.

### Changes Required:

#### 1. Dashboard query-state handling

**File**: `src/pages/dashboard.astro`

**Intent**: Show a success banner after completion using the same query-string feedback style as task creation.

**Contract**: Read `taskCompleted=1` from `Astro.url.searchParams` and render a short success message near the existing task-created and task-error banners. The task list must still be loaded from Supabase after the redirect, so derived dates/statuses reflect persisted data.

#### 2. Task-row completion form

**File**: `src/components/tasks/TaskList.astro`

**Intent**: Give each saved task a fast action to mark it completed without adding edit-slice behavior.

**Contract**: Render a form for each task posting to `/api/tasks/complete` with hidden field `taskId=<task.id>` and a submit control labeled `Mark completed`. The control should fit the existing compact task-row layout, remain usable on mobile, and not require client-side JavaScript.

#### 3. UI copy and state boundaries

**File**: `src/components/tasks/TaskList.astro`

**Intent**: Keep the row focused on the MVP recurrence loop: status, dates, recurrence, and completion.

**Contract**: Do not add edit/delete controls in this slice. Do not disable completion based on status; the route is idempotent when the task is already completed today.

### Success Criteria:

#### Automated Verification:

- `npm run lint` passes.
- `npm run build` passes.
- The completion form posts to `/api/tasks/complete` with only the task ID as task-specific browser input.
- Dashboard imports and task display still use `toMaintenanceTaskDisplayItems` rather than redefining status logic in markup.

#### Manual Verification:

- A signed-in user sees `Mark completed` on each saved task.
- Clicking `Mark completed` redirects to `/dashboard?taskCompleted=1`.
- The success banner appears after redirect.
- The completed row shows the app's current UTC date as `Last done`.
- The row's next due date and status reflect the app's current UTC completion date plus the existing recurrence interval.
- Clicking `Mark completed` again on the same day does not show an error.

---

## Phase 3: Verification And Closeout

### Overview

Lock the completion behavior with focused tests and document the manual smoke path.

### Changes Required:

#### 1. Completion date tests

**File**: `src/lib/maintenance-tasks.test.ts`

**Intent**: Cover any exported date-only helper added for the route and preserve existing due-date/status behavior.

**Contract**: If a new helper is exported, test that it returns the expected UTC `YYYY-MM-DD` string for a fixed `Date`. Existing tests for derived display state and status ordering must continue to pass.

#### 2. Route-level review checklist

**File**: `context/changes/complete-task-and-refresh-status/plan.md`

**Intent**: Make the security-sensitive parts of completion verification explicit for implementers and reviewers.

**Contract**: During implementation, record the commands run and whether manual checks proved anonymous POST protection, owner-scoped updates, idempotent repeat completion, and refreshed dashboard status.

#### 3. Roadmap prerequisite check

**File**: `context/foundation/roadmap.md`

**Intent**: Keep roadmap state forward-only and accurate as S-02 starts implementation.

**Contract**: Do not regress `S-01`. If S-01 is still shown as `in-progress` when S-02 implementation begins, note that S-02 depends on the reviewed S-01 code already present in the repository and that roadmap archival can be handled by the normal `/10x-archive` flow.

### Success Criteria:

#### Automated Verification:

- `npm run test` passes.
- `npm run lint` passes.
- `npm run build` passes.
- Tests cover any newly exported date-only helper used by the completion route.

#### Manual Verification:

- Signed-in local or production smoke confirms marking a task completed updates `Last done` to the app's current UTC date.
- Smoke confirms the task's `Next due` and status update after redirect.
- Smoke confirms repeat completion on the same day remains successful.
- Smoke confirms an inaccessible or invalid task ID shows a generic dashboard error.
- If a second account is available, smoke confirms one account cannot complete another account's task.

---

## Testing Strategy

### Unit Tests:

- Keep existing task contract tests for next due date, status classification, display mapping, and due-first sorting.
- Add a date-only helper test only if completion route logic requires exporting one from `src/lib/maintenance-tasks.ts`.

### Integration / Contract Tests:

- `npm run build` must compile the Astro route, dashboard, and task list form changes.
- `npm run lint` must cover new Astro and TypeScript files.
- No automated Supabase integration test is required for this slice; owner scoping is enforced by the existing store filter and RLS migration.

### Manual Testing Steps:

1. Sign in and open `/dashboard` with at least one saved task.
2. Click `Mark completed` on a task.
3. Confirm redirect returns to `/dashboard?taskCompleted=1`.
4. Confirm the success banner appears.
5. Confirm `Last done` is the app's current UTC date.
6. Confirm `Next due` equals the app's current UTC date plus the task's recurrence interval.
7. Confirm the status is recalculated from the refreshed next due date.
8. Click `Mark completed` again and confirm it remains successful.
9. Submit an invalid or inaccessible `taskId` and confirm a generic dashboard error.
10. If a second account is available, confirm it cannot complete the first account's task.

## Performance Considerations

The MVP task volume is small. A single owner-scoped update followed by a dashboard reload and in-memory derived-state sorting is sufficient. If task counts grow later, pagination and more targeted refresh behavior can be planned separately.

## Migration Notes

This slice does not add or change database schema. It depends on the existing `maintenance_tasks` table and owner-only update policy from `supabase/migrations/20260911130500_create_maintenance_tasks.sql`.

## References

- Roadmap item: `context/foundation/roadmap.md` (`S-02`)
- Product contract: `context/foundation/prd.md` (`FR-005`, `FR-002`, `FR-006`, Business Logic)
- Prior slice: `context/changes/create-task-with-status/plan.md`
- Prior review: `context/changes/create-task-with-status/reviews/impl-review.md`
- Dashboard: `src/pages/dashboard.astro`
- Task list: `src/components/tasks/TaskList.astro`
- Auth middleware: `src/middleware.ts`
- Supabase client: `src/lib/supabase.ts`
- Task store helpers: `src/lib/maintenance-task-store.ts`
- Task domain helpers: `src/lib/maintenance-tasks.ts`
- Existing task tests: `src/lib/maintenance-tasks.test.ts`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` - <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Protected Completion Route

#### Automated

- [x] 1.1 `src/pages/api/tasks/complete.ts` exists and exports a POST handler. - 3d8def9
- [x] 1.2 The route calls `updateMaintenanceTask` with `context.locals.user.id`, not a browser-provided owner value. - 3d8def9
- [x] 1.3 The route does not read completion date, next due date, or status from form data. - 3d8def9
- [x] 1.4 Completion success redirects to `/dashboard?taskCompleted=1`. - 3d8def9
- [x] 1.5 Completion failure redirects to `/dashboard?taskError=<encoded generic message>`. - 3d8def9
- [x] 1.6 `npm run lint` passes. - 3d8def9
- [x] 1.7 `npm run build` passes. - 3d8def9

#### Manual

- [x] 1.8 Review confirms an anonymous completion POST cannot update a task. - 3d8def9
- [x] 1.9 Review confirms a forged task ID owned by another account receives only a generic dashboard error path. - 3d8def9

### Phase 2: Dashboard Completion Control

#### Automated

- [x] 2.1 `npm run lint` passes.
- [x] 2.2 `npm run build` passes.
- [x] 2.3 The completion form posts to `/api/tasks/complete` with only the task ID as task-specific browser input.
- [x] 2.4 Dashboard imports and task display still use `toMaintenanceTaskDisplayItems` rather than redefining status logic in markup.

#### Manual

- [x] 2.5 A signed-in user sees `Mark completed` on each saved task.
- [x] 2.6 Clicking `Mark completed` redirects to `/dashboard?taskCompleted=1`.
- [x] 2.7 The success banner appears after redirect.
- [x] 2.8 The completed row shows the app's current UTC date as `Last done`.
- [x] 2.9 The row's next due date and status reflect the app's current UTC completion date plus the existing recurrence interval.
- [x] 2.10 Clicking `Mark completed` again on the same day does not show an error.

### Phase 3: Verification And Closeout

#### Automated

- [ ] 3.1 `npm run test` passes.
- [ ] 3.2 `npm run lint` passes.
- [ ] 3.3 `npm run build` passes.
- [ ] 3.4 Tests cover any newly exported date-only helper used by the completion route.

#### Manual

- [ ] 3.5 Signed-in local or production smoke confirms marking a task completed updates `Last done` to the app's current UTC date.
- [ ] 3.6 Smoke confirms the task's `Next due` and status update after redirect.
- [ ] 3.7 Smoke confirms repeat completion on the same day remains successful.
- [ ] 3.8 Smoke confirms an inaccessible or invalid task ID shows a generic dashboard error.
- [ ] 3.9 If a second account is available, smoke confirms one account cannot complete another account's task.
