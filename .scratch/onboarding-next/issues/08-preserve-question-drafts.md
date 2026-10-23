# 08: Preserve an unfinished question in each chat scope

**Milestone:** M6

**What to build:** Existing chat remembers unfinished questions across page navigation and reload, separately for each job role and All roles, without losing completed conversations.

**Blocked by:** None (can start immediately against the completed RAG baseline).

**Status:** ready-for-agent

**Progress:** not-started

- [ ] Keep one bounded unfinished question per existing chat scope using browser-local activity.
- [ ] Restore the appropriate draft after scope/page navigation and reload; preserve the current maximum question size.
- [ ] Keep all valid existing completed conversation records readable through the additive upgrade.
- [ ] Do not submit a question, spend provider quota or treat a draft as source evidence merely by typing/restoring it.
- [ ] Clear only the submitted draft on success, without erasing newer typing when a late response arrives.
- [ ] Keep storage failure feedback honest and include drafts in the current reset activity boundary.
- [ ] Verify the existing public chat UI across multiple scopes, including All roles, using controlled providers and no private-helper assertions.
