# 09: Ask a task question without overwriting unfinished work

**Milestone:** M6

**What to build:** A learner opens a configured task question in the correct role, edits it, protects an existing draft and submits through the normal grounded-answer journey.

**Blocked by:** 04: Complete and revisit a role checklist privately; 08: Preserve an unfinished question in each chat scope

**Status:** ready-for-agent

**Progress:** resolved

- [x] Administrators can configure an optional suggested question within the existing question limit.
- [x] Task action selects that task's role while preserving other scopes' drafts and completed history.
- [x] Empty or identical target drafts avoid redundant confirmation; conflicting nonempty drafts require a replace/cancel decision.
- [x] Cancel preserves the destination draft/history; acceptance replaces only that draft.
- [x] Use a bounded one-time handoff so reload/back or a cancelled intent cannot repeatedly overwrite a draft.
- [x] Missing or removed tasks show an honest unavailable action without clearing unrelated work.
- [x] No automatic submission or task completion occurs; explicit submission retains current retrieval, citation and quota contracts.
- [x] Verify the real task → chat → supported answer/source path plus no-request-before-submit, confirmation and scope-isolation cases.

## Verification

Implemented in f4578b1 and integrated at 45ba1a6. Four task-question journeys plus existing draft and guide journeys passed on desktop/mobile: 18 checks. Covers editable explicit submission with grounded citation, replace/cancel and replay protection, removed-task feedback, and 1000-character validation at the HTTP and direct Data API boundaries. A bounded five-minute session intent carries only a nonce in the URL and is consumed before lookup/confirmation. Existing histories, other-scope drafts and manual completion remain intact.

The journey exposed a published-guide lookup URI limit with 208 accumulated Frontend documents. The lookup now uses the actual active-version foreign-key relationship in one query, preserving same-role and fully-published checks. Typecheck, production build and repository CRLF checks passed; latest cross-tab integration was merged before handoff. Native FigCraft frames were inspected without exports. No cloud changes, push or deployment.
