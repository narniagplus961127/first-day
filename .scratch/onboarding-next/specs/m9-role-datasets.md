# M9 — Remaining role knowledge and checklists

Status: ready-for-agent

## Problem Statement

The product supports five role names but only the Frontend Developer demo journey has substantive content. Visitors choosing the other roles cannot yet experience relevant guides, tasks and grounded help.

## Solution

Deliver four small role-content releases, each with one practical fictional English Markdown starter guide and eight tasks, using the already completed checklist and RAG features.

## User Stories

1. As a Backend Developer learner, I want to read a role-specific setup guide, so that I can understand the fictional backend workflow.
2. As a Backend Developer learner, I want to follow eight relevant tasks, so that I can practice backend onboarding.
3. As a Backend Developer learner, I want to ask about a documented command or environment setting, so that I can get an answer backed by my role's guide.
4. As a Designer learner, I want to read the team's fictional design guide, so that I can understand its design workspace and conventions.
5. As a Designer learner, I want to follow eight design tasks, so that I can practice the team's design process.
6. As a Designer learner, I want to ask about a documented library or handoff rule, so that I can inspect supporting evidence.
7. As a Business Analyst learner, I want to read the fictional requirements guide, so that I can understand discovery and story conventions.
8. As a Business Analyst learner, I want to follow eight analysis tasks, so that I can practice the expected workflow.
9. As a Business Analyst learner, I want to ask about a documented acceptance format, so that I can get a grounded answer.
10. As an HR learner, I want to read the fictional people-operations guide, so that I can understand sample orientation practices.
11. As an HR learner, I want to follow eight HR tasks, so that I can practice the demo onboarding process.
12. As an HR learner, I want to ask about a documented template or contact, so that I can inspect the matching source.
13. As a learner, I want to receive no-evidence feedback for facts absent from each guide, so that I can avoid fabricated company policies.
14. As a learner, I want to keep checklist progress separate between all five roles, so that I can explore without mixing completion.
15. As a learner, I want to use task guide/question actions for each role, so that I can connect actions with supporting knowledge.
16. As an administrator, I want to publish each role independently, so that I can release content gradually.
17. As an administrator, I want to reuse normal indexing and safe publication, so that I can keep incomplete content outside retrieval.
18. As an administrator, I want to rerun sample preparation safely, so that I can avoid duplicates or lost custom edits.
19. As a demo visitor, I want to see one consistent fictional company context, so that I can understand how the examples relate.
20. As a demo owner, I want to use fictional data without real employee information or secrets, so that I can keep the public demo appropriate.
21. As a mobile learner, I want to complete a role journey on a narrow screen, so that I can use the same product on my device.
22. As a maintainer, I want to record what facts support each sample question, so that I can keep future content changes testable.

## Implementation Decisions

- Deliver Backend Developer, Designer, Business Analyst and HR as four independent releases using the existing five-role model. Do not add departments, manager approval or restricted role access.

- Use Lumen as the consistent fictional company context already used by the verified sample journey. Label examples as fictional; do not imply their commands/policies describe the actual FirstDay repository, a real employer or actual employees.

- Each role receives one primary English Markdown guide within the current 100 KB upload limit and eight role-specific tasks split 2 Before you start, 3 Day 1, 3 Week 1. Additional supporting content remains optional future scope.

- Backend guide topics include fictional prerequisites, exact sample startup command/port, environment setup, project layout, tests, review and safe debugging. Tasks: read the guide; check required tools; configure the sample environment; run the sample API; inspect a sample endpoint; run a sample test; review service conventions; prepare a small practice change.

- Designer guide topics include a fictional design workspace/library, naming, components/tokens, accessibility, feedback and handoff. Tasks: read the guide; locate the shared design kit; open the sample workspace; review components/tokens; inspect a sample flow; check accessibility; prepare a small design change; write a handoff note.

- Business Analyst guide topics include a fictional product brief, domain vocabulary, discovery notes, requirements template, acceptance criteria, traceability and review. Tasks: read the guide; review the glossary; inspect a sample requirement; write a user story; add acceptance criteria; map a sample flow; review traceability; prepare a small refinement note.

- HR guide topics include fictional orientation, a welcome template, sample resource directory, privacy conventions, FAQ and communications workflow. Tasks: read the guide; locate the resource directory; review the welcome template; prepare a fictional orientation outline; check sample privacy guidance; review the FAQ; draft a fictional welcome message; review a sample onboarding summary.

- Each guide includes concrete uniquely identifiable supported facts and intentionally omits at least one test question's answer. Avoid invented statutory entitlements, legal advice, actual credentials, employee personal information or real operational actions.

- Attach task links and suggested questions only to actual same-role published knowledge. The guide must substantively support the task instructions and offered prompts, not merely share their keywords.

- Publish through the normal authorized ingestion/index/retry/activation path, with the existing embedding configuration and bounded provider calls. Partial candidates remain outside learner browsing and retrieval.

- Keep stable explicit sample identities and detect already-prepared content. Repeated setup skips unchanged examples and reports divergence for explicit review/replacement; it does not silently reset customized checklists, replace unrelated documents by filename, duplicate records or delete old user-managed content.

- Do not rename or overwrite existing Frontend documents merely to make the examples uniform. The first Frontend checklist release remains a prerequisite; other role content reuses that established behavior.

- Use existing application limits and provider quotas. Verify deterministic role journeys with controlled providers first; any actual provider grounding checks are small, authorized and recorded per current document version.

## Testing Decisions

- Use one shared role-journey pattern at the browser/public API boundary, parameterized by each role's real persisted guide/checklist, rather than four copied helper-unit suites.

- For each role, verify authorized preparation/publication, guide reading, eight tasks/stages, task links, completion persistence, a supported answer/citation, a contextual follow-up where relevant, and an intentionally absent fact.

- Verify switching roles leaves another role's progress/history/draft unchanged; All roles broadens retrieval only when explicitly selected.

- Run setup again to prove no duplicate sample content and no overwrite of administrator changes. Check partial indexing/retry and inherited authorization through existing public contracts.

- Use controlled provider outputs for normal desktop/mobile tests. Record limited live embedding/answer access only as a separate smoke; preserve production counters and respect rate-limit retry guidance.

- Keep content facts and expected evidence tied to actual published versions so the final product review can reuse current evidence without repeating a quota-heavy role sweep.

## Out of Scope

- Additional role types, common-company checklist inheritance, real personnel records, actual provisioning or messaging.
- PDF/Obsidian ingestion, legal policy generation, paid fallback and new AI agent autonomy.

## Further Notes

Tickets 16–19. Each is a complete role release; none depends on another role's content ticket. M8 is helpful for discovery but not a genuine blocker. User authorization on October 23, 2026 accepts the recommendations, test seam and publication of local specifications/tickets without further approval. This does not start implementation or authorize GitHub publication or a release.
