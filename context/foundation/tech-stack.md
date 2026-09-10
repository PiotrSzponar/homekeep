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

## Why this stack

HomeKeep is a small greenfield web app with a 1-week after-hours MVP, login, user-owned maintenance tasks, and no payments, realtime, AI, or background-job scope. The 10x Astro Starter is the curated JavaScript/TypeScript default for this shape because it gives an opinionated full-stack path with TypeScript, auth, data storage, and Cloudflare deployment already aligned. The standard path keeps the decision surface small: Cloudflare Pages deployment, GitHub Actions CI, and auto-deploy on merge match the starter defaults and preserve momentum for the deadline.
