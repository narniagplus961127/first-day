# 12: Keep local activity honest when browser storage fails

**Milestone:** M7

**What to build:** Learners can still try the demo in a tab when browser storage is blocked or corrupted, with clear persistence limits and no false reset claims.

**Blocked by:** 11: Reset all demo activity without stale resurrection

**Status:** ready-for-agent

**Progress:** resolved

- [x] Detect read/write/clear failures and invalid persisted state without rendering untrusted activity.
- [x] Allow temporary in-tab completion and draft/history activity with an explicit lost-on-reload warning.
- [x] Do not claim persistence, cross-tab synchronization or browser-wide clearing when storage cannot provide it.
- [x] Keep available current-tab reset meaningful and explain a partial/unconfirmed browser-storage clear accurately.
- [x] Preserve valid legacy conversation data where safe; do not move learner activity into central storage as a fallback.
- [x] Use browser-platform failure/corruption injection and assert visible behavior through checklist, overview, chat and reset.
- [x] Check desktop/mobile keyboard feedback and recovery after storage is usable again.

## Implementation evidence

- Added a tab-local browser activity cache at the existing generation boundary, preserving temporary completion, role selection, scoped drafts and completed answers across client navigation. Full reload can lose unavailable storage state; the UI says so explicitly and does not claim cross-tab synchronization.
- Browser getter/getItem/setItem/enumeration failures retain safe temporary activity; malformed state is quarantined without rendering it. A malformed sibling checklist record cannot repeatedly erase fresh temporary progress.
- Reset keeps the durable generation fence and per-task storage operations. Unconfirmed cleanup remains visibly qualified; authentication, shared definitions and provider allowances are unchanged. Deliberate successful writes can recover persistence without automatically exporting fallback state.
- TDD: the public malformed-checklist regression first failed because checking a fresh task immediately unchecked it; after ignoring quarantined absent records it passes. The initial blocked-write journey also failed before implementation.
- Validation: 38 focused desktop/mobile storage/reset/draft/task-sync journeys passed; 4 targeted completed-history and valid legacy citation preservation journeys passed; final 18 storage-failure/recovery journeys passed after the corruption fix. TypeScript, repository CRLF checks and diff whitespace checks passed. React review retained effect cleanup, bounded data, accessible status feedback and existing native reset-dialog focus.
