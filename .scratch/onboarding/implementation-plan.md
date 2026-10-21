# FirstDay implementation plan

Status: synthesized

The first-journey specification is published in the local tracker as ready-for-agent. Use that specification for current scope and acceptance criteria; this file retains the planning and provider-research context.

## Confirmed context

- Project directory: C:\Projects\On Board RAG.
- Repository supplied by user: https://github.com/narniagplus961127/first-day.
- The local directory is not currently a Git checkout. The GitHub connector verified the public remote is empty with default branch metadata main; there is no existing stack or code to preserve.
- Use local Markdown issue tracking; adding a GitHub repository does not change that decision.
- Native FigCraft design approved by user.
- Scope of this session: plan one complete RAG journey using grilling and domain-modeling. No application implementation, deployment, or GitHub mutations yet.
- Preserve the five-role demo, shared learner credentials, separate administrator, Markdown knowledge management, citations, browser-local demo activity, and self-completed checklists described in spec.md.

## Confirmed first journey

An administrator signs in, uploads a fictional Frontend Developer setup guide, and sees indexing succeed. A visitor uses the demo credentials, selects Frontend Developer, asks how to run the project, receives a grounded answer, opens its citation, and sees the supporting source passage. An unsupported question receives an explicit missing-information response.

- Other role content and checklists follow in later milestones; the full five-role product scope is retained.
- Initial uploads are English Markdown with fictional company information. PDF, image parsing, and automatic Obsidian sync are deferred.
- User selected Groq free API for answer generation. A paid provider is not authorized by the general acceptance of the prior round; plan around Groq's free quota and no automatic paid fallback.
- Confirmed Google AI Studio as the second provider, using gemini-embedding-2 for document and question embeddings, subject to account access and quota verification.
- Confirmed initial answer model: configurable Groq openai/gpt-oss-20b via the direct AI SDK provider, subject to actual account access verification.
- Confirmed follow-up support using the last three question-and-answer exchanges within the selected role. History remains browser-local; relevant recent messages are sent with each request.
- Accept one English Markdown file per upload, up to 100 KB, with visible indexing progress and a retry action.
- Replacing a knowledge document creates a candidate version. The current version stays searchable until all replacement chunks are indexed and the replacement is activated atomically; failure preserves the current version.
- Enforce 5 questions per minute per IP and 100 questions per day across the demo on the server. Provider limits remain independent. Quota exhaustion returns clear retry feedback; no paid fallback.

## Decision tree

- First milestone boundary: proposed journey and included deployment/other features.
- Model access: budget preference -> provider and model -> embedding dimensions and quota handling.
- Source scope: language/format constraints -> parser and chunking -> upload and indexing limits.
- Indexing lifecycle: failure/retry and document updates -> database design and job strategy.
- Retrieval: role scope and conversation handling -> grounding and citation acceptance.
- Acceptance: representative questions, failure cases, authorization checks, and deploy verification.

## Current round

- Confirmed upload limits, safe document replacement, and demo request limits.
- User accepted all three provider/conversation decisions on October 21, 2026.
- User invoked to-spec for synthesis without another interview. The specification consolidates ingestion, retrieval/citations, authorization, and acceptance constraints, leaving routine tunable defaults to evidence-based implementation choices.
- User confirmed observable browser/API tests, simulated provider failures, and a separate small live-provider smoke check.

## Provider research and accepted choices

- Groq's published model catalog and API reference do not document an embedding model or embeddings endpoint. Use Groq for generation and a separate embedding provider.
- Accepted generation model: Groq openai/gpt-oss-20b via the direct AI SDK Groq provider; confirm actual account access before implementation.
- Groq quotas apply to requests and tokens at organization level. Application question limits do not guarantee staying below provider quotas. Handle HTTP 429 and retry-after without a paid fallback.
- Google's pricing page lists gemini-embedding-2 text input as free of charge within the Free Tier. User accepted a separate Google API key for document and question embeddings; actual project availability and quotas need verification before implementation.
- Google Free Tier content may be used to improve its products; use the already-agreed fictional demo content only.
- Sources: https://console.groq.com/docs/models ; https://console.groq.com/docs/api-reference ; https://console.groq.com/docs/rate-limits ; https://ai-sdk.dev/providers/ai-sdk-providers/groq ; https://ai.google.dev/gemini-api/docs/pricing ; https://ai.google.dev/gemini-api/docs/models/gemini-embedding-2 .

## Implementation tickets

The user approved eight tickets. Individual ready-for-agent tickets are published under .scratch/rag-journey/issues/ and indexed by .scratch/rag-journey/map.md. Ticket 01 is the dependency frontier; implementation has not started. The canonical specification is unchanged by ticket publication.
