# shadcn/Luma Design-System Foundation - Plan Brief

> Full plan: `context/changes/shadcn-luma-design-system-foundation/plan.md`
> Research: `context/changes/shadcn-luma-design-system-foundation/research.md`

## What & Why

HomeKeep needs a consistent UI foundation before M-2 polish slices continue. This plan aligns shadcn around Luma with Base UI selected as the base target, formalizes Lime-oriented theme tokens and light/dark/system mode, adds core primitives, and proves them lightly in the app.

## Starting Point

The repo already has Tailwind v4, `components.json`, Lucide, `cn()`, CSS-variable tokens, and a shadcn-style `Button`. The problem is consistency: dashboard, auth, task UI, banners, and starter homepage still use separate visual languages.

## Desired End State

Downstream slices can build on shared tokens and primitives instead of repeating raw `slate`, `emerald`, `purple`, and glass styles. Users can choose light, dark, or system theme, and the app has HomeKeep identity hooks without finalizing the S-08 visual assets early.

## Key Decisions Made

| Decision | Choice | Why | Source |
| --- | --- | --- | --- |
| Package command | `npx skills add shadcn/ui` | Matches the repo's npm convention and user instruction. | User |
| shadcn base | Base UI | The user wants Base UI selected during setup. | User |
| Registry scope | Minimal | Adds only what F-02 needs and avoids unused component churn. | Plan |
| Theme behavior | Light/dark/system, system default | Matches shadcn Astro guidance and avoids forcing one visual mode. | Research / Plan |
| Primitive scope | Core set | Covers repeated dashboard/auth/task needs found in research. | Research / Plan |
| Consumer adoption | Thin proof | Proves the foundation without absorbing S-05 through S-08. | Plan |
| Identity | Hooks only | Lets S-08 own final mark/favicon work. | Roadmap / Plan |

## Scope

**In scope:**

- shadcn skill setup with `npx skills add shadcn/ui`.
- Luma/Base UI-aligned config where supported by tooling.
- HomeKeep/Lime semantic tokens in `src/styles/global.css`.
- Pre-paint theme script plus React light/dark/system toggle.
- Input, label/field, badge, alert, card/surface, and spinner primitives; skeleton is deferred unless a real F-02 proof surface needs it.
- Brand constants and a reusable brand component contract.
- Thin adoption in layout, config banners, auth submit state, and dashboard shell.

**Out of scope:**

- Task CRUD, recurrence, ownership, Supabase schema, or route behavior.
- S-05 task form terminology/date/recurrence polish.
- S-06 mobile task-list-first UX and task action redesign.
- S-07 full auth/homepage/app shell redesign.
- S-08 final house-heart mark and favicon assets.
- Automatic dependency fixes such as `npm audit fix`.

## Architecture / Approach

`components.json` and the shadcn skill setup define generation conventions. `src/styles/global.css` remains the token source. `src/layouts/Layout.astro` applies the initial theme before paint. `src/components/ui/*` contains composable React primitives, and thin Astro/React consumers verify the system without changing product logic.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. shadcn Setup and Theme Contract | npm skill setup, Base UI/Luma alignment, semantic tokens, pre-paint theme handling | Tooling may not expose every desired config field |
| 2. Core UI Primitives and Identity Hooks | Minimal primitive set, theme toggle, brand constants/component contract | Primitive set grows beyond foundation needs |
| 3. Thin Consumer Adoption and Verification | Layout/banner/auth/dashboard proof plus lint/build/manual checks | Work expands into later polish slices |

**Prerequisites:** Existing F-02 research and npm project setup.
**Estimated effort:** About 2-3 focused implementation sessions across 3 phases.

## Open Risks & Assumptions

- shadcn's current schema/tooling may represent Luma/Base UI differently than the existing `components.json`; implementation should trust generated supported fields and document command approval/failure/no-op results without blocking repo-local work.
- Some visual inconsistency will intentionally remain until S-06 and S-07.
- If generated components add dependencies, audit findings must be reviewed, not automatically fixed.

## Success Criteria (Summary)

- HomeKeep has shared semantic tokens, theme persistence, and core UI primitives that pass lint/build.
- Converted proof surfaces render cleanly in light, dark, system, and mobile views.
- Task logic, auth protection, and account-scoped data behavior remain unchanged.
