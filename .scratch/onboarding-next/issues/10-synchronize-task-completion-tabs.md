# 10: Keep checklist changes consistent between browser tabs

**Milestone:** M7

**What to build:** Two tabs of the same browser see matching checklist progress without losing changes to different tasks.

**Blocked by:** 04: Complete and revisit a role checklist privately

**Status:** ready-for-agent

**Progress:** resolved

- [x] Propagate completed/incomplete changes to open same-origin tabs and subsequent reloads.
- [x] Interleaved changes to different tasks preserve both results rather than replacing a stale full snapshot.
- [x] The latest action to the same task wins consistently in visible and persisted state.
- [x] Keep role isolation and separate-browser isolation despite the shared login.
- [x] Use two real pages in one browser context and a separate context to exercise the public interaction pattern.
- [x] Do not introduce server-side progress, collaborative chat editing or extra services.

## Evidence

- Red/green at the approved browser seam: the initial two-tab journey failed before independent per-task storage and subscriptions were implemented; the first desktop/mobile checks then passed.
- Final isolated-fixture verification: 16 desktop/mobile cases passed across checklist-tabs, checklist-progress and checklist-overview. Interleaved stale tabs retain different-task changes; the latest same-task action persists; overview observes completion and role changes; separate browser contexts stay private. Reload, undo, remembered roles, existing reset and blocked-storage behavior also passed.
- Task writes update one bounded, validated browser key rather than a whole stale snapshot. Explicit incomplete markers preserve undo over supported legacy activity. No learner progress is sent to the server or a provider.
- React review: subscriptions clean up on unmount, role fetches remain abortable, progress derives from current task identities, and native labelled controls retain keyboard/mobile access.
