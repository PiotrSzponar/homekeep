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

## 10xDevs AI Toolkit - Module 2, Lesson 4

Prepare for a harder implementation stream with the **research-backed planning chain**:

```
internal research (/10x-research) + external research (exa.ai, Context7) -> /10x-plan -> /10x-implement -> success
```

The lesson focus is distinguishing internal from external research and using evidence to back planning decisions.

### Task Router - Where to start

| Skill                                                            | Use it when                                                                                                                                                                                                                                    |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Internal research (lesson focus)**                             |                                                                                                                                                                                                                                                |
| `/10x-research <change-id>`                                      | You need evidence from the existing codebase — patterns, conventions, integration points, or existing implementations. Runs parallel sub-agents over the repo and writes structured findings to `research.md`.                                 |
| **External research (lesson focus)**                             |                                                                                                                                                                                                                                                |
| exa.ai                                                           | You need AI-native web search for library comparisons, best practices, or ecosystem context that the codebase cannot answer.                                                                                                                   |
| Context7 (`resolve-library-id` → `get-library-docs`)             | You need live, current documentation for a specific library or framework. Resolves a library ID first, then fetches relevant doc pages.                                                                                                        |
| **Framing spare wheel**                                          |                                                                                                                                                                                                                                                |
| `/10x-frame <change-id>`                                         | The plan won't converge, the plan doesn't deliver expected results, or persistent drift keeps breaking the implementation. Use as an escape hatch on a separate problem (demonstrated on Space Explorers example), not as pre-research ritual. |
| **Planning and execution**                                       |                                                                                                                                                                                                                                                |
| `/10x-plan <change-id>` / `/10x-implement <change-id> phase <n>` | Use the same planning and execution chain from Lesson 2, now with upstream research evidence feeding the plan.                                                                                                                                 |

### Research discipline

- Internal research (`/10x-research`) answers "what does our codebase already do?" — patterns, schemas, conventions, integration points.
- External research (exa.ai, Context7) answers "what should we do?" — library capabilities, API docs, ecosystem best practices.
- Combine both as evidence-backed input to `/10x-plan`. A plan without research evidence on a non-trivial stream is a guess.
- Agent-friendly docs (`llms.txt`, markdown-for-agents, `/md` endpoints) are a quality signal for library selection — libraries that publish agent-readable docs integrate faster.

### `/10x-frame` as spare wheel

Three triggers for reaching for `/10x-frame`:

1. The plan won't converge — research keeps opening more questions instead of narrowing to a contract.
2. The plan doesn't deliver — implementation repeatedly fails to meet success criteria.
3. Persistent drift — the implementation keeps diverging from the plan in ways that suggest the problem was mis-framed.

Demonstrated on a Space Explorers example, not the SRS path. It is an escape hatch, not a mandatory step.

### Paths used by this lesson

- `context/changes/<change-id>/research.md` - internal research output
- `context/changes/<change-id>/frame.md` - framing output when needed
- `context/changes/<change-id>/plan.md` - evidence-backed implementation contract
- `context/foundation/lessons.md` - recurring rules and pitfalls

Skills must not write to `context/archive/`. Archived changes are immutable; if a resolved target path starts with `context/archive/`, abort with: "This change is archived. Open a new change with `/10x-new` instead."

<!-- END @przeprogramowani/10x-cli -->
