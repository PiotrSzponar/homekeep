---
project: HomeKeep
researched_at: "2026-09-10T21:49:59+02:00"
recommended_platform: "Cloudflare Workers + Pages"
runner_up: Netlify
context_type: mvp
tech_stack:
  language: "TypeScript / JavaScript"
  framework: "Astro 7 + React 19"
  runtime: "Cloudflare Workers via @astrojs/cloudflare"
---

## Recommendation

**Deploy on Cloudflare Workers + Pages.**

HomeKeep is already scaffolded for Astro SSR on Cloudflare Workers: `astro.config.mjs` uses `@astrojs/cloudflare`, `output: "server"`, and `wrangler.jsonc` points at the Astro Cloudflare Worker entrypoint. The interview answers also favor this choice: the app is request/response only, developer experience is the priority, the team is comfortable with Cloudflare, single-region latency is acceptable, and external managed services such as Supabase are fine.

Cloudflare wins because it requires the least stack change, has CLI-first deployment through Wrangler, provides a managed serverless runtime, has official Astro deployment docs, supports rollback and runtime logs, and now has official MCP servers for docs, observability, and Workers workflows.

Key evidence:

- Cloudflare Astro guide: https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/
- Astro Cloudflare adapter docs: https://docs.astro.build/en/guides/deploy/cloudflare/
- Cloudflare Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare Workers limits: https://developers.cloudflare.com/workers/platform/limits/
- Wrangler deploy, rollback, logs, and secrets commands: https://developers.cloudflare.com/workers/wrangler/commands/
- Cloudflare MCP servers: https://developers.cloudflare.com/agents/model-context-protocol/

## Platform Comparison

| Platform | CLI-first | Managed / serverless | Agent-readable docs | Stable deploy API | MCP / integration | Total | Fit for HomeKeep |
|---|---|---|---|---|---|---|---|
| Cloudflare Workers + Pages | Pass | Pass | Pass | Pass | Pass | 5 / 5 | Best fit |
| Netlify | Pass | Pass | Pass | Pass | Pass | 5 / 5 | Strong runner-up, but requires adapter change |
| Vercel | Pass | Pass | Pass | Pass | Partial | 4.5 / 5 | Strong DX, but requires adapter change |
| Railway | Pass | Partial | Pass | Pass | Pass | 4.5 / 5 | Good PaaS, more than this MVP needs |
| Render | Pass | Partial | Pass | Pass | Pass | 4.5 / 5 | Solid PaaS, but less aligned with this scaffold |
| Fly.io | Pass | Partial | Pass | Pass | Partial | 4 / 5 | Good for persistent/container workloads, unnecessary here |

Cloudflare Workers + Pages scores highest for this repository because the scaffold is already configured around the Cloudflare runtime. Wrangler provides direct deploy, rollback, logs, and secret management commands. Cloudflare's free and paid Worker tiers fit a small MVP, and the official docs cover Astro SSR deployment directly.

Netlify also scores well on agent-friendly criteria: it has a mature CLI, previews, logs, rollback, environment variable management, and an official MCP server. It is second because deploying this current codebase there would require changing from the Cloudflare adapter to Netlify's Astro deployment path.

Vercel has excellent frontend DX, CLI workflows, instant rollback support, and an MCP server in beta. It ranks third because this project is not using the Vercel Astro adapter today, and Vercel's strengths are most pronounced for Next.js-native projects.

Railway is strong for full-stack apps with co-located databases and persistent services. HomeKeep does not currently need those capabilities because it is a small Astro SSR app using external Supabase auth/data.

Render is a practical container/static hosting platform with useful CLI and hosted MCP support, but the free tier has cold-start behavior and Astro SSR would require a Node-style deployment change.

Fly.io is best when persistent processes, custom networking, or multi-region containers are part of the product. HomeKeep does not need always-on processes, so Fly's operational model is heavier than necessary.

### Shortlisted Platforms

#### 1. Cloudflare Workers + Pages (Recommended)

Cloudflare is the best fit because it matches the selected stack with almost no migration work. The repo already uses `@astrojs/cloudflare`, Wrangler, and a Worker entrypoint. It also fits the MVP constraints: low traffic, request/response behavior, external Supabase services, low operational overhead, and a developer already familiar with Cloudflare.

#### 2. Netlify

Netlify is the strongest alternative if Cloudflare becomes blocked by runtime compatibility or account constraints. It has excellent previews, CLI workflows, logs, rollback, and MCP support, but it would require changing the Astro adapter and validating the app on Netlify's runtime.

#### 3. Vercel

Vercel is a good fallback for fast iteration, preview deployments, and rollback ergonomics. It ranks below Netlify here because this project is Cloudflare-shaped already, Vercel's Astro SSR path uses a different adapter, and Vercel's MCP support is currently newer than its core deploy workflow.

## Anti-Bias Cross-Check: Cloudflare Workers + Pages

### Devil's Advocate - Weaknesses

1. Edge runtime compatibility can break later if HomeKeep adds dependencies that assume full Node.js APIs. `nodejs_compat` helps, but it does not make Workers identical to a Node server.
2. Secrets, bindings, and Cloudflare resources live outside the repository. A correct build can still fail at runtime if Supabase values, environment bindings, or access policies are missing.
3. Worker rollback restores a previous Worker version, but it does not roll back Supabase schema changes, Supabase data, deleted bindings, or external resources.
4. Debugging requires Cloudflare-specific habits: `wrangler tail`, Workers Logs, deployment logs, and dashboard observability. It is not the same loop as a long-running Node server.
5. Free-plan limits are generous for the MVP but still real: CPU time, request count, asset limits, environment variable limits, and log retention can become constraints if the app grows.

### Pre-Mortem - How This Could Fail

Six months after launch, the platform decision fails because the team treats Workers as if it were a generic Node server. A new scheduling or date helper dependency pulls in unsupported Node APIs, and the build still passes until a specific route fails at runtime. At the same time, environment values drift: local `.env`, `.dev.vars`, and Cloudflare Worker secrets contain different Supabase URLs or keys. A rushed production deploy ships a bad change and the team uses `wrangler rollback`, but the rollback only restores Worker code; the Supabase schema change and data mutation remain in place. Preview deployments also disappoint the workflow because forked pull requests do not receive the same preview URL behavior. Logs exist, but nobody configured a clear read-only path for agents to inspect them, so debugging turns into dashboard clicking. The MVP remains small, but the team pays an operational tax because they did not document runtime limits, secret ownership, deployment approval, and rollback boundaries before implementation.

### Unknown Unknowns

- Cloudflare's Astro deployment path is now Worker-oriented. Treat this as a Worker deployment with static assets, not as a traditional Node server.
- `compatibility_date` and `nodejs_compat` affect runtime behavior. Pinning and advancing them should be deliberate, not incidental.
- `wrangler secret put` manages deployed Worker secrets separately from local `.env` or `.dev.vars` files. Local success does not prove production secrets are present.
- Cloudflare preview URLs are subject to repository and branch conditions; forked pull requests may not receive preview URLs.
- Worker rollback is limited to recent versions and can fail or be incomplete when bindings or external resources have changed.

## Operational Story

- **Preview deploys**: Connect the repository through Cloudflare's Git integration for branch and pull-request previews. Protect preview URLs with Cloudflare Access if they expose signed-in product flows. Do not rely on preview URLs for forked pull requests.
- **Secrets**: Local development uses `.env` or `.dev.vars`; production uses Cloudflare Worker secrets set with `npx wrangler secret put SUPABASE_URL` and `npx wrangler secret put SUPABASE_KEY`. Secrets are not committed, and rotation requires a human owner.
- **Rollback**: Use `npx wrangler rollback` or `npx wrangler rollback <VERSION_ID> --message "<reason>"` to revert Worker code to a recent version. This does not revert Supabase schema, data, or deleted/changed bindings.
- **Approval**: A human approves production deploys, primary secret rotation, access policy changes, binding creation/deletion, and any Supabase schema/data migration. Agents may run read-only log inspection and build validation when credentials are scoped appropriately.
- **Logs**: Runtime logs are read through `npx wrangler tail <worker-name> --format pretty` or Cloudflare Workers Logs. For agent workflows, configure read-only Cloudflare Observability MCP access where available.

## Risk Register

| Risk | Source | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| A future dependency assumes unsupported Node APIs on Workers | Devil's advocate | M | H | Run `npm run build` before deploy, prefer browser/edge-compatible packages, and check Astro Cloudflare docs before adding server-only libraries. |
| Production secrets are missing or drift from local values | Pre-mortem | M | H | Use `.dev.vars` or `.env` only for local work, set production values with `wrangler secret put`, and verify required keys before deployment. |
| Rollback does not revert Supabase data or schema changes | Devil's advocate | M | H | Treat data changes separately from Worker deploys, document migration rollback steps, and back up/export data before destructive schema changes. |
| Preview deployment behavior is misunderstood | Unknown unknowns | M | M | Document the Git integration behavior, fork pull-request limitation, and whether Cloudflare Access protects previews. |
| Existing dependency audit findings remain unresolved | Research finding | H | M | Review the current `npm audit --json` output before production. Upgrade deliberately and avoid blind `npm audit fix` changes without regression testing. |
| Cloudflare free-plan limits become surprising after growth | Research finding | L | M | Monitor Workers request count, CPU time, assets, environment variables, and logs. Move to Workers Paid if usage approaches free limits. |
| Binding or resource changes make rollback incomplete | Unknown unknowns | M | H | Keep binding changes small and reviewed. Include bindings in deployment notes and avoid deleting resources until rollback windows pass. |

## Getting Started

1. Rename the Worker in `wrangler.jsonc` from `10x-astro-starter` to `homekeep` or the final production Worker name.
2. Keep the existing Astro deployment shape: `@astrojs/cloudflare` in `astro.config.mjs`, `output: "server"`, and the Cloudflare Worker entrypoint in `wrangler.jsonc`.
3. Configure local Supabase values in `.dev.vars` or `.env`, then set production secrets:

   ```powershell
   npx wrangler secret put SUPABASE_URL
   npx wrangler secret put SUPABASE_KEY
   ```

4. Validate the production build locally:

   ```powershell
   npm run build
   ```

5. Deploy with the pinned Wrangler version from this project:

   ```powershell
   npx wrangler deploy
   ```

6. Tail runtime logs after deployment, using the final Worker name:

   ```powershell
   npx wrangler tail homekeep --format pretty
   ```

## Out of Scope

The following were not evaluated in this research:

- Docker image configuration
- CI/CD pipeline setup
- Production-scale architecture such as multi-region failover, high availability, and disaster recovery
