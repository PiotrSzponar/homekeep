# First HomeKeep Deployment On Cloudflare Workers

## Summary
- Deploy directly with `npx wrangler deploy` as Worker `homekeep`.
- Use the `workers.dev` production URL returned by Wrangler: `https://homekeep.piotr-sz.workers.dev`.
- Use account-level `workers.dev` subdomain `homekeep`.
- Do not configure a custom domain, Git integration, CI/CD deploys, Cloudflare Pages previews, or Worker Preview URLs in this first deployment.
- Use the existing hosted Supabase project and set production secrets in Cloudflare as `SUPABASE_URL` and `SUPABASE_KEY`.

## Required Repository Changes
- `wrangler.jsonc` must use `name: "homekeep"`.
- `wrangler.jsonc` must explicitly set `workers_dev: true` and `preview_urls: false`.
- `wrangler.jsonc` must declare required secrets: `SUPABASE_URL` and `SUPABASE_KEY`.
- Normalize CRLF line endings in linted source/config files only.
- Do not write to `context/archive/`.

## Deploy Flow
1. Run local preflight:
   - `npm run lint`
   - `npm run build`
   - `npx wrangler deploy --dry-run`
2. Verify Cloudflare auth:
   - `npx wrangler whoami`
   - If not authenticated, run `npx wrangler login`.
   - If more than one account is available and the target account is unclear, stop and choose the account manually.
3. Ensure account-level `workers.dev` subdomain is `homekeep`.
4. Set production Supabase secrets:
   - In this local run, use `npx wrangler secret bulk .env --name homekeep` because `.env` contains only the two required Supabase keys and is ignored by git.
   - `npx wrangler secret put SUPABASE_URL --name homekeep`
   - `npx wrangler secret put SUPABASE_KEY --name homekeep`
   - If setting secrets individually, values must be entered interactively by the human operator and must not be committed or pasted into chat.
5. Deploy production:
   - `npm run build`
   - `npx wrangler deploy --message "First HomeKeep production deploy"`
6. After deploy:
   - Record the returned `workers.dev` URL.
   - Add that production URL to Supabase Auth Site URL / allowed redirect URLs if Supabase email confirmation or redirect allowlisting requires it.
   - Check runtime errors with `npx wrangler tail homekeep --format pretty --status error`.

## Verification
- `npm run lint` must pass after line-ending normalization.
- `npm run build` must pass.
- `npx wrangler deploy --dry-run` must pass before production deploy.
- Production checks:
  - `/` loads successfully.
  - `/dashboard` redirects an anonymous user to `/auth/signin`.
  - `/auth/signup` and `/auth/signin` work against hosted Supabase.
  - After sign-in, `/dashboard` is available.
  - `wrangler tail` shows no runtime errors during smoke testing.

## Fallbacks
- If `secrets.required` blocks the first deploy despite `secret put`, use a temporary secrets file outside the repo with `npx wrangler deploy --secrets-file <temporary-file>`, then delete it immediately.
- If Cloudflare rejects the automatic `IMAGES` binding, set the Astro adapter to `cloudflare({ imageService: "compile" })`, rebuild, and repeat dry-run.
- If automatic `SESSION` KV creation fails, run `npx wrangler kv namespace create homekeep-session --binding SESSION --update-config`, then rebuild, dry-run, and deploy.

## Assumptions
- Node version is `22.14.0` from `.nvmrc`.
- npm is the package manager.
- Local Wrangler version is `4.131.0`.
- The Cloudflare Astro path is `npm run build` followed by `npx wrangler deploy`.
- Wrangler supports `deploy --dry-run`, `secret put`, `tail`, rollback, and `secrets.required`.

## Deployment Result
- Production URL: `https://homekeep.piotr-sz.workers.dev`.
- Current deployed Worker version: `d208c251-480c-47ad-b367-2e98f8f6d73a`.
- Cloudflare account `workers.dev` subdomain: `homekeep`.
- Worker subdomain enabled: `true`.
- Worker preview URLs enabled: `false`.
