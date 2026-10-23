# FirstDay next milestones — programme specification

Status: ready-for-agent

## Problem Statement

The shipped FirstDay RAG demo proves upload-to-answer onboarding, but the complete approved product still lacks administrator-defined checklists, learner progress/overview behavior, a safe task-to-chat bridge, complete role datasets and richer knowledge discovery. The owner wants a complete plan that can be implemented slowly, without repeatedly rediscovering decisions or treating roadmap headings as horizontal implementation tickets.

## Solution

Finish the product in milestone-sized increments M4–M10 while preserving the working RAG foundation M1–M3. Administrators maintain coherent shared task definitions, learners follow their own role checklists privately, tasks connect to current guides and grounded questions, and each of five roles eventually has useful fictional content. Provide small independently verifiable tickets with only genuine blocking edges.

## User Stories

1. As an administrator, I want to maintain one shared checklist per job role, so that I can define useful onboarding actions.
2. As an administrator, I want to publish coherent validated checklist changes, so that I can avoid partial onboarding instructions.
3. As an administrator, I want to resolve stale saves without overwriting newer edits, so that I can work safely in multiple tabs.
4. As a learner, I want to complete and undo role-specific tasks privately, so that I can track my own onboarding.
5. As a learner, I want to retain completion through ordinary task edits, so that I can avoid repeating finished work.
6. As a learner, I want to see current role progress and next tasks, so that I can know where to continue.
7. As a learner, I want to see honest empty and completed states, so that I can understand the actual checklist status.
8. As a learner, I want to open current supporting guides from tasks, so that I can follow up-to-date instructions.
9. As a learner, I want to turn a task into an editable role-scoped question, so that I can get relevant grounded help.
10. As a learner, I want to keep unfinished questions without losing completed history, so that I can navigate without discarding work.
11. As a learner, I want to confirm before replacing a question draft, so that I can protect my unfinished question.
12. As a learner, I want to synchronize checklist changes across tabs, so that I can keep local progress consistent.
13. As a learner, I want to reset all local activity without stale resurrection, so that I can restart the demo predictably.
14. As a learner, I want to receive honest blocked-storage feedback, so that I can understand what will survive reload.
15. As a learner, I want to search published guide titles and filter by role, so that I can find relevant knowledge quickly.
16. As a learner, I want to keep onboarding, library and chat scope choices distinct, so that I can control relevance without confusion.
17. As a Backend Developer learner, I want to use a complete fictional role journey, so that I can explore backend onboarding.
18. As a Designer learner, I want to use a complete fictional role journey, so that I can explore design onboarding.
19. As a Business Analyst learner, I want to use a complete fictional role journey, so that I can explore analysis onboarding.
20. As a HR learner, I want to use a complete fictional role journey, so that I can explore people-operations onboarding.
21. As a demo visitor, I want to keep local activity separate from other visitors using the same login, so that I can maintain privacy.
22. As a mobile or keyboard user, I want to use the whole onboarding journey accessibly, so that I can participate without a wide screen or mouse.
23. As a demo owner, I want to preserve provider limits and secret boundaries, so that I can operate the demo within its agreed model.
24. As a project owner, I want to implement and verify small milestones gradually, so that I can control delivery pace.
25. As a maintainer, I want to trace every milestone to verifiable end-to-end tickets, so that I can resume work with clear dependencies.

## Implementation Decisions

- Preserve the completed authentication, RAG ingestion/publication, answering/citation, provider/quota, source-retention and hosting behavior. This programme adds the agreed product capabilities instead of rebuilding those foundations.
- M4 supplies private checklist maintenance and coherent shared read data; M5 supplies learner completion and overview; M6 supplies current-guide links, task questions and question drafts; M7 supplies integrated tab/reset/storage reliability. All four contribute to one complete Frontend checklist release gate.
- M8 is independent knowledge discovery over the existing published reader. M9 expands content in four independently releasable role journeys. M10 verifies and releases the complete five-role application.
- Retain exactly Frontend Developer, Backend Developer, Designer, Business Analyst and HR. All roles is only a browsing/chat relevance option, never a sixth checklist role or authorization identity.
- Keep one checklist per role and three fixed guidance stages. Shared task definitions use stable identities and versioned atomic saves; learner completion stays local and follows task identity rather than whole-checklist revision.
- Ordinary task edits preserve completion, new identities begin unchecked, and removed tasks stop counting. Task definitions must not reuse deleted identities for new obligations.
- Keep onboarding role selection, library filters and chat search scope distinct. A task-question action explicitly selects its role, protects the target draft and requires explicit submission.
- Role guides resolve the latest active published version, whereas answer citations retain their exact original version. Unavailable task references are explained rather than silently substituted.
- Drafts, history, progress, role preference and reset must have bounded, validated local activity contracts and compatible upgrade behavior. Same-browser checklist changes synchronize without overwriting different-task actions; reset fences old writes, handoffs and pending answers.
- Preserve public learner versus private administrator separation at the actual server/data boundary. No manager approval, central learner tracking or automatic AI task completion is introduced.
- Prepare fictional Lumen starter content only: eight Frontend tasks first, then one primary guide and eight tasks for each additional role. Existing customized or unrelated content is not silently overwritten during setup.
- Reuse approved native FigCraft frames and reconcile new states before building. Preserve manual edits and omit preview exports. Routine accessible controls and error states accompany each increment.
- Prefer additive integration of local activity capabilities at their public callers. No independent wide mechanical refactor is currently required; if implementation discovers one, plan an expand–migrate–contract sequence rather than landing broken horizontal slices.
- Keep existing TypeScript/Next.js/Supabase and direct Google/Groq constraints, no paid fallback and Singapore function region. No new infrastructure, CI/hook wiring or deferred retrospective fixes are part of this scope.
- Publish specifications and individual tickets to the configured local Markdown tracker, with ready-for-agent triage and separate not-started lifecycle. Ready does not mean implementation or release has started.

## Testing Decisions

- The user accepted all recommendations and explicitly waived further approval on October 23, 2026; this includes the proposed observable testing seam and ticket granularity. No additional interview or approval gate is required to publish this planning package.
- Prefer the existing authenticated browser/public API seam with real isolated Supabase Auth/Data API/Postgres persistence and controlled Google/Groq HTTP responses. Reuse current authentication, conversation, replacement, limit and storage-outage journey patterns.
- Test externally visible outcomes: saved coherent definitions, denied writes, progress/next tasks, version-correct readers/citations, explicit task questions, preserved drafts, literal title search, role isolation and honest failure feedback. Do not mirror reducers, prompts, component layout or private key spellings.
- Use independent browser contexts for different visitors, and multiple pages in one context for same-browser tab interleavings. Exercise delayed responses and storage failure/corruption through the browser platform boundary.
- Each ticket includes its own relevant authorization, error, keyboard and mobile checks. Ticket 13 is the integrated Frontend checklist gate; ticket 20 is final cross-role sign-off, not the first quality test.
- Keep actual provider/deployment checks small, separate and authorized. Reuse current-version evidence where valid, respect actual allowance/retry behavior and do not reset live counters or force quota exhaustion.
- Validate the planning package itself for template completeness, graph references, acyclicity, true independence, source links, checklist coverage, triage/lifecycle and CRLF without running app/provider tests merely for documentation.

## Out of Scope

- Application implementation, cloud mutation, GitHub publication, branch merges and deployment as a side effect of preparing these specs/tickets.
- Rebuilding completed M1–M3, expanding source-retention or changing providers without an implementation need.
- PDF/image/OCR or Obsidian/repository synchronization, personal accounts/cross-device progress, new roles/departments/organizations, deadlines, reminders, attachments, manager approval, analytics, autonomous operations and paid fallback.
- Remaining retrospective checker repairs, CI/pre-commit wiring, new monitoring/keepalive automation and design preview exports.

## Further Notes

The user said: “Use all your suggestion, dont need my approval” and requested to-spec followed by to-tickets. This authorizes accepting recommendations 16–20, selecting routine planning defaults, and publishing the local planning documents without re-asking about the seams or breakdown. Implementation remains future work.

Milestone-specific specifications are the detailed requirements for their slices:

- [M4 — Checklist administration](specs/m4-checklist-administration.md)
- [M5 — Frontend checklist and learner overview](specs/m5-learner-checklists-overview.md)
- [M6 — Checklist-to-RAG journey and question drafts](specs/m6-task-rag-bridge-drafts.md)
- [M7 — Integrated local activity and reset](specs/m7-local-activity-reset.md)
- [M8 — Knowledge discovery](specs/m8-knowledge-discovery.md)
- [M9 — Remaining role knowledge and checklists](specs/m9-role-datasets.md)
- [M10 — Complete-product design review and release](specs/m10-complete-product-release.md)

The [delivery map](map.md) provides all 20 ticket links, blocking edges, current frontier and milestone release gates. Existing accepted checklist decisions remain in the earlier interview brief; this programme adds the accepted full-roadmap planning choices.

