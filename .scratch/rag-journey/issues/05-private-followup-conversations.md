# 05: Continue and reset a private demo conversation

**What to build:** A learner asks contextual follow-ups, revisits this browser's role-specific chat, and confirms a reset. Other visitors using the same public credentials cannot see or overwrite the conversation.

**Blocked by:** 04: Ask a question and inspect its evidence.

**Status:** ready-for-agent

- [ ] Store chat locally per browser and selected job role. Shared authentication does not create shared centrally stored chats.
- [ ] Submit at most the last three completed question-and-answer exchanges within the selected role; validate and bound submitted history server-side.
- [ ] A follow-up such as "What about those environment variables?" uses the preceding setup conversation to retrieve the correct passage and produce a cited answer.
- [ ] History helps interpret questions but does not replace source evidence; failed/incomplete output is not a completed answer.
- [ ] Switching among the five roles isolates chat context, labels active scope, and handles absent later-role knowledge honestly.
- [ ] Explain local persistence and that relevant recent messages still go to the server/providers.
- [ ] Confirm Reset demo before clearing this browser's chats across roles, preserving shared documents and other visitors' state. Retain compatibility with later local checklist progress.
- [ ] Browser/API tests cover contextual retrieval, history-window bounds, reload persistence, role isolation, two visitors sharing credentials, and cancel/confirm reset on desktop/mobile.

## Comments

Do not add central history synchronization or full checklist functionality. This ticket is independent of replacement and shared-limit work after ticket 04.
