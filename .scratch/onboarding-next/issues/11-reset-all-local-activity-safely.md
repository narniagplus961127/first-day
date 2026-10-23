# 11: Reset all demo activity without stale resurrection

**Milestone:** M7

**What to build:** A confirmed Reset demo clears progress, conversations, drafts and task-question handoffs across open tabs, and late work cannot restore cleared activity.

**Blocked by:** 09: Ask a task question without overwriting unfinished work; 10: Keep checklist changes consistent between browser tabs

**Status:** ready-for-agent

**Progress:** not-started

- [ ] Provide consistent accessible confirmation from overview/checklist and chat; cancellation changes no activity.
- [ ] Clear all five roles' progress, all chat scopes' history/drafts and pending task-question handoffs; restore Frontend Developer defaults.
- [ ] Propagate visible reset to other open tabs and fence stale writes, old imported history, replayed handoffs and pre-reset answer callbacks.
- [ ] A new intentional post-reset action remains possible while pre-reset activity stays cleared.
- [ ] Preserve authentication, shared checklist/knowledge definitions, other browsers and server-side question allowances.
- [ ] Pause a controlled answer, reset elsewhere, release the response and trigger stale writes/reload; verify no resurrection through the browser seam.
- [ ] Do not claim that browser reset refunds or reverses an admitted provider request.
