# 06: Replace a guide without interrupting answers

**What to build:** An administrator revises a guide while learners continue receiving answers from its active version. Complete replacement indexing switches versions atomically; failures preserve working knowledge and earlier citations retain their original evidence.

**Blocked by:** 04: Ask a question and inspect its evidence.

**Status:** ready-for-agent

- [ ] An explicit administrator replacement action targets an existing document and reuses upload validation, indexing progress, and retry behavior.
- [ ] Candidate versions remain separate during pending, partial, and failed indexing.
- [ ] Learner reading and new answers continue using the prior active version during replacement without mixed-version retrieval.
- [ ] Successful complete indexing atomically activates the replacement and excludes the previous version from new retrieval.
- [ ] Failure/interruption preserves the active version; safe retry does not duplicate chunks or republish stale work.
- [ ] Concurrent attempts cannot let an older attempt overwrite a newer successful publication; document and test conflict behavior.
- [ ] Earlier citations open their original source version rather than changed text. Define bounded historical retention and explicit unavailable-source feedback where needed.
- [ ] Direct learner attempts to replace, retry, or activate content remain denied.
- [ ] Browser/API tests demonstrate reading/answers before, during, and after updates, failure/retry, concurrent/stale attempts, and citation inspection after activation.

## Comments

Use visibly different fictional setup instructions to verify publication externally. Historical retention must not expose partial candidates to ordinary browsing.
