# Testing Status and Form Contracts Implementation Plan

## Overview

Add the smallest Vitest-only test coverage that turns rollout Phase 1 of `context/foundation/test-plan.md` into an enforceable contract. The work proves two product risks: status/date boundaries are calculated from stored task source fields, and create/edit task inputs follow the same client/server acceptance rules before persistence.

This phase also adds `npm run test` to CI so the new unit and integration floor is durable after the plan ships.

## Current State Analysis

The status rule is centralized in `src/lib/maintenance-tasks.ts`. It consumes `last_completed_date` and `recurrence_interval_days`, computes `nextDueDate`, then classifies status with the seven-day due-soon threshold. Existing tests cover direct status classification and one combined due-soon derivation, but they do not yet prove overdue, due-soon boundary, and OK boundary through the combined source-fields-to-display-state contract.

Task form validation is layered. `src/components/tasks/task-form-rules.ts` owns client-side string validation, browser-local defaults, and recurrence presets. Server-side validation lives in `src/lib/maintenance-tasks.ts`, while `src/pages/api/tasks/create.ts` and `src/pages/api/tasks/update.ts` parse native form submissions before handing off to the store. Existing route tests cover some parser behavior, but there is no focused client/server parity matrix and no direct coverage for `task-form-rules.ts`.

CI currently runs install, Astro sync, lint, and build in `.github/workflows/ci.yml`; it does not run the existing `npm run test` script.

## Desired End State

Risk #1 is covered by hard-coded, hand-counted date/status boundary examples that call the combined business contract with a fixed `todayDate`.

Risk #2 is covered by a small parity matrix that checks valid and invalid task inputs across client validation, server validation, and useful create/update parser normalization or rejection paths.

CI runs `npm run test` in addition to lint and build, and `context/foundation/test-plan.md` records the Phase 1 cookbook pattern for future status/date and form-contract tests.

## What We're NOT Doing

- No DOM/component test dependencies.
- No Playwright, browser e2e, or in-app browser verification.
- No broad React form behavior tests for focus management, hydration, native submission, preset button clicks, or visual state.
- No schema, Supabase RLS, ownership, mutation-feedback, auth, mobile, or visual regression coverage. Those belong to later rollout phases.
- No use of production date calculation to generate expected values.

## Approach

Keep this as a pure Vitest rollout. Expand existing tests where they already own the behavior, and add one focused test file for client form rules because that module is currently untested. Prefer table-driven cases when they reduce duplication without hiding the business examples.

## Phase 1: Combined Status Boundary Tests

### Overview

Prove Risk #1 through the combined task source-field contract: last completed date plus recurrence interval produces the expected next due date and exactly one status.

### Changes Required

#### 1. Add a combined boundary matrix for derived task state

**File**: `src/lib/maintenance-tasks.test.ts`

**Intent**: Add explicit examples for overdue, due-soon boundary, and OK boundary using fixed `todayDate = "2026-09-13"`. This proves the full business rule from persisted source fields to display state, not only classification from an already-derived next due date.

**Contract**: Tests should call `deriveMaintenanceTaskState(...)` or `toMaintenanceTaskDisplayItems(...)` with stored-style inputs. Expected `nextDueDate` and `status` values must be hard-coded from hand-counted calendar examples.

Recommended examples:

- `last_completed_date: "2026-09-01"`, recurrence `11` -> next due `2026-09-12`, status `overdue`.
- `last_completed_date: "2026-09-01"`, recurrence `19` -> next due `2026-09-20`, status `due-soon`.
- `last_completed_date: "2026-09-01"`, recurrence `20` -> next due `2026-09-21`, status `ok`.

### Observable Behavior Proved

A homeowner's task status is derived from the saved last-completed date and recurrence interval, with overdue, due-soon, and OK boundaries all covered by deterministic examples.

### Success Criteria

#### Automated Verification

- `npm run test -- src/lib/maintenance-tasks.test.ts` passes.
- The new boundary expectations contain literal expected next due dates and statuses, not calls to `computeNextDueDate(...)` or other production helpers to build expected values.

#### Manual Verification

- No manual verification required for this phase.

---

## Phase 2: Client/Server Form Contract Parity

### Overview

Prove Risk #2 with focused Vitest coverage for task input acceptance, rejection, and normalization across the client form rules, server validation helpers, and create/update parser paths.

### Changes Required

#### 1. Add client form rule tests

**File**: `src/components/tasks/task-form-rules.test.ts`

**Intent**: Cover the client-side form rule module directly without introducing DOM or component test dependencies.

**Contract**: Test `getDefaultTaskFormValues(...)`, `RECURRENCE_PRESETS`, and `validateTaskFormValues(...)` with fixed dates and string recurrence inputs. Keep cases narrow: defaults, one valid input, blank name, invalid calendar date, future date, blank recurrence, nonnumeric recurrence, zero recurrence, and decimal recurrence.

#### 2. Strengthen server validation parity

**File**: `src/lib/maintenance-tasks.test.ts`

**Intent**: Make server-side write and update validation visibly line up with the client input matrix for the risk-bearing cases.

**Contract**: Use fixed `todayDate` for future-date cases. Cover the same meaningful accept/reject outcomes as the client tests while respecting type differences: client recurrence is a string, server recurrence is a number.

#### 3. Tighten create/update parser parity where useful

**Files**: `src/pages/api/tasks/create.test.ts`, `src/pages/api/tasks/update.test.ts`

**Intent**: Keep parser tests focused on parser responsibility: field presence, trimming/normalization, numeric decoding, and non-finite rejection. Do not turn parser tests into duplicates of full server validation.

**Contract**: Express create and update parser expectations as matching small cases where possible. Add missing update parser coverage for blank name and blank date. Add create/update coverage that finite-but-invalid recurrence values such as `0` or `1.5` parse through to numeric payloads, because store validation owns rejecting them before persistence.

### Observable Behavior Proved

The same task input classes are either accepted or rejected consistently by HomeKeep's client and server contracts, and create/edit route parsers normalize or reject form submissions in the same useful places without relying on browser constraints.

### Success Criteria

#### Automated Verification

- `npm run test -- src/components/tasks/task-form-rules.test.ts` passes.
- `npm run test -- src/lib/maintenance-tasks.test.ts` passes.
- `npm run test -- src/pages/api/tasks/create.test.ts src/pages/api/tasks/update.test.ts` passes.
- Tests distinguish route parser responsibility from server validation responsibility for zero and decimal recurrence values.

#### Manual Verification

- No manual verification required for this phase.

---

## Phase 3: CI Test Gate and Cookbook Update

### Overview

Make Phase 1 durable by adding the test command to CI and recording how future contributors should add status/date and form-contract tests.

### Changes Required

#### 1. Add Vitest to CI

**File**: `.github/workflows/ci.yml`

**Intent**: Enforce the unit/integration floor selected by the test plan after Phase 1.

**Contract**: Add `npm run test` after `npx astro sync` and before or near `npm run lint` / `npm run build`. Do not change CI triggers, Node version, Supabase secrets, or build behavior.

#### 2. Fill Phase 1 cookbook entries

**File**: `context/foundation/test-plan.md`

**Intent**: Replace the Phase 1 TBD cookbook placeholders with concise, durable guidance for adding future status/date and task form contract tests.

**Contract**: Update only sections `6.1`, `6.2`, and `6.6` as needed. Record file locations, naming patterns, representative test commands, and the rule that date/status expected values are hard-coded rather than generated with production helpers.

### Observable Behavior Proved

The project now fails CI when the Phase 1 Vitest contracts regress, and future agents have a short cookbook for extending the same test patterns.

### Success Criteria

#### Automated Verification

- `npm run test` passes.
- `npm run lint` passes.
- `npm run build` passes.
- `.github/workflows/ci.yml` includes `npm run test`.

#### Manual Verification

- `context/foundation/test-plan.md` Phase 1 cookbook entries are concise and point to the new reference tests.

---

## Testing Strategy

- Unit tests cover pure business and validation helpers because they are the cheapest layer with the strongest signal for Phase 1.
- Route integration tests exercise Astro API handler/parser boundaries with existing mock patterns.
- CI runs the full Vitest suite after this phase.
- No browser or DOM testing is introduced.

## Edge Cases

- Due-soon includes exactly seven days until due.
- A task due before today is overdue.
- A task due more than seven days from today is OK.
- Future last-completed dates are rejected with a fixed test `todayDate`.
- Invalid calendar dates are rejected.
- Blank, nonnumeric, zero, negative, and decimal recurrence inputs are handled at the layer responsible for them.
- Create and update forms normalize trimmed names and day-based recurrence consistently.

## References

- Research: `context/changes/testing-status-and-form-contract/research.md`
- Test plan: `context/foundation/test-plan.md`
- Business rule owner: `src/lib/maintenance-tasks.ts`
- Client form rule owner: `src/components/tasks/task-form-rules.ts`
- Create route: `src/pages/api/tasks/create.ts`
- Update route: `src/pages/api/tasks/update.ts`
- CI workflow: `.github/workflows/ci.yml`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` - <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Combined Status Boundary Tests

#### Automated

- [x] 1.1 Combined overdue boundary test passes - 63a32a4
- [x] 1.2 Combined due-soon boundary test passes - 63a32a4
- [x] 1.3 Combined OK boundary test passes - 63a32a4
- [x] 1.4 Focused maintenance task test command passes - 63a32a4

### Phase 2: Client/Server Form Contract Parity

#### Automated

- [x] 2.1 Client form rule tests cover defaults and recurrence presets - d5a0bf7
- [x] 2.2 Client form rule tests cover valid and invalid input matrix - d5a0bf7
- [x] 2.3 Server validation tests cover matching valid and invalid input matrix - d5a0bf7
- [x] 2.4 Create/update parser parity tests cover normalization and parser-owned rejection - d5a0bf7
- [x] 2.5 Focused form and route test commands pass - d5a0bf7

### Phase 3: CI Test Gate and Cookbook Update

#### Automated

- [x] 3.1 CI workflow runs npm run test
- [x] 3.2 Full npm run test passes
- [x] 3.3 npm run lint passes
- [x] 3.4 npm run build passes

#### Manual

- [x] 3.5 Phase 1 cookbook entries document the reference test locations and commands
