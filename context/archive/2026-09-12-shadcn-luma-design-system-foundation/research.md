---
date: 2026-09-12T11:41:50+02:00
researcher: Codex
git_commit: 5fd319c1d2bf0b07160d92cfa2550420a2d36d6d
branch: main
repository: HomeKeep
topic: "shadcn-luma-design-system-foundation"
tags: [research, codebase, ui, shadcn, tailwind, design-system]
status: complete
last_updated: 2026-09-12
last_updated_by: Codex
---

# Research: shadcn/Luma Design-System Foundation

**Date**: 2026-09-12T11:41:50+02:00  
**Researcher**: Codex  
**Git Commit**: 5fd319c1d2bf0b07160d92cfa2550420a2d36d6d  
**Branch**: main  
**Repository**: HomeKeep

## Research Question

What does the current HomeKeep UI/design-system foundation already provide, what is missing for the M-2 shadcn/Luma/Lime foundation, and what constraints should the implementation plan preserve?

## Summary

HomeKeep already has a partial shadcn-ready foundation: `components.json`, Tailwind v4 CSS-variable tokens, Lucide, Radix Slot, CVA, `cn()`, and one shadcn-style `Button`. The gap is not initial setup; it is consistency. Dashboard, task UI, auth pages, banners, and starter homepage still use local color utilities and separate visual languages.

F-02 should therefore establish a small shared foundation before feature polish: confirm shadcn config, align theme tokens toward Luma/Lime, add dark/light/system theme handling, add missing primitives needed by downstream slices, and add HomeKeep identity hooks. It should not rewrite task business logic, change recurrence storage, or expand MVP scope.

Official shadcn docs reviewed on 2026-09-12 confirm that shadcn skills read `components.json` and run `shadcn info --json`; Luma is a style that changes geometry/spacing beyond color theming; shadcn theming is based on semantic CSS variables and `.dark` overrides; Codex MCP setup requires manually adding the shadcn server to `~/.codex/config.toml`.

## Detailed Findings

### Current shadcn and Tailwind Foundation

- `components.json` exists and is configured for shadcn `new-york`, TSX, non-RSC, CSS variables, neutral base color, aliases, and Lucide icons (`components.json:3`, `components.json:4`, `components.json:6`, `components.json:13`, `components.json:20`).
- Tailwind is v4-style. Astro loads `@tailwindcss/vite`, and there is no separate `tailwind.config.*` in the inspected project (`astro.config.mjs:6`, `astro.config.mjs:13`).
- `src/styles/global.css` is the token source: it imports Tailwind and `tw-animate-css`, defines `@custom-variant dark`, declares shadcn-style OKLCH variables under `:root` and `.dark`, maps them via `@theme inline`, and applies base `border/background/text` styles (`src/styles/global.css:1`, `src/styles/global.css:4`, `src/styles/global.css:6`, `src/styles/global.css:41`, `src/styles/global.css:75`, `src/styles/global.css:117`).
- Design-system dependencies already present include `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `lucide-react`, `tailwind-merge`, `tailwindcss`, `@tailwindcss/vite`, and `tw-animate-css` (`package.json:21`, `package.json:24`, `package.json:28`, `package.json:30`, `package.json:33`, `package.json:35`).
- The only shadcn-style UI primitive currently present is `src/components/ui/button.tsx`; it uses Radix `Slot`, CVA variants, `cn()`, `data-slot="button"`, and exports `Button` plus `buttonVariants` (`src/components/ui/button.tsx:2`, `src/components/ui/button.tsx:7`, `src/components/ui/button.tsx:35`, `src/components/ui/button.tsx:47`, `src/components/ui/button.tsx:50`).
- `cn()` is already the standard utility for class merging via `clsx` and `tailwind-merge` (`src/lib/utils.ts:1`).
- `components.json` declares a `hooks` alias, but no `src/hooks` directory exists yet (`components.json:18`). That is not a runtime problem today, but plans that add shadcn hooks should either create the directory or avoid relying on it.

### Current UI Inconsistencies

- `Layout.astro` still defaults page title to `10x Astro Starter`, links `/favicon.png`, and owns global config banners (`src/layouts/Layout.astro:10`, `src/layouts/Layout.astro:18`, `src/layouts/Layout.astro:22`).
- `src/pages/index.astro` still renders `Welcome`, and `Welcome.astro` contains user-visible starter branding and starter-oriented content (`src/pages/index.astro:2`, `src/pages/index.astro:6`, `src/components/Welcome.astro:35`, `src/components/Welcome.astro:38`, `src/components/Welcome.astro:57`).
- Dashboard is already HomeKeep-branded but uses one-off dark slate/emerald Tailwind classes instead of semantic tokens or reusable surfaces (`src/pages/dashboard.astro:34`, `src/pages/dashboard.astro:38`, `src/pages/dashboard.astro:105`).
- Dashboard success banners are duplicated inline and expose implementation wording: "The list below reflects the latest data from Supabase" (`src/pages/dashboard.astro:57`, `src/pages/dashboard.astro:65`, `src/pages/dashboard.astro:73`, `src/pages/dashboard.astro:81`).
- Auth pages use a separate cosmic purple/glass visual language (`src/pages/auth/signin.astro:9`, `src/pages/auth/signup.astro:9`, `src/pages/auth/confirm-email.astro:22`).
- Auth form components provide reusable patterns but are auth-specific and purple-themed rather than tokenized primitives (`src/components/auth/FormField.tsx:5`, `src/components/auth/FormField.tsx:37`, `src/components/auth/ServerError.tsx:11`, `src/components/auth/SubmitButton.tsx:15`).
- Loading states currently exist in auth submit buttons via `useFormStatus`, but task create/complete/edit/delete controls do not expose pending states (`src/components/auth/SubmitButton.tsx:12`, `src/components/auth/SubmitButton.tsx:20`, `src/components/tasks/CreateTaskForm.tsx:7`, `src/components/tasks/TaskList.astro:70`).
- Task UI contains repeated candidate primitives: task card, empty state, status badge, action buttons, edit disclosure, and inline edit form (`src/components/tasks/TaskList.astro:23`, `src/components/tasks/TaskList.astro:33`, `src/components/tasks/TaskList.astro:61`, `src/components/tasks/TaskList.astro:69`, `src/components/tasks/TaskList.astro:96`).
- Create task form uses the shared `Button` and Lucide `Save`, but text inputs are still hand-styled (`src/components/tasks/CreateTaskForm.tsx:1`, `src/components/tasks/CreateTaskForm.tsx:14`, `src/components/tasks/CreateTaskForm.tsx:45`).

### Official shadcn Guidance

- The shadcn Skills docs say the skill activates from `components.json`, reads project configuration, and provides framework, alias, icon library, installed component, and base library context. It also expects component discovery through docs/search/MCP before generating code. Source: [shadcn Skills](https://ui.shadcn.com/docs/skills).
- The Skills docs list `pnpm dlx skills add shadcn/ui` as the install command. The repo uses npm, so planning should convert commands to npm equivalents where applicable and avoid assuming pnpm is available. Source: [shadcn Skills](https://ui.shadcn.com/docs/skills).
- The Luma changelog describes Luma as a style foundation with rounded geometry, soft elevation, breathable layouts, and a different spacing/feel baseline, not just a color theme. It is available in `shadcn/create` for Radix and Base UI. Source: [Introducing Luma](https://ui.shadcn.com/docs/changelog/2026-03-luma).
- The shadcn Theming docs recommend CSS variables and semantic tokens such as `background`, `foreground`, `primary`, `card`, `muted`, `accent`, `destructive`, `border`, `input`, and `ring`; Tailwind maps these to utilities like `bg-background`, `text-foreground`, `border-border`, and `ring-ring`. Source: [shadcn Theming](https://ui.shadcn.com/docs/theming).
- The shadcn Astro dark-mode docs recommend an inline pre-paint script that toggles the `.dark` class from local storage/system preference, plus a client-loaded mode toggle for light/dark/system selection. Source: [shadcn Astro Dark Mode](https://ui.shadcn.com/docs/dark-mode/astro).
- The shadcn MCP docs say MCP lets assistants browse/search/install registry components, and standard shadcn/ui registry access needs no extra registry config in `components.json`. Source: [shadcn MCP Server](https://ui.shadcn.com/docs/mcp).
- For Codex specifically, shadcn says the CLI cannot automatically update `~/.codex/config.toml`; the MCP server must be added manually as:

```toml
[mcp_servers.shadcn]
command = "npx"
args = ["shadcn@latest", "mcp"]
```

Source: [shadcn MCP Server - Codex](https://ui.shadcn.com/docs/mcp).

## Code References

- `components.json:3` - shadcn style currently `new-york`, not Luma.
- `components.json:8` - Tailwind CSS entry is `src/styles/global.css`.
- `components.json:20` - icon library is Lucide.
- `package.json:15` - dependencies already include the basic shadcn/Tailwind/Lucide stack.
- `src/styles/global.css:6` - `:root` token block.
- `src/styles/global.css:41` - `.dark` token block.
- `src/styles/global.css:75` - `@theme inline` mappings.
- `src/styles/global.css:113` - `bg-cosmic` starter utility still exists.
- `src/components/ui/button.tsx:7` - only shadcn-style primitive currently present.
- `src/layouts/Layout.astro:10` - default title is still starter-branded.
- `src/pages/dashboard.astro:57` - success banners are duplicated and Supabase-flavored.
- `src/pages/dashboard.astro:105` - create form appears before task list in the dashboard grid source order.
- `src/pages/auth/signin.astro:9` - auth page uses cosmic purple/glass styling.
- `src/components/auth/SubmitButton.tsx:12` - auth submit has the only current pending-state implementation.
- `src/components/tasks/TaskList.astro:51` - task list still says "Last done", which downstream S-05 must standardize.

## Architecture Insights

- F-02 should be a foundation, not a full redesign. It should create shared tokens/primitives and identity hooks that S-05 through S-08 can consume.
- Prefer semantic shadcn tokens over raw `slate`, `emerald`, `purple`, `blue`, and translucent white utility classes in new primitives.
- The repo is already Tailwind v4/CSS-variable oriented; do not introduce a Tailwind config unless a later plan identifies a hard need.
- Theme handling belongs at layout/root level because `Layout.astro` already imports global CSS and wraps all pages.
- A light/dark/system toggle should be client-loaded React, while the initial `.dark` class should be decided before paint to avoid flicker.
- Use Lucide directly for icons, matching current repo practice and `components.json`.
- Native date inputs can satisfy "calendar-friendly date inputs" for MVP polish with lower dependency risk; a custom date picker can be deferred to S-05 if the plan decides the UX benefit justifies adding Popover/Calendar dependencies.
- Keep task flows server-authoritative: current create/complete/edit/delete flow uses POST routes, redirects, and dashboard reloads, not optimistic state. F-02 should not move task data authority into client UI.

## Historical Context

- M-1 archived plans deliberately built the task loop around server POST routes, query-string success/error banners, and authoritative dashboard reloads (`context/archive/2026-09-11-create-task-with-status/plan-brief.md:15`, `context/archive/2026-09-11-complete-task-and-refresh-status/plan.md:19`, `context/archive/2026-09-12-edit-task-and-recalculate-status/plan-brief.md:49`, `context/archive/2026-09-12-delete-task/plan.md:35`).
- Prior UI work favored inline dashboard controls: inline create form, per-row completion form, inline edit disclosure, and per-task delete form with browser confirmation (`context/archive/2026-09-11-create-task-with-status/plan-brief.md:21`, `context/archive/2026-09-11-complete-task-and-refresh-status/plan.md:115`, `context/archive/2026-09-12-edit-task-and-recalculate-status/plan.md:103`, `context/archive/2026-09-12-delete-task/plan.md:115`).
- Mobile constraints already surfaced in prior planning/review: avoid crowding, keep actions usable on narrow screens, use stable button sizing, avoid text overlap, and preserve status/action clarity (`context/archive/2026-09-12-edit-task-and-recalculate-status/plan.md:111`, `context/archive/2026-09-12-delete-task/plan.md:123`, `context/archive/2026-09-12-delete-task/reviews/impl-review.md:29`).
- Auth and owner scoping are established boundaries. Middleware protects `/dashboard` and `/api/tasks`; task routes use `context.locals.user?.id`; browser-provided owner/status/date-derived fields are not trusted (`context/archive/2026-09-11-owned-task-storage-contract/plan.md:9`, `context/archive/2026-09-11-create-task-with-status/reviews/impl-review.md:24`, `context/archive/2026-09-11-complete-task-and-refresh-status/reviews/impl-review.md:24`).
- Due date/status logic should remain in shared helpers, not UI components (`context/archive/2026-09-11-owned-task-storage-contract/plan-brief.md:23`, `context/archive/2026-09-11-create-task-with-status/reviews/impl-review.md:26`, `context/archive/2026-09-11-complete-task-and-refresh-status/plan.md:132`).

## Related Research

None yet under active `context/changes/**/research.md` for M-2. Historical implementation plans and reviews under `context/archive/**` are relevant and cited above.

## Open Questions

- Whether to install the shadcn skill/MCP into the local Codex environment is an environment operation, not a repo implementation detail. The plan should call out that Codex MCP requires manual `~/.codex/config.toml` setup if the user wants registry tools available inside Codex.
- Whether F-02 should install additional shadcn primitives from the registry or create minimal local wrappers should be decided during `/10x-plan`; current repo needs at least alert/banner, field/input, badge, spinner/skeleton, theme toggle, and brand primitives, but exact registry dependency shape should be planned deliberately.
