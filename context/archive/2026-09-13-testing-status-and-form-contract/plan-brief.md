# Testing Status and Form Contracts - Plan Brief

> Full plan: `context/changes/testing-status-and-form-contract/plan.md`
> Research: `context/changes/testing-status-and-form-contract/research.md`

## What & Why

This plan turns rollout Phase 1 of the test plan into a small Vitest-only implementation. It protects the MVP's core promise: saved task source fields produce the right next due date/status, and create/edit task inputs obey the same contract across client and server paths.

## Starting Point

The repo already has Vitest, task helper tests, and create/update route tests. Research found gaps in the combined date/status boundary matrix, direct client form rule coverage, create/edit parser parity, and CI enforcement.

## Desired End State

Status/date boundary examples are hard-coded and test the combined business contract from last completed date plus recurrence interval to next due date plus status. Client/server validation and create/update parser behavior are covered by focused parity tests. CI runs `npm run test`, and the test plan cookbook explains how to extend the new patterns.

## Key Decisions Made

| Decision            | Choice                                      | Why                                                                                                  | Source           |
| ------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------- |
| Test layer          | Vitest unit/integration only                | Cheapest layer covers the risks without adding browser infrastructure.                               | User / Research  |
| DOM/component tests | Excluded                                    | Form behavior can be covered through pure rule tests and route tests in this phase.                  | User             |
| Browser e2e         | Excluded                                    | Phase 1 does not need navigation, hydration, or mobile workflow signal.                              | User             |
| Date oracle         | Hard-coded expected values                  | Prevents tests from copying production date calculation into expected results.                       | User / Research  |
| Form parity meaning | Accept/reject and normalized payload parity | Create and update intentionally differ in redirect copy, so identical messages are not the contract. | Research         |
| CI gate             | Add `npm run test`                          | Unit/integration becomes required after Phase 1.                                                     | User / Test Plan |

## Scope

**In scope:**

- Combined date/status boundary tests in `src/lib/maintenance-tasks.test.ts`.
- Direct client form rule tests for defaults, presets, and a small valid/invalid matrix.
- Server validation parity tests in `src/lib/maintenance-tasks.test.ts`.
- Focused create/update parser tests for normalization and parser-owned rejection.
- CI update to run `npm run test`.
- Cookbook updates in `context/foundation/test-plan.md` for Phase 1 patterns.

**Out of scope:**

- DOM/component test dependencies.
- Playwright or browser e2e.
- Broad UI behavior tests.
- Supabase ownership, auth, mutation feedback, mobile, visual, or accessibility coverage.

## Architecture / Approach

Expand tests at the current ownership boundaries: business rules in `src/lib`, client rules in `src/components/tasks`, route parsers in `src/pages/api/tasks`, and CI in `.github/workflows/ci.yml`. The plan avoids new runtime dependencies and uses fixed dates everywhere date-sensitive behavior matters.

## Phases at a Glance

| Phase                                 | What it delivers                                                     | Key risk                                                 |
| ------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------- |
| 1. Combined Status Boundary Tests     | Hard-coded overdue, due-soon, and OK combined business-rule examples | Tests accidentally validate only part of the status path |
| 2. Client/Server Form Contract Parity | Focused validation and parser parity across create/edit paths        | Client and server contracts drift                        |
| 3. CI Test Gate and Cookbook Update   | CI runs tests and cookbook records new patterns                      | New contracts exist locally but are not durable          |

**Prerequisites:** Existing Vitest setup and Phase 1 research.
**Estimated effort:** One short implementation pass across three small phases.

## Open Risks & Assumptions

- CI is currently configured for `master` even though the local branch is `main`; this plan does not change workflow triggers.
- No DOM coverage means submit-prevention and focus behavior remain deliberately untested until a later phase chooses a DOM layer.

## Success Criteria (Summary)

- `npm run test`, `npm run lint`, and `npm run build` pass.
- Date/status tests use fixed `todayDate` and literal expected dates/statuses.
- Create/edit form contract tests prove the same accepted/rejected input classes without adding browser test tooling.
