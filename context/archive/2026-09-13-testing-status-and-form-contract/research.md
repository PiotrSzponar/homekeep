---
date: 2026-09-13T23:46:01+02:00
researcher: Codex
git_commit: 19dbc2552fcc0c48ade9a0a176059c7b5327a216
branch: main
repository: HomeKeep
topic: "Ground rollout Phase 1 of context/foundation/test-plan.md: status and form contract"
tags: [research, codebase, maintenance-tasks, task-forms, vitest]
status: complete
last_updated: 2026-09-13
last_updated_by: Codex
---

# Research: Status and Form Contract

**Date**: 2026-09-13T23:46:01+02:00
**Researcher**: Codex
**Git Commit**: 19dbc2552fcc0c48ade9a0a176059c7b5327a216
**Branch**: main
**Repository**: HomeKeep

## Research Question

Ground rollout Phase 1 of `context/foundation/test-plan.md`.

Risks to verify: Risk #1 and Risk #2.

- Risk #1: prove boundary examples independently cover OK, due soon, and overdue from last-completed date plus recurrence interval; challenge production date math as the oracle; avoid copying the implementation calculation into expected values.
- Risk #2: prove the same invalid and valid task inputs produce consistent outcomes across create and edit paths; challenge browser constraints as a substitute for server validation; avoid happy-path-only form tests.

Hot-spot directories that raised these risks: `src/components/tasks`, `src/pages/dashboard.astro`, and `src/lib` maintenance-task area.

Stack: Astro + React + TypeScript, Supabase, Cloudflare Pages/Workers, shadcn/Base UI Luma/Lime, sparse Vitest suite.

## Summary

Risk #1 is real and mostly centralized. The due-date/status rule lives in `src/lib/maintenance-tasks.ts`, not in the dashboard or React task components. The dashboard fetches owned rows, calls `toMaintenanceTaskDisplayItems(...)`, then `TaskList.astro` renders the already-derived `nextDueDate` and status badge. Current tests cover `computeNextDueDate`, direct status classification, and one combined due-soon derivation, but they do not yet prove the combined last-completed-date plus recurrence path for overdue, due-soon, and OK as independent boundary examples.

Risk #2 is also real. Create and edit share the same React controller and field component, but client validation is duplicated separately from the server validation helper. Route parsers only check presence and finite numeric recurrence before calling store functions, where authoritative server validation happens. Current create/update route tests cover some parser behavior, but they are not expressed as one parity matrix across create and edit, and no test directly covers `src/components/tasks/task-form-rules.ts`.

Cheapest useful layer for Phase 1 is Vitest unit/integration. Use pure helper tests for date/status and client/server validation matrices, then route-level integration tests for create/update parser normalization and rejection. A browser/e2e layer is not needed for these two risks unless a later plan deliberately validates hydration or native form submission behavior.

## Detailed Findings

### Risk #1: Date and Status Boundary Contract

The persisted task contract stores only source fields, not derived status. The migration declares `last_completed_date date not null` and `recurrence_interval_days integer not null check (recurrence_interval_days > 0)` in `supabase/migrations/20260911130500_create_maintenance_tasks.sql:5-6`.

The dashboard read path fetches stored rows and derives display state at render time:

- `src/lib/maintenance-task-store.ts:25` selects `id,user_id,name,last_completed_date,recurrence_interval_days,created_at,updated_at`.
- `src/lib/maintenance-task-store.ts:31-35` reads from `maintenance_tasks`, filters `.eq("user_id", userId)`, and orders by `created_at`.
- `src/pages/dashboard.astro:22-29` calls `listMaintenanceTasks(...)` and then `tasks = toMaintenanceTaskDisplayItems(result.data)`.

The calculation owner is `src/lib/maintenance-tasks.ts`. Relevant lines:

```ts
export const DUE_SOON_THRESHOLD_DAYS = 7;
completedAt.setUTCDate(completedAt.getUTCDate() + recurrenceIntervalDays);
const daysUntilDue = diffDateOnlyInDays(todayDate, nextDueDate);
```

The status branches are in `src/lib/maintenance-tasks.ts:112-120`: negative days are `overdue`, zero through seven days are `due-soon`, and anything later is `ok`.

The display mapper joins the calculation and classification: `deriveMaintenanceTaskState(...)` computes the next due date and status in `src/lib/maintenance-tasks.ts:123-132`, and `toMaintenanceTaskDisplayItem(...)` exposes `lastCompletedDate`, `recurrenceIntervalDays`, `nextDueDate`, and `status` in `src/lib/maintenance-tasks.ts:152-162`.

`TaskList.astro` is only a render surface for derived values. It maps status strings to labels at `src/components/tasks/TaskList.astro:24-28`, chooses badge variants at `src/components/tasks/TaskList.astro:30-34`, renders the badge at `src/components/tasks/TaskList.astro:65-67`, and renders the next due date at `src/components/tasks/TaskList.astro:73-75`.

The response guidance is correct, with one sharpening: Phase 1 should test the combined path with a fixed `todayDate`, preferably `deriveMaintenanceTaskState(...)` or `toMaintenanceTaskDisplayItems(...)`, not only `classifyMaintenanceTaskStatus(nextDueDate, todayDate)`. Direct classification tests prove the threshold, but they skip the recurrence-to-next-date calculation that Risk #1 names.

Good independent fixtures for `todayDate = "2026-09-13"`:

- Overdue: last completed `2026-09-01`, recurrence `11`, expected next due `2026-09-12`, expected status `overdue`.
- Due soon boundary: last completed `2026-09-01`, recurrence `19`, expected next due `2026-09-20`, expected status `due-soon`.
- OK boundary: last completed `2026-09-01`, recurrence `20`, expected next due `2026-09-21`, expected status `ok`.

Those expected dates are hand-counted calendar expectations and should be hard-coded. Do not build expected values with `computeNextDueDate(...)`, because that copies the production calculation into the oracle.

### Risk #2: Create/Edit Form and Server Contract Parity

Create and edit share the same React form machinery:

- `src/components/tasks/CreateTaskForm.tsx:7` calls `useTaskFormController()` with defaults.
- `src/components/tasks/EditTaskForm.tsx:21-27` calls the same controller with existing task values and `recurrenceIntervalDays: String(recurrenceIntervalDays)`.
- Both forms use native POST and disable native browser validation with `noValidate` at `src/components/tasks/CreateTaskForm.tsx:10-15` and `src/components/tasks/EditTaskForm.tsx:31`.

Shared field rendering lives in `src/components/tasks/TaskFormFields.tsx`. It names the inputs `name`, `lastCompletedDate`, and `recurrenceIntervalDays` at lines 125, 144, and 184. It also sets browser hints and constraints: `required`, `maxLength={120}`, `type="date"`, `max={controller.todayDate}`, and `inputMode="numeric"` across lines 130-191. These are useful UI constraints, but they are not the server contract.

Client-side validation is isolated in `src/components/tasks/task-form-rules.ts`:

```ts
if (values.name.trim().length === 0) {
if (!values.lastCompletedDate) {
} else if (!isDateOnly(values.lastCompletedDate)) {
} else if (values.lastCompletedDate > todayDate) {
```

Recurrence parsing in the same file trims a string, converts it with `Number(...)`, then rejects non-finite, fractional, and non-positive values in `src/components/tasks/task-form-rules.ts:55-68`.

Create defaults and recurrence presets live only in the client form rules:

- `src/components/tasks/task-form-rules.ts:16-20` defines presets `30`, `90`, and `365` days.
- `src/components/tasks/task-form-rules.ts:32-38` defaults `lastCompletedDate` to browser-local today and leaves recurrence blank.
- `src/components/tasks/task-form-rules.ts:24-30` computes browser-local today with `getFullYear()`, `getMonth()`, and `getDate()`.

Server route parsers are intentionally thinner than the full contract. `parseMaintenanceTaskCreateForm(...)` trims `name`, reads `lastCompletedDate`, converts recurrence with `Number(...)`, and returns null only for blank required values or non-finite recurrence in `src/pages/api/tasks/create.ts:39-54`. `parseMaintenanceTaskUpdateForm(...)` mirrors that shape plus `taskId` in `src/pages/api/tasks/update.ts:49-73`.

The authoritative server validation happens after parsing:

- `src/lib/maintenance-task-store.ts:49-53` calls `validateMaintenanceTaskWriteInput(input)` before insert.
- `src/lib/maintenance-task-store.ts:77-81` calls `validateMaintenanceTaskUpdateInput(input)` before update.
- `src/lib/maintenance-tasks.ts:195-213` trims names and validates full write inputs.
- `src/lib/maintenance-tasks.ts:215-237` validates partial update inputs.
- `src/lib/maintenance-tasks.ts:239-262` rejects blank names when supplied, invalid or future dates, and non-positive or fractional recurrence values.

Persisted recurrence remains day-based:

- TypeScript write input uses `recurrenceIntervalDays: number` in `src/lib/maintenance-tasks.ts:34-38`.
- Insert maps to `recurrence_interval_days` in `src/lib/maintenance-task-store.ts:55-60`.
- Update maps to `recurrence_interval_days` in `src/lib/maintenance-task-store.ts:83-91`.
- Supabase enforces integer positive days in `supabase/migrations/20260911130500_create_maintenance_tasks.sql:6`.

The response guidance is correct, with one correction: "consistent outcomes" should mean accept/reject parity and normalized payload parity, not identical redirect copy. Create passes store error text through to the dashboard at `src/pages/api/tasks/create.ts:32-33`; update intentionally redirects with a generic update error at `src/pages/api/tasks/update.ts:42-43`.

### Existing Tests

`npm run test` maps to `vitest run` in `package.json:10`. Vitest has an alias for `@` and uses the Node environment in `vitest.config.ts:4-12`.

Current test files relevant to Phase 1:

- `src/lib/maintenance-tasks.test.ts:14-281` covers date/status helpers, server write/update validation, display mapping, and display sorting.
- `src/pages/api/tasks/create.test.ts:19-129` covers create route success, missing parser input, unauthenticated redirect, missing Supabase redirect, store failure, and parser behavior for complete, blank, and non-numeric forms.
- `src/pages/api/tasks/update.test.ts:18-105` covers update route success, missing task id, unauthenticated redirect, store failure, and parser rejection for blank and non-numeric recurrence.
- `src/lib/maintenance-task-store.test.ts:5-32` covers delete store behavior only, not create/update store validation.
- `src/lib/auth-navigation.test.ts:5` is unrelated to Phase 1.
- `src/pages/api/tasks/delete.test.ts` is unrelated to Phase 1 except as route-test style precedent.

Coverage gaps:

- No tests directly cover `src/components/tasks/task-form-rules.ts`, including browser-local today defaults, recurrence presets, client validation messages, and string recurrence parsing.
- No component or DOM integration tests cover `useTaskFormController`, submit prevention, focus handoff, shared field parity, `max={todayDate}`, preset buttons, or edit initial values. The current Vitest setup is Node-only and `package.json` does not include DOM testing helpers.
- The combined derived-state path has one due-soon example in `src/lib/maintenance-tasks.test.ts:35-48`, but not a full OK/due-soon/overdue boundary matrix from last completed date plus recurrence.
- Direct status tests at `src/lib/maintenance-tasks.test.ts:23-33` cover overdue, exactly seven days, and more than seven days from an already-derived next due date. They do not prove recurrence arithmetic and classification together.
- Create/update parser tests are similar but not shared as a parity matrix. Update lacks blank name/date parser cases. Both route parsers pass zero and decimal recurrence through to store validation, but route tests do not assert that store validation path.
- CI currently runs `npm ci`, `npx astro sync`, `npm run lint`, and `npm run build` in `.github/workflows/ci.yml:18-21`; it does not run `npm run test`, even though `context/foundation/test-plan.md` makes unit + integration required after Phase 1.

## Code References

- `src/lib/maintenance-tasks.ts:1` - Seven-day due-soon threshold constant.
- `src/lib/maintenance-tasks.ts:97-103` - Adds recurrence days to last completed date to compute next due date.
- `src/lib/maintenance-tasks.ts:106-121` - Classifies overdue, due-soon, and OK.
- `src/lib/maintenance-tasks.ts:123-132` - Combines next due date and status derivation.
- `src/lib/maintenance-tasks.ts:145-162` - Maps stored rows to display items.
- `src/lib/maintenance-tasks.ts:195-237` - Server write/update validation.
- `src/lib/maintenance-task-store.ts:44-69` - Create store contract and persisted insert shape.
- `src/lib/maintenance-task-store.ts:71-106` - Update store contract and persisted update shape.
- `src/pages/dashboard.astro:22-29` - Dashboard fetches tasks and derives display items.
- `src/components/tasks/TaskList.astro:24-34` - Status label and badge variant maps.
- `src/components/tasks/TaskList.astro:65-75` - Renders status badge and next due date.
- `src/components/tasks/task-form-rules.ts:16-20` - Recurrence presets.
- `src/components/tasks/task-form-rules.ts:24-38` - Browser-local today and create defaults.
- `src/components/tasks/task-form-rules.ts:40-72` - Client-side form validation.
- `src/components/tasks/TaskFormFields.tsx:37-80` - Shared form controller submit behavior.
- `src/components/tasks/TaskFormFields.tsx:121-198` - Shared name/date/recurrence fields.
- `src/components/tasks/CreateTaskForm.tsx:10-15` - Create form posts to `/api/tasks/create` with `noValidate`.
- `src/components/tasks/EditTaskForm.tsx:21-33` - Edit form seeds shared controller and posts to `/api/tasks/update`.
- `src/pages/api/tasks/create.ts:39-54` - Create route parser.
- `src/pages/api/tasks/update.ts:49-73` - Update route parser.
- `supabase/migrations/20260911130500_create_maintenance_tasks.sql:1-8` - Database task table and recurrence/date constraints.
- `vitest.config.ts:4-12` - Vitest alias and Node environment.
- `.github/workflows/ci.yml:18-21` - CI currently runs install, Astro sync, lint, and build, but not tests.

## Architecture Insights

The task status rule is appropriately centralized in a pure TypeScript module, which makes Risk #1 cheap to test without Supabase, Astro rendering, or browser automation. The important unit boundary is not only `classifyMaintenanceTaskStatus(...)`; it is the combined contract that consumes stored task fields and emits display fields.

The form stack has three layers: React client validation for fast feedback, route parsers for defensive form decoding, and store/server validation as the authoritative contract before persistence. That layered design is sound, but it requires parity tests because the client and server validation rules are separate implementations.

The client date source and server date source differ. Client form defaults use browser-local dates, while server helpers default to UTC date-only strings. Tests should inject fixed dates when validating future-date behavior and status classification.

Route parser tests alone are not enough for Risk #2 because parsers intentionally accept some values that the store rejects. For example, finite decimal or zero recurrence values can parse, but server validation must reject them before persistence.

## Historical Context

- `context/archive/2026-09-11-owned-task-storage-contract/plan.md:129` established the original expectation for next due date, overdue, due-soon, OK, and invalid recurrence tests.
- `context/archive/2026-09-11-create-task-with-status/plan.md:63` and `context/archive/2026-09-11-create-task-with-status/plan.md:125` required create form fields named `name`, `lastCompletedDate`, and `recurrenceIntervalDays`.
- `context/archive/2026-09-12-edit-task-and-recalculate-status/plan.md:54` and `context/archive/2026-09-12-edit-task-and-recalculate-status/plan.md:151` introduced the edit route/form expectations and update validation coverage.
- `context/archive/2026-09-13-task-form-language-and-validation-polish/plan-brief.md:50` documented the layered validation intent: React inline validation, defensive route parser, and server validation backstop.
- `context/archive/2026-09-13-task-form-language-and-validation-polish/reviews/impl-review.md:35` recorded focused Vitest passing for `maintenance-tasks`, create route, and update route tests.
- `context/archive/2026-09-13-task-form-language-and-validation-polish/reviews/impl-review.md:23-30` flagged historical preset prose drift: earlier text mentioned a 180-day half-year preset, but current implementation and review confirm `30/90/365`.

## Hot-Spot Evidence Check

`src/components/tasks` is valid likelihood evidence for Risk #2 and for display wiring in Risk #1, but it is misleading if treated as the date/status calculation owner. It owns form controls, client validation, create/edit wrappers, task actions, and status display.

`src/pages/dashboard.astro` is useful likelihood evidence for display composition. It owns fetch-to-display wiring and dashboard feedback banners, but it does not own due-date arithmetic or validation.

The `src/lib` maintenance-task area is the strongest real failure-path anchor for Risk #1 and the server side of Risk #2. It is a better code anchor than a churn signal: the calculation and validation contracts are centralized there even if the directory is not as visibly UI-hot as `src/components/tasks`.

No Risk #1 or #2 scenario appears speculative. The only misleading part of the evidence is treating high-churn UI paths as if they owned the business calculation. They raise likelihood because they touch the user-facing path, not because they contain the status oracle.

## Cheapest Useful Test Layer

Risk #1 should start with Vitest unit tests against `deriveMaintenanceTaskState(...)` or `toMaintenanceTaskDisplayItems(...)` using fixed `todayDate` and hard-coded expected next due dates/statuses. Add at least OK, due-soon, and overdue rows from last completed date plus recurrence interval, with due-soon boundary coverage. A thin Astro/component render test is optional and lower priority unless Phase 1 chooses to introduce an Astro rendering harness.

Risk #2 should use Vitest unit tests for `validateTaskFormValues(...)` and server validation with the same valid/invalid matrix, plus route/parser integration tests for create/update normalization and rejection. Keep browser/e2e out of Phase 1 unless the implementation plan adds DOM test infrastructure for a specific reason.

Recommended parity matrix:

- Valid: trimmed name, non-future `YYYY-MM-DD`, recurrence `"30"` or `30`, expected accepted and normalized.
- Invalid blank name: rejected by client and server; create/update parser should not call store when name is empty.
- Invalid date format and invalid calendar date: rejected by client and server validation.
- Future last completed date: rejected by client and server validation with fixed today.
- Blank recurrence and non-numeric recurrence: rejected before store on route parser paths.
- Zero recurrence, negative recurrence, and decimal recurrence: rejected by client and server validation; route parser may decode finite values, so the integration expectation should be that store validation blocks persistence.

## Related Research

- `context/archive/2026-09-12-shadcn-luma-design-system-foundation/research.md` - UI foundation research. It is not directly about Phase 1 business logic, but it confirms the current shadcn/Base UI baseline.

## Open Questions

- Should Phase 1 introduce DOM/component testing dependencies for React form behavior, or deliberately keep form coverage at pure helper plus route integration level until Phase 3?
- Should CI start running `npm run test` as part of this phase or be deferred to Phase 4's quality-gates rollout? The test plan says unit + integration are required after Phase 1, but CI currently omits them.
