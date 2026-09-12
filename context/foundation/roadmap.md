---
project: HomeKeep
version: 2
status: draft
created: 2026-09-11
updated: 2026-09-12
prd_version: 1
main_goal: polish
top_blocker: design-system-consistency
milestone_id: mvp-polish-consistency
milestone_seq: 2
milestone_status: open
---

# Roadmap: HomeKeep

> Derived from `context/foundation/prd.md`, the completed M-1 roadmap, and the post-MVP polish brief supplied on 2026-09-12.
> Edit in place; archive completed change folders only through `/10x-archive`.
> M-1 remains documented below as completed historical roadmap context. M-2 adds polish work without expanding the MVP scope.

## Milestone

**M-2: MVP polish, consistency, and design-system hardening** - Status: open

- **Intent:** Improve the already-complete maintenance loop so the app feels coherent, clear, mobile-friendly, and product-owned without expanding the MVP feature set.
- **Source materials:** `context/foundation/prd.md` (v1), completed M-1 roadmap items, and user polish brief from 2026-09-12.
- **Done when:** every F-NN and S-NN with `proposed`, `ready`, `planning`, or `in-progress` status below is `done`.
- **Scope anchors:** PRD FR-001 through FR-006, US-01, and M-2 polish anchors MS-01 through MS-08 below.

### Completed M-1: First usable maintenance loop

- **Intent:** Deliver the smallest signed-in HomeKeep flow that lets a homeowner save recurring maintenance work, see calculated due dates and status, then manage that task enough for the MVP contract.
- **Source materials:** `context/foundation/prd.md` (v1)
- **Scope anchors:** FR-001 through FR-006, US-01.
- **Status:** done

### M-2 Polish Anchors

- **MS-01:** Standardize end-user task terminology, especially "Last completed".
- **MS-02:** Prevent future last-completed dates.
- **MS-03:** Improve task creation defaults and common recurrence interval entry while preserving day-based storage.
- **MS-04:** Remove implementation-focused Supabase wording from user banners.
- **MS-05:** Prioritize the task list on mobile by collapsing task creation.
- **MS-06:** Apply a consistent shadcn/Luma-inspired Lime visual system with theme choices, icons, calendar-friendly date inputs, and loading states.
- **MS-07:** Align dashboard, auth, and homepage flows into one coherent HomeKeep app shell.
- **MS-08:** Add a lightweight HomeKeep identity based on the house-heart mark and favicon; no README/template image work.

## Vision recap

HomeKeep serves an individual homeowner who needs to know when recurring maintenance was last completed and when it should happen next. The useful product promise is deliberately small: last completed date plus recurrence interval produces a next due date and exactly one status, so the homeowner can act without relying on memory, calendars, or scattered notes.

## North star

North star here means the smallest end-to-end slice whose successful delivery proves the current milestone worked.

**M-1 north star, completed:** S-01 proved the core maintenance promise by letting the user create the first task and see calculated status.

**M-2 north star:** S-07 is the current north star because it is where users feel the combined result of wording, visual system, mobile hierarchy, identity, theme, and starter-branding cleanup.

## At a glance

| ID | Change ID | Outcome (user can ...) | Prerequisites | PRD refs | Status |
| --- | --- | --- | --- | --- | --- |
| F-01 | owned-task-storage-contract | (foundation) account-scoped task persistence contract exists for vertical task slices | - | FR-006, Access Control, NFR account access | done |
| S-01 | create-task-with-status | create a maintenance task and immediately see next due date plus current status | F-01 | US-01, FR-001, FR-002, FR-006, Business Logic, NFR task visibility | done |
| S-02 | complete-task-and-refresh-status | mark a saved maintenance task as completed and see last completed date, next due date, and status update | S-01 | FR-005, FR-002, FR-006, Business Logic, NFR task visibility | done |
| S-03 | edit-task-and-recalculate-status | edit an existing maintenance task and see the recalculated next due date and status | S-01 | FR-003, FR-002, FR-006, Business Logic, NFR task visibility | done |
| S-04 | delete-task | delete an existing maintenance task from their own task list | S-01 | FR-004, FR-006, Access Control | done |
| F-02 | shadcn-luma-design-system-foundation | (foundation) consistent HomeKeep UI primitives, theme tokens, and identity hooks exist for polish slices | - | MS-06, MS-08 | ready |
| S-05 | task-form-language-and-validation-polish | create and edit tasks with consistent "Last completed" terminology, safe dates, and common repeat intervals | F-02 | US-01, FR-001, FR-003, MS-01, MS-02, MS-03 | proposed |
| S-06 | dashboard-task-list-first-mobile-ux | scan tasks first on mobile and use clearer task actions and banners | F-02, S-05 | FR-002, FR-004, FR-005, MS-04, MS-05, MS-06 | proposed |
| S-07 | unified-app-shell-auth-and-homepage | enter HomeKeep through dashboard or auth with consistent pages and no starter-facing branding | F-02, S-06 | FR-006, MS-07 | proposed |
| S-08 | homekeep-visual-identity-assets | see lightweight HomeKeep identity and favicon based on the house-heart mark | F-02 | MS-08 | proposed |

## Baseline

What's already in place in the codebase as of `2026-09-12`.

- **Frontend:** present - Astro, React, TypeScript, Tailwind 4, Lucide, `components.json`, and shadcn-style button primitives exist.
- **Backend / API:** present - auth and task API routes exist under `src/pages/api/`.
- **Data:** present for MVP - Supabase task storage, ownership filtering, and derived status helpers exist.
- **Auth:** present - Supabase SSR client, auth handlers, and protected dashboard middleware are wired.
- **Deploy / infra:** present - Cloudflare deployment config, GitHub CI, and first Worker deployment notes exist.
- **Observability:** partial - Cloudflare Worker observability is enabled; app-level task-flow error tracking is not part of M-2.

### M-1 Baseline Snapshot

What's already in place in the codebase as of `2026-09-11` before M-1 implementation.
Foundations below assumed these were present and did not re-scaffold them.

- **Frontend:** present - selected frontend stack is wired in `package.json`, `astro.config.mjs`, `src/pages/`, and `src/components/`.
- **Backend / API:** partial - request handlers existed for auth only; no maintenance-task endpoints or page actions were wired yet.
- **Data:** partial - Supabase config and dependencies existed; no app task schema, migrations, or task CRUD data access existed yet.
- **Auth:** present - Supabase SSR client, auth handlers, and protected dashboard middleware were wired.
- **Deploy / infra:** present - Cloudflare deployment config, GitHub CI, and first Worker deployment notes existed.
- **Observability:** partial - Cloudflare Worker observability was enabled; app-level task-flow error tracking was not present.

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
- **Risk:** This was sequenced first because every task capability depended on ownership; the risk was building task behavior that later needed to be reworked for privacy.
- **Status:** done

### F-02: shadcn/Luma design-system foundation

- **Outcome:** (foundation) consistent HomeKeep UI primitives, theme tokens, and identity hooks exist for the polish slices.
- **Change ID:** shadcn-luma-design-system-foundation
- **PRD refs:** MS-06, MS-08
- **Unlocks:** S-05, S-06, S-07, S-08
- **Prerequisites:** -
- **Parallel with:** -
- **Blockers:** -
- **Unknowns:** -
- **Risk:** The app already mixes starter styling with MVP dashboard styling; establishing shared tokens and primitives first reduces repeated one-off fixes.
- **Status:** ready

## Slices

### S-01: Create task with calculated status

- **Outcome:** user can create a maintenance task by entering name, last completed date, and recurrence interval, then see the saved task with calculated next due date and one current status.
- **Change ID:** create-task-with-status
- **PRD refs:** US-01, FR-001, FR-002, FR-006, Business Logic, NFR task visibility
- **Prerequisites:** F-01
- **Parallel with:** -
- **Blockers:** -
- **Unknowns:** -
- **Risk:** This was the first user-visible proof of the product; the risk was hiding calculation or ownership mistakes inside a flow that appeared to save successfully.
- **Status:** done

### S-02: Mark task completed

- **Outcome:** user can mark a saved maintenance task as completed and see the last completed date, next due date, and status update.
- **Change ID:** complete-task-and-refresh-status
- **PRD refs:** FR-005, FR-002, FR-006, Business Logic, NFR task visibility
- **Prerequisites:** S-01
- **Parallel with:** S-03, S-04
- **Blockers:** -
- **Unknowns:** -
- **Risk:** Completion was sequenced before general editing because recurring maintenance depends on fast status refresh; the risk was treating completion as a generic edit and making the main loop slower.
- **Status:** done

### S-03: Edit task and recalculate

- **Outcome:** user can edit an existing maintenance task and see the recalculated next due date and current status.
- **Change ID:** edit-task-and-recalculate-status
- **PRD refs:** FR-003, FR-002, FR-006, Business Logic, NFR task visibility
- **Prerequisites:** S-01
- **Parallel with:** S-02, S-04
- **Blockers:** -
- **Unknowns:** -
- **Risk:** Editing came after the first create/view loop so recalculation had a known baseline; the risk was duplicating status logic instead of preserving one rule.
- **Status:** done

### S-04: Delete task

- **Outcome:** user can delete an existing maintenance task from their own task list.
- **Change ID:** delete-task
- **PRD refs:** FR-004, FR-006, Access Control
- **Prerequisites:** S-01
- **Parallel with:** S-02, S-03
- **Blockers:** -
- **Unknowns:** -
- **Risk:** Deletion was independent after saved tasks existed; the risk was deleting across account boundaries or leaving the list visually stale.
- **Status:** done

### S-05: Task form language and validation polish

- **Outcome:** user can create and edit tasks with consistent "Last completed" terminology, future-date prevention, today as the default create date, and common recurrence options while storage remains day-based.
- **Change ID:** task-form-language-and-validation-polish
- **PRD refs:** US-01, FR-001, FR-003, MS-01, MS-02, MS-03
- **Prerequisites:** F-02
- **Parallel with:** -
- **Blockers:** -
- **Unknowns:** -
- **Risk:** The risk is making the UI easier while accidentally changing the recurrence contract; keep persisted recurrence as days.
- **Status:** proposed

### S-06: Dashboard task-list-first mobile UX

- **Outcome:** user can scan tasks first on mobile, open creation only when needed, and act on tasks through clearer icon-supported controls and concise banners.
- **Change ID:** dashboard-task-list-first-mobile-ux
- **PRD refs:** FR-002, FR-004, FR-005, MS-04, MS-05, MS-06
- **Prerequisites:** F-02, S-05
- **Parallel with:** S-08
- **Blockers:** -
- **Unknowns:** -
- **Risk:** The risk is hiding creation too deeply; the mobile add-task control must remain obvious while the task list gets priority.
- **Status:** proposed

### S-07: Unified app shell, auth, and homepage

- **Outcome:** user enters HomeKeep through the dashboard when signed in or an auth page when signed out, with dashboard and auth pages sharing one visual system and no user-facing starter branding.
- **Change ID:** unified-app-shell-auth-and-homepage
- **PRD refs:** FR-006, MS-07
- **Prerequisites:** F-02, S-06
- **Parallel with:** -
- **Blockers:** -
- **Unknowns:** -
- **Risk:** The risk is changing route behavior in a way that weakens auth protection; keep middleware as the owner of protected dashboard and task routes.
- **Status:** proposed

### S-08: HomeKeep visual identity assets

- **Outcome:** user sees a lightweight HomeKeep identity through the house-heart mark, app title treatment, and favicon.
- **Change ID:** homekeep-visual-identity-assets
- **PRD refs:** MS-08
- **Prerequisites:** F-02
- **Parallel with:** S-06
- **Blockers:** -
- **Unknowns:** -
- **Risk:** The risk is spending polish time on brand collateral; keep this limited to app identity and favicon, excluding README/template images.
- **Status:** proposed

## Backlog Handoff

| Roadmap ID | Change ID | Suggested issue title | Status | Notes |
| --- | --- | --- | --- | --- |
| F-01 | owned-task-storage-contract | Establish owned task storage contract | done | Archived 2026-09-11. |
| S-01 | create-task-with-status | Create task and show calculated status | done | Archived 2026-09-11. |
| S-02 | complete-task-and-refresh-status | Mark task completed and refresh status | done | Archived 2026-09-11. |
| S-03 | edit-task-and-recalculate-status | Edit task and recalculate status | done | Archived 2026-09-12. |
| S-04 | delete-task | Delete task from own list | done | Archived 2026-09-12. |
| F-02 | shadcn-luma-design-system-foundation | Establish HomeKeep design-system foundation | ready | Plan this first; include UI/shadcn research before implementation. |
| S-05 | task-form-language-and-validation-polish | Polish task form terminology, validation, and recurrence inputs | proposed | Plan after F-02 is implemented. |
| S-06 | dashboard-task-list-first-mobile-ux | Make dashboard task list mobile-first and actions clearer | proposed | Plan after F-02 and S-05 are implemented. |
| S-07 | unified-app-shell-auth-and-homepage | Unify app shell, auth pages, and root entry flow | proposed | Plan after F-02 and S-06 are implemented. |
| S-08 | homekeep-visual-identity-assets | Add HomeKeep mark and favicon | proposed | Plan after F-02 is implemented; no README/template image work. |

## Open Roadmap Questions

None.

## Parked

- **Shared homes, household members, invitations, and role separation** - Why parked: PRD Non-Goals exclude shared ownership in the MVP.
- **Email, push, SMS, or calendar reminders** - Why parked: PRD Non-Goals keep the MVP focused on status when the homeowner opens HomeKeep.
- **Prebuilt task library** - Why parked: PRD Non-Goals say homeowners create their own maintenance tasks.
- **AI-generated schedules or recommendations** - Why parked: PRD Non-Goals keep scheduling rules based only on user-provided inputs.
- **Custom domain, Git deployment integration, and preview deployment workflow** - Why parked: first deployment already exists and the current milestone remains product polish.
- **README/template image generation** - Why parked: explicitly removed from S-08.

## Milestone History

- **M-1: First usable maintenance loop** - Closed 2026-09-12. Delivered account-scoped create, view, complete, edit, and delete for maintenance tasks.

## Done

- **S-04: user can delete an existing maintenance task from their own task list.** - Archived 2026-09-12 -> `context/archive/2026-09-12-delete-task/`. Lesson: -.
- **S-03: user can edit an existing maintenance task and see the recalculated next due date and current status.** - Archived 2026-09-12 -> `context/archive/2026-09-12-edit-task-and-recalculate-status/`. Lesson: -.
- **F-01: (foundation) account-scoped task persistence contract exists so each vertical task slice can store, read, and verify only the signed-in homeowner's own tasks.** - Archived 2026-09-11 -> `context/archive/2026-09-11-owned-task-storage-contract/`. Lesson: -.
- **S-01: user can create a maintenance task by entering name, last completed date, and recurrence interval, then see the saved task with calculated next due date and one current status.** - Archived 2026-09-11 -> `context/archive/2026-09-11-create-task-with-status/`. Lesson: -.
- **S-02: user can mark a saved maintenance task as completed and see last completed date, next due date, and status update.** - Archived 2026-09-11 -> `context/archive/2026-09-11-complete-task-and-refresh-status/`. Lesson: -.
