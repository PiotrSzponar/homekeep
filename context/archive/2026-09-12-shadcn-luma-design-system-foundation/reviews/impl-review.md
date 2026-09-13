<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: shadcn/Luma Design-System Foundation

- **Plan**: context/changes/shadcn-luma-design-system-foundation/plan.md
- **Scope**: Phase 1-3 of 3
- **Date**: 2026-09-12
- **Verdict**: APPROVED
- **Findings**: 0 critical, 1 warning, 0 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | PASS |
| Safety & Quality | WARNING |
| Architecture | PASS |
| Pattern Consistency | PASS |
| Success Criteria | PASS |

## Findings

### F1 - Theme toggle can hydrate with different state than SSR markup

- **Severity**: WARNING
- **Impact**: MEDIUM - real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: src/components/ui/theme-toggle.tsx:36
- **Detail**: `ThemeToggle` is rendered from Astro with `client:load` (`src/layouts/Layout.astro:42`). During SSR, `getStoredTheme()` returns `system` because `window` is unavailable, but during client hydration the lazy `useState(getStoredTheme)` initializer can read `localStorage` and return `light` or `dark`. That means `aria-pressed` and selected button classes can differ between the server markup and the first client render for users with an explicit saved theme. The pre-paint script still applies the correct document theme class, so the risk is a hydration warning and a brief control-state mismatch, not a broken theme.
- **Fix A Recommended**: Refactor the component state source to use a hydration-safe browser snapshot pattern, such as `useSyncExternalStore` with `system` as the server snapshot and `localStorage` as the client snapshot.
  - Strength: Preserves `client:load`, keeps server markup available, and avoids SSR/client state divergence.
  - Tradeoff: Slightly more component code than the current `useState` initializer.
  - Confidence: MEDIUM - the mismatch follows directly from the SSR/client branches, but it has not been reproduced in a browser console during this review.
  - Blind spot: Did not run a browser-console hydration check because manual verification was handled by the user.
- **Fix B**: Render the theme toggle as a client-only island from Astro so there is no server-rendered toggle markup to hydrate.
  - Strength: Smaller code change in the layout.
  - Tradeoff: The toggle appears only after client JavaScript loads and loses SSR markup.
  - Confidence: MEDIUM - Astro supports client-only islands, but this is a heavier rendering behavior change than fixing the state source.
  - Blind spot: Did not verify the exact visual delay on slow devices.
- **Decision**: FIXED via Fix A. `ThemeToggle` now uses `useSyncExternalStore` with a stable `system` server snapshot and browser storage as the client snapshot.

## Verification

- `npm run lint`: PASS before review fix, then PASS again after Fix A. ESLint completed with repeated existing `astro-eslint-parser` notices about `projectService` fallback.
- `npm run build`: PASS before review fix, then PASS again after Fix A. Astro build completed successfully. Wrangler emitted non-blocking EPERM messages while trying to write debug logs under `C:\Users\piotr\AppData\Roaming\xdg.config\.wrangler\logs`.
- `npm audit --json`: PASS WITH ADVISORIES. The command exits 1 because advisories exist: 4 high, 0 critical, all through Cloudflare tooling (`@cloudflare/vite-plugin`, `wrangler`, `miniflare`, `sharp`). No automatic fixes were applied.
- Search review for `bg-cosmic`, `purple-`, `slate-`, and `10x Astro Starter`: PASS. Remaining matches are documented as deferred to S-05, S-06, and S-07 in implementation notes.
- Primitive boundary search: PASS. `src/components/ui` has no `maintenance-task`, `supabase`, or `createClient` imports.
- Dependency cleanup search: PASS. No `@radix-ui` references remain in `package.json`, `package-lock.json`, or `src/components/ui`; no `from "cn"` imports remain in `src/components/ui`.
