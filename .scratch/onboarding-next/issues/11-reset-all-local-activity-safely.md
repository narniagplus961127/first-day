# 11: Reset all demo activity without stale resurrection

**Milestone:** M7

**What to build:** A confirmed Reset demo clears progress, conversations, drafts and task-question handoffs across open tabs, and late work cannot restore cleared activity.

**Blocked by:** 09: Ask a task question without overwriting unfinished work; 10: Keep checklist changes consistent between browser tabs

**Status:** ready-for-agent

**Progress:** resolved

- [x] Provide consistent accessible confirmation from overview/checklist and chat; cancellation changes no activity.
- [x] Clear all five roles' progress, all chat scopes' history/drafts and pending task-question handoffs; restore Frontend Developer defaults.
- [x] Propagate visible reset to other open tabs and fence stale writes, old imported history, replayed handoffs and pre-reset answer callbacks.
- [x] A new intentional post-reset action remains possible while pre-reset activity stays cleared.
- [x] Preserve authentication, shared checklist/knowledge definitions, other browsers and server-side question allowances.
- [x] Pause a controlled answer, reset elsewhere, release the response and trigger stale writes/reload; verify no resurrection through the browser seam.
- [x] Do not claim that browser reset refunds or reverses an admitted provider request.

## Comments

October 23, 2026: Implemented on feat/onboarding-11. Overview, checklist and chat share an accessible native confirmation with cancel focused. Reset publishes a durable generation marker before bounded cleanup; current-generation records remain readable while old legacy/task/conversation writes stay inert. Cross-tab reset restores Frontend defaults, removes older session handoffs, dismisses replacement confirmation and fences asynchronous task lookup plus answer response/error/finally with generation and request identity. New deliberate actions continue to work, including before a delayed reset notification arrives.

The browser journey verifies all five roles, all six chat scopes, cancellation, paused real public API answers, paused task lookup, suspended legacy handoff replay, new task handoffs, separate browser isolation, unchanged authenticated shared definitions and the real five-question server allowance. A partial remove failure reports unconfirmed browser-wide clearing. Blocked initial storage remains usable with temporary-activity feedback; comprehensive storage recovery belongs to ticket 12.

TDD evidence: missing checklist Reset control failed first; suspended legacy handoff replay failed next; delayed reset event erased an intentional new draft before the listener guard. Each was corrected and observed green. The existing blocked-storage draft case caught a startup generation-read regression; the narrow token fallback restored the prior temporary-tab behavior. Existing restored-citation coverage also exposed corrupted punctuation introduced in the integration; only affected English literals were corrected.

Validation: six new reset journeys passed on desktop/mobile (12 cases). The six-file existing conversation/draft/task-question/checklist-tabs/progress/overview run passed 39 of 42 before the final fixes. Focused rerun of the two affected existing cases plus all reset journeys passed 16 of 16, covering all 54 distinct relevant cases across the runs. Type checking passed. Production build passed. Repository rules passed (215 text/binary files inspected), and git diff --check passed. No cloud schema/provider/settings or deployment changes.
