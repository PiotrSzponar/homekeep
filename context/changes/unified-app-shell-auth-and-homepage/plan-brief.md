# Unified App Shell, Auth, and Homepage - Plan Brief

> Full plan: `context/changes/unified-app-shell-auth-and-homepage/plan.md`

## What & Why

HomeKeep needs one coherent entry and shell flow across homepage, auth, and dashboard. S-07 makes signed-in users enter through the dashboard, keeps signed-out users on a compact HomeKeep entry page or auth forms, and removes visible implementation/vendor wording.

## Starting Point

The app already has protected dashboard middleware, a shared Topbar, HomeKeep brand constants, and shadcn/Luma/Lime primitives. The gaps are that `/` always renders a public page, signed-in users can still see sign-in/sign-up forms, auth pages duplicate shell markup, and dashboard/config/auth messages still expose Supabase/provider wording.

## Desired End State

Signed-in homeowners land in the dashboard immediately, including when they visit `/`, `/auth/signin`, or `/auth/signup`. Signed-out visitors get a compact public entry page and auth pages that share the same HomeKeep shell. Visible messages talk like product UI, not scaffolding or backend diagnostics.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Root behavior | Signed-in redirect, signed-out compact entry | Keeps dashboard as the app home without deleting the public entry path. |
| Auth pages when signed in | Redirect to `/dashboard` | Avoids showing irrelevant auth forms to active users. |
| Homepage scope | Compact entry | Removes starter feel without creating a marketing-page project. |
| Shell strategy | Shared shell | Reduces duplicated route markup and keeps homepage/auth/dashboard visually consistent. |
| Copy cleanup | All visible implementation/vendor wording | Completes the polish anchor across normal, fallback, and missing-config surfaces. |
| Signed-out Topbar | Sign in only | Keeps navigation minimal while page body carries account creation. |
| Verification | Focused helper tests plus lint/build/manual route checks | Covers redirect risk without introducing a heavy Astro route harness. |

## Scope

**In scope:**

- Session-aware `/` behavior.
- Signed-in redirects from sign-in and sign-up pages.
- Shared shell/page spacing for homepage, auth pages, and dashboard.
- Compact signed-out homepage entry.
- Provider-neutral dashboard, config, and auth fallback messages.
- Focused redirect-helper tests where practical.

**Out of scope:**

- Task CRUD, task calculations, schema, or data access changes.
- Shared households, reminders, templates, AI schedules, or other PRD non-goals.
- Final logo/favicon identity work owned by S-08.
- Full marketing-page expansion.

## Architecture / Approach

Middleware remains the owner of protected `/dashboard` and `/api/tasks` access. Root and auth pages consume `Astro.locals.user` for usability redirects, while a shared shell component owns Topbar placement and responsive main spacing. Copy cleanup stays in the routes/helpers that surface messages to users.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Route Entry Contract | Session-aware root and signed-in auth-page redirects | Redirect loops or weakened auth assumptions |
| 2. Shared Shell and Compact Public Entry | Reusable page shell and consistent homepage/auth/dashboard structure | Regressing S-06 dashboard layout |
| 3. User-Facing Copy and Final Route QA | Provider-neutral visible messages and full route-loop verification | Losing useful setup diagnostics |

**Prerequisites:** F-02 UI foundation is complete; S-06 dashboard layout is present in the working tree.
**Estimated effort:** ~1-2 implementation sessions across 3 phases.

## Open Risks & Assumptions

- The plan assumes `Astro.locals.user` is reliable on root and auth pages because middleware already loads it for every request.
- S-06 appears implemented in the working tree even though the roadmap status still says `in-progress`; implementation should preserve the current dashboard create/list layout.
- Missing-config copy must stay user-facing while still leaving enough developer signal for local setup.

## Success Criteria (Summary)

- Signed-in users are routed to `/dashboard` from `/`, `/auth/signin`, and `/auth/signup`; signed-out users can still enter through homepage/auth flows.
- Homepage, auth pages, and dashboard share a consistent HomeKeep shell without starter-facing branding or old palette regressions.
- User-visible dashboard/config/auth messages no longer mention Supabase or starter internals.
