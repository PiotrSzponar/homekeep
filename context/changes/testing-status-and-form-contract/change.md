---
change_id: testing-status-and-form-contract
title: Test status and task form contracts
status: impl_reviewed
created: 2026-09-13
updated: 2026-09-13
archived_at: null
---

## Notes

Open a change folder for rollout Phase 1 of context/foundation/test-plan.md: "Status and form contract".
Risks covered: #1, #2. Test types planned: unit + integration.
Risk response intent:

- Risk #1: prove boundary examples independently cover OK, due soon, and overdue from last-completed date plus recurrence interval; challenge production date math as the oracle; avoid copying the implementation calculation into expected values.
- Risk #2: prove the same invalid and valid task inputs produce consistent outcomes across create and edit paths; challenge browser constraints as a substitute for server validation; avoid happy-path-only form tests.
  After creating the folder, follow the downstream continuation rule.
