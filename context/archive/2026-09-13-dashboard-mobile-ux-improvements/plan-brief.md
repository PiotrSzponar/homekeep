# Dashboard Mobile UX Improvements - Plan Brief

> Full plan: `context/changes/dashboard-mobile-ux-improvements/plan.md`

## What & Why

S-06 improves the dashboard's mobile ergonomics without changing the MVP task model. The goal is to make saved tasks easier to scan first on phones, keep first-task creation obvious, and make task action buttons follow the requested mobile order: Mark completed, Delete, Edit task.

## Starting Point

S-05 already delivered hydrated create/edit forms and a `TaskActions` React island. The dashboard currently renders create form first in a two-column desktop grid, then the task list; task action buttons are grouped as edit/delete on the left and mark-completed on the right on all viewports.

## Desired End State

On mobile, homeowners with saved tasks see a compact create entry first, with the create form hidden until opened so saved tasks remain immediately reachable. When there are no tasks, and on desktop in all task states, the create form remains visible so task creation is not hidden. Task actions use the mobile order Mark completed, Delete, Edit task below `sm`, while desktop can keep the current wider-row layout.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Mobile creation | Keep create entry first but collapse the form when tasks exist | Preserves a predictable create location while keeping saved tasks immediately reachable. | Plan |
| Empty and desktop dashboard | Create form remains visible | Empty users need a direct first-task path, and desktop has enough space for the full create surface. | Plan |
| Mobile action order | Mark completed, Delete, Edit task | Matches the S-06 roadmap update and the main recurring-maintenance workflow priority. | Roadmap / Plan |
| Desktop action layout | May remain optimized for wide screens | Keeps the current clear desktop grouping instead of forcing mobile order everywhere. | Plan |
| Banners | Keep current placement and copy | User explicitly excluded banner changes from this slice. | Plan |
| Card density | No task-card content/density redesign | Keeps scope focused on mobile workflow, create visibility, and action ordering. | Plan |
| Breakpoint | Mobile behavior below `sm` | Matches existing Tailwind responsive patterns in task components. | Plan |
| Verification | Lint, build, focused search, and visual/manual checks | UI-responsive behavior is best verified through build plus browser checks here. | Plan |

## Scope

**In scope:**

- Mobile-only create-form collapse when there are saved tasks.
- Visible create form on empty mobile dashboard.
- Mobile task action order: Mark completed, Delete, Edit task.
- Desktop task action layout may remain optimized for wide screens.
- Manual mobile/desktop light/dark verification.

**Out of scope:**

- API, Supabase, schema, auth, or business-rule changes.
- Dashboard banner copy, placement, or behavior changes.
- Task card information-density redesign.
- New reminders, task libraries, shared households, or AI recommendations.
- S-07 app shell/auth/homepage changes.

## Architecture / Approach

Keep Astro responsible for dashboard composition and server-fetched task data. Add the smallest React wrapper needed for mobile create-form disclosure, and adjust `TaskActions` responsive classes so mobile order differs from desktop without changing native POST routes.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Mobile create entry | Mobile create form collapses when tasks exist and remains visible when empty | Hiding creation too much for users with tasks |
| 2. Mobile task actions | Mobile action order becomes Mark completed, Delete, Edit task while desktop stays ergonomic | Regressing task actions or delete confirmation |
| 3. Responsive verification | Build/lint/search plus manual mobile and desktop checks | Missing a viewport/theme layout issue |

**Prerequisites:** S-05 implementation reviewed; F-02 shadcn/Luma primitives remain the UI baseline.
**Estimated effort:** One focused implementation session across three small phases.

## Open Risks & Assumptions

- Assumes keeping dashboard banners unchanged is intentional for S-06.
- Assumes mobile below `sm` is the right cutoff for this product's current layout.
- Assumes a simple local disclosure state is enough; no persistence of create-form open state is required.

## Success Criteria (Summary)

- Mobile users with saved tasks see a compact create trigger first, then tasks immediately, and can open creation quickly.
- Mobile task action buttons appear as Mark completed, Delete, Edit task.
- Create, edit, mark-completed, and delete flows still submit to their existing routes and pass build/lint verification.
