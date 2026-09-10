---
bootstrapped_at: 2026-09-10T15:03:50+02:00
starter_id: 10x-astro-starter
starter_name: "10x Astro Starter (Astro + Supabase + Cloudflare)"
project_name: homekeep
language_family: js
package_manager: npm
cwd_strategy: git-clone
bootstrapper_confidence: first-class
phase_3_status: ok
audit_command: "npm audit --json"
---

## Hand-off

```yaml
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
---
```

HomeKeep is a small greenfield web app with a 1-week after-hours MVP, login, user-owned maintenance tasks, and no payments, realtime, AI, or background-job scope. The 10x Astro Starter is the curated JavaScript/TypeScript default for this shape because it gives an opinionated full-stack path with TypeScript, auth, data storage, and Cloudflare deployment already aligned. The standard path keeps the decision surface small: Cloudflare Pages deployment, GitHub Actions CI, and auto-deploy on merge match the starter defaults and preserve momentum for the deadline.

## Pre-scaffold verification

| Signal | Value | Severity | Notes |
| --- | --- | --- | --- |
| npm package | not run | n/a | Starter command starts with git clone, so no npm create package was derived. |
| GitHub repo | not run | n/a | `gh` CLI is not installed; repo recency check unavailable. |

## Scaffold log

**Resolved invocation**: `git clone https://github.com/przeprogramowani/10x-astro-starter .bootstrap-scaffold && cd .bootstrap-scaffold && npm install`
**Strategy**: git-clone
**Exit code**: 0
**Files moved**: 31515
**Conflicts (.scaffold siblings)**: none
**.gitignore handling**: moved silently
**.bootstrap-scaffold cleanup**: deleted

## Post-scaffold audit

**Tool**: `npm audit --json`
**Summary**: 2 CRITICAL, 14 HIGH, 8 MODERATE, 3 LOW
**Direct vs transitive**: 1/0/2/0 direct of total 2/14/8/3

#### CRITICAL findings

- `astro` - direct dependency; fix available.
- `tar` - transitive dependency; fix available.

#### HIGH findings

- `brace-expansion` - transitive dependency; fix available.
- `browserslist` - transitive dependency; fix available.
- `devalue` - transitive dependency; fix available.
- `fast-uri` - transitive dependency; fix available.
- `js-yaml` - transitive dependency; fix available.
- `miniflare` - transitive dependency; fix available.
- `nanoid` - transitive dependency; fix available.
- `postcss` - transitive dependency; fix available.
- `sharp` - transitive dependency; fix available.
- `smol-toml` - transitive dependency; fix available.
- `svgo` - transitive dependency; fix available.
- Additional high findings are present in the raw audit output; rerun `npm audit --json` for the full advisory list.

#### MODERATE findings

8 moderate findings were reported by npm audit. Rerun `npm audit --json` for the full advisory list.

#### LOW / INFO findings

3 low findings and 0 info findings were reported by npm audit. Rerun `npm audit --json` for the full advisory list.

## Hints recorded but not acted on

| Hint | Value |
| --- | --- |
| bootstrapper_confidence | first-class |
| quality_override | false |
| path_taken | standard |
| self_check_answers | null |
| team_size | solo |
| deployment_target | cloudflare-pages |
| ci_provider | github-actions |
| ci_default_flow | auto-deploy-on-merge |
| has_auth | true |
| has_payments | false |
| has_realtime | false |
| has_ai | false |
| has_background_jobs | false |

## Next steps

Next: a future skill will set up agent context (CLAUDE.md, AGENTS.md). For now, your project is scaffolded and verified.

Useful manual steps in the meantime:

- `git init` if you have not already, to start your own repo history.
- Review any `.scaffold` siblings the conflict policy created and decide which version of each file to keep.
- Address audit findings per your project's risk tolerance; the full breakdown is in this log.
