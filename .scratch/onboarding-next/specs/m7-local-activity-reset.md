# M7 — Integrated local activity and reset

Status: ready-for-agent

## Problem Statement

Browser-local checklist progress, completed chats and question drafts can diverge between tabs. A late response or stale tab can restore activity after reset, while storage failures can falsely imply that progress was saved.

## Solution

Make local activity consistent across the learner experience, synchronize checklist changes between same-browser tabs, and make Reset demo reliably clear all role activity without touching shared data or authentication.

## User Stories

1. As a learner, I want to see task changes reflected in another tab, so that I can continue in either tab.
2. As a learner, I want to retain changes to different tasks made in different tabs, so that I can avoid losing unrelated completion.
3. As a learner, I want to have the latest action to the same task win, so that I can see a predictable final state.
4. As a learner, I want to confirm Reset demo before clearing activity, so that I can avoid accidental loss.
5. As a learner, I want to cancel reset without changing activity, so that I can keep my work.
6. As a learner, I want to clear completion across every role, so that I can start the demo again.
7. As a learner, I want to clear completed chats and unfinished questions together, so that I can start without stale context.
8. As a learner, I want to have open tabs reflect reset, so that I can avoid seeing conflicting activity.
9. As a learner, I want to prevent a stale tab or late answer from restoring cleared activity, so that I can trust the reset.
10. As a learner, I want to remain signed in after reset, so that I can continue exploring immediately.
11. As a learner, I want to keep shared knowledge and checklist definitions unchanged, so that I can avoid affecting other visitors.
12. As a demo owner, I want to retain shared usage counters after browser reset, so that I can prevent limit bypass.
13. As a learner, I want to use temporary completion if storage is blocked, so that I can still try the checklist.
14. As a learner, I want to see when activity is not saved, so that I can understand reload behavior.
15. As a learner, I want to recover safely from corrupted local data, so that I can keep using the demo.
16. As a returning learner, I want to retain valid existing completed history during the upgrade, so that I can avoid losing supported local data.
17. As a learner, I want to keep another browser's activity separate, so that I can maintain visitor isolation.
18. As a keyboard or mobile user, I want to operate reset and its feedback accessibly, so that I can control demo activity on my device.

## Implementation Decisions

- Keep shared knowledge/checklist definitions central and learner activity browser-local. Existing shared authentication never becomes a shared learner-progress identity.

- Expose coherent local activity operations for individual task changes, onboarding role selection, per-scope drafts, completed conversations and reset. Prefer additive integration at real caller boundaries; avoid a horizontal rewrite that breaks existing chat.

- Synchronize task changes across same-origin tabs. Different-task changes must not overwrite each other through a stale whole-state snapshot; the latest action to the same task wins. Use actual browser-state behavior, not only a private merge helper, to prove it.

- Fence reset with a local generation or equivalent boundary. A callback, stale write, stored handoff or pending answer from before reset cannot repopulate cleared activity. Re-reading legacy history after reset must not resurrect it either.

- Reset confirmation clears all role completion, all chat scopes' completed exchanges, every question draft, pending task-question handoffs and the remembered onboarding role. Return onboarding/chat to Frontend Developer. Cancellation changes nothing.

- Propagate reset to open tabs, clear their visible old activity and cancel/ignore pre-reset UI work. A new intentional action after reset remains possible; do not lock the browser into perpetual reset.

- Preserve authentication cookies, shared content, other visitors' browser state and server-side question allowances. Browser reset does not refund admitted provider requests or undo a server request already processing.

- Keep existing valid saved conversation records readable during the upgrade. Bound retained data and validate stored shapes/identifiers; reject malformed content without rendering unsafe values.

- When storage read/write/clear is blocked, keep only honest in-tab activity with an explicit persistence warning. Do not claim successful browser-wide clearing when it cannot be confirmed. Do not fall back to cloud learner storage.

- Reset controls are available from the learner checklist/overview journey as well as chat, with the same meaning and accessible confirmation behavior.

- Do not introduce collaborative chat editing or message synchronization as a separate product. The scope is reliable checklist synchronization, per-scope draft persistence and cross-tab reset consistency.

- Use the existing dedicated local fixture exclusively during relevant tests. Do not reset production counters or shared knowledge for browser verification.

## Testing Decisions

- Reuse the existing highest practical seam: authenticated browser journeys and public reads backed by the real local Supabase fixture, with controlled external providers.

- Open two pages in one browser context; deliberately interleave changes to different tasks and to the same task, and assert both visible and reload behavior.

- Open separate browser contexts using the same public credentials and prove progress/reset isolation.

- Pause an answer response, invoke Reset demo from another tab, then release the response and trigger a stale save/reload. Assert that no pre-reset completion, chat, draft or handoff returns.

- Exercise confirmation cancellation, all-role clearing, role defaults, authenticated navigation and unchanged shared definitions/usage allowances.

- Use browser-platform storage failure/corruption injection at the public UI boundary. Verify accurate notices and temporary behavior rather than private storage-key or reducer assertions.

- Check desktop/mobile keyboard focus and dialog behavior. Reuse the current conversation/reset/provider-failure prior art rather than adding a second fake persistence stack.

## Out of Scope

- Server-side learner progress, cross-device synchronization, cross-browser sharing and collaborative chat editing.
- New infrastructure, usage-limit resets, keepalive automation, CI/hook wiring and deferred retrospective checker repairs.

## Further Notes

Tickets 10–13. Ticket 13 is the Frontend checklist release gate; earlier increments do not count as complete until this combined journey passes. User authorization on October 23, 2026 accepts the recommendations, test seam and publication of local specifications/tickets without further approval. This does not start implementation or authorize GitHub publication or a release.
