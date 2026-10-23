# 01: Publish and read an administrator-defined role checklist

**Milestone:** M4

**What to build:** A private administrator creates, edits and removes tasks, saves a coherent role checklist, and an authenticated learner can read the saved result.

**Blocked by:** None (can start immediately against the completed RAG baseline).

**Status:** ready-for-agent

**Progress:** not-started

- [ ] Choose among the exact five job roles; allow one checklist per role and preserve unrestricted learner reading across roles.
- [ ] Support task title, fixed stage and optional instructions, with stable server-owned identities and explicit Save changes.
- [ ] Persist the complete valid snapshot atomically with a saved revision; failed input or persistence leaves the previous published checklist intact.
- [ ] Bound task count, text and request size; reject forged/cross-role IDs, duplicate tasks and unsupported stage/role values.
- [ ] Deny anonymous and learner direct writes through the actual server/data boundary.
- [ ] Provide useful empty, loading, validation, error and success states on desktop/mobile, using accessible forms.
- [ ] Prepare eight fictional Frontend tasks idempotently without populating other role datasets or overwriting customized content; unsupported guide/question fields stay empty.
- [ ] Prove the full admin save → persisted public read → learner rendering path with real isolated persistence and public-boundary tests.
