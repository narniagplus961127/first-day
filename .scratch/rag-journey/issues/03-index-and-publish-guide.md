# 03: Index and publish a readable guide

**What to build:** An administrator indexes an uploaded guide and sees progress or a retryable failure. After complete indexing, the first active version becomes available for learners to browse and read.

**Blocked by:** 02: Upload and inspect a knowledge document.

**Status:** ready-for-agent

- [ ] Introduce Google gemini-embedding-2 with server-side configuration. Verify actual account/model access using a small separate live check when credentials are available.
- [ ] Chunk Markdown while preserving meaningful headings, code instructions, version identity, and supporting passage locations; retain original text for reading.
- [ ] Persist compatible vectors in Supabase and record embedding model/configuration/dimension identity for subsequent question embeddings.
- [ ] Use bounded processing or resumable batches based on verified hosting/provider limits; persist progress and retry state rather than relying on unbounded detached serverless work.
- [ ] Show pending/processing, ready, and failed outcomes, progress where available, and meaningful retry feedback without paid fallback.
- [ ] Failed or partial indexing remains unavailable to learners. Successful initial publication exposes one complete active version.
- [ ] Interrupted/failed retries neither duplicate active chunks nor activate partial work. Only administrators can index or retry.
- [ ] Learners browse and open the published guide with title, job role, and original text on desktop/mobile.
- [ ] Browser/API tests with real test persistence and controlled provider responses cover publication, embedding failure, partial/interrupted work, safe retry, and authorization.
- [ ] Record tunable chunking/batch/embedding choices and prevent silent mixing of incompatible embedding configurations.

## Comments

This slice publishes a first version. Replacement/concurrent-version behavior belongs to ticket 06. Distinguish provider quota failure from invalid content.
