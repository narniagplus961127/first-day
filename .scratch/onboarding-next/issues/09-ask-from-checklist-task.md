# 09: Ask a task question without overwriting unfinished work

**Milestone:** M6

**What to build:** A learner opens a configured task question in the correct role, edits it, protects an existing draft and submits through the normal grounded-answer journey.

**Blocked by:** 04: Complete and revisit a role checklist privately; 08: Preserve an unfinished question in each chat scope

**Status:** ready-for-agent

**Progress:** not-started

- [ ] Administrators can configure an optional suggested question within the existing question limit.
- [ ] Task action selects that task's role while preserving other scopes' drafts and completed history.
- [ ] Empty or identical target drafts avoid redundant confirmation; conflicting nonempty drafts require a replace/cancel decision.
- [ ] Cancel preserves the destination draft/history; acceptance replaces only that draft.
- [ ] Use a bounded one-time handoff so reload/back or a cancelled intent cannot repeatedly overwrite a draft.
- [ ] Missing or removed tasks show an honest unavailable action without clearing unrelated work.
- [ ] No automatic submission or task completion occurs; explicit submission retains current retrieval, citation and quota contracts.
- [ ] Verify the real task → chat → supported answer/source path plus no-request-before-submit, confirmation and scope-isolation cases.
