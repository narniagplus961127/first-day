# 02: Upload and inspect a knowledge document

**What to build:** An administrator uploads an English Markdown guide, assigns its title and job role, and inspects the saved original content and status. Learners cannot read or retrieve this unindexed document.

**Blocked by:** 01: Demo login and protected administrator access.

**Status:** ready-for-agent

**Progress:** resolved

- [x] Support one UTF-8 English Markdown file per upload, maximum 100 KB, with title and one of the five job roles. Use fictional Frontend Developer content initially.
- [x] Validate size, format, metadata, and empty/unusable content at the server and show actionable errors.
- [x] Persist document identity, a candidate version, original text, job role, and initial indexing state. Filename similarity does not silently replace another document.
- [x] The administrator can reopen the candidate and inspect its title, headings, code blocks, and role in a safe Markdown reader that does not execute embedded content.
- [x] Show that the document is not ready for learner retrieval; an unindexed draft is not an active version.
- [x] Learners cannot upload, alter, or inspect candidates through UI, endpoints, or direct data access.
- [x] Responsive upload/inspection provides recoverable request-failure feedback.
- [x] Browser/API tests verify persisted inspection, accepted input, invalid/oversized/unsupported/empty uploads, and direct authorization checks against real test persistence.

## Comments

This slice needs no embedding calls. Publication and learner reading wait for indexing in ticket 03.

### Implementation and verification (October 22, 2026)

- Implemented authenticated administrator upload, candidate persistence, responsive document list/inspection, safe Markdown rendering, and clear retryable upload feedback. Drafts remain administrator-only through application authorization and database RLS.
- TDD: first real-Supabase upload/reader test failed against the missing route, then passed after implementation. A network-abort recovery test exposed unhelpful fetch feedback; actionable retry feedback made that journey pass.
- `npm run test:knowledge`: 10 desktop/mobile browser/API tests passed against isolated real Supabase Auth, PostgREST, and PostgreSQL, including direct REST/RPC learner-denial checks, invalid uploads, same-filename distinct identities, HTML nonexecution, persistence, and network retry.
- `npm run test:e2e`: 14 authentication regression tests passed. The test-only Auth fixture moved to port 19029 because Windows reserved its former 54329 port after Docker restart; production settings are unchanged.
- `npm run typecheck` and `npm run build` passed. Source text normalized to CRLF.
- Live production-build smoke against the dedicated FirstDay cloud project passed administrator upload (201), persisted reader/reload, code preservation, pending status, and learner denial (403). It left fictional unindexed smoke guides in the dedicated project.
- Migration identity matches the applied cloud migration: knowledge_documents, version 20261022033938. Parent applied it and verified RLS on both tables. Parent reported no schema security-advisor notices; an existing Auth leaked-password-protection warning is separate configuration work.
- Indexing and learner publication are intentionally absent until ticket 03. No data is mocked in the persistence suite, no secrets are committed, and no unrelated project/container was changed.