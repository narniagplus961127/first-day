# 07: Enforce demo limits and handle provider failures

**What to build:** Visitors receive clear feedback when the shared allowance or a provider quota is exhausted. Limits work across browsers/server instances, and failed requests recover without misleading answers or paid fallback.

**Blocked by:** 04: Ask a question and inspect its evidence.

**Status:** ready-for-agent

- [ ] Enforce 5 questions per minute per IP and 100 per day across the demo using durable shared atomic counters rather than instance-local memory.
- [ ] Use trusted hosting request metadata for IP identity rather than client-declared identity; new sessions cannot bypass the global allowance.
- [ ] Record a consistent daily reset boundary and counting policy, including failures, and explain retry timing. Question counts must not be described as guaranteed token-quota protection.
- [ ] Bound questions, recent history, retrieved context, and outputs; administrator ingestion is authenticated and workload-bounded too.
- [ ] Distinguish application limits, Google embedding quota/network errors, and Groq generation quota/network errors. Respect provider retry guidance where available.
- [ ] Retry only within bounded policy and never automatically use paid inference or unbounded retry loops.
- [ ] Mark interrupted streams incomplete/failed and retryable, not completed supported answers. Failed indexing retains safe publication and useful retry state.
- [ ] Browser/API tests use controlled clocks/request identity to verify per-IP/global limits, atomic concurrent updates, reset boundaries, independent provider errors, and retries without live load testing.
- [ ] Confirm public learner credentials cannot trigger ingestion or use management endpoints to bypass workload controls.

## Comments

Complete before exposing the public demo. This ticket can proceed independently of tickets 05 and 06; apply controls at shared public boundaries.
