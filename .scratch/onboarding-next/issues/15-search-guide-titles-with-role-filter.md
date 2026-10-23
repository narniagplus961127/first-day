# 15: Search published guide titles alongside role filters

**Milestone:** M8

**What to build:** Learners find published guides with a case-insensitive title query combined with the selected role.

**Blocked by:** 14: Filter the knowledge library by job role

**Status:** ready-for-agent

**Progress:** resolved

- [x] Apply literal case-insensitive title substring matching and role filtering together with AND semantics.
- [x] Trim surrounding query whitespace, bound query length, and treat percent/underscore/punctuation as literal search content.
- [x] An empty query preserves the role selection; clearing either control retains the other's intended effect.
- [x] Preserve search/filter context through reader/back navigation and refresh.
- [x] Show clear no-match guidance and keep storage failures distinct from legitimate empty results.
- [x] Do not search private candidates, call embeddings/generation, or modify chat/onboarding scopes.
- [x] Verify combined filtering, mixed-case/punctuation titles, invalid/excessive input and desktop/mobile keyboard behavior using real persistence.

## Comments

Implemented URL-backed literal title search with a 200-character bound, case-insensitive substring matching, AND role filtering, independent clear controls, and reader/back context retention. Validation is distinct from the existing retryable storage error boundary. Published document filtering and authorization remain unchanged; browsing adds no provider calls.

Verification: the interrupted implementation completed all three public browser journeys on desktop and mobile (6 passing cases), using real isolated Supabase persistence and the actual dedicated REST outage/retry path. The preserved Playwright last-run artifact reports passed with no failed tests. The prior implementation also completed build and typecheck. On resumption, reviewed the unchanged code/tests against M8 and reran typecheck and check:repo successfully; no fixture suite was repeated. Existing role/onboarding/chat state is untouched. No live deployment navigation benchmark was run for this local ticket.
