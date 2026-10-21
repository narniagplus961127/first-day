# 04: Ask a question and inspect its evidence

**What to build:** A learner asks how to run the frontend project, receives a real retrieved answer, and opens a citation to the matching document version and passage. An unsupported question gets an honest missing-information response.

**Blocked by:** 03: Index and publish a readable guide.

**Status:** ready-for-agent

- [ ] Authenticate and validate questions/search scope before embedding, retrieval, or generation. Job-role scope controls relevance, not document authorization.
- [ ] Embed live questions with the indexed Google model/configuration/dimensions and retrieve only fully indexed active versions.
- [ ] Generate using the direct AI SDK Groq integration and configurable openai/gpt-oss-20b, keeping credentials server-side and checking actual account access separately when possible.
- [ ] Supported answers preserve the fictional guide's setup command and environment-variable instructions rather than inventing generic steps.
- [ ] Treat documents as reference data rather than operating instructions; prior assistant statements do not count as source evidence.
- [ ] Resolve citations against actual retrieved identifiers/passages. Invented references never become valid links.
- [ ] Citation selection opens the matching title, source version, passage, and heading where available in desktop/mobile layouts.
- [ ] Irrelevant or insufficient evidence produces explicit missing-information feedback without misleading citations. Similarity scores alone are not proof of support.
- [ ] Show processing/streaming where supported and accurate failure/incomplete states; bound input, context, and output sizes.
- [ ] Browser/API tests verify a supported answer and citation, an absent fact, invalid citation IDs, role/all-role scope, and exclusion of partial versions using real persistence and controlled provider responses.

## Comments

Test supporting facts rather than exact AI prose. Run a small live smoke check separately when access is available. Public deployment waits for shared limits and final verification.
