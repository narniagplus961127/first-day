# 06: Preserve accurate progress through checklist changes

**Milestone:** M5

**What to build:** Learners keep completed work when an administrator clarifies or reorganizes tasks, while new and removed obligations change progress predictably.

**Blocked by:** 02: Reorder tasks and move them between onboarding stages; 04: Complete and revisit a role checklist privately

**Status:** ready-for-agent

**Progress:** resolved

- [x] Rename, instructions edits, reorder and stage movement preserve completion for the same task identity.
- [x] New task identities begin incomplete; removed tasks no longer display, count or appear among next tasks.
- [x] Deleting and creating a new obligation cannot reuse an old completion through text, index or recycled identity.
- [x] Reconcile progress using the current saved checklist; do not reset the whole role merely because its revision changes.
- [x] Demonstrate an administrator editing a checklist while a learner has saved completion, then assert current counts and ordering.
- [x] Preserve browser/role isolation and accurate behavior across reload.
## Verification

October 23, 2026: `npm run test:knowledge -- checklist-reconciliation.spec.ts` passed both desktop and mobile journeys (2/2), using real isolated authentication, checklist persistence and public administrator/read APIs. A separate administrator edits a checklist while a learner has saved completion. The journey checks retained completion after title/instruction/stage/order changes, removed-task denominator and overview next-step reconciliation, a fresh incomplete same-title obligation, rejected reuse of a retired task identity without changing the published snapshot, role/browser isolation and reload persistence.

The stable-identity behavior already supplied by tickets 01, 02 and 04 met this contract; no additional application changes were needed. Ticket 05 was integrated before verifying overview next steps. `npm run typecheck` and `git diff --check` passed. Test setup restores both shared role definitions through the public administrator save API and does not use a database side channel or private browser storage keys.
