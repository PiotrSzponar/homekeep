# Test Plan

> Phased test rollout for this project. Strategy is frozen at the top
> (sections 1-5); cookbook patterns at the bottom (section 6) fill in as phases ship.
> Read before writing any new test.
>
> Refresh: re-run `/10x-test-plan --refresh` when stale (see section 8).
>
> Last updated: 2026-09-13

## 1. Strategy

Tests follow three non-negotiable principles for this project:

1. **Cost x signal.** The cheapest test that gives a real signal for the
   risk wins. Do not promote to e2e because e2e "feels safer." Do not put a
   vision model on top of a deterministic visual diff that already catches
   the regression.
2. **User concerns are first-class evidence.** Risks anchored in "the team is
   worried about X, and the failure would surface somewhere in area Y" carry
   the same weight as PRD lines or hot-spot data.
3. **Risks are scenarios, not code locations.** This plan documents *what
   could fail* and *why we believe it's likely* - drawn from documents,
   interview, and codebase *signal* (churn, structure, test base). It does
   NOT claim to know which line owns the failure. That knowledge is produced
   by `/10x-research` during each rollout phase. If the plan and research
   disagree about where the failure lives, research is the ground truth.

Hot-spot scope used for likelihood weighting: `src`, `supabase`.

## 2. Risk Map

The top failure scenarios this project must protect against, ordered by
risk = impact x likelihood. Risks are failure scenarios in user or business
terms, not test names. The Source column cites evidence that surfaced the
risk - never a specific file as "where the failure lives."

| # | Risk (failure scenario) | Impact | Likelihood | Source (evidence - not anchor) |
|---|---|---|---|---|
| 1 | Wrong next due date or status causes a homeowner to miss or misprioritize maintenance. | High | High | PRD Business Logic; roadmap S-01/S-02/S-03; interview Q1/Q2; hot-spot dir `src/components/tasks` (19 commits/30d) |
| 2 | Client-side form behavior accepts, blocks, or transforms task inputs differently than the server task contract. | High | High | PRD FR-001/FR-003; roadmap S-05; interview Q3/Q4; hot-spot dir `src/components/tasks` (19 commits/30d) |
| 3 | A signed-in homeowner can access or mutate another homeowner's tasks through a task route or stale identifier. | High | Medium | PRD Guardrails and Access Control; roadmap F-01/S-04/S-07; hot-spot dir `src/pages/api` (17 commits/30d) |
| 4 | Completion, edit, or delete appears successful but the refreshed dashboard is stale or misleading. | Medium | High | PRD FR-002/FR-005; roadmap S-02/S-03/S-04/S-06; hot-spot `src/pages/dashboard.astro` (14 commits/30d) |
| 5 | Auth entry and protected routes regress, causing redirect loops or exposing signed-in surfaces incorrectly. | High | Medium | PRD Access Control; roadmap S-07; hot-spot dirs `src/pages/auth` (17 commits/30d), `src/components/auth` (15 commits/30d) |
| 6 | Mobile task actions become hard to operate or make destructive deletion too easy after UI churn. | Medium | Medium | Roadmap S-06; archived slice risk; hot-spot dir `src/components/ui` (19 commits/30d) |

### Risk Response Guidance

| Risk | What would prove protection | Must challenge | Context `/10x-research` must ground | Likely cheapest layer | Anti-pattern to avoid |
|---|---|---|---|---|---|
| #1 | Boundary examples independently prove OK, due soon, and overdue from last-completed date plus recurrence interval. | Do not trust production date math as the oracle. | Rule contract, date source, boundary fixture source, and display path. | unit + integration | Copying the implementation calculation into expected values. |
| #2 | The same invalid and valid task inputs produce consistent outcomes across create and edit paths. | Do not assume browser constraints equal server validation. | Client validation, server acceptance rules, defaults, and persisted interval contract. | integration | Happy-path-only form tests. |
| #3 | Authenticated requests cannot read, update, complete, or delete a task outside the current homeowner's account. | Do not confuse "signed in" with "owns this task." | Auth boundary, ownership filtering, mutation side effects, and stale-id behavior. | integration | Over-mocking ownership checks. |
| #4 | After completion/edit/delete, the next dashboard render shows the changed task state, success/failure feedback, and no stale action result. | Do not assume redirects imply state changed. | Mutation result contract, redirect/query feedback, and dashboard refresh ordering. | integration + focused e2e smoke | Testing only direct handler output. |
| #5 | Signed-out users reach auth surfaces, signed-in users reach the dashboard, and protected pages/routes do not loop or leak. | Do not move protection from middleware into scattered pages. | Route protection contract, entry redirects, auth fallback states, and signed-in/out fixtures. | unit + e2e smoke | Testing helper logic but never the navigation contract. |
| #6 | On narrow viewports, primary task actions remain reachable, ordered, and guarded against accidental deletion. | Do not equate desktop DOM presence with mobile usability. | Mobile action hierarchy, destructive confirmation behavior, and critical viewport dimensions. | e2e + selective visual/a11y review | Broad visual snapshots of every UI primitive. |

## 3. Phased Rollout

Each row is a discrete rollout phase that will open its own change folder via
`/10x-new`. Status moves through the fixed values below; the orchestrator
updates Status as artifacts appear on disk.

| # | Phase name | Goal (one line) | Risks covered | Test types | Status | Change folder |
|---|---|---|---|---|---|---|
| 1 | Status and form contract | Prove date/status boundaries and create/edit form parity before broader flow tests. | #1, #2 | unit + integration | planned | context/changes/testing-status-and-form-contract/ |
| 2 | Account-scoped task mutations | Prove task route ownership and refreshed mutation feedback for complete/edit/delete. | #3, #4 | integration + focused e2e smoke | not started | - |
| 3 | Auth and mobile workflow | Prove signed-in/out navigation plus mobile task action usability on critical screens. | #5, #6 | e2e + accessibility + selective visual review | not started | - |
| 4 | Quality gates and cookbook | Wire the durable floor and fill the cookbook from the shipped rollout patterns. | cross-cutting | gates + documentation | not started | - |

**Status vocabulary** (fixed parser literals): `not started`, `change opened`,
`researched`, `planned`, `implementing`, `complete`.

## 4. Stack

The classic test base for this project is sparse: Vitest is configured and six
test files exist, clustered in `src/lib` and task API routes. CI currently runs
lint and build, but not tests.

| Layer | Tool | Version | Notes |
|---|---|---|---|
| unit + integration | Vitest | 5.0.0 | Present via `npm run test`; official Vitest docs confirm `.test.`/`.spec.` conventions and `vitest run`; checked: 2026-09-13. |
| Astro app testing | Astro + Vite config | Astro 7.3.2 | Astro official docs point to Vitest for unit/integration and Playwright/Cypress for e2e; checked: 2026-09-13. |
| Cloudflare runtime integration | none yet - consider Cloudflare Vitest plugin in Phase 2 | n/a | Cloudflare recommends its Workers Vitest integration for Workers/Pages Functions when runtime APIs or bindings matter; checked: 2026-09-13. |
| e2e | none yet - see Phase 3 | n/a | Playwright is the likely fit if full browser navigation becomes the cheapest signal. |
| accessibility | none yet - see Phase 3 | n/a | Use only on critical auth/dashboard/mobile screens. |
| AI-native visual review | Browser tool available; no dedicated docs/search MCP found | n/a | When NOT to use: generated UI primitives, static identity assets, or pages already covered by deterministic assertions. |

**Stack grounding tools (current session):**
- Docs: none via MCP - official Astro, Vitest, Playwright, and Cloudflare docs were checked with web search; checked: 2026-09-13.
- Search: web search available - used only to reach official docs and current tool status; checked: 2026-09-13.
- Runtime/browser: Browser plugin available - useful for later local critical-flow screenshots and interaction checks, not used for code anchors; checked: 2026-09-13.
- Provider/platform: Sites/Cloudflare-adjacent deployment tools available, but no Supabase/GitHub MCP quality gate used in this pass; checked: 2026-09-13.

## 5. Quality Gates

The full set of gates that must pass before a change reaches production.
Before a rollout phase lands, its gate is planned rather than enforced.

| Gate | Where | Required? | Catches |
|---|---|---|---|
| lint | local + CI | required now | syntax, formatting, and lint drift |
| build | local + CI | required now | Astro/TypeScript/build drift |
| unit + integration | local + CI | required after Phase 1 | status, form, and route regressions |
| focused e2e critical flows | local + CI on PR | required after Phase 3 | broken signed-in/out and task mutation paths |
| accessibility on critical screens | local or CI on PR | required after Phase 3 | keyboard/name/role regressions on auth/dashboard/mobile actions |
| selective visual review | local agent loop | recommended after Phase 3 | overlapping text or mobile hierarchy regressions |
| pre-prod smoke | between merge and production | optional after Phase 4 | environment-specific failures |

## 6. Cookbook Patterns

How to add new tests in this project. Each subsection is filled in once the
relevant rollout phase ships; before that, it points to the rollout phase.

### 6.1 Adding a status/date unit test

Add status/date tests in `src/lib/maintenance-tasks.test.ts`.

Use Vitest with a fixed `todayDate` and call the combined business contract
(`deriveMaintenanceTaskState(...)` or `toMaintenanceTaskDisplayItems(...)`)
when the risk is "last completed + recurrence -> next due + status". Expected
dates and statuses must be literal, hand-counted values; do not generate
expected values with `computeNextDueDate(...)` or another production helper.

Reference command:

```bash
npm run test -- src/lib/maintenance-tasks.test.ts
```

### 6.2 Adding a task form integration test

Keep task form contract tests at pure Vitest unit/integration level until a
later rollout deliberately adds DOM tooling.

- Client-side string/default/preset rules live in
  `src/components/tasks/task-form-rules.test.ts`.
- Server-side write/update validation lives in
  `src/lib/maintenance-tasks.test.ts`.
- Create/update parser normalization and parser-owned rejection live in
  `src/pages/api/tasks/create.test.ts` and
  `src/pages/api/tasks/update.test.ts`.

Use a small shared-risk matrix: valid normalized input, blank name, invalid
calendar date, future last completed date with fixed today, blank recurrence,
nonnumeric recurrence, zero recurrence, negative recurrence, and decimal
recurrence. Keep parser tests focused on form decoding; store/server validation
owns finite-but-invalid values such as `0` and `1.5`.

Reference commands:

```bash
npm run test -- src/components/tasks/task-form-rules.test.ts
npm run test -- src/lib/maintenance-tasks.test.ts
npm run test -- src/pages/api/tasks/create.test.ts src/pages/api/tasks/update.test.ts
```

### 6.3 Adding a task API ownership or mutation test

TBD - see Phase 2 for account-scoped route and mutation feedback patterns.

### 6.4 Adding an auth/navigation e2e smoke

TBD - see Phase 3 for signed-in/signed-out route behavior patterns.

### 6.5 Adding a mobile/a11y/visual workflow check

TBD - see Phase 3 for dashboard mobile action and selective review patterns.

### 6.6 Per-rollout-phase notes

- Phase 1 added Vitest coverage for status/date boundaries and task form
  contract parity without DOM, Playwright, or browser e2e infrastructure.
- CI now runs `npm run test`; keep new Phase 1-style tests inside the existing
  unit/integration suite unless a later rollout changes the test layer.

## 7. What We Deliberately Don't Test

Exclusions agreed during rollout discovery. Future contributors should respect
these unless the underlying assumption changes.

- **Generated shadcn/Base UI primitive internals** - generated library-style UI
  internals are not HomeKeep's product risk. Re-evaluate if the project forks
  those primitives into bespoke behavior. Source: Phase 2 interview Q5.
- **Parked non-goals** - shared homes, reminders, prebuilt task libraries, and
  AI-generated schedules are outside the MVP. Re-evaluate only if the PRD
  changes.
- **Broad static identity snapshots** - the mark and favicon are low-risk
  polish assets. Re-evaluate if identity becomes a conversion-critical surface.

## 8. Freshness Ledger

- Strategy (sections 1-5) last reviewed: 2026-09-13
- Stack versions last verified: 2026-09-13
- AI-native tool references last verified: 2026-09-13

Refresh (`/10x-test-plan --refresh`) when:

- a new top-3 risk surfaces from the roadmap or archive,
- a recommended tool's `checked:` date is older than three months,
- the project's tech stack changes (new framework, new test runner),
- section 7 negative-space no longer matches what the team believes.
