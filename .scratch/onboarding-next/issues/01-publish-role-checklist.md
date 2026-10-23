# 01: Publish and read an administrator-defined role checklist

**Milestone:** M4

**What to build:** A private administrator creates, edits and removes tasks, saves a coherent role checklist, and an authenticated learner can read the saved result.

**Blocked by:** None (can start immediately against the completed RAG baseline).

**Status:** ready-for-agent

**Progress:** resolved

- [x] Choose among the exact five job roles; allow one checklist per role and preserve unrestricted learner reading across roles.
- [x] Support task title, fixed stage and optional instructions, with stable server-owned identities and explicit Save changes.
- [x] Persist the complete valid snapshot atomically with a saved revision; failed input or persistence leaves the previous published checklist intact.
- [x] Bound task count, text and request size; reject forged/cross-role IDs, duplicate tasks and unsupported stage/role values.
- [x] Deny anonymous and learner direct writes through the actual server/data boundary.
- [x] Provide useful empty, loading, validation, error and success states on desktop/mobile, using accessible forms.
- [x] Prepare eight fictional Frontend tasks idempotently without populating other role datasets or overwriting customized content; unsupported guide/question fields stay empty.
- [x] Prove the full admin save → persisted public read → learner rendering path with real isolated persistence and public-boundary tests.

## Implementation evidence

- Added authenticated checklist read and private administrator snapshot save, with RLS and a database trigger validating every write, stable server-generated task identities and revision conflicts.
- Added approved-style desktop/mobile editor and reader, explicit Frontend starter preparation, bounded input, empty/loading/error/retry feedback and preserved failed-save edits.
- Tests: real isolated Supabase fixture; checklist suite 10/10 desktop/mobile passes. Initial missing UI, inconsistent read/save projection and unhelpful network feedback were observed failing before their fixes. Production build and TypeScript checks pass. No cloud changes, provider requests, push or deployment.
- Starter preparation is explicit through the administrator's Prepare Frontend starter tasks action (or authenticated POST /api/admin/checklists), runs only for an absent Frontend definition, and preserves any existing customized or intentionally empty checklist.
- Integration verification: final empty-checklist assertion cleanup rechecked October 23, 2026; affected desktop/mobile cases passed 2/2 on integration commit 1aa661a.
