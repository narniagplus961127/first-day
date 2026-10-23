# 16: Publish the Backend Developer onboarding journey

**Milestone:** M9

**What to build:** A learner can read a fictional Backend Developer starter guide, follow eight role-specific tasks and ask supported questions using the established checklist/RAG journey.

**Blocked by:** 13: Finish the complete Frontend checklist demo journey

**Status:** ready-for-agent

**Progress:** resolved

- [x] Prepare one practical fictional English Lumen Backend Developer guide within current upload limits and eight relevant tasks in the agreed 2/3/3 stage split.
- [x] Use the role's planned topics and concrete supported facts; include an intentionally absent fact for honest no-evidence verification.
- [x] Publish through normal administrator upload/index/retry/activation and bind only actual same-role guide/question references.
- [x] Repeated sample preparation avoids duplicates and does not silently overwrite administrator-customized content or unrelated documents.
- [x] Verify guide reading, task completion/overview, editable task question, supported answer/matching citation and absent-fact behavior through the browser/public API seam.
- [x] Verify switching roles preserves independent progress, history and drafts; learner/anonymous mutations remain denied.
- [x] Check relevant mobile/keyboard paths using controlled providers and real isolated persistence.
- [x] Keep actual provider checks small and separately authorized, recording current document versions; no real employee data, operational actions or paid fallback.

## Evidence — October 23, 2026

- Added docs/samples/backend.json and backend.md: one fictional English Lumen guide (well below 100 KB) and eight tasks split 2 Before you start / 3 Day 1 / 3 Week 1. Every task question has substantive guide coverage: prerequisites, environment copy and local port, exact startup command, health response, route/service/test layout, API test assertions, redacted debugging and a response-field practice change. The guide describes an imaginary repository and prohibits real operational actions or actual secrets.
- The supported evidence is the exact command `npm run api:dev -- --port 4102`. The cloud hosting region is deliberately absent. This short supported passage is independent of the missing fact, allowing the controlled retrieval test to distinguish them.
- tests/knowledge/backend-journey.spec.ts calls the existing shared roleJourney('backend') without changing its helpers or provider behavior. The missing manifest first failed loading; that is setup evidence only. A separate incomplete two-task publication through normal preparation failed the public GET checklist acceptance assertion (expected eight tasks, received two). Restoring the full eight-task manifest made both final desktop/mobile journeys pass (2 passed, 43.4 seconds).
- The final journeys use normal administrator upload, exact-candidate indexing/publication and revision-checked checklist saves with real isolated Supabase persistence. An unchanged preparation rerun returns the same document/version/revision/task identities without changes. Every saved task binds the actual same-role guide. The inherited preparation safety suite from ticket 13 covers customized guide/checklist preservation, concurrent sample identity, interrupted indexing/retry and denied learner mutations; earlier upload/checklist authorization coverage also denies anonymous mutations; this ticket adds content only and leaves those public contracts unchanged.
- Verified actual guide reading, protected draft keep/replace, editable explicit question submission, supported answer and contextual follow-up with the exact published document/version citation, source passage reading, all eight completed tasks and completed overview. Independent role histories/drafts and a separate browser's zero completion remain intact. Keyboard Space completion and Enter reset cancellation/confirmation pass on desktop and mobile with no horizontal overflow.
- The absent-region question returns no_evidence after one embedding call and zero Groq generation calls. Controlled providers demonstrate application contracts and exact source provenance; they do not certify live-model semantic quality.
- TypeScript, repository CRLF/ticket validation and patch whitespace checks passed. No application UI/shared helper/schema changes were needed. Full combined build and final design/release checks belong to ticket 20.

## Release prerequisites

Only the isolated local fixture received this guide/checklist. No cloud data changes, actual provider requests, Git push or hosted deployment were performed. The existing bounded live-provider smoke and current-version release evidence remain ticket 20 work; no real employee information or paid fallback is introduced.
