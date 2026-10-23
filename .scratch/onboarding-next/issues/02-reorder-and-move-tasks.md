# 02: Reorder tasks and move them between onboarding stages

**Milestone:** M4

**What to build:** Administrators organize a saved checklist with accessible reorder and stage-move controls, and learners see the same published sequence.

**Blocked by:** 01: Publish and read an administrator-defined role checklist

**Status:** ready-for-agent

**Progress:** resolved

- [x] Move tasks within a stage and between Before you start, Day 1 and Week 1, retaining task identities.
- [x] Support keyboard and mobile operation without requiring drag-and-drop.
- [x] Save normalized ordering together with the complete checklist; do not expose partially reordered state.
- [x] Preserve the previous published sequence if save fails and retain recoverable editing state.
- [x] Show the resulting learner sequence after reload and omit misleading empty stage containers.
- [x] Verify the end-to-end edit/save/read sequence and direct-write authorization through existing public seams.

## Implementation evidence

- Added keyboard/mobile Move up and Move down controls with stage boundaries and destination-stage append behavior, retaining stable task identities and explicit atomic snapshot publication.
- Public browser/API ordering journey passed desktop/mobile 2/2, including failed-save draft recovery, unchanged published snapshot, reload, learner sequence, omitted empty stage and denied learner write. Initial RED observed the missing reorder button.
- Existing checklist regression: 8/10 passed; two starter-preparation cases exposed shared fixture residue from another suite (an existing customized three-task Frontend definition is correctly preserved rather than overwritten with eight starters). Integration follow-up required for test isolation.
- TypeScript, production build and CRLF checks pass. No cloud change, push or deployment.
