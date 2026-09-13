---
starter_id: 10x-astro-starter
package_manager: npm
project_name: homekeep
hints:
  language_family: js
  team_size: solo
  deployment_target: cloudflare-pages
  ci_provider: github-actions
  ci_default_flow: auto-deploy-on-merge
  bootstrapper_confidence: first-class
  path_taken: standard
  quality_override: false
  self_check_answers: null
  has_auth: true
  has_payments: false
  has_realtime: false
  has_ai: false
  has_background_jobs: false
  ui_design_system: shadcn-ui
  ui_base: base-ui
  ui_preset: luma
  ui_theme: lime
  ui_icons: lucide
---

## Why this stack

HomeKeep is a small greenfield web app with a 1-week after-hours MVP, login, user-owned maintenance tasks, and no payments, realtime, AI, or background-job scope. The 10x Astro Starter is the curated JavaScript/TypeScript default for this shape because it gives an opinionated full-stack path with TypeScript, auth, data storage, and Cloudflare deployment already aligned. The standard path keeps the decision surface small: Cloudflare Pages deployment, GitHub Actions CI, and auto-deploy on merge match the starter defaults and preserve momentum for the deadline.

## UI Foundation

HomeKeep uses shadcn/ui as the application design-system source, generated for Base UI with the Luma preset and Lime theme. This is part of the foundation stack, not a per-feature preference to rediscover in later roadmap work.

- `components.json` is the shadcn contract: `style: "base-luma"`, Base UI primitives, Tailwind v4 CSS variables, `@/` aliases, and Lucide icons.
- `src/styles/global.css` is the only theme-token source. Keep Luma/Lime semantic tokens there and consume them through classes such as `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-primary-foreground`, `bg-secondary`, `text-destructive`, and `ring-ring`.
- `src/components/ui/` owns reusable shadcn primitives. Prefer composing `Button`, `Card`, `Alert`, `Badge`, `Field`, `Input`, `Separator`, `Empty`, `Spinner`, and `DropdownMenu` before adding custom styled markup.
- `src/lib/utils.ts` owns the local `cn()` helper backed by `clsx` and `tailwind-merge`; do not import from the external `cn` package in app source.
- Theme mode is `light | dark | system`, persisted in `localStorage` under `theme`. The toggle follows the official shadcn dark-mode dropdown pattern adapted to Base UI's `render` trigger API and belongs in the top header near account/auth actions.

Future roadmap planning should assume this UI foundation exists. New polish slices should extend it or add missing shadcn primitives explicitly; they should not create another design-system setup task unless the stack changes.
