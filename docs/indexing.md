# Knowledge indexing contract

Ticket 03 implements initial publication. Replacement and concurrent-version workflows belong to ticket 06; answer retrieval belongs to ticket 04.

## Embeddings

Use the direct Google provider, `@ai-sdk/google` 4.0.102 with `ai` 7.0.148. The server reads `GOOGLE_GENERATIVE_AI_API_KEY`. Model: `gemini-embedding-2`, requested dimensions: 768. This model rejects `taskType`, so document input is `title: {document title} | text: {passage}`. Reduced embeddings are normalized by this model; the app does not truncate, pad, or silently switch providers. Validate finite 768-element responses before persistence.

Persisted configuration: `google:gemini-embedding-2:768:document-prefix-v1:chunks-v1`. Ticket 04 must use compatible 768-dimensional question embeddings and the researched query prefix `task: question answering | query: {question}`. Filter retrieval by the active, ready version and exact configuration. A changed indexing configuration clears unfinished incompatible chunks under the version lock; existing published data must be explicitly reindexed through a future version rather than silently mixed.

## Chunking and source identity

Original uploaded Markdown remains unchanged in `knowledge_versions.content`. Split into passages at Markdown headings, or at blank lines after approximately 2200 characters outside fenced code. Keep fenced code together and ignore heading syntax inside fences. Oversized indivisible passages above 12000 characters receive an actionable content error rather than sending an oversized provider request. These are tunable character limits, not claimed token counts.

Each passage stores a stable UUID, version UUID, zero-based ordinal, nearest heading, and inclusive one-based source start/end lines. `(version_id, ordinal)` is unique. CRLF and LF source files use the same native line coordinates. These persisted locations and original content form the source identity for future citations; no reconstructed generated answer text is treated as source content.

## Bounded execution and publication

`POST /api/admin/documents/{id}/index` authenticates an administrator and checks request origin. One request embeds at most four unfinished passages, with a 25-second provider timeout and zero hidden SDK retries. A transactional claim takes a 60-second version lease. Progress is persisted before the next request; the browser requests another batch while processing and can safely resume after reload. A crashed request becomes claimable after the lease expires. Provider quota errors explain waiting before retry; valid completed vectors remain reusable. No detached work or paid fallback runs.

Publication is a database transaction: lock the claimed version, verify every expected passage has a vector with the expected configuration, set ready/publication timestamp, then set the document's first active pointer. Partial and failed candidates have no learner read policy. Published version policies use their own publication metadata to avoid recursive document/version RLS. The learner reader explicitly selects the active version; the administrator preview intentionally selects the latest candidate. Historical published versions remain identifiable for later citation inspection.

## Verification

`npm run test:knowledge` uses actual local Supabase Auth, PostgREST, Postgres and migrations. Only the external Google HTTP endpoint is controlled, via the normal provider `baseURL` option and an explicit server environment variable (`GOOGLE_EMBEDDING_BASE_URL`, normally unset). There is no production fake-indexing mode. Tests enforce 768-dimensional requests, document prefixes and omission of taskType, and exercise publication, persisted partial progress, quota failure, private candidates, retry, stable version identity and learner/admin boundaries on desktop and mobile.

A separate real-provider smoke on 2026-10-22 created fictional cloud guide `08efd694-3fd7-46a1-9eb2-168e27810999`; two passages were embedded and published with Google. Cloud SQL confirmed two actual 768d vectors and an active ready version. Real cloud learner reading returned 200 and indexing returned 403. No credentials are recorded here.

Cloud migrations: `20261022040150_knowledge_indexing` and `20261022040529_knowledge_read_policies`. CLI-generated filenames were renamed to the versions assigned by the cloud migration API. Security advisors report only the existing leaked-password-protection setting; performance advisors report only unused-index information on this small dataset. Keep foreign-key indexes despite their initial unused status.
