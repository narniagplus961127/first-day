# 05: Continue and reset a private demo conversation

**What to build:** A learner asks contextual follow-ups, revisits this browser's role-specific chat, and confirms a reset. Other visitors using the same public credentials cannot see or overwrite the conversation.

**Blocked by:** 04: Ask a question and inspect its evidence.

**Status:** resolved

- [x] Store chat locally per browser and selected job role. Shared authentication does not create shared centrally stored chats.
- [x] Submit at most the last three completed question-and-answer exchanges within the selected role; validate and bound submitted history server-side.
- [x] A follow-up such as "What about those environment variables?" uses the preceding setup conversation to retrieve the correct passage and produce a cited answer.
- [x] History helps interpret questions but does not replace source evidence; failed/incomplete output is not a completed answer.
- [x] Switching among the five roles isolates chat context, labels active scope, and handles absent later-role knowledge honestly.
- [x] Explain local persistence and that relevant recent messages still go to the server/providers.
- [x] Confirm Reset demo before clearing this browser's chats across roles, preserving shared documents and other visitors' state. Retain compatibility with later local checklist progress.
- [x] Browser/API tests cover contextual retrieval, history-window bounds, reload persistence, role isolation, two visitors sharing credentials, and cancel/confirm reset on desktop/mobile.

## Comments

Do not add central history synchronization or full checklist functionality. This ticket is independent of replacement and shared-limit work after ticket 04.

## Implementation evidence

See [conversation contract](../../../docs/conversations.md) for request validation, contextual retrieval, local storage and confirmed reset. TDD established missing reload persistence, missing follow-up history, and the absent Reset demo control before their implementations. Twelve new desktop/mobile browser/API tests cover reload, contextual source retrieval, scope isolation, two visitors with shared credentials, cancellation/confirmation of local reset, last-three bounds, invalid history, incomplete answers, malformed stored claims and rebuilt source links. Full regressions passed: 36 real-Supabase knowledge tests and 14 authentication tests. Typecheck, production build, CRLF and diff checks passed. No central chat store, schema changes or live-provider load test were introduced; the final hosted ticket verifies the live contextual follow-up.
