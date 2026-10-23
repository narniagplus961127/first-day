# 19: Publish the HR onboarding journey

**Milestone:** M9

**What to build:** A learner can read a fictional HR starter guide, follow eight role-specific tasks and ask supported questions using the established checklist/RAG journey.

**Blocked by:** 13: Finish the complete Frontend checklist demo journey

**Status:** ready-for-agent

**Progress:** resolved

- [x] Prepare one practical fictional English Lumen HR guide within current upload limits and eight relevant tasks in the agreed 2/3/3 stage split.
- [x] Use the role's planned topics and concrete supported facts; include an intentionally absent fact for honest no-evidence verification.
- [x] Publish through normal administrator upload/index/retry/activation and bind only actual same-role guide/question references.
- [x] Repeated sample preparation avoids duplicates and does not silently overwrite administrator-customized content or unrelated documents.
- [x] Verify guide reading, task completion/overview, editable task question, supported answer/matching citation and absent-fact behavior through the browser/public API seam.
- [x] Verify switching roles preserves independent progress, history and drafts; learner/anonymous mutations remain denied.
- [x] Check relevant mobile/keyboard paths using controlled providers and real isolated persistence.
- [x] Keep actual provider checks small and separately authorized, recording current document versions; no real employee data, operational actions or paid fallback.
## Evidence — October 24, 2026

- Added docs/samples/hr.json and hr.md: one fictional English Lumen HR guide below 100 KB and eight tasks split 2 Before you start / 3 Day 1 / 3 Week 1. The guide supports orientation, People Sandbox / Resources, WELCOME-01, synthetic participant privacy checks, FAQ routing, an unsent welcome-message exercise and the three-field onboarding summary. No real employee data, contact details, statutory entitlement amounts or actual messages are included.
- The supported fact states the four WELCOME-01 fields and exact resource directory. The paid-leave amount is deliberately absent; the guide explicitly does not establish employment entitlements or provide legal advice.
- tests/knowledge/hr-journey.spec.ts calls the existing shared roleJourney('hr') without changing the shared journey, provider fixtures, sample preparer or application. The initial two-task manifest was published through normal upload/index/checklist preparation; the public GET checklist assertion then failed with expected eight tasks, received two. Adding the six remaining tasks completed the agreed 2/3/3 journey.
- The completed mobile journey passed. The initial desktop run failed locating Published guide after opening a task guide; its snapshot showed only an alert. Console evidence showed HMR rebuilding, including a 2999 ms compilation, without a console error. Compilation is a possible explanation, not a confirmed cause: the subsequent retry replaced the earlier HTTP trace before that response could be inspected. A targeted desktop rerun passed with no failed tests. Ticket 20 must retain combined desktop/mobile navigation validation; this transient initial failure is not hidden or represented as a proven fix.
- Both successful viewport journeys verify real isolated Supabase persistence through authorized normal upload, exact-candidate indexing/publication and revision-checked checklist saves. An unchanged rerun returns the same document/version/revision/task IDs. All task bindings point to the actual same-role published guide. Ticket 13's inherited preparation safety suite covers concurrent sample identity, interrupted indexing/retry, customized guide/checklist preservation and denied learner mutations; existing authorization tests cover anonymous mutation denial. This content-only ticket preserves those contracts.
- Verified published guide reading, draft keep/replace, explicit editable question submission, answer and contextual follow-up with matching document/version citations, supporting passage reading, eight task completions and completed overview. Role histories/drafts remain independent; a separate browser starts with zero completion. Keyboard Space completion and Enter reset cancellation/confirmation pass; mobile has no horizontal overflow.
- The absent paid-leave question returns no_evidence after one controlled embedding call and no Groq generation call. Controlled providers verify application contracts/source provenance, not live-model semantic quality.
- TypeScript, repository CRLF/ticket validation and patch whitespace checks passed. No shared UI, helper or schema change was required. The full combined build, final review and deployment belong to ticket 20.

## Release prerequisites

Only the dedicated local fixture received this guide/checklist. No actual provider call, cloud data change, Git push or hosted deployment was performed. Ticket 20 owns bounded live-provider smoke evidence tied to current published versions. No real personnel records or paid fallback were introduced.
