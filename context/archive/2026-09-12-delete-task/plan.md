# Delete Task Implementation Plan

## Overview

Add permanent deletion for existing maintenance tasks from the dashboard. A signed-in homeowner can delete one of their own tasks through a confirmed action, return to the refreshed dashboard, and no longer see that task in the list.

## Current State Analysis

HomeKeep already has most of the data-layer and database ownership pieces needed for delete. The existing store function filters by both task id and user id, but it still needs a row-match contract so stale or cross-account IDs are treated as failures instead of successful no-ops. The remaining missing pieces are a delete route, a task-card delete action, a dashboard success banner, and focused verification around the destructive route contract.

## Desired End State

A signed-in homeowner can click Delete on a task card, confirm the browser prompt, and submit a POST request that deletes only that homeowner's task. The dashboard reloads from Supabase, shows a success banner, and the deleted task is absent from the refreshed list. Missing, stale, or cross-account task IDs return to the dashboard with a generic task error.

### Key Discoveries:

- `src/lib/maintenance-task-store.ts:108` already exposes `deleteMaintenanceTask(supabase, userId, taskId)` and filters by both `id` and `user_id`, but the current delete call does not prove that a row was actually deleted.
- `supabase/migrations/20260911130500_create_maintenance_tasks.sql` includes `maintenance_tasks_delete_own`, so the database also enforces own-row deletion.
- `src/middleware.ts:4` protects `/api/tasks`, so a delete route under that prefix inherits the same authentication gate as create and complete.
- `src/pages/api/tasks/complete.ts:10` establishes the POST route pattern for a task mutation with hidden `taskId`, generic error redirect, and success redirect.
- `src/components/tasks/TaskList.astro:69` currently renders the only per-task action, `Mark completed`; delete should join this action area without changing status calculation or task sorting.
- `context/foundation/roadmap.md:115` defines S-04 as delete behavior and identifies the main risk as deleting across account boundaries or leaving the list visually stale.

## What We're NOT Doing

- No soft delete, trash, restore, or undo behavior.
- No schema migration or new deletion metadata.
- No bulk deletion.
- No shared-household, role, invite, or admin deletion behavior.
- No client-side optimistic removal; the dashboard should reload authoritative data after the route redirects.
- No separate task details page.

## Implementation Approach

Follow the existing server-rendered POST form pattern. First tighten `deleteMaintenanceTask` so success means one owned row was deleted and zero matched rows return a store error. Then add `POST /api/tasks/delete`, parse a hidden `taskId`, call the store function with the signed-in user id, and redirect to `/dashboard?taskDeleted=1` on success or generic `taskError` on failure. Add a Delete button to each task card with native browser confirmation and a dashboard success banner for `taskDeleted=1`.

## Critical Implementation Details

Deletion is permanent for the MVP. The delete UI must require confirmation before form submission because there is no undo or restore path. The route should not expose whether a failed delete targeted a missing row, stale task id, or another user's task.

## Phase 1: Delete Route Contract

### Overview

Add a dedicated API route for deleting one owned task by id.

### Changes Required:

#### 1. Store Delete Contract

**File**: `src/lib/maintenance-task-store.ts`

**Intent**: Make the store contract distinguish a real owned-row deletion from a no-op caused by a stale, missing, or cross-account task id.

**Contract**: Update `deleteMaintenanceTask` so it still filters by `id` and `user_id`, but returns success only when Supabase confirms one matching row was deleted. If no owned row matches, return `{ data: null, error: { message: "Unable to delete task." } }` or an equivalent generic store error that the route maps to the generic task error.

#### 2. Task Delete API Route

**File**: `src/pages/api/tasks/delete.ts`

**Intent**: Add an explicit route for permanent task deletion while preserving the existing task mutation pattern.

**Contract**: Accept `POST` form field `taskId`; require `context.locals.user?.id`; create the Supabase client with `createClient(context.request.headers, context.cookies)`; call `deleteMaintenanceTask(supabase, userId, taskId)`; redirect to `/dashboard?taskDeleted=1` on success; redirect to `/dashboard?taskError=<encoded generic message>` for missing Supabase config, missing task id, store errors, stale IDs, and cross-account IDs.

#### 3. Route Form Parsing

**File**: `src/pages/api/tasks/delete.ts`

**Intent**: Keep parsing local and consistent with `create.ts` and `complete.ts`.

**Contract**: Use a route-local `stringFormValue(form, "taskId").trim()` helper pattern. A blank `taskId` must not call the store and must redirect with the generic task error.

#### 4. Route-Level Test Coverage

**File**: `src/pages/api/tasks/delete.test.ts`

**Intent**: Cover the destructive route contract without requiring live Supabase credentials.

**Contract**: Exercise the exported `POST` handler or route-local test seams for signed-in success, missing `taskId`, unauthenticated redirect, missing Supabase config, store failure, and no-owned-row deletion failure. If direct Astro route testing is too coupled to framework internals, extract only minimal pure helpers needed to test form parsing and redirect decisions.

### Success Criteria:

#### Automated Verification:

- `deleteMaintenanceTask` distinguishes one deleted owned row from zero matched rows.
- Delete route exists at `src/pages/api/tasks/delete.ts`.
- Route tests cover signed-in success, missing task id, unauthenticated redirect, missing Supabase config, failed store deletion, and no-owned-row deletion failure.
- `npm run test` passes.
- `npm run lint` passes.

#### Manual Verification:

- Submitting a valid delete for a signed-in user's own task redirects to `/dashboard?taskDeleted=1`.
- Submitting with a missing or stale task id returns to the dashboard with the generic task error.
- Existing create and mark-completed routes still work independently.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets; the corresponding checkboxes live in the `## Progress` section.

---

## Phase 2: Dashboard Delete UI

### Overview

Add a delete action to task cards and show a dashboard success banner after deletion.

### Changes Required:

#### 1. Task Card Delete Action

**File**: `src/components/tasks/TaskList.astro`

**Intent**: Let the homeowner delete a specific task directly from its card while keeping the existing task details and mark-completed action intact.

**Contract**: Render a form for each task posting to `/api/tasks/delete` with hidden `taskId`. The submit button must use a browser confirmation guard before submission. The visual treatment should make Delete clearly destructive without overwhelming the existing status and mark-completed controls.

#### 2. Task Actions Layout

**File**: `src/components/tasks/TaskList.astro`

**Intent**: Keep task actions readable and usable on desktop and mobile after adding a second action.

**Contract**: Preserve the current status badge and mark-completed form. Add Delete in the same action area with stable button sizing, no text overlap, and responsive stacking consistent with the current `flex` layout.

#### 3. Dashboard Success Banner

**File**: `src/pages/dashboard.astro`

**Intent**: Confirm successful deletion after the route redirects back to the dashboard.

**Contract**: Read `taskDeleted=1` from the query string and render a success banner matching the existing `taskCreated` and `taskCompleted` banners. Continue to render `taskError` for delete failures.

### Success Criteria:

#### Automated Verification:

- `npm run lint` passes after the UI changes.
- `npm run build` passes after the UI changes.

#### Manual Verification:

- A signed-in homeowner sees a Delete action on each saved task.
- Clicking Delete shows a confirmation prompt before submission.
- Confirming deletion removes the task from the refreshed list and shows the success banner.
- Canceling the confirmation leaves the task in place and does not submit the form.
- Existing create and mark-completed flows still work from the same dashboard.
- The task list action area remains usable on a narrow mobile viewport.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 3: Verification and Planning State

### Overview

Finish the slice with final checks, manual destructive-flow verification, and roadmap consistency.

### Changes Required:

#### 1. Final Route Coverage Review

**File**: `src/pages/api/tasks/delete.test.ts`

**Intent**: Review the Phase 1 route tests after the UI is wired and add only missing coverage discovered during implementation.

**Contract**: Do not duplicate Phase 1's route-test ownership. Confirm the tests cover success, missing task id, unauthenticated redirect, missing Supabase config, store failure, and no-owned-row deletion failure; add narrowly scoped cases only if implementation reveals an uncovered branch.

#### 2. Manual Destructive Flow Verification

**File**: `context/changes/delete-task/plan.md`

**Intent**: Make the manual verification path explicit because deletion has no restore path.

**Contract**: Use disposable test data when manually verifying deletion. Do not delete tasks that the user cares about.

#### 3. Roadmap Status

**File**: `context/foundation/roadmap.md`

**Intent**: Keep the roadmap in sync with this planned change.

**Contract**: The S-04 `delete-task` item should be marked `planning` by this planning run and must not be regressed by implementation.

### Success Criteria:

#### Automated Verification:

- `npm run test` passes.
- `npm run lint` passes.
- `npm run build` passes.

#### Manual Verification:

- Complete the happy path manually with a disposable task: create or use a throwaway task, delete it, confirm it disappears, and confirm `taskDeleted=1` success feedback.
- Complete the cancel path manually: click Delete, cancel the browser confirmation, and confirm no request is submitted and the task remains.
- Complete the failure path manually: submit a blank or stale task id and confirm the generic task error appears.
- Confirm no soft-delete fields, restore behavior, or schema changes were added.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before closing the slice.

---

## Testing Strategy

### Unit Tests:

- No new business-logic unit tests are required because deletion does not affect status derivation, recurrence validation, or display sorting.

### Integration Tests:

- Route-level tests for `POST /api/tasks/delete` cover signed-in success, missing `taskId`, missing Supabase config, store failure, no-owned-row deletion failure, and unauthenticated redirect.
- Tests should not require a live Supabase service; use route-local helper seams or module mocks as needed.

### Manual Testing Steps:

1. Sign in and open `/dashboard`.
2. Create a disposable task if no disposable task exists.
3. Click Delete on the disposable task and cancel the browser confirmation; confirm the task remains.
4. Click Delete again and confirm; confirm the dashboard reloads with `taskDeleted=1`.
5. Confirm the deleted task no longer appears in the task list.
6. Confirm create and mark-completed still work.
7. Test a narrow mobile viewport and confirm task actions do not overlap.

## Performance Considerations

The delete flow performs one Supabase delete and one dashboard reload with the existing list query. This is within the PRD expectation that task list updates are visible within 3 seconds for small data volume. No optimistic client state or background work is needed.

## Migration Notes

No database migration is required. Existing RLS already permits authenticated users to delete only their own maintenance task rows.

## References

- Product contract: `context/foundation/prd.md`
- Roadmap slice: `context/foundation/roadmap.md`
- Existing delete store function: `src/lib/maintenance-task-store.ts`
- Existing completion route pattern: `src/pages/api/tasks/complete.ts`
- Existing dashboard and list UI: `src/pages/dashboard.astro`, `src/components/tasks/TaskList.astro`
- Existing delete RLS policy: `supabase/migrations/20260911130500_create_maintenance_tasks.sql`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append `- <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Delete Route Contract

#### Automated

- [x] 1.1 `deleteMaintenanceTask` distinguishes one deleted owned row from zero matched rows.
- [x] 1.2 Delete route exists at `src/pages/api/tasks/delete.ts`.
- [x] 1.3 Route tests cover signed-in success, missing task id, unauthenticated redirect, missing Supabase config, failed store deletion, and no-owned-row deletion failure.
- [x] 1.4 `npm run test` passes.
- [x] 1.5 `npm run lint` passes.

#### Manual

- [x] 1.6 Submitting a valid delete for a signed-in user's own task redirects to `/dashboard?taskDeleted=1`.
- [x] 1.7 Submitting with a missing or stale task id returns to the dashboard with the generic task error.
- [x] 1.8 Existing create and mark-completed routes still work independently.

### Phase 2: Dashboard Delete UI

#### Automated

- [x] 2.1 `npm run lint` passes after the UI changes.
- [x] 2.2 `npm run build` passes after the UI changes.

#### Manual

- [x] 2.3 A signed-in homeowner sees a Delete action on each saved task.
- [x] 2.4 Clicking Delete shows a confirmation prompt before submission.
- [x] 2.5 Confirming deletion removes the task from the refreshed list and shows the success banner.
- [x] 2.6 Canceling the confirmation leaves the task in place and does not submit the form.
- [x] 2.7 Existing create and mark-completed flows still work from the same dashboard.
- [x] 2.8 The task list action area remains usable on a narrow mobile viewport.

### Phase 3: Verification and Planning State

#### Automated

- [x] 3.1 `npm run test` passes.
- [x] 3.2 `npm run lint` passes.
- [x] 3.3 `npm run build` passes.

#### Manual

- [x] 3.4 Complete the happy path manually with a disposable task: create or use a throwaway task, delete it, confirm it disappears, and confirm `taskDeleted=1` success feedback.
- [x] 3.5 Complete the cancel path manually: click Delete, cancel the browser confirmation, and confirm no request is submitted and the task remains.
- [x] 3.6 Complete the failure path manually: submit a blank or stale task id and confirm the generic task error appears.
- [x] 3.7 Confirm no soft-delete fields, restore behavior, or schema changes were added.
