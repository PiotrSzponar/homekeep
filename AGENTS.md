# Repository Guidelines

## Hard Rules

- Do not write to `context/archive/`. Archived changes are immutable; open a new change instead.
- Preserve `context/` foundation files. `context/foundation/prd.md` is the product contract and `context/foundation/tech-stack.md` is the stack hand-off.
- Do not commit secrets. Keep Supabase values in `.env` and `.dev.vars`; use `.env.example` only for documented placeholders.
- Do not run automatic dependency fixes such as `npm audit fix` unless explicitly requested. The scaffold currently reports audit findings; review risk before changing dependency versions.

## Project Context

HomeKeep is a small Astro/React web app for signed-in homeowners to track recurring home maintenance tasks. The MVP rule is in `context/foundation/prd.md`: compute next due date from last completed date plus recurrence interval, then classify each task as `OK`, `due soon` within 7 days, or `overdue`.

Stack hand-off: `10x-astro-starter`, npm, Astro + React + TypeScript, Supabase auth/data, Cloudflare Pages/Workers. UI foundation: shadcn/ui generated for Base UI with the Luma preset, Lime theme, Tailwind v4 CSS variables, and Lucide icons. `CLAUDE.md` is only a shim to this file.

## Commands

- `npm run dev` - start the Astro dev server.
- `npm run build` - production build.
- `npm run preview` - preview the production build.
- `npm run lint` - ESLint over the repo.
- `npm run lint:fix` - auto-fix lint issues.
- `npm run format` - Prettier write.
- `npm audit --json` - dependency advisory report; non-zero exit means advisories exist, not that the scaffold failed.

## Structure

- `src/pages/` contains Astro pages and API routes.
- `src/pages/api/auth/` contains auth form handlers.
- `src/components/auth/` contains React auth form components.
- `src/components/ui/` contains reusable UI primitives.
- `src/lib/` contains shared server/client helpers.
- `src/middleware.ts` owns route protection.
- `supabase/` contains local Supabase config.

## Auth And Data

- Use `createClient(context.request.headers, context.cookies)` from `src/lib/supabase.ts` for server-side Supabase access.
- If Supabase config is missing, follow the existing pattern: return a redirect with an encoded error for auth routes, or show a configuration banner via `src/lib/config-status.ts`.
- Add protected page prefixes to `PROTECTED_ROUTES` in `src/middleware.ts`; do not duplicate auth checks across pages when middleware can own them.
- Keep the MVP access model flat: a signed-in homeowner can only access their own maintenance tasks. Do not add shared households, roles, invites, or admin surfaces unless the PRD changes.

## UI Conventions

- Astro pages/layouts own routing and page composition; React components own interactive form controls and local state.
- Use the existing `@/` import alias.
- Use shadcn/Base UI primitives from `src/components/ui/` before custom UI markup. Callouts use `Alert`, actions use `Button`, repeated surfaces use `Card`, statuses use `Badge`, form controls use `Field`/`FieldLabel`/`Input`, dividers use `Separator`, empty states use `Empty`, loading states use `Spinner`, and menus use `DropdownMenu`.
- Use semantic Luma/Lime theme tokens from `src/styles/global.css`; do not reintroduce raw old palette classes such as `bg-cosmic`, `purple-*`, `blue-*`, `slate-*`, `emerald-*`, `rose-*`, `amber-*`, `sky-*`, or `text-white` for application UI.
- Use `lucide-react` icons inside React controls where an icon is needed. Icons inside `Button` should use `data-icon="inline-start"` or `data-icon="inline-end"` and should not carry manual sizing classes unless the surrounding primitive cannot size them.
- Reuse `src/components/ui/button.tsx` and `cn()` from `src/lib/utils.ts` for button variants and class merging. Do not import `cn` directly from the external `cn` package in app source.
- Keep theme switching in the top header as the shadcn dropdown pattern: `Button` trigger plus `DropdownMenu` options for `Light`, `Dark`, and `System`. Do not add a floating page-level theme switch.
- Keep form validation close to the form component when it is client-only; server/auth outcomes should flow through Astro API routes.

## Product Boundaries

- MVP must include: create, view, edit, delete, mark completed, calculated next due date, status, and account-scoped access.
- MVP must not include: shared homes, reminders, prebuilt task library, or AI-generated schedules/recommendations.
- `due soon` means next due date is within 7 days. Preserve that threshold unless `context/foundation/prd.md` is updated.

## Verification

Before handing back code changes, run the smallest relevant check:

- UI or TypeScript changes: `npm run lint`.
- Build/runtime changes: `npm run build`.
- Dependency changes: `npm audit --json` and summarize critical/high findings.

If a command cannot run because local services or secrets are missing, report the blocker and the exact command attempted.

<!-- BEGIN @przeprogramowani/10x-cli -->

## 10xDevs AI Toolkit - Module 3, Lesson 1

Open Module 3 by producing a **durable, risk-first quality contract** before any test is written — then drive each rollout phase through the standard change chain.

```
PRD + roadmap + archive
        │
        ▼
   /10x-test-plan  ──►  context/foundation/test-plan.md  (strategy §1–§5 frozen + cookbook §6 grows)
        │
        ▼  (one rollout phase at a time, /clear between handoffs)
   /10x-new ──► /10x-research ──► /10x-plan ──► /10x-implement
```

`/10x-test-plan` is a **stateful orchestrator**, not a one-shot generator. On first run it writes the phased rollout to `context/foundation/test-plan.md`. On every subsequent run it re-derives state from on-disk artifacts and presents the next handoff. The lesson focus is **strategy and rollout sequencing, not configuration**. Hooks, MCP servers, and CI YAML are configured in later lessons of this module.

### Task Router - Where to start

| Skill | Use it when |
| --- | --- |
| **Quality strategy as a rules-file (lesson focus)** | |
| `/10x-test-plan` | You have a PRD (and ideally a roadmap and a few archived slices) and you are about to write the project's first tests, or you noticed that AI-generated tests are landing on helpers while critical flows go uncovered. First invocation runs discovery (PRD + roadmap + archive + hot-spot scan), a 5-question user interview, and a synthesis pass with a mandatory challenger check, then writes `test-plan.md` in `context/foundation/` with a risk map (5–7 failure scenarios), a phased rollout table, a stack table, a quality-gates table, a cookbook section (`§6`, fills in as phases ship), and a negative-space section (what we deliberately don't test). Subsequent invocations advance the rollout one handoff at a time. |
| `/10x-test-plan --status` | A `test-plan.md` already exists and you want a compact snapshot of where the rollout stands — which phases are `not started`, `change opened`, `researched`, `planned`, `implementing`, or `complete`, and what the next action is. Does no work; safe to run any time. |
| `/10x-test-plan --refresh` | A `test-plan.md` already exists and one of: a new top-3 risk surfaced from the roadmap or archive, a tool's `checked:` date is older than three months, the project's tech stack changed, or §7 negative-space no longer matches what the team believes. Opens a new `test-plan-refresh-<YYYY-MM-DD>` change folder rather than editing the guide in place. |

### Rollout chain — what happens after the guide is written

The guide's §3 *Phased Rollout* table is the orchestrator's state. For each non-`complete` row the orchestrator selects the next handoff based on which artifacts exist in `context/changes/<change-id>/`:

| State on disk | Next handoff | Status transitions to |
| --- | --- | --- |
| change folder missing | `/10x-new <change-id>` | `change opened` |
| `change.md` only | `/10x-research` (with a risks-to-verify brief) | `researched` |
| `+ research.md` | `/10x-plan` (with cost × signal + cookbook-update constraints) | `planned` |
| `+ plan.md` with pending `## Progress` items | `/10x-implement <change-id> phase <N>` | `implementing` / `complete` |
| `+ plan.md` fully `[x]` | Mark §3 row `complete`; loop to next pending row | — |

Each handoff is a **STOP point**. The orchestrator copies the next command to the clipboard, asks the user to `/clear` and run it, then exits. Re-invoke `/10x-test-plan` (no arguments) to advance.

### Risk-first prioritization rules

- Risks are **failure scenarios in user / business terms**, not test names. "Logged-out user reaches paid content via stale token" is a risk; "test the login form" is not.
- 5 to 7 risks. Fewer is too coarse; more makes prioritization useless.
- Impact and likelihood are user/business ratings, not technical complexity.
- Every risk traces to a source: PRD section, archived slice, roadmap entry, Phase 2 interview question, hot-spot **directory** with churn count, or a tech-stack constraint. No invented risks.
- **Signal, not knowledge.** §2 cites *evidence that raised the risk*, never a file as "where the failure lives." File:line anchors, function names, schema names, and module names are forbidden in §2 — they belong in `/10x-research`'s output, produced per rollout phase against current code. The plan is a QA spec; it is not a code audit.
- Coverage is not the metric. **Risk coverage** is the metric.

### Dual-layer mapping rules

- Classic layer first: the cheapest test that gives a real signal wins. Promote to e2e only when no cheaper layer covers the risk.
- AI-native layer second, and only where it adds signal classic tests do not give cheaply.
- Every AI-native row has a **"When NOT to use"** line. If you cannot write one, drop the row.
- Every tool name carries a `checked: <YYYY-MM-DD>` date. Tool names are examples of the category, not endorsements.
- Both layers must be non-empty in the final guide if the project warrants them. Classic-only is a 2020 plan; AI-native-only is hype. AI-native phases are not mandatory — include them only when the brief justified them under cost × signal.

### Quality gates rules

- Required gates (lint, typecheck, unit+integration, e2e on critical flows) must map to actual CI steps. If a required gate is not yet wired, mark it as `required after §3 Phase <N>` and let the named rollout phase wire it.
- Post-edit hook is **recommended local**, not a CI substitute.
- Multimodal visual review is **selective**, applied to 1–3 critical screens, not to every page.
- Vision-driven fallback (Anthropic Computer Use or OpenAI CUA) is reserved for DOM-unreachable surfaces; expensive per action.

### Cookbook patterns (§6) — fills in over time

`test-plan.md` is both a phased strategy and a **growing cookbook**. §6 starts as placeholders (`TBD — see §3 Phase <N>`) and fills in incrementally — each rollout phase's plan ends with a sub-phase that updates the relevant §6 entry (location, naming, reference test, run command). After Module 3 completes, §6 becomes the canonical answer to "how do I add a test for X in this project?" — and is what `/10x-tdd` reads in Lesson 2.

### Lesson boundaries

- Do not write test code. That is Lesson 2 (`/10x-tdd` and unit-test authoring).
- Do not configure hooks, hook lifecycle, or debugging hooks. That is Lesson 3.
- Do not configure MCP servers, Playwright API, e2e code, or multimodal scenario code. That is Lesson 4.
- Do not run the bug-to-fix-to-regression-test workflow. That is Lesson 5.
- Do not author CI/CD pipelines from scratch or write GitHub Actions YAML. The guide names gates; configuration is owned by Module 1 Lesson 5 and Module 2 Lesson 5.
- Do not benchmark multimodal models. Cite criteria (cost, latency, agent-friendliness), never a ranking.
- Do not read the codebase for knowledge (call graphs, schemas, "which file owns this failure"). That is `/10x-research`'s job, per rollout phase.

### Paths used by this lesson

- `context/foundation/test-plan.md` — the quality contract produced and maintained by `/10x-test-plan`
- `context/foundation/prd.md` — primary risk source
- `context/foundation/roadmap.md` — likelihood weighting
- `context/foundation/tech-stack.md` — stack input (when present)
- `context/archive/<change-id>/plan.md` — implemented risk surface
- `context/changes/<change-id>/` — per-rollout-phase change folder (one per row in §3)

<!-- END @przeprogramowani/10x-cli -->
