# Task Form Language and Validation Polish - Plan Brief

> Full plan: `context/changes/task-form-language-and-validation-polish/plan.md`

## What & Why

HomeKeep needs the task create and edit forms to feel like one product flow instead of two raw data-entry surfaces. This plan adds consistent "Last completed" language, prevents future completion dates, defaults new tasks to today, and makes common recurrence choices faster without changing the MVP storage contract.

## Starting Point

The dashboard already supports create and edit through POST routes and shared maintenance-task validators. The current create form has no date default or inline validation, the edit form is still static Astro markup, and server validation rejects invalid date formats and recurrence intervals but does not reject future last-completed dates.

## Desired End State

Users can create and edit tasks with matching shadcn/Luma form controls. The create date defaults to the browser's local today, date inputs prevent future dates, recurrence offers 1 month, half a year, and 1 year presets plus custom days, and invalid input is explained inline before submit. API routes remain defensive and return the existing dashboard `taskError` banner if invalid data still reaches the server.

## Key Decisions Made

| Decision | Choice | Why | Source |
| --- | --- | --- | --- |
| Date source | Browser local date for UI; server date as backstop | Matches what the homeowner sees while keeping server validation authoritative. | Plan interview |
| Create default | Today | Reduces friction for the common case of logging work just completed. | Plan interview |
| Edit scope | Match create | Create and edit should teach one task-form behavior. | Plan interview |
| Recurrence presets | 30, 180, 365 days labelled 1 month, Half a year, 1 year | Covers common maintenance intervals without clutter. | Plan interview |
| Recurrence storage | Days remain the persisted value | Preserves PRD and existing Supabase/store contracts. | Roadmap / Plan |
| Validation feedback | Inline only in interactive forms | Gives precise field guidance without adding complex redirected form state. | Plan interview |
| Server fallback | Generic dashboard banner | Keeps no-JS and tampered-submit behavior simple and consistent with existing task routes. | Plan interview |

## Scope

**In scope:**

- Shared task-form validation helpers for browser-local date and recurrence input checks.
- Central server validation rejecting future `lastCompletedDate` values.
- Create form default date set to browser-local today.
- Matching create and edit task form controls using the F-02 shadcn/Luma/Lime primitive baseline.
- Recurrence presets for 30, 180, and 365 days plus custom positive whole-number days.
- Route parser tests for create and update fallback behavior.

**Out of scope:**

- Database schema changes or recurrence units other than days.
- New reminders, task templates, shared households, or AI scheduling.
- S-06 mobile task-list-first dashboard restructuring.
- S-07 app shell/auth/homepage redesign beyond what form integration requires.
- Changing the due-soon threshold or task status calculation.

## Architecture / Approach

Validation stays layered: React forms provide local inline feedback, route parsers defensively normalize submitted form values, and `src/lib/maintenance-tasks.ts` remains the shared business-rule gate used by the store. A reusable React task form field layer should be shared by create and edit so language, date constraints, and recurrence presets cannot drift.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Validation Contract | Future-date validation and safer create/update route parsing with tests | Server and browser dates can differ near midnight |
| 2. Shared Form UX | Reusable shadcn/Luma task form controls with inline validation and presets | Overbuilding form abstraction beyond this slice |
| 3. Integration | Create and edit consume the shared form behavior, including fixed edit form ids | Astro/React boundary can disturb existing POST flows |

**Prerequisites:** F-02 shadcn/Luma design-system foundation is implemented.
**Estimated effort:** About 2 focused implementation sessions across 3 phases.

## Open Risks & Assumptions

- Browser-local today can differ from the server's date near midnight; server validation remains the final backstop.
- Date inputs use native browser date controls; no custom calendar component is planned for this slice.
- Inline validation depends on JavaScript, while no-JS/tampered submissions keep the existing dashboard `taskError` banner pattern.

## Success Criteria (Summary)

- Create and edit forms use the same terminology, validation rules, recurrence presets, and shadcn/Luma visual baseline.
- Future last-completed dates cannot be submitted through normal UI and are rejected by server validation.
- Existing task creation, editing, recalculation, and ownership behavior remain unchanged.
