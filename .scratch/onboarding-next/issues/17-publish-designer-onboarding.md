# 17: Publish the Designer onboarding journey

**Milestone:** M9

**What to build:** A learner can read a fictional Designer starter guide, follow eight role-specific tasks and ask supported questions using the established checklist/RAG journey.

**Blocked by:** 13: Finish the complete Frontend checklist demo journey

**Status:** ready-for-agent

**Progress:** resolved

- [x] Prepare one practical fictional English Lumen Designer guide within current upload limits and eight relevant tasks in the agreed 2/3/3 stage split.
- [x] Use the role's planned topics and concrete supported facts; include an intentionally absent fact for honest no-evidence verification.
- [x] Publish through normal administrator upload/index/retry/activation and bind only actual same-role guide/question references.
- [x] Repeated sample preparation avoids duplicates and does not silently overwrite administrator-customized content or unrelated documents.
- [x] Verify guide reading, task completion/overview, editable task question, supported answer/matching citation and absent-fact behavior through the browser/public API seam.
- [x] Verify switching roles preserves independent progress, history and drafts; learner/anonymous mutations remain denied.
- [x] Check relevant mobile/keyboard paths using controlled providers and real isolated persistence.
- [x] Keep actual provider checks small and separately authorized, recording current document versions; no real employee data, operational actions or paid fallback.

## Evidence — October 24, 2026

- Added docs/samples/designer.json and designer.md: one fictional English Lumen design guide within the 100 KB upload limit and eight tasks in the agreed 2 Before you start / 3 Day 1 / 3 Week 1 split. Topics cover the imagined Lumen Sandbox workspace, Lumen Foundations v1 library, Category/Name/State naming, brand and spacing tokens, welcome-flow states, accessibility observations, feedback and an unsent handoff note. No real shared file, account, personal information or operational action is required.
- The uniquely identifiable supported passage is `Use Lumen Foundations v1 and the space.4 spacing token (16 px).` The purchased paid-font license is intentionally absent. Each suggested task question has substantive coverage in the guide rather than a keyword-only reference.
- tests/knowledge/designer-journey.spec.ts calls the established roleJourney('designer') without changing shared helpers or provider behavior. Before interruption, normal sample preparation published an incomplete two-task manifest and the public checklist assertion failed with expected eight tasks / received two. The completed eight-task manifest passes the final real-persistence desktop and mobile journeys: 2 passed in 49.2 seconds.
- Both journeys use normal administrator Markdown upload, exact-candidate indexing/publication and revision-checked checklist save. Every task binds the actual same-role guide. Unchanged preparation returns the same document/version/checklist/task identities without another content change. Ticket 13's inherited preparation safety tests cover customized guide/checklist preservation, concurrent sample identities, interrupted indexing/retry and denied learner writes; existing upload/checklist tests also deny anonymous writes. This ticket changes content only and preserves those shared contracts.
- Verified guide reading, editable task question with explicit submission, keep/replace protection for an existing draft, a grounded answer and contextual follow-up citing the exact published document/version, and supporting-passage reading. All eight tasks complete and the overview reflects completion. Role-specific histories/drafts survive switching, and an independent browser starts at zero completion.
- Desktop and mobile verify keyboard Space completion, Enter reset cancellation/confirmation, Frontend reset default and cleared role history/draft, with no horizontal overflow. The missing-font question returns no_evidence after one embedding request and no Groq generation request. Controlled providers verify source provenance and observable application behavior; live-model semantic quality is separate release evidence.
- TypeScript, repository CRLF/ticket validation and patch whitespace checks pass. No application UI, schema or shared helper changes are introduced. The combined build and final design/release verification remain ticket 20 work.

## Release prerequisites

Only the isolated local fixture received this guide/checklist. No cloud data changes, actual provider requests, Git push or hosted deployment were performed. Ticket 20 retains the bounded live-provider smoke and current published-version release evidence; no employee data or paid fallback is introduced.
