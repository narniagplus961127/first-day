# Safe guide replacement

Ticket 06 adds `POST /api/admin/documents/{id}/replace`. It accepts the same single UTF-8 Markdown file and 100 KB limit as initial upload, while retaining the document title and job role. The administrator guide page exposes an explicit Replace guide action. Both replacement and indexing require verified administrator identity and same-origin requests; direct learner RPCs also fail through security-invoker functions and existing RLS.

## Publication and conflicts

Replacement creates an unpublished candidate without changing the active pointer. Learner reading and vector retrieval continue selecting only the fully indexed active version. Indexing requests pin the candidate version in the URL. Every version has a database-generated revision; candidate creation, worker claims, and publication lock the document before inspecting revision order. Once a newer candidate exists, older claims and publications return 409, even if the newer candidate has not yet published. Reload the administrator page to work on the newest candidate.

Provider failure marks only the candidate failed, preserves completed vectors, and releases its lease. Retry resumes that candidate; repeated requests after successful publication return the ready state. A paused worker cannot publish stale content after a newer candidate is created. Active-pointer switching, readiness, and historical pruning occur in one transaction.

## Bounded retention

Each document retains three published versions, including its active version. Earlier citations retain their exact version and passage identifiers while that version remains retained. Publishing a fourth version expires the oldest source; its citation reader shows Source unavailable and directs the learner to ask a new question. Missing/mismatched/private sources use the same feedback. Storage query errors use a retryable error boundary rather than falsely reporting expiration.

A document also retains at most three unpublished candidates. Replacement prunes older drafts without live indexing leases. Up to three workers with live leases are protected from pruning; a fourth simultaneous candidate is rejected with 409 until an attempt releases or its 60-second lease expires. This bounds stored drafts without deleting a source currently being processed. Drafts never appear in learner browsing.

## Verification

The public API/browser suite exercises old answers during pending/failed replacement, switching after publication, retained and expired citations, administrator replacement UI, concurrent candidate order, stale version rejection, bounded drafts with three paused external-provider workers, safe failure/retry, idempotent readiness, and learner app/RPC denials. It uses actual local Supabase Auth/PostgREST/Postgres; only Google/Groq HTTP is controlled. Desktop and mobile run the same observable journeys.

Full post-merge verification passed: 48 real-Supabase knowledge tests on desktop/mobile, type checking, production build, CRLF and diff checks. All 14 authentication journeys passed across the regression batch and one unchanged targeted rerun: the first desktop login exceeded its existing five-second URL assertion during cold compilation; the rerun passed without product or test changes.

Cloud migrations `20261022144226_knowledge_replacement` and `20261022144243_knowledge_candidate_retention` were applied once to the dedicated FirstDay project. Local filenames and fixture migration ledger match those assigned versions. Cloud queries verified the identity revision, security-invoker functions, pinned search paths, no anonymous function execution, and enabled knowledge-table RLS. Advisors added no replacement-related findings; inherited Auth leaked-password protection, intentionally policy-free server-only admission tables from ticket 07, and unused-index information remain. The final hosted ticket verifies the live complete journey.
