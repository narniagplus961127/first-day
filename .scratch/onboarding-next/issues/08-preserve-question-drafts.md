# 08: Preserve an unfinished question in each chat scope

**Milestone:** M6

**What to build:** Existing chat remembers unfinished questions across page navigation and reload, separately for each job role and All roles, without losing completed conversations.

**Blocked by:** None (can start immediately against the completed RAG baseline).

**Status:** ready-for-agent

**Progress:** resolved

- [x] Keep one bounded unfinished question per existing chat scope using browser-local activity.
- [x] Restore the appropriate draft after scope/page navigation and reload; preserve the current maximum question size.
- [x] Keep all valid existing completed conversation records readable through the additive upgrade.
- [x] Do not submit a question, spend provider quota or treat a draft as source evidence merely by typing/restoring it.
- [x] Clear only the submitted draft on success, without erasing newer typing when a late response arrives.
- [x] Keep storage failure feedback honest and include drafts in the current reset activity boundary.
- [x] Verify the existing public chat UI across multiple scopes, including All roles, using controlled providers and no private-helper assertions.

## Comments

Implemented October 23, 2026. Added bounded per-scope question drafts to the existing version-1 browser activity envelope, preserving compatible completed exchanges. Drafts restore across role changes, navigation and reload. Typing remains available during an answer request; an edit revision prevents a late response clearing newer typing. Existing reset includes drafts, and failed browser storage reports temporary activity.

Validation: first observable draft test failed because navigation lost the All roles draft, then passed after implementation. Desktop and mobile coverage passed for all six new draft cases plus twelve existing conversation cases (16 passed in the combined run; two storage cases passed after disambiguating the Next.js route-announcer alert in their selector). TypeScript and production build passed. No live provider calls, cloud changes or deployment.
