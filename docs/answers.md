# Grounded answer contract

Ticket 04 adds answering and source inspection. Ticket 05 extends it with browser-local conversations and bounded follow-up context; replacement and shared request limits remain owned by tickets 06 and 07.

## Public interface

Authenticated POST /api/chat accepts JSON containing question and scope. Scope is one of the five job roles or the literal All roles. Default UI scope is Frontend Developer. Scope controls relevance; learners may read published guides from every role. Same-origin validation and verified Supabase getUser authentication run before any model request. Questions must contain non-whitespace text and have at most 1000 characters. The streamed request body is capped at 32768 bytes. Optional history contains at most three completed same-scope exchanges, with questions up to 1000 and prior answers up to 2000 characters. See [conversation contract](conversations.md) for validation and browser-local persistence.

Success is an AnswerResult from src/lib/answers/types.ts: status answered or no_evidence, a plain-text answer, and claims. Each answered claim has text and server-resolved citations. Missing evidence returns the explicit missing-information answer with no claims/citations. Errors use the existing JSON error contract and HTTP 400/401/403/413/503 as applicable. Cache-Control is no-store. Atomic admission and provider retry metadata are documented in docs/demo-limits.md.

## Retrieval and model bounds

Direct Google gemini-embedding-2 embeds task: question answering | query: {question} into a validated finite 768-element vector, using the exact persisted configuration from docs/indexing.md. No taskType is sent. The security-invoker search_knowledge RPC joins the document active pointer to a ready, published version and checks both version/chunk configuration. Role filtering occurs inside SQL before similarity ordering and limit. It is callable by authenticated users but not anonymous callers, preserves RLS, and pins search_path.

Exact cosine search returns at most six passages with similarity at least 0.35. This is a tunable retrieval shortlist threshold, not a confidence score or proof of support. Generation receives at most 18000 source characters. The live fictional setup fixture verified this initial calibration; broader datasets may need tuning.

Use direct @ai-sdk/groq 4.0.67 with ai 7.0.148, initially openai/gpt-oss-20b (server GROQ_MODEL override supported). No Gateway or paid fallback is configured. Installed Groq defaults enable strict structured JSON. Groq strict structured output cannot stream, so the UI shows processing and reveals a completed answer only after validation. Google timeout is 25 seconds; Groq is 30 seconds; hidden SDK retries are disabled. The route declares a 90-second hosting duration. Output is capped at 1800 tokens, six claims, 1500 characters per claim, and one to three references per claim.

Source passages are untrusted reference data in the prompt. Instructions inside them do not receive tools or execution privileges. The model must decline absent facts and attach exact IDs plus verbatim supporting quotations. The server rejects unknown IDs, quotations absent from their source passage, empty/oversized claims, missing references, and any non-stop completion. Validated schema and quoted source identity do not independently prove semantic entailment; evidence sufficiency still involves model judgment. The separate real-provider check therefore tests both supported instructions and an intentionally missing fact.

## Source inspection

Every citation href is server-built as /sources/{version UUID}/{passage UUID}. The authenticated reader verifies that the passage belongs to that published, ready version and displays title, heading, original passage, native source lines, and version ID. A full original-version view is available below the passage. This deliberately does not redirect through the current active pointer, allowing ticket 06 to retain historical evidence. Unpublished candidates and nonexistent/mismatched IDs return 404. Retention policy belongs to ticket 06.

The answer UI uses escaped text, and source Markdown uses the existing raw-HTML/image restrictions. Navigation highlights the current page instead of permanently marking Overview active.

## Verification

The public browser/API journey suite uses real local Supabase Auth/PostgREST/Postgres and controlled external Google/Groq HTTP responses. No internal answering function is mocked. Tests cover exact setup instructions and source reading, absent facts despite retrieved text, role/All roles filtering, private candidates, fabricated citation IDs/quotes, incomplete generation, and authentication/origin/input validation on desktop/mobile.

Cloud migration 20261022042120_knowledge_retrieval is applied to the dedicated FirstDay project. Cloud checks confirmed security invoker, pinned search_path and no anonymous execute grant. Advisors reported no new security/performance warnings; the existing leaked-password notice and unused-index information remain.

A separate production-build check on October 22, 2026 uploaded a fictional Citrus Frontend guide, indexed it using real Google, embedded a real question, and received a real Groq cited answer preserving npm run dev -- --port 3101 and .env.local setup. Its matching source opened successfully. A second question about absent vacation allowance returned no_evidence. This was two live answer requests, not a provider load test.

Run the production app on a loopback port with configured environment, then run node --env-file=.env.local scripts/smoke-answer.mjs with FIRSTDAY_BASE_URL pointing at that app (default http://127.0.0.1:3204). This script creates a fictional cloud guide and uses two answer calls; it requires private administrator and public learner identities. It logs only verification booleans, never credentials. Deterministic suites remain npm run test:knowledge and npm run test:e2e.

Source retention is now implemented by [safe replacement](replacement.md): three published versions per document, exact historical links while retained, and explicit unavailable-source feedback after expiration. Source storage failures show retry guidance separately.
