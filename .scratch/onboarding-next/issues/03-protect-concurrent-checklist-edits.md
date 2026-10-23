# 03: Protect newer checklist saves from stale administrators

**Milestone:** M4

**What to build:** Two administrators or tabs can edit safely: the first valid save succeeds, and an outdated save receives a clear conflict instead of silently replacing it.

**Blocked by:** 01: Publish and read an administrator-defined role checklist

**Status:** ready-for-agent

**Progress:** not-started

- [ ] Require the expected saved revision, including concurrent first creation of a role checklist.
- [ ] Reject stale snapshots transactionally without changing the newer checklist.
- [ ] Show conflict/reload guidance and preserve the losing editor's recoverable work rather than claiming success.
- [ ] Handle validation and ordinary save failures distinctly from revision conflicts.
- [ ] Use two authenticated browser contexts and direct API attempts to prove only the accepted version is published.
- [ ] Keep learner visibility restricted to complete saved snapshots throughout the conflict.
