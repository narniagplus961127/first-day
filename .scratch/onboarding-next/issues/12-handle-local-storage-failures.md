# 12: Keep local activity honest when browser storage fails

**Milestone:** M7

**What to build:** Learners can still try the demo in a tab when browser storage is blocked or corrupted, with clear persistence limits and no false reset claims.

**Blocked by:** 11: Reset all demo activity without stale resurrection

**Status:** ready-for-agent

**Progress:** not-started

- [ ] Detect read/write/clear failures and invalid persisted state without rendering untrusted activity.
- [ ] Allow temporary in-tab completion and draft/history activity with an explicit lost-on-reload warning.
- [ ] Do not claim persistence, cross-tab synchronization or browser-wide clearing when storage cannot provide it.
- [ ] Keep available current-tab reset meaningful and explain a partial/unconfirmed browser-storage clear accurately.
- [ ] Preserve valid legacy conversation data where safe; do not move learner activity into central storage as a fallback.
- [ ] Use browser-platform failure/corruption injection and assert visible behavior through checklist, overview, chat and reset.
- [ ] Check desktop/mobile keyboard feedback and recovery after storage is usable again.
