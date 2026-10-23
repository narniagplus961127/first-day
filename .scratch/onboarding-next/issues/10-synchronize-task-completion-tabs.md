# 10: Keep checklist changes consistent between browser tabs

**Milestone:** M7

**What to build:** Two tabs of the same browser see matching checklist progress without losing changes to different tasks.

**Blocked by:** 04: Complete and revisit a role checklist privately

**Status:** ready-for-agent

**Progress:** not-started

- [ ] Propagate completed/incomplete changes to open same-origin tabs and subsequent reloads.
- [ ] Interleaved changes to different tasks preserve both results rather than replacing a stale full snapshot.
- [ ] The latest action to the same task wins consistently in visible and persisted state.
- [ ] Keep role isolation and separate-browser isolation despite the shared login.
- [ ] Use two real pages in one browser context and a separate context to exercise the public interaction pattern.
- [ ] Do not introduce server-side progress, collaborative chat editing or extra services.
