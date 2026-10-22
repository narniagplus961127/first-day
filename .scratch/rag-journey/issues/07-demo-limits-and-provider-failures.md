# 07: Enforce demo limits and handle provider failures

**What to build:** Visitors receive clear feedback when the shared allowance or a provider quota is exhausted. Limits work across browsers/server instances, and failed requests recover without misleading answers or paid fallback.

**Blocked by:** 04: Ask a question and inspect its evidence.

**Status:** resolved

- [x] Enforce 5 questions per minute per IP and 100 per day across the demo using durable shared atomic counters rather than instance-local memory.
- [x] Use trusted hosting request metadata for IP identity rather than client-declared identity; new sessions cannot bypass the global allowance.
- [x] Record a consistent daily reset boundary and counting policy, including failures, and explain retry timing. Question counts must not be described as guaranteed token-quota protection.
- [x] Bound questions, recent history, retrieved context, and outputs; administrator ingestion is authenticated and workload-bounded too.
- [x] Distinguish application limits, Google embedding quota/network errors, and Groq generation quota/network errors. Respect provider retry guidance where available.
- [x] Retry only within bounded policy and never automatically use paid inference or unbounded retry loops.
- [x] Mark interrupted streams incomplete/failed and retryable, not completed supported answers. Failed indexing retains safe publication and useful retry state.
- [x] Browser/API tests use controlled clocks/request identity to verify per-IP/global limits, atomic concurrent updates, reset boundaries, independent provider errors, and retries without live load testing.
- [x] Confirm public learner credentials cannot trigger ingestion or use management endpoints to bypass workload controls.

## Comments

Complete before exposing the public demo. This ticket can proceed independently of tickets 05 and 06; apply controls at shared public boundaries.

## Implementation evidence

See [demo admission and failure contract](../../../docs/demo-limits.md) for durable atomic rolling-minute/global-day limits, trusted Vercel identity, private counters, counted-failure policy, UTC reset, provider retry metadata, and bounded work. Seven new desktop/mobile public browser/API tests cover cross-session and spoofed-identity attempts, concurrent rolling admission and exact reset boundaries, concurrent global 100/day plus new-session/UTC reset, independent Google/Groq quota/network recovery, resumable indexing quota, and direct learner counter/RPC denials. Invalid history is rejected before admission. All 62 combined knowledge journeys passed after merging Ticket06, alongside 14 authentication journeys, typecheck, and production build. The external Google fixture now uses full-dimensional normalized deterministic vectors to avoid unrelated-marker collisions in persistent test data.

Cloud migration 20261022143627_chat_admission is applied to FirstDay only, with local SQL filename and isolated-fixture migration ledger aligned. Verification confirmed counter RLS and absent learner table grants, invoker RPC with pinned search_path, no anonymous/learner execute, and server-role execute. Two advisor INFO notices reflect deliberately private no-policy counter tables; the existing leaked-password protection warning remains unchanged. No live provider load testing, paid fallback, Git push, or deployment was performed for this ticket.
