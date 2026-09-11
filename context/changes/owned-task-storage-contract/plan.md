# Implementation Plan: Establish Owned Task Storage Contract

## Overview

Create the minimum data contract that lets HomeKeep store recurring maintenance tasks for signed-in homeowners without exposing one homeowner's data to another. This is a foundation change from roadmap item `F-01`; it unlocks the later vertical slices for create/view, completion, editing, and deletion.

## Current State Analysis

- Auth is already present through Supabase SSR helpers in `src/lib/supabase.ts`, auth API handlers under `src/pages/api/auth/`, and `/dashboard` protection in `src/middleware.ts`.
- Supabase dependencies and local config exist, but there are no app migrations, task table, task data-access helpers, or task tests yet.
- The PRD requires owner-only access (`FR-006`) and derives next due date/status from task inputs rather than storing status as user-entered data.
- The roadmap marks deploy/auth/frontend as present and data/backend as partial, so this plan creates only the storage and helper contract needed before user-visible task slices begin.

## Implementation Approach

Use Supabase as the persistence layer and make ownership enforceable at the database boundary with Row Level Security. Keep the stored task shape limited to MVP inputs plus ownership/timestamps, compute derived due date/status in shared TypeScript helpers, and add a minimal repeatable test path so later slices can rely on the contract.

## Phase 1: Database Ownership Contract

### Overview

Add the source-controlled Supabase migration that defines the `maintenance_tasks` table and owner-only access rules.

### Changes Required:

#### 1. Supabase migration

**File**: `supabase/migrations/<timestamp>_create_maintenance_tasks.sql`

**Intent**: Create the first application table for maintenance tasks with fields that support the MVP input contract and account ownership. Keep derived values out of storage so later slices calculate next due date and status from canonical inputs.

**Contract**: The table must include an ID, `user_id` referencing `auth.users(id)`, task `name`, `last_completed_date`, positive `recurrence_interval_days`, `created_at`, and `updated_at`. Enable Row Level Security and add owner-only policies for select, insert, update, and delete where the row owner is `auth.uid()`.

#### 2. Migration documentation

**File**: `context/changes/owned-task-storage-contract/plan.md`

**Intent**: Keep production schema mutation manual and auditable for this foundation. The implementation should not push schema changes to hosted Supabase without a separate human-approved step.

**Contract**: The implementation notes must record the exact local migration verification command used and the manual hosted Supabase apply step, including that production deploy is not complete for later task slices until the migration is applied remotely.

### Success Criteria:

#### Automated Verification:

- Migration file exists under `supabase/migrations/` and defines `maintenance_tasks`.
- Migration enables RLS and includes owner-only select, insert, update, and delete policies.
- Migration constrains `recurrence_interval_days` to positive values.
- `npm run lint` passes.
- `npm run build` passes.

#### Manual Verification:

- Human confirms whether the migration has been applied to hosted Supabase before production task slices are tested.
- Human confirms no service-role key or privileged database credential was added to the repo.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before treating hosted Supabase as ready for task slices.

---

## Phase 2: Typed Task Contract And Business Rule Helpers

### Overview

Add the narrow TypeScript contract later slices will consume: task row/input types, ownership-scoped query helpers, and pure helpers for next due date and status.

### Changes Required:

#### 1. Task domain types and business-rule helpers

**File**: `src/lib/maintenance-tasks.ts`

**Intent**: Define the shared maintenance-task contract without building any UI or route behavior yet. Later slices should import this module instead of re-deciding field names, status names, or due-date calculation.

**Contract**: Export task status values `ok`, `due-soon`, and `overdue`; typed task row/input/update shapes; a helper that computes next due date from `last_completed_date` plus `recurrence_interval_days`; and a helper that classifies status using the PRD's 7-day due-soon threshold.

#### 2. Supabase data-access helpers

**File**: `src/lib/maintenance-task-store.ts`

**Intent**: Provide narrow, ownership-scoped Supabase operations that later API/page slices can call. This foundation should not implement user-visible CRUD workflows, but it should make the data boundary explicit.

**Contract**: Export helpers for listing a signed-in user's tasks and validating task write payloads against the storage contract. If create/update/delete helpers are included, they must accept a Supabase client plus the authenticated user ID and must never accept an arbitrary owner ID from form input.

#### 3. Astro local types

**File**: `src/env.d.ts`

**Intent**: Preserve the existing `Astro.locals.user` auth contract while making any new task helper types compile cleanly under the current strict TypeScript settings.

**Contract**: Do not weaken the existing Supabase user type. Add only the minimum declarations needed by the new task modules, if any.

### Success Criteria:

#### Automated Verification:

- TypeScript exports compile under `npm run build`.
- `npm run lint` passes.
- Derived status helper returns `ok`, `due-soon`, and `overdue` for representative dates.
- Data-access helpers require the authenticated user ID at the call boundary or prove owner scoping through Supabase RLS.

#### Manual Verification:

- Review confirms no task helper accepts `user_id` directly from browser form data.
- Review confirms derived `next_due_date` and `status` are not stored as mutable table columns.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before planning `S-01`.

---

## Phase 3: Repeatable Verification Path

### Overview

Add a small test setup that proves the core contract without requiring the full task UI to exist.

### Changes Required:

#### 1. Test runner

**File**: `package.json`

**Intent**: Add a minimal repeatable test command for pure task-contract checks. The repo currently has lint/build but no test runner, and this foundation needs more than compilation to prove date/status edge cases.

**Contract**: Add a `test` script and the smallest dev dependency needed to run TypeScript unit tests in this Vite/Astro stack. Do not change existing lint/build scripts.

#### 2. Task contract tests

**File**: `src/lib/maintenance-tasks.test.ts`

**Intent**: Lock the PRD business rule before later slices build UI and handlers around it. Tests should exercise boundary behavior around overdue, due soon, and OK states.

**Contract**: Cover at least: next due date equals last completed date plus recurrence days; overdue after next due date has passed; due soon when next due date is within 7 days; OK when it is more than 7 days away; invalid recurrence intervals are rejected by helper-level validation.

#### 3. Migration contract check

**File**: `context/changes/owned-task-storage-contract/plan.md`

**Intent**: Make schema verification auditable even if local Supabase is not running on every machine. This avoids pretending `npm run build` proves RLS.

**Contract**: Record the exact SQL assertions or manual checklist used to confirm the migration includes table ownership, RLS, and four owner-only policies.

### Success Criteria:

#### Automated Verification:

- `npm run test` passes.
- `npm run lint` passes.
- `npm run build` passes.
- Migration contract check confirms table, positive interval constraint, RLS, and four policies are present.

#### Manual Verification:

- If local Supabase is available, a signed-in user can only query rows whose `user_id` is their own when exercising the migration manually.
- If local Supabase is unavailable, the limitation is recorded in the change notes before implementation is archived.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation that the foundation is sufficient to unlock `S-01`.

---

## Testing Strategy

### Unit Tests:

- Date arithmetic for next due date.
- Status classification at the overdue boundary, due-soon boundary, and OK range.
- Validation of positive recurrence intervals and required task names.

### Integration / Contract Tests:

- Migration SQL contains `maintenance_tasks`, RLS enablement, owner-only policies, `auth.uid()`, and a positive recurrence constraint.
- If local Supabase is available, apply the migration locally and run simple owner/read/write checks with two users.

### Manual Testing Steps:

1. Confirm no secret or service-role value was added to tracked files.
2. Confirm hosted Supabase migration application is either complete or explicitly deferred before production task slices proceed.
3. Confirm `S-01` can consume the exported types/helpers without redefining task ownership or status names.

## Performance Considerations

The MVP data volume is small. The contract should still include an ownership-friendly query path, with ordering by due-relevant dates or creation date left to the first user-visible listing slice if not needed for this foundation.

## Migration Notes

This change introduces the first app-owned table. Local migration files are committed; hosted Supabase schema application is a manual gate. Rollback is to drop the `maintenance_tasks` table only if no real production task data has been created; once task data exists, rollback requires a data-preserving migration instead.

Phase 1 local migration verification command:

```powershell
rg -n "create table if not exists public\.maintenance_tasks|enable row level security|maintenance_tasks_select_own|maintenance_tasks_insert_own|maintenance_tasks_update_own|maintenance_tasks_delete_own|recurrence_interval_days integer not null check \(recurrence_interval_days > 0\)|auth\.uid\(\)" supabase/migrations/20260911130500_create_maintenance_tasks.sql
```

Phase 1 hosted Supabase apply gate: apply `supabase/migrations/20260911130500_create_maintenance_tasks.sql` to the hosted Supabase project only after human approval, using the Supabase SQL editor or an explicitly approved linked-project migration command such as `npx supabase db push`. Production verification for later task slices is not complete until this remote migration has been applied.

Phase 1 manual gate result on 2026-09-11: hosted Supabase migration is not applied yet. Production task slices remain blocked until this migration is applied remotely.

## References

- Change identity: `context/changes/owned-task-storage-contract/change.md`
- Roadmap item: `context/foundation/roadmap.md` (`F-01`)
- Product contract: `context/foundation/prd.md` (`FR-006`, Access Control, Business Logic)
- Supabase client pattern: `src/lib/supabase.ts`
- Auth boundary: `src/middleware.ts`
- Existing auth API handlers: `src/pages/api/auth/`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` - <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Database Ownership Contract

#### Automated

- [x] 1.1 Migration file exists under `supabase/migrations/` and defines `maintenance_tasks`.
- [x] 1.2 Migration enables RLS and includes owner-only select, insert, update, and delete policies.
- [x] 1.3 Migration constrains `recurrence_interval_days` to positive values.
- [x] 1.4 `npm run lint` passes.
- [x] 1.5 `npm run build` passes.

#### Manual

- [x] 1.6 Human confirms whether the migration has been applied to hosted Supabase before production task slices are tested.
- [x] 1.7 Human confirms no service-role key or privileged database credential was added to the repo.

### Phase 2: Typed Task Contract And Business Rule Helpers

#### Automated

- [x] 2.1 TypeScript exports compile under `npm run build`. - f9ea3c7
- [x] 2.2 `npm run lint` passes. - f9ea3c7
- [x] 2.3 Derived status helper returns `ok`, `due-soon`, and `overdue` for representative dates. - f9ea3c7
- [x] 2.4 Data-access helpers require the authenticated user ID at the call boundary or prove owner scoping through Supabase RLS. - f9ea3c7

#### Manual

- [x] 2.5 Review confirms no task helper accepts `user_id` directly from browser form data. - f9ea3c7
- [x] 2.6 Review confirms derived `next_due_date` and `status` are not stored as mutable table columns. - f9ea3c7

### Phase 3: Repeatable Verification Path

#### Automated

- [ ] 3.1 `npm run test` passes.
- [ ] 3.2 `npm run lint` passes.
- [ ] 3.3 `npm run build` passes.
- [ ] 3.4 Migration contract check confirms table, positive interval constraint, RLS, and four policies are present.

#### Manual

- [ ] 3.5 If local Supabase is available, a signed-in user can only query rows whose `user_id` is their own when exercising the migration manually.
- [ ] 3.6 If local Supabase is unavailable, the limitation is recorded in the change notes before implementation is archived.
