# Implementation Notes: shadcn/Luma Design-System Foundation

## Phase 1

- Ran `npx skills add shadcn/ui` on 2026-09-12.
- Result: command completed successfully and installed the local `shadcn` and `migrate-radix-to-base` skills under `.agents/skills/`, with entries recorded in `skills-lock.json`.
- The command ran non-interactively in Codex and did not prompt for Base UI. Base UI/Luma alignment was therefore applied in repo config with `style: "base-luma"` in `components.json`, then verified with `npx shadcn@latest info --json`, which reported `config.base: "base"`.

## Phase 2

- Added Base UI shadcn primitives with `npx shadcn@latest add @shadcn/input @shadcn/label @shadcn/field @shadcn/badge @shadcn/alert @shadcn/card @shadcn/spinner`.
- The registry also added `separator` as a support primitive for `field`.
- Normalized generated imports from `cn` to the local `@/lib/utils` helper and removed the accidental `cn` package.
- Installed `@base-ui/react` and removed the stale `@radix-ui/react-slot` dependency after migrating `Button` to the Base UI primitive.
- `npm audit --json` reports 4 high and 0 critical advisories through Cloudflare tooling: `@cloudflare/vite-plugin`, `wrangler`, `miniflare`, and `sharp`. No automatic fixes were applied.

## Phase 3

- Remaining `bg-cosmic`, purple, and starter title references are intentionally deferred to S-07 homepage/auth/app-shell work.
- Remaining task form/list raw `slate`/`emerald`/status color references are intentionally deferred to S-05 and S-06 task polish work.

## Corrective UI Rebuild

- User review found the Phase 3 proof too thin: `bg-cosmic`, starter colors, and bespoke UI styling still appeared across Astro and React surfaces.
- Rebuilt the visible homepage, topbar, auth pages, dashboard alerts, task create form, task list, auth controls, and utility badges around the installed Base UI shadcn primitives and semantic Luma/Lime theme tokens.
- Added the shadcn `empty` primitive for task-list empty states.
- Removed the obsolete `bg-cosmic` utility and eliminated old starter palette references from React, Astro, and CSS UI files.
- Replaced the direct `cn` package dependency with the local `cn()` helper backed by `clsx` and `tailwind-merge`.
