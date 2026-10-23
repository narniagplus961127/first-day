# 18: Publish the Business Analyst onboarding journey

**Milestone:** M9

**What to build:** A learner can read a fictional Business Analyst starter guide, follow eight role-specific tasks and ask supported questions using the established checklist/RAG journey.

**Blocked by:** 13: Finish the complete Frontend checklist demo journey

**Status:** ready-for-agent

**Progress:** resolved

- [x] Prepare one practical fictional English Lumen Business Analyst guide within current upload limits and eight relevant tasks in the agreed 2/3/3 stage split.
- [x] Use the role's planned topics and concrete supported facts; include an intentionally absent fact for honest no-evidence verification.
- [x] Publish through normal administrator upload/index/retry/activation and bind only actual same-role guide/question references.
- [x] Repeated sample preparation avoids duplicates and does not silently overwrite administrator-customized content or unrelated documents.
- [x] Verify guide reading, task completion/overview, editable task question, supported answer/matching citation and absent-fact behavior through the browser/public API seam.
- [x] Verify switching roles preserves independent progress, history and drafts; learner/anonymous mutations remain denied.
- [x] Check relevant mobile/keyboard paths using controlled providers and real isolated persistence.
- [x] Keep actual provider checks small and separately authorized, recording current document versions; no real employee data, operational actions or paid fallback.

## Evidence — October 24, 2026

- Added docs/samples/business-analyst.json and business-analyst.md: a fictional English Lumen guide within the 100 KB limit and eight substantive tasks split 2 Before you start / 3 Day 1 / 3 Week 1. The guide covers LUM-101, glossary terms, discovery observations/assumptions/questions, the requirement and story templates, observable acceptance criteria, a learner flow, traceability and refinement notes. Instructions produce unsent fictional practice artifacts without real interviews, operational changes or personal data.
- The supported fact is the exact passage: Requirement fields: Problem / User / Outcome / Scope / Open questions. Acceptance criteria use Given / When / Then. The approved delivery budget for LUM-101 is deliberately absent.
- tests/knowledge/business-analyst-journey.spec.ts reuses roleJourney('business-analyst') without shared helper, provider or application changes. An initial invocation used an unavailable project name and was corrected to the existing desktop project before running tests. The incomplete two-task manifest then produced the genuine public checklist RED: expected eight tasks, received two. Adding the six remaining guide-supported tasks made desktop and mobile pass (2 passed, 47.4 seconds).
- Normal administrator upload, exact-candidate indexing/publication and revision-checked checklist preparation used real isolated Supabase persistence. Every task binds the actual same-role guide; unchanged preparation preserves document/version/task identities and revision. Ticket 13's inherited preparation coverage verifies customized guide/checklist preservation, concurrent identity, resumable indexing/retry and learner denial; established upload/checklist authorization also covers anonymous denial. This ticket adds content only and preserves those contracts.
- Both viewports verify published guide reading, protected draft keep/replace, editable explicit task question submission, a supported answer and contextual follow-up, citation identity for the exact published document/version and supporting passage reading. Completing all eight tasks updates the overview. Separate role histories/drafts, independent browser completion and reset cancellation/confirmation remain correct; keyboard Space/Enter and no horizontal overflow pass.
- The missing-budget question returns no_evidence after one embedding request and zero Groq generation calls. Controlled providers establish observable application contracts and source provenance, not live-model semantic quality.
- TypeScript, repository CRLF/ticket validation and patch whitespace checks passed. Full combined build and design/release verification remain ticket 20 work.

## Release prerequisites

Only the isolated fixture received this guide/checklist. No cloud data changes, real provider requests, Git push or hosted deployment were performed. Separately bounded live-provider verification and current-version release evidence remain ticket 20 work; no paid fallback was added.
