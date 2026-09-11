---
project: HomeKeep
version: 1
status: draft
created: 2026-09-11
updated: 2026-09-11
prd_version: 1
main_goal: speed
top_blocker: time
milestone_id: first-usable-maintenance-loop
milestone_seq: 1
milestone_status: open
---

# Roadmap: HomeKeep

> Derived from `context/foundation/prd.md` + auto-researched codebase baseline.
> Edit in place; archive when superseded.
> Slices below are listed in dependency order. The "At a glance" table is the index.

## Milestone

**M-1: First usable maintenance loop** - Status: open

- **Intent:** Deliver the smallest signed-in HomeKeep flow that lets a homeowner save recurring maintenance work, see calculated due dates and status, then manage that task enough for the MVP contract.
- **Source materials:** `context/foundation/prd.md` (v1)
- **Done when:** every F-NN and S-NN below is `done`.
- **Scope anchors:** FR-001 through FR-006, US-01.

## Vision recap

HomeKeep serves an individual homeowner who needs to know when recurring maintenance was last completed and when it should happen next. The useful product promise is deliberately small: last completed date plus recurrence interval produces a next due date and exactly one status, so the homeowner can act without relying on memory, calendars, or scattered notes.

## North star

North star here means the smallest end-to-end slice whose successful delivery proves the core HomeKeep promise works.

**S-01: User can create the first maintenance task and see status** - This is placed as early as its prerequisite allows because the selected goal is speed, and US-01 plus the primary success criterion both hinge on this flow.

## At a glance

| ID | Change ID | Outcome (user can ...) | Prerequisites | PRD refs | Status |
| --- | --- | --- | --- | --- | --- |
| F-01 | owned-task-storage-contract | (foundation) account-scoped task persistence contract exists for vertical task slices | - | FR-006, Access Control, NFR account access | done |
| S-01 | create-task-with-status | create a maintenance task and immediately see next due date plus current status | F-01 | US-01, FR-001, FR-002, FR-006, Business Logic, NFR task visibility | proposed |
| S-02 | complete-task-and-refresh-status | mark a saved maintenance task as completed and see last completed date, next due date, and status update | S-01 | FR-005, FR-002, FR-006, Business Logic, NFR task visibility | proposed |
| S-03 | edit-task-and-recalculate-status | edit an existing maintenance task and see the recalculated next due date and status | S-01 | FR-003, FR-002, FR-006, Business Logic, NFR task visibility | proposed |
| S-04 | delete-task | delete an existing maintenance task from their own task list | S-01 | FR-004, FR-006, Access Control | proposed |

## Baseline

What's already in place in the codebase as of `2026-09-11` (auto-researched + user-confirmed).
Foundations below assume these are present and do NOT re-scaffold them.

- **Frontend:** present - selected frontend stack is wired in `package.json`, `astro.config.mjs`, `src/pages/`, and `src/components/`.
- **Backend / API:** partial - request handlers exist for auth only; no maintenance-task endpoints or page actions are wired yet.
- **Data:** partial - Supabase config and dependencies exist; no app task schema, migrations, or task CRUD data access exists yet.
- **Auth:** present - Supabase SSR client, auth handlers, and protected dashboard middleware are wired.
- **Deploy / infra:** present - Cloudflare deployment config, GitHub CI, and first Worker deployment notes exist.
- **Observability:** partial - Cloudflare Worker observability is enabled; app-level task-flow error tracking is not present.

## Foundations

### F-01: Owned task storage contract

- **Outcome:** (foundation) account-scoped task persistence contract exists so each vertical task slice can store, read, and verify only the signed-in homeowner's own tasks.
- **Change ID:** owned-task-storage-contract
- **PRD refs:** FR-006, Access Control, NFR account access
- **Unlocks:** S-01, S-02, S-03, S-04
- **Prerequisites:** -
- **Parallel with:** -
- **Blockers:** -
- **Unknowns:** -
- **Risk:** This is sequenced first because every task capability depends on ownership; the risk is building task behavior that later needs to be reworked for privacy.
- **Status:** done

## Slices

### S-01: Create task with calculated status

- **Outcome:** user can create a maintenance task by entering name, last completed date, and recurrence interval, then see the saved task with calculated next due date and one current status.
- **Change ID:** create-task-with-status
- **PRD refs:** US-01, FR-001, FR-002, FR-006, Business Logic, NFR task visibility
- **Prerequisites:** F-01
- **Parallel with:** -
- **Blockers:** -
- **Unknowns:** -
- **Risk:** This is the first user-visible proof of the product; the risk is hiding calculation or ownership mistakes inside a flow that appears to save successfully.
- **Status:** proposed

### S-02: Mark task completed

- **Outcome:** user can mark a saved maintenance task as completed and see the last completed date, next due date, and status update.
- **Change ID:** complete-task-and-refresh-status
- **PRD refs:** FR-005, FR-002, FR-006, Business Logic, NFR task visibility
- **Prerequisites:** S-01
- **Parallel with:** S-03, S-04
- **Blockers:** -
- **Unknowns:** -
- **Risk:** Completion is sequenced before general editing because recurring maintenance depends on fast status refresh; the risk is treating completion as a generic edit and making the main loop slower.
- **Status:** proposed

### S-03: Edit task and recalculate

- **Outcome:** user can edit an existing maintenance task and see the recalculated next due date and current status.
- **Change ID:** edit-task-and-recalculate-status
- **PRD refs:** FR-003, FR-002, FR-006, Business Logic, NFR task visibility
- **Prerequisites:** S-01
- **Parallel with:** S-02, S-04
- **Blockers:** -
- **Unknowns:** -
- **Risk:** Editing comes after the first create/view loop so recalculation has a known baseline; the risk is duplicating status logic instead of preserving one rule.
- **Status:** proposed

### S-04: Delete task

- **Outcome:** user can delete an existing maintenance task from their own task list.
- **Change ID:** delete-task
- **PRD refs:** FR-004, FR-006, Access Control
- **Prerequisites:** S-01
- **Parallel with:** S-02, S-03
- **Blockers:** -
- **Unknowns:** -
- **Risk:** Deletion is independent after saved tasks exist; the risk is deleting across account boundaries or leaving the list visually stale.
- **Status:** proposed

## Backlog Handoff

| Roadmap ID | Change ID | Suggested issue title | Ready for `/10x-plan` | Notes |
| --- | --- | --- | --- | --- |
| F-01 | owned-task-storage-contract | Establish owned task storage contract | yes | Run `/10x-plan owned-task-storage-contract` |
| S-01 | create-task-with-status | Create task and show calculated status | no | Wait for F-01 |
| S-02 | complete-task-and-refresh-status | Mark task completed and refresh status | no | Wait for S-01 |
| S-03 | edit-task-and-recalculate-status | Edit task and recalculate status | no | Wait for S-01 |
| S-04 | delete-task | Delete task from own list | no | Wait for S-01 |

## Open Roadmap Questions

None.

## Parked

- **Shared homes, household members, invitations, and role separation** - Why parked: PRD Non-Goals exclude shared ownership in the MVP.
- **Email, push, SMS, or calendar reminders** - Why parked: PRD Non-Goals keep the MVP focused on status when the homeowner opens HomeKeep.
- **Prebuilt task library** - Why parked: PRD Non-Goals say homeowners create their own maintenance tasks.
- **AI-generated schedules or recommendations** - Why parked: PRD Non-Goals keep scheduling rules based only on user-provided inputs.
- **Custom domain, Git deployment integration, and preview deployment workflow** - Why parked: first deployment already exists and the current milestone is about the product task loop.

## Milestone History

None.

## Done

- **F-01: (foundation) account-scoped task persistence contract exists so each vertical task slice can store, read, and verify only the signed-in homeowner's own tasks.** - Archived 2026-09-11 -> `context/archive/2026-09-11-owned-task-storage-contract/`. Lesson: -.
