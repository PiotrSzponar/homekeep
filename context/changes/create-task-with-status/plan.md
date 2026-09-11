# Implementation Plan: Create Task And Show Calculated Status

## Overview

Build the first user-visible HomeKeep maintenance loop: a signed-in homeowner can create a maintenance task from `/dashboard` and immediately see the saved task with its calculated next due date and current status. This implements roadmap slice `S-01` and consumes the archived `F-01` storage contract rather than redefining task ownership, recurrence, or status rules.

## Current State Analysis

- `/dashboard` is protected by `src/middleware.ts`, but currently renders only a placeholder card with the signed-in user's email and a sign-out form.
- Auth API routes use the established pattern of Astro `APIRoute` handlers, `createClient(context.request.headers, context.cookies)`, form parsing, and redirects with encoded query-string errors.
- `F-01` added `maintenance_tasks` storage, owner-only RLS, `src/lib/maintenance-tasks.ts`, `src/lib/maintenance-task-store.ts`, and Vitest coverage for the date/status contract.
- The archived F-01 plan notes that hosted Supabase migration application was not proven in that run. S-01 can be implemented locally, but production create/list smoke tests require the F-01 migration to exist in the hosted Supabase database.
- The PRD requires exactly this first loop: create a task from name, last completed date, and recurrence interval, then show name, calculated next due date, and one status.

## Implementation Approach

Keep the first task loop server-rendered and form-post based. Add an inline dashboard form, a protected POST route for task creation, server-side task loading on `/dashboard`, and a small presentation helper for due-first ordering. Use the F-01 store/domain helpers for validation, persistence, and derived values; do not add edit, delete, completion, reminders, task libraries, shared homes, or AI scheduling in this slice.

## Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Create flow | Inline form on `/dashboard` | It is the shortest path to the PRD's first value loop and avoids extra routing before saved tasks exist. |
| Submit path | `POST /api/tasks/create` | Matches existing auth handler conventions and works without client-side JavaScript. |
| List ordering | Due-first | Supports the secondary success criterion: the homeowner can quickly scan which task needs attention first. |
| Error UX | Query-string banner/alert on `/dashboard` | Fits existing redirect-based auth error handling and keeps S-01 small. |
| Success UX | Redirect to `/dashboard?taskCreated=1` and reload from DB | Confirms real persistence instead of optimistic UI. |
| Hosted schema | Manual prerequisite for production smoke | Keeps schema release responsibility explicit and avoids hiding a DB state dependency in feature code. |
| Tests | Helper tests plus manual smoke | Gives repeatable coverage for sorting/derived display logic without needing seeded auth users in CI. |

## What We're Not Doing

- No edit task flow.
- No delete task flow.
- No mark-completed flow.
- No shared homes, household members, roles, invitations, or admin views.
- No reminders, calendars, or notifications.
- No prebuilt task library or AI-generated schedule suggestions.
- No storing mutable `next_due_date` or `status` columns.

## Phase 1: Protected Create Route

### Overview

Add the server write path for creating a maintenance task owned by the authenticated homeowner.

### Changes Required:

#### 1. Protect task API routes

**File**: `src/middleware.ts`

**Intent**: Extend the existing auth boundary so task mutation endpoints cannot be called anonymously.

**Contract**: Add the `/api/tasks` prefix to `PROTECTED_ROUTES`. Preserve the current `Astro.locals.user` population and redirect behavior.

#### 2. Task create API route

**File**: `src/pages/api/tasks/create.ts`

**Intent**: Parse dashboard form submissions and persist a new task using the F-01 owner-scoped store helper.

**Contract**: Export `POST: APIRoute`. The handler must:
- read `name`, `lastCompletedDate`, and `recurrenceIntervalDays` from `FormData`;
- normalize form values before building `MaintenanceTaskWriteInput`: require string values for all three fields, trim `name`, convert `recurrenceIntervalDays` with `Number`, and let non-finite or non-integer values flow to the existing validation/error redirect;
- get Supabase with `createClient(context.request.headers, context.cookies)`;
- require `context.locals.user?.id`;
- call `createMaintenanceTask` with the server-side `user.id`;
- never read or trust `user_id` from browser form data;
- redirect to `/dashboard?taskCreated=1` on success;
- redirect to `/dashboard?taskError=<encoded message>` on validation or task store failure after an authenticated request reaches the handler;
- rely on protected-route middleware for anonymous or missing-config requests, which redirect to sign-in/global configuration-banner flows before the task handler runs.

#### 3. Store typing bridge if needed

**File**: `src/lib/maintenance-task-store.ts`

**Intent**: Keep the route implementation clean if the generic Supabase client returned by `createClient` needs a narrow typed boundary for task operations.

**Contract**: If TypeScript requires it, add a minimal adapter or type helper in this module. Do not weaken the validation contract or allow arbitrary owner IDs through write input.

### Success Criteria:

#### Automated Verification:

- `/api/tasks/create` exists and exports a POST handler.
- `src/middleware.ts` protects `/api/tasks`.
- The create handler calls `createMaintenanceTask` with `context.locals.user.id`, not a form-provided owner value.
- `npm run lint` passes.
- `npm run build` passes.

#### Manual Verification:

- Review confirms an anonymous task POST cannot create a task.
- Review confirms invalid form data redirects back to `/dashboard` with a user-visible error path.

**Implementation Note**: Pause after this phase if the route cannot type cleanly against the existing Supabase helper; do not introduce `any` or browser-provided `user_id` as a shortcut.

---

## Phase 2: Dashboard Task Experience

### Overview

Replace the placeholder dashboard with the first maintenance task experience: inline create form, empty state, due-first list, calculated next due date, and status.

### Changes Required:

#### 1. Dashboard server data loading

**File**: `src/pages/dashboard.astro`

**Intent**: Load the authenticated homeowner's tasks during server render and prepare display data from stored rows plus derived state.

**Contract**: The page must:
- use `createClient` and `Astro.locals.user`;
- call `listMaintenanceTasks` with the authenticated `user.id`;
- derive `nextDueDate` and `status` via `src/lib/maintenance-tasks.ts`;
- show a dashboard error state if task list loading fails after authentication;
- rely on the existing global configuration banner/sign-in redirect path when Supabase is missing;
- sort display items due-first: overdue first, then due-soon, then ok, with earlier `nextDueDate` before later dates.

#### 2. Inline create form

**File**: `src/components/tasks/CreateTaskForm.tsx`

**Intent**: Provide the three PRD inputs in the main dashboard flow.

**Contract**: Render a form posting to `/api/tasks/create` with fields named exactly `name`, `lastCompletedDate`, and `recurrenceIntervalDays`. Use semantic labels, native required/min/date/number constraints, and the existing `Button` component. Do not add client-only state unless needed.

#### 3. Task list presentation

**File**: `src/components/tasks/TaskList.astro`

**Intent**: Display saved tasks in a scan-friendly shape with the status and next due date visible.

**Contract**: Accept task display items that include `id`, `name`, `lastCompletedDate`, `recurrenceIntervalDays`, `nextDueDate`, and `status`. Render empty state when no tasks exist. Status labels shown to the user should be `OK`, `Due soon`, and `Overdue`.

#### 4. Task display helpers

**File**: `src/lib/maintenance-tasks.ts`

**Intent**: Keep due-first sorting and display mapping reusable and testable instead of embedding status ordering in Astro markup.

**Contract**: Export a helper for turning rows into derived display items and sorting by urgency/next due date. Do not store derived fields in the database contract.

### Success Criteria:

#### Automated Verification:

- `npm run lint` passes.
- `npm run build` passes.
- Dashboard imports task store/domain helpers instead of redefining due-date or status logic inline.
- Task display helper sorts overdue before due-soon before ok, then by earliest next due date.

#### Manual Verification:

- Signed-in dashboard with no tasks shows the inline create form and an empty state.
- After creating a valid task, `/dashboard?taskCreated=1` shows a success message and the saved task.
- The saved task displays name, next due date, and one of `OK`, `Due soon`, or `Overdue`.
- Refreshing `/dashboard` still shows the task from Supabase.

---

## Phase 3: Verification And Production Smoke

### Overview

Lock the new first-loop behavior with repeatable tests and define the manual checks needed before S-01 is considered production-ready.

### Changes Required:

#### 1. Task display tests

**File**: `src/lib/maintenance-tasks.test.ts`

**Intent**: Extend existing task contract coverage to include due-first ordering and display item derivation used by the dashboard.

**Contract**: Cover at least:
- overdue, due-soon, and ok ordering;
- earliest `nextDueDate` within the same status group;
- display mapping includes calculated `nextDueDate` and `status`.

#### 2. Manual smoke checklist

**File**: `context/changes/create-task-with-status/plan.md`

**Intent**: Keep the production schema dependency explicit and make the first user-visible flow verifiable.

**Contract**: Record that production smoke testing requires the F-01 hosted Supabase migration to be applied first. Include manual checks for `/dashboard`, valid create, invalid create, refresh persistence, and no cross-account visibility when two accounts are available.

#### 3. Optional production deploy note

**File**: `context/changes/create-task-with-status/plan.md`

**Intent**: Capture whether this slice was deployed after implementation without forcing deployment into the coding phase.

**Contract**: If deployment is performed, record the Worker URL and smoke-test result. If deployment is deferred, record that code verification passed but production smoke remains pending until deploy and hosted schema checks are complete.

### Success Criteria:

#### Automated Verification:

- `npm run test` passes.
- `npm run lint` passes.
- `npm run build` passes.
- Tests cover due-first ordering and display item derivation.

#### Manual Verification:

- Hosted Supabase has the F-01 `maintenance_tasks` migration applied before production S-01 smoke.
- On the production Worker or local dev server, a signed-in user can create a task and see it after redirect.
- Invalid create submission returns to the dashboard with a visible error.
- A second signed-in account cannot see the first account's task, if a second test account is available.

**Implementation Note**: If hosted Supabase migration has not been applied, do not mark production smoke as complete. The code can still be implemented and locally verified, but release readiness depends on that schema gate.

---

## Testing Strategy

### Unit Tests:

- Existing next due date and status classification tests remain in `src/lib/maintenance-tasks.test.ts`.
- Add tests for display item mapping and due-first sorting.
- Keep tests deterministic by passing fixed `todayDate` values.

### Integration / Contract Tests:

- Build must compile Astro dashboard imports, API route imports, and Supabase store typing.
- Lint must cover new Astro, TS, and TSX files.
- No automated hosted Supabase integration test is required in this slice.

### Manual Testing Steps:

1. Confirm hosted Supabase has the F-01 migration before production smoke.
2. Sign in and open `/dashboard`.
3. Submit a valid task with name, last completed date, and recurrence interval.
4. Confirm redirect returns to `/dashboard?taskCreated=1`.
5. Confirm the saved task shows name, next due date, and one status.
6. Refresh the dashboard and confirm the task persists.
7. Submit invalid data and confirm a visible error.
8. If a second account is available, confirm it cannot see the first account's task.

## Performance Considerations

The MVP task volume is small. Server-rendered list loading and in-memory due-first sorting are acceptable for S-01. If task counts grow substantially, a later slice can add pagination or persisted/queryable ordering fields, but that is out of scope for this first loop.

## Migration Notes

This slice does not add or change database schema. It depends on the archived F-01 migration `supabase/migrations/20260911130500_create_maintenance_tasks.sql`. Production smoke is blocked until that migration is applied to hosted Supabase.

## References

- Roadmap item: `context/foundation/roadmap.md` (`S-01`)
- Product contract: `context/foundation/prd.md` (`US-01`, `FR-001`, `FR-002`, `FR-006`, Business Logic)
- Storage foundation: `context/archive/2026-09-11-owned-task-storage-contract/plan.md`
- Dashboard: `src/pages/dashboard.astro`
- Auth middleware: `src/middleware.ts`
- Supabase client: `src/lib/supabase.ts`
- Task domain helpers: `src/lib/maintenance-tasks.ts`
- Task store helpers: `src/lib/maintenance-task-store.ts`
- Existing task tests: `src/lib/maintenance-tasks.test.ts`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` - <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Protected Create Route

#### Automated

- [x] 1.1 `/api/tasks/create` exists and exports a POST handler. - 2f61ef0
- [x] 1.2 `src/middleware.ts` protects `/api/tasks`. - 2f61ef0
- [x] 1.3 The create handler calls `createMaintenanceTask` with `context.locals.user.id`, not a form-provided owner value. - 2f61ef0
- [x] 1.4 `npm run lint` passes. - 2f61ef0
- [x] 1.5 `npm run build` passes. - 2f61ef0

#### Manual

- [x] 1.6 Review confirms an anonymous task POST cannot create a task. - 2f61ef0
- [x] 1.7 Review confirms invalid form data redirects back to `/dashboard` with a user-visible error path. - 2f61ef0

### Phase 2: Dashboard Task Experience

#### Automated

- [x] 2.1 `npm run lint` passes.
- [x] 2.2 `npm run build` passes.
- [x] 2.3 Dashboard imports task store/domain helpers instead of redefining due-date or status logic inline.
- [x] 2.4 Task display helper sorts overdue before due-soon before ok, then by earliest next due date.

#### Manual

- [x] 2.5 Signed-in dashboard with no tasks shows the inline create form and an empty state.
- [x] 2.6 After creating a valid task, `/dashboard?taskCreated=1` shows a success message and the saved task.
- [x] 2.7 The saved task displays name, next due date, and one of `OK`, `Due soon`, or `Overdue`.
- [x] 2.8 Refreshing `/dashboard` still shows the task from Supabase.

### Phase 3: Verification And Production Smoke

#### Automated

- [ ] 3.1 `npm run test` passes.
- [ ] 3.2 `npm run lint` passes.
- [ ] 3.3 `npm run build` passes.
- [ ] 3.4 Tests cover due-first ordering and display item derivation.

#### Manual

- [ ] 3.5 Hosted Supabase has the F-01 `maintenance_tasks` migration applied before production S-01 smoke.
- [ ] 3.6 On the production Worker or local dev server, a signed-in user can create a task and see it after redirect.
- [ ] 3.7 Invalid create submission returns to the dashboard with a visible error.
- [ ] 3.8 A second signed-in account cannot see the first account's task, if a second test account is available.
