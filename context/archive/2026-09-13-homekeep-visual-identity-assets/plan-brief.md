# HomeKeep Visual Identity Assets - Plan Brief

> Full plan: `context/changes/homekeep-visual-identity-assets/plan.md`

## What & Why

S-08 adds a lightweight HomeKeep identity based on a house-heart mark. The goal is to replace the temporary `HK` topbar chip and scaffold-era favicon with a small, product-owned identity that fits the existing Luma/Lime UI system.

## Starting Point

The app already has a shared topbar, brand constants, a reusable `AppBrand` component, and shadcn/Base UI theme tokens. The current visual identity is minimal: `AppBrand` renders an `HK` text chip, and `Layout.astro` links a 32x32 `/favicon.png`.

## Desired End State

Users see a recognizable house-heart HomeKeep mark in the topbar and browser tab. The app keeps the current HomeKeep name/tagline lockup, task flows remain unchanged, and no README/template imagery or broader brand collateral is added.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Mark source | Repo-native SVG/CSS mark | Keeps the identity crisp, inspectable, and easy to maintain. |
| Asset formats | SVG plus PNG favicon | Gives scalable UI/browser support while keeping the existing PNG favicon path covered. |
| Surfaces | Topbar and favicon only | Delivers the roadmap outcome without overlapping shell/homepage redesign work. |
| Text lockup | Refine current lockup | Keeps navigation stable while replacing the placeholder mark. |
| Visual QA | Manual design review required | Brand acceptance is subjective enough to require explicit user approval. |
| README/template images | Out of scope | Roadmap explicitly excludes this collateral from S-08. |

## Scope

**In scope:**

- SVG house-heart mark source.
- Topbar `AppBrand` mark replacement.
- SVG favicon plus updated 32x32 PNG favicon.
- `Layout.astro` favicon link updates if needed.
- Light/dark and mobile/desktop visual QA.
- Explicit user approval of the mark/favicon direction.

**Out of scope:**

- README image or `public/template.png` replacement.
- Brand guidelines, social preview images, app-store icons, or marketing collateral.
- Homepage/auth/dashboard redesign.
- Task, auth, Supabase, route, or data changes.

## Architecture / Approach

Author one SVG house-heart source and use it for both the in-app mark and favicon generation. Keep text in `src/lib/brand.ts`, consume the mark in `src/components/brand/AppBrand.astro`, and update `src/layouts/Layout.astro` only for favicon links.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Mark Source and Asset Contract | Canonical SVG mark plus favicon assets | Mark may not survive favicon scale |
| 2. Topbar Lockup Integration | `HK` chip replaced without changing nav behavior | Header spacing may regress on mobile |
| 3. Visual QA and Review | Lint/build plus screenshot/manual approval gate | Subjective review may require iteration |

**Prerequisites:** F-02 shadcn/Luma foundation is complete.
**Estimated effort:** One focused implementation session plus manual review.

## Open Risks & Assumptions

- The plan assumes a simple geometric house-heart mark is enough for MVP identity.
- The favicon PNG should be generated from the SVG source, not hand-maintained as an unrelated bitmap.
- Manual approval may require one or more small visual iterations before archive.

## Success Criteria (Summary)

- Topbar and favicon show the same house-heart identity direction.
- No placeholder `HK` mark remains in user-facing brand surfaces.
- Lint/build pass, mobile/desktop screenshots are clean, and the user approves the mark/favicon.
