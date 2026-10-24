# 03: Protect newer checklist saves from stale administrators

**Milestone:** M4

**What to build:** Two administrators or tabs can edit safely: the first valid save succeeds, and an outdated save receives a clear conflict instead of silently replacing it.

**Blocked by:** 01: Publish and read an administrator-defined role checklist

**Status:** ready-for-agent

**Progress:** resolved

- [x] Require the expected saved revision, including concurrent first creation of a role checklist.
- [x] Reject stale snapshots transactionally without changing the newer checklist.
- [x] Show conflict/reload guidance and preserve the losing editor's recoverable work rather than claiming success.
- [x] Handle validation and ordinary save failures distinctly from revision conflicts.
- [x] Use two authenticated browser contexts and direct API attempts to prove only the accepted version is published.
- [x] Keep learner visibility restricted to complete saved snapshots throughout the conflict.

## Implementation and verification evidence

- Implemented in eec582e587207546b91eec8812a8abaf5f9bdc31 and integrated by 9d5f25e. The final tracker reconciliation corrected an overlooked Progress field; this is documentation only.
- The save RPC requires an expected revision and serializes same-role writes with a transaction advisory lock, including first creation. A stale revision returns PT409 before a complete snapshot is inserted or replaced.
- The administrator editor preserves losing edits, explains the conflict, blocks repeat saves until an intentional reload, confirms discarding edits, and retains the draft if reloading fails. Validation and ordinary network failures retain edits without presenting conflict reload.
- tests/knowledge/checklist-conflicts.spec.ts exercises independent authenticated administrators, concurrent first saves, missing revisions, unchanged accepted learner snapshots, explicit reload/cancel and distinct validation/network failures through public browser/API boundaries. These desktop/mobile cases passed in the integrated verification recorded in ticket 20; final independent Standards/Spec reviews have zero remaining findings.
