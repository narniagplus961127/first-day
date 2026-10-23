# 02: Reorder tasks and move them between onboarding stages

**Milestone:** M4

**What to build:** Administrators organize a saved checklist with accessible reorder and stage-move controls, and learners see the same published sequence.

**Blocked by:** 01: Publish and read an administrator-defined role checklist

**Status:** ready-for-agent

**Progress:** in-progress

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
- Added a fixture-only starter test setup guarded to HTTP 127.0.0.1:55421, removing only the Frontend checklist before checking initial sample preparation. Assertions remain on public browser/API results; shared fixture residue no longer determines the initial state.
- Resume verification: TypeScript, CRLF and diff checks pass. The two affected desktop/mobile starter cases are pending because Docker Desktop crashes before the local fixture starts (stale sailor-ingest runtime socket). Automatic approval review rejected stopping the entire Desktop service because it could disrupt unrelated projects. No runtime files, cloud data, push or deployment changed.
