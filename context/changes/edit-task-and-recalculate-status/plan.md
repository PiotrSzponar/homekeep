# Edit Task and Recalculate Status Implementation Plan

## Overview

Add inline editing for existing maintenance tasks on the dashboard. The homeowner can edit a task's name, last completed date, and recurrence interval, submit the changes through a dedicated update route, and see the refreshed dashboard with recalculated next due date and status.

## Current State Analysis

HomeKeep already has the core storage, ownership, and derived-status pieces required for this slice. The missing piece is homeowner-facing edit UI plus an API route dedicated to general task updates.

## Desired End State

A signed-in homeowner can open the dashboard, expand an edit form for one of their existing tasks, change any editable task field, save, and return to the dashboard with a success banner. The task list is reloaded from Supabase, converted through the existing display mapper, resorted by urgency, and shown with the recalculated next due date and status.

### Key Discoveries:

- `src/lib/maintenance-tasks.ts:93` owns `computeNextDueDate`, and `src/lib/maintenance-tasks.ts:120` owns derived next-due/status generation; the plan must reuse this path rather than store mutable derived fields.
- `src/lib/maintenance-task-store.ts:71` already exposes `updateMaintenanceTask`, validates partial update input, and filters updates by both `id` and `user_id`.
- `src/pages/api/tasks/create.ts:10` and `src/pages/api/tasks/complete.ts:10` establish the route pattern: check `context.locals.user`, create a Supabase client, parse form data, call the store, and redirect to `/dashboard`.
- `src/components/tasks/TaskList.astro:40` currently renders task cards with static task details and a mark-completed POST form, so edit controls should live beside that action.
- `context/foundation/roadmap.md:103` defines this slice as S-03 and calls out the main risk: duplicating status logic instead of preserving one rule.

## What We're NOT Doing

- No schema migration or stored `next_due_date` / `status` columns.
- No shared-household, role, invite, or admin editing behavior.
- No reminders, task templates, or AI-generated schedules.
- No optimistic client-side save, modal editor, or separate edit page.
- No delete behavior; `delete-task` remains a separate roadmap slice.
- No special ownership/not-found disclosure for stale or foreign task IDs.

## Implementation Approach

Use the existing server-POST pattern. Add `POST /api/tasks/update` for general edits, reuse `updateMaintenanceTask`, and redirect back to `/dashboard?taskUpdated=1` on success or a generic `taskError` on failure. Render the edit form inline inside each task item with current values prefilled. After save, dashboard data is fetched again and `toMaintenanceTaskDisplayItems` recalculates the derived fields.

## Critical Implementation Details

The edit form should submit all three editable fields so the update route can call `updateMaintenanceTask` with a complete edit payload. Status recalculation still happens only after the dashboard reload maps stored rows through `toMaintenanceTaskDisplayItems`; do not add route-level or database-level derived status writes.

## Phase 1: Update Route Contract

### Overview

Add a dedicated task update route that accepts the edit form payload and maps it to the existing store update function.

### Changes Required:

#### 1. Task Update API Route

**File**: `src/pages/api/tasks/update.ts`

**Intent**: Add a POST route for general task edits. It should follow the existing task route conventions while keeping completion behavior separate.

**Contract**: Accept form fields `taskId`, `name`, `lastCompletedDate`, and `recurrenceIntervalDays`; require a signed-in user; call `updateMaintenanceTask(supabase, userId, taskId, input)`; redirect to `/dashboard?taskUpdated=1` on success; redirect to `/dashboard?taskError=<encoded generic message>` on missing config, missing task id, validation failure, Supabase failure, stale task id, or cross-account task id.

#### 2. Shared Route Parsing Pattern

**File**: `src/pages/api/tasks/update.ts`

**Intent**: Keep form parsing close to the route, matching the create and complete handlers.

**Contract**: Use the same `stringFormValue` style already present in `src/pages/api/tasks/create.ts` and `src/pages/api/tasks/complete.ts`. Convert `recurrenceIntervalDays` with `Number(...)` before passing the input to the store.

#### 3. Route-Level Test Coverage

**File**: `src/pages/api/tasks/update.test.ts`

**Intent**: Cover the route behavior that is most likely to regress: valid payload wiring, missing `taskId`, unauthenticated access, and failed store update.

**Contract**: Exercise the exported `POST` handler or route-local test seams without requiring a live Supabase service. If direct Astro route testing is too coupled to framework internals, extract only minimal pure helpers needed to test form parsing and redirect decisions. Route/form parsing should reject blank edit-form recurrence values; `validateMaintenanceTaskUpdateInput` must continue allowing omitted fields for partial updates such as mark completed.

### Success Criteria:

#### Automated Verification:

- Update route exists at `src/pages/api/tasks/update.ts`.
- Route tests cover valid edit payload, missing task id, unauthenticated request, and failed update behavior.
- `npm run lint` passes.
- `npm run test` passes.

#### Manual Verification:

- Submitting a valid edit for a signed-in user's own task redirects to `/dashboard?taskUpdated=1`.
- Submitting with a missing or stale task id returns to the dashboard with the generic task error.
- The existing mark-completed route still works independently.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 2: Inline Edit UI

### Overview

Expose editing directly from the task list while preserving the current dashboard and task-card layout.

### Changes Required:

#### 1. Task List Edit Form

**File**: `src/components/tasks/TaskList.astro`

**Intent**: Add an inline edit affordance to each rendered task item so the homeowner can change task details without leaving the dashboard.

**Contract**: For each task, render an edit control that reveals a form posting to `/api/tasks/update`. The form must include hidden `taskId`, text input `name`, date input `lastCompletedDate`, and number input `recurrenceIntervalDays`, prefilled from the current `MaintenanceTaskDisplayItem`.

#### 2. Task Actions Layout

**File**: `src/components/tasks/TaskList.astro`

**Intent**: Keep edit and mark-completed actions visually clear and usable on mobile and desktop.

**Contract**: Preserve the current status badge and mark-completed form. Add the edit action beside or below it using stable dimensions and existing rounded-md/button styling conventions. The row must not shift unpredictably when the edit form is opened.

#### 3. Dashboard Success Banner

**File**: `src/pages/dashboard.astro`

**Intent**: Show an edit-specific success message after the update route redirects back to the dashboard.

**Contract**: Read `taskUpdated=1` from the query string and render a success banner matching the existing `taskCreated` and `taskCompleted` banners. Continue to show generic `taskError` for edit failures.

### Success Criteria:

#### Automated Verification:

- `npm run lint` passes after the UI changes.
- `npm run build` passes after the UI changes.

#### Manual Verification:

- A signed-in homeowner can open an edit form from an existing task card.
- The edit form starts with the current task name, last completed date, and recurrence interval.
- Editing the last completed date or recurrence interval changes the displayed next due date and status after save.
- Editing a task may move it in the sorted list when urgency or next due date changes.
- Existing create and mark-completed flows still work from the same dashboard.
- The task list remains usable on a narrow mobile viewport.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 3: Verification and Planning State

### Overview

Finish the slice with focused validation coverage, project checks, and planning-state consistency.

### Changes Required:

#### 1. Update Validation Coverage

**File**: `src/lib/maintenance-tasks.test.ts`

**Intent**: Ensure the edit route relies on a tested update-input contract, not just create-input validation.

**Contract**: Add focused assertions for `validateMaintenanceTaskUpdateInput`: accepts a full edit payload, trims the name, rejects invalid date format, rejects non-positive recurrence interval, and rejects an empty update object.

#### 2. Route and UI Verification Review

**File**: `src/pages/api/tasks/update.test.ts`

**Intent**: Review the Phase 1 route tests after the UI is wired and add only missing coverage discovered during implementation.

**Contract**: Do not duplicate Phase 1's route-test ownership. Confirm the existing route tests verify that successful edits call the store with `taskId`, `name`, `lastCompletedDate`, and `recurrenceIntervalDays`, while failures redirect with the generic task error; add narrowly scoped cases only if the implementation reveals an uncovered branch. Tests must not require real Supabase credentials.

#### 3. Roadmap Status

**File**: `context/foundation/roadmap.md`

**Intent**: Keep the roadmap in sync with this planned change.

**Contract**: The S-03 `edit-task-and-recalculate-status` item should be marked `planning` by this planning run and must not be regressed by implementation.

### Success Criteria:

#### Automated Verification:

- `npm run test` passes.
- `npm run lint` passes.
- `npm run build` passes.

#### Manual Verification:

- Complete the happy path manually: create or use an existing task, edit each field, save, and confirm updated task details plus recalculated next due date/status.
- Complete the failure path manually: submit an invalid recurrence interval or stale task id and confirm the generic task error appears.
- Confirm no derived status fields were added to the database schema or persisted row contract.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before closing the slice.

---

## Testing Strategy

### Unit Tests:

- `validateMaintenanceTaskUpdateInput` accepts valid full edits and returns normalized values.
- `validateMaintenanceTaskUpdateInput` rejects invalid date-only values.
- `validateMaintenanceTaskUpdateInput` rejects zero, negative, or fractional recurrence values when included; route/form parsing rejects blank recurrence values from the full edit form.
- Existing derived-state tests continue to prove next due date and status are computed from stored fields.

### Integration Tests:

- Route-level tests for `POST /api/tasks/update` cover signed-in success, missing `taskId`, store validation failure, and unauthenticated redirect.
- Store behavior remains covered through route mocks and existing helper tests; no live Supabase dependency is required for this slice's automated tests.

### Manual Testing Steps:

1. Sign in and open `/dashboard`.
2. Create a task if no task exists.
3. Open the task's edit form and confirm all current values are prefilled.
4. Change the task name and save; confirm the success banner and updated name.
5. Change `lastCompletedDate` or `recurrenceIntervalDays` so status changes; confirm next due date/status recalculate after redirect.
6. Confirm the task may resort based on the recalculated urgency and date.
7. Mark the same or another task completed; confirm the completion flow still works.
8. Test mobile width and confirm the task card, actions, and edit form do not overlap.

## Performance Considerations

The edit flow performs one Supabase update and one dashboard reload with the existing task list query. This is within the PRD expectation that task list and status updates are visible within 3 seconds for small data volume. No caching, pagination, or client-side optimistic state is needed for the MVP.

## Migration Notes

No database migration is required. Existing rows already contain the editable source fields, and RLS/update policy already permits authenticated users to update only their own rows.

## References

- Product contract: `context/foundation/prd.md`
- Roadmap slice: `context/foundation/roadmap.md`
- Existing status helpers: `src/lib/maintenance-tasks.ts`
- Existing store update contract: `src/lib/maintenance-task-store.ts`
- Existing create route pattern: `src/pages/api/tasks/create.ts`
- Existing completion route pattern: `src/pages/api/tasks/complete.ts`
- Existing dashboard and list UI: `src/pages/dashboard.astro`, `src/components/tasks/TaskList.astro`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append `- <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Update Route Contract

#### Automated

- [x] 1.1 Update route exists at `src/pages/api/tasks/update.ts`.
- [x] 1.2 Route tests cover valid edit payload, missing task id, unauthenticated request, and failed update behavior.
- [x] 1.3 `npm run lint` passes.
- [x] 1.4 `npm run test` passes.

#### Manual

- [x] 1.5 Submitting a valid edit for a signed-in user's own task redirects to `/dashboard?taskUpdated=1`.
- [x] 1.6 Submitting with a missing or stale task id returns to the dashboard with the generic task error.
- [x] 1.7 The existing mark-completed route still works independently.

### Phase 2: Inline Edit UI

#### Automated

- [x] 2.1 `npm run lint` passes after the UI changes.
- [x] 2.2 `npm run build` passes after the UI changes.

#### Manual

- [x] 2.3 A signed-in homeowner can open an edit form from an existing task card.
- [x] 2.4 The edit form starts with the current task name, last completed date, and recurrence interval.
- [x] 2.5 Editing the last completed date or recurrence interval changes the displayed next due date and status after save.
- [x] 2.6 Editing a task may move it in the sorted list when urgency or next due date changes.
- [x] 2.7 Existing create and mark-completed flows still work from the same dashboard.
- [x] 2.8 The task list remains usable on a narrow mobile viewport.

### Phase 3: Verification and Planning State

#### Automated

- [x] 3.1 `npm run test` passes.
- [x] 3.2 `npm run lint` passes.
- [x] 3.3 `npm run build` passes.

#### Manual

- [x] 3.4 Complete the happy path manually: create or use an existing task, edit each field, save, and confirm updated task details plus recalculated next due date/status.
- [x] 3.5 Complete the failure path manually: submit an invalid recurrence interval or stale task id and confirm the generic task error appears.
- [x] 3.6 Confirm no derived status fields were added to the database schema or persisted row contract.
