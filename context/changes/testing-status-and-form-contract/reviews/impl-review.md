<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Testing Status and Form Contracts

- **Plan**: `context/changes/testing-status-and-form-contract/plan.md`
- **Scope**: Full plan, phases 1-3
- **Date**: 2026-09-13
- **Verdict**: APPROVED
- **Findings**: 0 critical, 0 warnings, 1 observation

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

## Findings

### F1 - Phase 1 commit includes explicitly approved extra paths

- **Severity**: OBSERVATION
- **Impact**: LOW - quick decision; fix is obvious and narrowly scoped
- **Dimension**: Scope Discipline
- **Location**: commit `63a32a4`
- **Detail**: The Phase 1 commit includes `.agents/.10x-cli-manifest.json`, `AGENTS.md`, and `context/foundation/test-plan.md`, which were outside the Phase 1 touched set. This happened after the dirty-path prompt and the user explicitly selected `Stage all`, so it is accepted commit history rather than implementation drift.
- **Fix**: No code fix required; keep this note as accepted scope history for future archive/review readers.
- **Decision**: ACCEPTED - user approved staging all dirty paths during the Phase 1 commit ritual.

## Evidence

- `src/lib/maintenance-tasks.test.ts:50` adds the combined boundary matrix.
- `src/lib/maintenance-tasks.test.ts:55`, `src/lib/maintenance-tasks.test.ts:62`, and `src/lib/maintenance-tasks.test.ts:69` use literal expected next due dates.
- `src/components/tasks/task-form-rules.test.ts:16` covers defaults, and `src/components/tasks/task-form-rules.test.ts:24` covers day-based recurrence presets.
- `src/components/tasks/task-form-rules.test.ts:36` covers the client valid/invalid matrix.
- `src/lib/maintenance-tasks.test.ts:195` covers matching write/update server validation rejection.
- `src/pages/api/tasks/create.test.ts:130` and `src/pages/api/tasks/update.test.ts:111` prove finite-but-invalid recurrence values parse through for store validation.
- `.github/workflows/ci.yml:20` runs `npm run test`.
- `context/foundation/test-plan.md:115` and `context/foundation/test-plan.md:131` document the Phase 1 cookbook patterns.

## Verification

- `npm run test` passed: 7 test files, 67 tests.
- `npm run lint` passed. It emitted existing `astro-eslint-parser` projectService compatibility notices.
- `npm run build` passed with escalation after the sandboxed run logged Wrangler `EPERM` errors writing outside the workspace. The successful build emitted the existing sitemap warning about a missing Astro `site` option.
- `rg -n "playwright|@testing-library|jsdom|happy-dom|vitest-environment" package.json vitest.config.ts src context .github` returned no matches, confirming no DOM/e2e infrastructure was introduced.
