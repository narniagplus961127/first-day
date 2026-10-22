# 04: Ask a question and inspect its evidence

**What to build:** A learner asks how to run the frontend project, receives a real retrieved answer, and opens a citation to the matching document version and passage. An unsupported question gets an honest missing-information response.

**Blocked by:** 03: Index and publish a readable guide.

**Status:** resolved

- [x] Authenticate and validate questions/search scope before embedding, retrieval, or generation. Job-role scope controls relevance, not document authorization.
- [x] Embed live questions with the indexed Google model/configuration/dimensions and retrieve only fully indexed active versions.
- [x] Generate using the direct AI SDK Groq integration and configurable openai/gpt-oss-20b, keeping credentials server-side and checking actual account access separately when possible.
- [x] Supported answers preserve the fictional guide's setup command and environment-variable instructions rather than inventing generic steps.
- [x] Treat documents as reference data rather than operating instructions; prior assistant statements do not count as source evidence.
- [x] Resolve citations against actual retrieved identifiers/passages. Invented references never become valid links.
- [x] Citation selection opens the matching title, source version, passage, and heading where available in desktop/mobile layouts.
- [x] Irrelevant or insufficient evidence produces explicit missing-information feedback without misleading citations. Similarity scores alone are not proof of support.
- [x] Show processing/streaming where supported and accurate failure/incomplete states; bound input, context, and output sizes.
- [x] Browser/API tests verify a supported answer and citation, an absent fact, invalid citation IDs, role/all-role scope, and exclusion of partial versions using real persistence and controlled provider responses.

## Comments

Test supporting facts rather than exact AI prose. Run a small live smoke check separately when access is available. Public deployment waits for shared limits and final verification.

## Implementation evidence

See [answer contract](../../../docs/answers.md) for public interfaces, retrieval/model bounds, exact source identity, provider behavior and cloud migration. Ten new desktop/mobile answer tests pass against real local Supabase with only external model HTTP controlled. Typecheck and production build pass. Full regressions passed: 24 real-Supabase knowledge tests and 14 authentication tests across desktop/mobile. A separate real Google/Groq production-build smoke verified upload/index, exact setup and environment instructions, source opening, and an honest absent-fact response.
