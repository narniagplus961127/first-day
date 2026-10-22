# 06: Replace a guide without interrupting answers

**What to build:** An administrator revises a guide while learners continue receiving answers from its active version. Complete replacement indexing switches versions atomically; failures preserve working knowledge and earlier citations retain their original evidence.

**Blocked by:** 04: Ask a question and inspect its evidence.

**Status:** resolved

- [x] An explicit administrator replacement action targets an existing document and reuses upload validation, indexing progress, and retry behavior.
- [x] Candidate versions remain separate during pending, partial, and failed indexing.
- [x] Learner reading and new answers continue using the prior active version during replacement without mixed-version retrieval.
- [x] Successful complete indexing atomically activates the replacement and excludes the previous version from new retrieval.
- [x] Failure/interruption preserves the active version; safe retry does not duplicate chunks or republish stale work.
- [x] Concurrent attempts cannot let an older attempt overwrite a newer successful publication; document and test conflict behavior.
- [x] Earlier citations open their original source version rather than changed text. Define bounded historical retention and explicit unavailable-source feedback where needed.
- [x] Direct learner attempts to replace, retry, or activate content remain denied.
- [x] Browser/API tests demonstrate reading/answers before, during, and after updates, failure/retry, concurrent/stale attempts, and citation inspection after activation.

## Comments

Use visibly different fictional setup instructions to verify publication externally. Historical retention must not expose partial candidates to ordinary browsing.

## Implementation evidence

See [replacement contract](../../../docs/replacement.md) for latest-candidate conflict behavior, transactional publication, protected live-worker leases, three-version published history, and bounded unpublished drafts. Six new desktop/mobile browser/API journeys cover old versus new answers/readers, administrator replacement, concurrent/stale attempts, historical citation retention/expiration, three paused provider workers with fourth-candidate rejection, failed replacement retry/idempotence, and direct learner RPC denials. Full regressions passed: 48 knowledge tests, 14 auth journeys (one unchanged cold-navigation rerun), typecheck/build/CRLF/diff checks. Cloud migrations 20261022144226 and 20261022144243 are applied with local migration history aligned.
