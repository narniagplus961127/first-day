# FirstDay: First complete onboarding RAG journey

Status: ready-for-agent

## Problem Statement

A new joiner needs trustworthy instructions from team onboarding notes. A generic chatbot cannot establish what those notes say or show the supporting passage. An administrator needs to publish and revise knowledge without exposing incomplete indexing or interrupting existing answers.

The first milestone must prove a real upload-to-answer journey rather than only demonstrate a chat interface with fixed responses.

## Solution

An administrator signs in, uploads a fictional English Markdown Frontend Developer setup guide, and sees indexing complete. A visitor uses the public learner demo account, asks how to run the project, receives a grounded answer, opens its supporting passage, and asks a contextual follow-up. Missing evidence and exhausted free-provider quotas produce clear feedback.

Use the approved desktop/mobile design for the relevant screens. Manage shared knowledge centrally and keep each visitor's chat history browser-local. Preserve the current active version until replacement indexing succeeds. Keep the full five-role onboarding product as follow-on scope beyond the initial dataset and journey.

## User Stories

1. As a visitor, I want a FirstDay login page, so that I understand where to begin.
2. As a visitor, I want demo credentials in a popup, so that I can try the application without registering.
3. As a visitor, I want to copy credentials or fill the login form, so that entering the sample workspace is straightforward.
4. As a learner, I want working demo authentication, so that I can use the learner workspace.
5. As an administrator, I want private administrator authentication, so that only maintainers can change shared knowledge.
6. As a learner, I want management operations denied even through direct requests, so that shared documents remain intact.
7. As a user, I want clear invalid-login and expired-session feedback, so that I can regain access.
8. As a learner, I want a Frontend Developer starting point, so that the first demo addresses concrete onboarding questions.
9. As an administrator, I want to upload one English Markdown document, so that I can publish knowledge through the application.
10. As an administrator, I want files over 100 KB and unsupported formats rejected clearly, so that I can correct the upload.
11. As an administrator, I want a document title and job role, so that learners can identify the guide.
12. As an administrator, I want indexing progress and readiness, so that I know when a guide can support answers.
13. As an administrator, I want useful indexing failure feedback, so that I know whether to retry or correct the content.
14. As an administrator, I want safe retry without duplicate active chunks, so that failed work recovers cleanly.
15. As a learner, I want to browse and read an active guide, so that I can inspect the instructions directly.
16. As a learner, I want answers to use fully indexed active versions, so that unfinished uploads do not affect guidance.
17. As a learner, I want to ask how to run the frontend project, so that I can complete my initial setup.
18. As a learner, I want answers grounded in retrieved passages, so that instructions reflect team knowledge.
19. As a learner, I want citations attached to supported claims, so that I can verify the answer.
20. As a learner, I want citations to open the matching document version and passage, so that I can inspect the actual evidence.
21. As a learner, I want visible answering progress and streaming where available, so that I know a request is progressing.
22. As a learner, I want an explicit missing-information response, so that unsupported questions do not receive invented answers.
23. As a learner, I want to ask a follow-up about environment variables, so that I can continue naturally from a setup answer.
24. As a learner, I want follow-ups limited to recent exchanges in the selected job role, so that unrelated conversations do not interfere.
25. As a visitor, I want browser-local chat history, so that others using the same credentials cannot see my activity.
26. As a visitor, I want an explanation of local demo activity, so that I understand its persistence.
27. As a visitor, I want a confirmed Reset demo action, so that I can clear my browser's activity without changing shared knowledge.
28. As an administrator, I want explicit document replacement, so that revising a guide is distinct from adding another guide.
29. As a learner, I want the current version available during replacement indexing, so that updates do not interrupt answers.
30. As an administrator, I want failed replacement to preserve the active version, so that a failed update does not remove working knowledge.
31. As a learner, I want new questions to use a successful replacement, so that instructions reflect the published revision.
32. As a learner, I want application-limit and provider-quota feedback, so that I know when to retry.
33. As the demo owner, I want shared server-side request limits, so that new browser sessions cannot bypass the overall allowance.
34. As the demo owner, I want quota exhaustion handled without paid fallback, so that the demo respects the agreed cost model.
35. As a mobile visitor, I want usable login, chat, reading, and source inspection, so that the core journey works on a narrow screen.
36. As an administrator, I want usable mobile upload and document status, so that I can maintain the demo on a mobile browser.
37. As a maintainer, I want a small live-provider smoke check, so that real model access is verified separately from deterministic tests.
38. As the project owner, I want local Markdown progress tracking, so that implementation follows the configured workflow.

## Implementation Decisions

### Scope and design

- Build one Frontend Developer knowledge journey first. Preserve compatibility with exactly five job roles: Frontend Developer, Backend Developer, Designer, Business Analyst, and HR. There is no department model.
- All demo knowledge is readable by all learners. Selected-role filtering and the explicit All roles option control relevance, not authorization. Only the Frontend Developer dataset is required initially.
- Use the approved native FigCraft design: light surfaces, light orange accents, desktop sidebar, adapted mobile navigation, and source inspection. Implement the relevant screens rather than every prototype frame in this milestone.
- Learner and administrator are authorization identities; job role does not grant management privileges. Public credentials grant learner access only. No public registration.
- Separate self-completed checklists per job role, without manager approval, remain agreed follow-on scope.

### Architecture and data

- Plan TypeScript with Next.js UI/server endpoints, AI SDK model integrations, and Supabase authentication, PostgreSQL, and vector search. Vercel/Supabase free tiers are intended for the prototype, subject to eligibility and quotas.
- Organize behavior around authentication/authorization, knowledge ingestion/publication, retrieval/answering, and browser-local demo state. Separate deployed services are not required.
- Store knowledge documents, document versions, chunks, embedding configuration, indexing state, and shared request counters centrally. Preserve original text and heading/passage locations for source inspection.
- Choose chunk size, overlap, retrieval count, similarity calibration, embedding dimensions, and batching against the acceptance fixture. These are tunable implementation defaults, not previously user-prescribed requirements.
- Select bounded request processing or resumable batches after verifying hosting/provider limits. Indexing must retry safely and must not depend on detached serverless work continuing indefinitely. Additional queue infrastructure is not a prerequisite unless evidence requires it.

### Providers

- Generate answers through the direct Groq integration, initially using configurable openai/gpt-oss-20b.
- Use a separate Google AI Studio key and gemini-embedding-2 for document and question embeddings. Verify actual account access, quotas, model availability, and SDK compatibility before relying on either provider; no keys have been supplied or tested.
- Use consistent embedding model, dimensions, and configuration for documents and questions. Track configuration identity to prevent silently mixing incompatible vectors after a change.
- Store provider and privileged database keys server-side. Public demo credentials are intentionally visible; administrator credentials and secrets are not.
- Google and Groq quotas are independent of application request limits. Handle retry guidance where available and never switch automatically to paid inference.
- Use fictional company content only. Acceptance of the discussed Google free-tier data-use condition does not authorize uploading actual employee information.

### Ingestion and publication

- Validate one UTF-8 English Markdown file per upload, maximum 100 KB, at the server. Reject empty/unusable content and unsupported formats with actionable errors.
- Preserve headings and code blocks sufficiently for setup instructions to remain meaningful after chunking. Retain original text for the reader.
- Authorize every upload, replacement, indexing, retry, and activation operation at the server/data boundary. Learners read active content but cannot mutate it.
- Expose pending/processing, ready, and failed outcomes, progress where available, and safe retry. Partial indexing is never learner-searchable.
- Replacement explicitly targets a knowledge document; filename similarity alone must not silently overwrite another guide. Index a candidate version while the active version remains available.
- Activate a fully indexed replacement atomically. Failure preserves the previous version. Retry must not duplicate active chunks; concurrent attempts must not let stale work overwrite a newer successful publication.
- Preserve version-specific inspection for already-issued citations rather than silently redirecting an old citation to changed text. Bound historical retention during implementation without exposing partial versions in ordinary browsing.

### Retrieval, follow-ups, and citations

- Authenticate learner requests, validate input/scope, enforce limits, embed the contextual question, retrieve relevant active-version chunks, and generate an answer from bounded evidence.
- Use at most the last three question-and-answer exchanges within the selected job role for follow-ups. History stays browser-local; relevant recent messages are submitted per request. Prior assistant messages are context, not source evidence.
- Retrieval must account for context-dependent follow-ups such as "What about those environment variables?" The implementation can normalize a query or combine bounded context; an extra model call is not mandated.
- Treat knowledge documents as reference data, not operating instructions. Answer from evidence and explicitly report missing information. Similarity scores alone do not establish support.
- Resolve citations against retrieved identifiers on the server. Invented references must not become valid links. Show the matching document version, supporting passage, title, and heading where available.
- Show processing, incomplete, and error states accurately. A failed stream must not appear as a completed grounded answer or contaminate later source evidence.

### Demo state and limits

- Shared authentication must not cause shared chats. Store demo chat locally per browser and job role. Later checklist progress follows the same isolation rule.
- Explain that local history does not mean requests avoid the server/providers. Reset asks for confirmation and clears only that browser's demo activity.
- Enforce 5 chat questions per minute per IP and 100 per day across the entire demo using shared atomic counters, not function-instance memory. Derive request identity from trusted hosting metadata, not arbitrary client-declared IP fields.
- Record a consistent daily reset boundary and response contract during implementation; the user has not selected a rate-limit timezone. Give useful retry timing. Bound input/history/context/output sizes because question counts alone do not bound token use.
- Keep management workloads authenticated, authorized, and bounded so public credentials cannot trigger ingestion or unrestricted provider use.

## Testing Decisions

- The user confirmed the primary test seam: observable browser and public API journeys, provider failures simulated there, and a small separate live-provider smoke check.
- Exercise an authenticated application journey with real test persistence and controlled provider responses as the highest practical seam. Assert visible outcomes and public authorization/data behavior, not private helpers, exact prompts, internal component structure, or exact AI wording.
- There is no existing application or suite, so no prior test seams can be reused. Add focused lower-level tests only for meaningful invariants difficult to establish at the public boundary.
- Use a fictional Markdown fixture with an exact setup command, an environment-variable instruction, and a known heading. Deliberately omit an unsupported fact. Assert preserved instructions and citations resolving to real passages.
- Verify popup, credential fill, login, admin upload, indexing readiness, browsing, supported question, citation opening, contextual follow-up, and unsupported-question feedback.
- Verify invalid/expired sessions, oversized/unsupported/empty uploads, and direct learner attempts to upload, index, replace, or activate knowledge. UI hiding alone is not an authorization check.
- Simulate embedding failure, interrupted/partial indexing, retry, delays, generation failure, and provider quota errors. Failed candidates stay outside retrieval and errors produce actionable feedback.
- Verify replacement success/failure while reading the active version, safe retry without duplicate chunks, stale/concurrent activation protection, and source inspection for an earlier citation.
- Verify two browser contexts using shared demo credentials do not share chats, job-role context remains isolated, and reset affects only the current browser.
- Verify limits through public requests with a controlled clock/request identity: per-IP limits, the shared daily limit, concurrent updates, reset timing, and provider retry feedback. Do not spend live quota load-testing limits.
- Check desktop/mobile journeys and keyboard-accessible forms, popup controls, navigation, and source details.
- Keep live checks separate and small: verify model access, compatible document/question embeddings, one actual cited response, and the hosted journey when deployment is authorized. Deterministic tests alone do not establish provider availability or live grounding.
- Completion requires a real upload-to-answer path, supported citations, honest no-evidence handling, safe publication/retry, denied learner mutations, and enforced limits. Fixed mock chat alone is insufficient.

## Out of Scope

- Full checklists, checklist administration, progress dashboards, and datasets for the other four job roles. These remain agreed follow-on features.
- Departments, role-restricted knowledge, manager approvals, public registration, enterprise access management, and multiple organizations.
- PDF/image/OCR ingestion, crawling, automatic Obsidian synchronization, and repository ingestion.
- Autonomous actions such as requesting access, provisioning employee accounts, sending messages, or creating external tickets.
- Self-hosted embedding servers, graph retrieval, fine-tuning, multi-agent orchestration, or extra infrastructure without a demonstrated need.
- Central learner-chat storage, cross-device history, unlimited inference, guaranteed free-provider availability, or paid fallback.
- Redesigning the approved native artifact or exporting preview images.
- Application implementation, account provisioning, deployment, or publishing GitHub changes as a side effect of writing this specification.

## Further Notes

- This specification consolidates the confirmed journey and explicitly accepted provider/follow-up choices. It supersedes older notes calling those choices pending.
- Repository: https://github.com/narniagplus961127/first-day . The last inspection found an empty remote and a local folder without Git metadata; recheck before connecting or publishing.
- Local Markdown remains the configured issue tracker. The earlier seven-ticket proposal has not been approved or published as implementation tickets.
- Provider research references are retained in the implementation plan. Reverify official documentation and actual account limits during implementation; no credentials or live verification exist yet.
- ready-for-agent means the specification is ready for ticketing or implementation planning. It does not mean infrastructure is provisioned or authorize starting application development in this synthesis turn.
