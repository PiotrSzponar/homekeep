# Establish Owned Task Storage Contract - Plan Brief

> Full plan: `context/changes/owned-task-storage-contract/plan.md`

## What & Why

This change creates the minimum owned task storage contract for HomeKeep. It exists because every later task workflow must store maintenance tasks while enforcing the PRD rule that a signed-in homeowner can access only their own data.

## Starting Point

Supabase auth is already wired through server helpers, auth routes, and protected middleware. Task persistence is not wired yet: there is no task table, migration, task store, or repeatable date/status test path.

## Desired End State

HomeKeep has a source-controlled `maintenance_tasks` migration with owner-only RLS, narrow TypeScript task contracts, and pure helpers for next due date/status. Later slices can implement create/view, completion, edit, and delete behavior without re-deciding ownership, stored fields, or status names.

## Key Decisions Made

| Decision | Choice | Why | Source |
| --- | --- | --- | --- |
| Stored fields | MVP fields only | The PRD only needs name, last completed date, recurrence interval, ownership, and timestamps. | Plan |
| Recurrence interval | Positive days integer | This is the simplest unambiguous representation for the MVP rule. | Plan |
| Derived values | App helper computes due date/status | Avoids stale stored status while giving later slices one shared rule. | Plan |
| Ownership enforcement | Owner-only RLS for CRUD | Directly satisfies `FR-006` and protects every downstream task slice. | Roadmap / Plan |
| Data-access surface | Typed helpers | Keeps F-01 useful as a contract without absorbing full CRUD UI scope. | Plan |
| Verification | Migration and helper tests | Lint/build alone cannot prove RLS shape or date/status boundaries. | Plan |
| Remote migration | Manual hosted Supabase apply | Keeps production schema mutation auditable and human-gated. | Plan |

## Scope

**In scope:**
- Supabase migration for `maintenance_tasks`
- Owner-only RLS policies
- Task row/input/update TypeScript types
- Pure due-date and status helpers
- Minimal test runner and contract tests
- Roadmap status sync to `planning`

**Out of scope:**
- User-visible create/view/edit/delete UI
- Completion workflow UI
- Reminders, shared homes, task library, or AI schedules
- Automatic production Supabase schema push

## Architecture / Approach

The database enforces ownership with RLS, while the app owns derived due-date/status calculation through shared TypeScript helpers. Later Astro pages or API routes will use the existing Supabase SSR client and these task contracts rather than accepting owner IDs from browser input.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Database Ownership Contract | Source-controlled task table and RLS contract | Weak policies could leak or mutate another user's data |
| 2. Typed Task Contract And Business Rule Helpers | Shared task types and due-date/status helpers | Duplicated status logic could drift in later slices |
| 3. Repeatable Verification Path | Tests/checks proving helper behavior and migration shape | Test setup could be too heavy for the small MVP |

**Prerequisites:** Existing Supabase auth config and hosted Supabase project access.

## Open Risks & Assumptions

- Hosted Supabase migration application remains a manual gate.
- Local Supabase may not be available on every machine; the plan includes a fallback contract check.
- The MVP accepts recurrence intervals as days, not calendar months.

## Success Criteria (Summary)

- Task persistence contract is source-controlled and owner-scoped.
- Derived due-date/status behavior is tested at important boundaries.
- Later `S-01` work can consume the contract without redefining ownership or task fields.
