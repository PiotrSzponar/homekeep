---
project: "HomeKeep"
version: 1
status: draft
created: 2026-09-10
context_type: greenfield
product_type: web-app
target_scale:
  users: small
  qps: low
  data_volume: small
timeline_budget:
  mvp_weeks: 1
  hard_deadline: 2026-09-14
  after_hours_only: true
---

# HomeKeep PRD

## Vision & Problem Statement

An individual homeowner feels the problem when they need to remember when a recurring maintenance task was last completed and when it should be done again.

Today they rely on memory, calendar entries, or scattered notes, which takes extra effort and can result in maintenance being done late or forgotten. HomeKeep's insight is that last done date plus repeat interval can produce a useful OK, due soon, or overdue signal without making the MVP larger.

## User & Persona

Primary persona: an individual homeowner tracking recurring maintenance tasks for their own home.

They reach for HomeKeep when they need to check whether a maintenance task is still OK, due soon, or already overdue.

## Success Criteria

### Primary

- A signed-in homeowner can create a maintenance task by entering the task name, the date it was last completed, and the recurrence interval; after saving, HomeKeep shows the saved task with the calculated next due date and its current status: OK, due soon, or overdue.

### Secondary

- The homeowner can quickly scan saved tasks to see which task needs attention first.

### Guardrails

- A signed-in homeowner must not see another homeowner's maintenance tasks.

## User Stories

### US-01: Create a maintenance task and see its status

- **Given** a signed-in homeowner has opened HomeKeep
- **When** they create a maintenance task by entering the task name, the date it was last completed, and the recurrence interval, then save it
- **Then** HomeKeep shows the saved task with the calculated next due date and its current status: OK, due soon, or overdue

#### Acceptance Criteria

- The saved task shows the task name provided by the homeowner.
- The saved task shows a calculated next due date.
- The saved task shows one current status: OK, due soon, or overdue.

## Functional Requirements

- FR-001: Signed-in homeowner can create a maintenance task by providing its name, last completed date, and recurrence interval. Priority: must-have
  > Socrates: Counter-argument considered: "Creating a task might have too many fields for a small MVP." Resolution: kept as written; name, last completed date, and recurrence interval are the minimum inputs needed to calculate status.
- FR-002: Signed-in homeowner can view their saved maintenance tasks with the calculated next due date and current status. Priority: must-have
  > Socrates: Counter-argument considered: "Status may be enough without showing next due date." Resolution: kept as written; next due date explains the status.
- FR-003: Signed-in homeowner can edit an existing maintenance task. Priority: must-have
  > Socrates: Counter-argument considered: "The homeowner could delete and recreate a task instead of editing it." Resolution: kept as written.
- FR-004: Signed-in homeowner can delete an existing maintenance task. Priority: must-have
  > Socrates: Counter-argument considered: "Deletion could accidentally remove useful maintenance history if there is no recovery path." Resolution: kept as written; the MVP can avoid preserving deleted tasks once the user deletes them.
- FR-005: Signed-in homeowner can mark a maintenance task as completed so its last completed date, next due date, and status are updated. Priority: must-have
  > Socrates: Counter-argument considered: "Editing the last completed date could cover completion without a separate action." Resolution: kept as written; marking completed is core to recurring maintenance and keeps the main workflow fast.
- FR-006: Signed-in homeowner can access only their own maintenance tasks after signing in. Priority: must-have
  > Socrates: Counter-argument considered: "Account-based data separation adds product and implementation surface for a tiny MVP." Resolution: kept as written; because the MVP uses login, each homeowner's tasks must stay private.

## Non-Functional Requirements

- Task list and status updates are visible to the homeowner within 3 seconds.
- A signed-in homeowner can only access maintenance tasks belonging to their account.
- HomeKeep remains usable on current mainstream desktop and mobile browsers.

## Business Logic

HomeKeep calculates the next maintenance due date from the task's last completion date and recurrence interval, then classifies the task as OK, due soon, or overdue.

The rule consumes the task's last completion date and recurrence interval. It produces a next due date and exactly one current status.

A task is overdue after its next due date has passed. A task is due soon when its next due date is within 7 days. Otherwise, the task is OK.

The homeowner encounters this rule when viewing saved tasks and when marking a task as completed.

## Access Control

HomeKeep requires login for the MVP.

Each signed-in homeowner can only manage their own maintenance tasks. There are no separate roles in the MVP.

## Non-Goals

- No shared homes, household members, invitations, or role separation in the MVP; the first version serves an individual homeowner.
- No reminders by email, push, SMS, or calendar notification in the MVP; the first version reports status when the homeowner opens HomeKeep.
- No prebuilt task library in the MVP; the homeowner creates their own maintenance tasks.
- No AI-generated maintenance schedules or recommendations in the MVP; the first version calculates due dates and classifies task status from user-provided inputs.

## Open Questions

None.
