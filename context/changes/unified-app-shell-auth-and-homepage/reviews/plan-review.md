<!-- PLAN-REVIEW-REPORT -->
# Plan Review: Unified App Shell, Auth, and Homepage

- **Plan**: `context/changes/unified-app-shell-auth-and-homepage/plan.md`
- **Mode**: Deep local review
- **Date**: 2026-09-13
- **Verdict**: SOUND after fixes
- **Findings**: 1 critical, 1 warning, 1 observation

## Verdicts

| Dimension | Verdict |
| --- | --- |
| End-State Alignment | PASS |
| Lean Execution | PASS |
| Architectural Fitness | PASS |
| Blind Spots | PASS after fix |
| Plan Completeness | PASS after fix |

## Grounding

Grounding: 12/12 paths OK, 5/5 symbols OK, brief to plan OK. Deep verification was performed locally because this environment only permits sub-agent delegation when the user explicitly asks for it.

## Findings

### F1 - Phase success criteria use checkboxes outside Progress

- **Severity**: CRITICAL
- **Impact**: LOW - quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Phase 1, Phase 2, Phase 3 success criteria
- **Detail**: The phase-body success criteria used checklist bullets while the plan also had the canonical `## Progress` checklist. The plan-review skill treats checkboxes outside `## Progress` as a parser-risk issue for `/10x-implement`.
- **Fix**: Convert phase-body success criteria from `- [ ] ...` to plain `- ...`, leaving only the `## Progress` section as checkboxes.
- **Decision**: FIXED - phase-body success criteria now use plain bullets.

### F2 - Redirect-helper tests are conditional despite a planned helper

- **Severity**: WARNING
- **Impact**: MEDIUM - real tradeoff; pause to reason through it
- **Dimension**: Blind Spots
- **Location**: Phase 1 Redirect Helper Extraction and Testing Strategy
- **Detail**: Phase 1 planned `src/lib/auth-navigation.ts`, but automated criteria said `npm run test -- src/lib/auth-navigation.test.ts` passes only "if helper tests are added." That allowed implementation to skip the focused redirect coverage selected during planning.
- **Fix A Recommended**: Make `src/lib/auth-navigation.ts` and `src/lib/auth-navigation.test.ts` required, and remove optional test wording.
  - Strength: Matches the chosen verification strategy and keeps redirect logic covered without a page harness.
  - Tradeoff: Adds a tiny helper even though inline page checks would be simpler.
  - Confidence: HIGH - existing pure helper tests already fit this pattern.
  - Blind spot: Exact helper signatures can still be chosen during implementation.
- **Fix B**: Remove the helper extraction step and rely on manual route verification plus lint/build.
  - Strength: Smallest implementation.
  - Tradeoff: Weakens automated coverage for the highest-risk behavior in the slice.
  - Confidence: MEDIUM - acceptable for tiny route logic, but less aligned with the planning decision.
  - Blind spot: Future redirect regressions remain mostly manual.
- **Decision**: FIXED via Fix A - helper and focused tests are now required.

### F3 - Roadmap Backlog Handoff still says S-07 is proposed

- **Severity**: OBSERVATION
- **Impact**: LOW - quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: `context/foundation/roadmap.md`
- **Detail**: The S-07 at-a-glance row and item body said `planning`, but the Backlog Handoff row still said `proposed`.
- **Fix**: Change the S-07 Backlog Handoff status cell from `proposed` to `planning`.
- **Decision**: FIXED - roadmap Backlog Handoff now matches the planning status.
