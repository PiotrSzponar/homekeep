# Repository Guidelines

## Hard Rules

- Do not write to `context/archive/`. Archived changes are immutable; open a new change instead.
- Preserve `context/` foundation files. `context/foundation/prd.md` is the product contract and `context/foundation/tech-stack.md` is the stack hand-off.
- Do not commit secrets. Keep Supabase values in `.env` and `.dev.vars`; use `.env.example` only for documented placeholders.
- Do not run automatic dependency fixes such as `npm audit fix` unless explicitly requested. The scaffold currently reports audit findings; review risk before changing dependency versions.

## Project Context

HomeKeep is a small Astro/React web app for signed-in homeowners to track recurring home maintenance tasks. The MVP rule is in `context/foundation/prd.md`: compute next due date from last completed date plus recurrence interval, then classify each task as `OK`, `due soon` within 7 days, or `overdue`.

Stack hand-off: `10x-astro-starter`, npm, Astro + React + TypeScript, Supabase auth/data, Cloudflare Pages/Workers. `CLAUDE.md` is only a shim to this file.

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
- Use `lucide-react` icons inside React controls where an icon is needed.
- Reuse `src/components/ui/button.tsx` and `cn()` from `src/lib/utils.ts` for button variants and class merging.
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

## 10xDevs AI Toolkit - Module 2, Lesson 2

Turn one roadmap item into the first implementation cycle with the **change planning chain**:

```
/10x-roadmap -> /10x-new -> /10x-plan -> /10x-plan-review -> /10x-implement
```

`/10x-new`, `/10x-plan`, `/10x-plan-review`, and `/10x-implement` are the lesson focus. `/10x-frame` and `/10x-research` are not required rituals here; they are escalation paths introduced in the next lesson.

### Task Router - Where to start

| Skill | Use it when |
| --- | --- |
| **Change setup (lesson focus)** | |
| `/10x-new <change-id>` | You selected a roadmap item and need a stable change folder. Creates `context/changes/<change-id>/change.md` so planning, implementation, progress, commits, and later review all share one identity. Use AFTER roadmap selection, BEFORE `/10x-plan`. |
| **Planning (lesson focus)** | |
| `/10x-plan <change-id>` | You have a change folder and need a reviewable implementation plan. Reads roadmap context, foundation docs, codebase evidence, and any existing change notes; writes `plan.md` and `plan-brief.md` with phases, file contracts, success criteria, and `## Progress`. |
| **Plan readiness (lesson focus)** | |
| `/10x-plan-review <change-id>` | You have `plan.md` and need a light pre-code readiness check. Use it to catch missing end state, weak contracts, malformed progress, scope drift, or blind spots before code changes begin. |
| **Implementation (lesson focus)** | |
| `/10x-implement <change-id> phase <n>` | You have an approved plan and want to execute one phase with verification, manual gate, commit ritual, and SHA write-back to `## Progress`. |
| **Lifecycle closure** | |
| `/10x-archive <change-id>` | A change is merged or intentionally closed. Move it out of active `context/changes/` into archive state. |

### How the chain hands off

- `/10x-new` creates the durable change identity.
- `/10x-plan` turns that identity into an implementation contract.
- `/10x-plan-review` checks the plan before the agent mutates code.
- `/10x-implement` executes one planned phase, verifies, asks for manual confirmation when needed, commits, and records progress.

### Lesson boundaries

- Plan is the default router after roadmap selection. Start with `/10x-plan` unless the problem is unclear or external evidence is blocking.
- Do not run `/10x-frame + /10x-research` as ceremony for every change.
- Do not turn this lesson into a full end-to-end product build. A checkpoint with a planned and partially or fully implemented stream is valid.
- Code review of the implemented diff belongs to Lesson 3 via `/10x-impl-review`.
- Lifecycle closure via `/10x-archive` after a change is merged or intentionally closed.

### Paths used by this lesson

- `context/foundation/roadmap.md` - upstream roadmap
- `context/changes/<change-id>/change.md` - change identity
- `context/changes/<change-id>/plan.md` - implementation contract
- `context/changes/<change-id>/plan-brief.md` - compressed handoff
- `context/foundation/lessons.md` - recurring rules and pitfalls
- `docs/reference/contract-surfaces.md` - load-bearing names registry

Skills must not write to `context/archive/`. Archived changes are immutable; if a resolved target path starts with `context/archive/`, abort with: "This change is archived. Open a new change with `/10x-new` instead."

<!-- END @przeprogramowani/10x-cli -->
