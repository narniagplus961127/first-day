# FirstDay next milestones — delivery map

## State and authorization

Implementation started October 23, 2026 using implement-spec on integration branch feat/onboarding-integration, based on main 1d5efea. The user authorized the complete ticket graph and recommended routine decisions without further input. Tickets 01, 08 and 14 are resolved and integrated (1aa661a, de31686, fd9a5e0). Their focused checks and final test cleanup recheck passed; see issue evidence. Ticket 04 is integrated at e873130 (six browser checks). Ticket 15 is integrated at 680b5b0 (six browser checks, static checks passed). Tickets 02, 03 and 05 are in progress; 07, 09 and 10 are ready. Local browser tests are temporarily waiting for Docker engine recovery after the usage interruption. Build/typecheck/CRLF evidence accompanies each completed issue. The accepted planning baseline is commit 416bbd1. Release evidence remains pending until the reviewed implementation exists.

Canonical programme: [specification](spec.md). Product roadmap: [roadmap](../../docs/roadmap.md). Accepted checklist discussion: [decision map](../checklists/map.md).

## Milestone specifications

- [M4 — Checklist administration](specs/m4-checklist-administration.md)
- [M5 — Frontend checklist and learner overview](specs/m5-learner-checklists-overview.md)
- [M6 — Checklist-to-RAG journey and question drafts](specs/m6-task-rag-bridge-drafts.md)
- [M7 — Integrated local activity and reset](specs/m7-local-activity-reset.md)
- [M8 — Knowledge discovery](specs/m8-knowledge-discovery.md)
- [M9 — Remaining role knowledge and checklists](specs/m9-role-datasets.md)
- [M10 — Complete-product design review and release](specs/m10-complete-product-release.md)

## Current frontier

- [02: Reorder tasks and move them between onboarding stages](issues/02-reorder-and-move-tasks.md) - ready after 01.
- [03: Protect newer checklist saves from stale administrators](issues/03-protect-concurrent-checklist-edits.md) - in progress.
- [05: Show role progress and next tasks on the learner overview](issues/05-show-overview-progress.md) - in progress.

Additional ready tickets after 04: [07](issues/07-open-current-guide-from-task.md), [09](issues/09-ask-from-checklist-task.md), [10](issues/10-synchronize-task-completion-tabs.md).

Choose one ready slice when resuming; readiness does not require implementing the whole programme at once. Use the declared graph rather than blindly processing every ticket in numerical order. M9 roles are separate small releases, not one large content batch.

## Tracer-bullet ticket breakdown

1. **[01: Publish and read an administrator-defined role checklist](issues/01-publish-role-checklist.md) — M4**
   - **Blocked by:** None; completed RAG foundation is available.
   - **What it delivers:** A private administrator creates, edits and removes tasks, saves a coherent role checklist, and an authenticated learner can read the saved result.
   - **Progress:** resolved

2. **[02: Reorder tasks and move them between onboarding stages](issues/02-reorder-and-move-tasks.md) — M4**
   - **Blocked by:** 01
   - **What it delivers:** Administrators organize a saved checklist with accessible reorder and stage-move controls, and learners see the same published sequence.
   - **Progress:** in-progress

3. **[03: Protect newer checklist saves from stale administrators](issues/03-protect-concurrent-checklist-edits.md) — M4**
   - **Blocked by:** 01
   - **What it delivers:** Two administrators or tabs can edit safely: the first valid save succeeds, and an outdated save receives a clear conflict instead of silently replacing it.
   - **Progress:** in-progress

4. **[04: Complete and revisit a role checklist privately](issues/04-complete-role-checklist.md) — M5**
   - **Blocked by:** 01
   - **What it delivers:** Learners choose a role, follow its grouped checklist, toggle task completion and retain their own progress after navigation and reload.
   - **Progress:** resolved

5. **[05: Show role progress and next tasks on the learner overview](issues/05-show-overview-progress.md) — M5**
   - **Blocked by:** 04
   - **What it delivers:** The overview reflects the same role and progress as the checklist, highlights up to three next incomplete tasks, and offers meaningful empty/completed states.
   - **Progress:** in-progress

6. **[06: Preserve accurate progress through checklist changes](issues/06-preserve-progress-through-task-edits.md) — M5**
   - **Blocked by:** 02, 04
   - **What it delivers:** Learners keep completed work when an administrator clarifies or reorganizes tasks, while new and removed obligations change progress predictably.
   - **Progress:** not-started

7. **[07: Open the current same-role guide from a checklist task](issues/07-open-current-guide-from-task.md) — M6**
   - **Blocked by:** 04
   - **What it delivers:** Administrators attach published same-role guides, and learners open current instructions from tasks without changing completion or historical answer citations.
   - **Progress:** not-started

8. **[08: Preserve an unfinished question in each chat scope](issues/08-preserve-question-drafts.md) — M6**
   - **Blocked by:** None; completed RAG foundation is available.
   - **What it delivers:** Existing chat remembers unfinished questions across page navigation and reload, separately for each job role and All roles, without losing completed conversations.
   - **Progress:** resolved

9. **[09: Ask a task question without overwriting unfinished work](issues/09-ask-from-checklist-task.md) — M6**
   - **Blocked by:** 04, 08
   - **What it delivers:** A learner opens a configured task question in the correct role, edits it, protects an existing draft and submits through the normal grounded-answer journey.
   - **Progress:** not-started

10. **[10: Keep checklist changes consistent between browser tabs](issues/10-synchronize-task-completion-tabs.md) — M7**
   - **Blocked by:** 04
   - **What it delivers:** Two tabs of the same browser see matching checklist progress without losing changes to different tasks.
   - **Progress:** not-started

11. **[11: Reset all demo activity without stale resurrection](issues/11-reset-all-local-activity-safely.md) — M7**
   - **Blocked by:** 09, 10
   - **What it delivers:** A confirmed Reset demo clears progress, conversations, drafts and task-question handoffs across open tabs, and late work cannot restore cleared activity.
   - **Progress:** not-started

12. **[12: Keep local activity honest when browser storage fails](issues/12-handle-local-storage-failures.md) — M7**
   - **Blocked by:** 11
   - **What it delivers:** Learners can still try the demo in a tab when browser storage is blocked or corrupted, with clear persistence limits and no false reset claims.
   - **Progress:** not-started

13. **[13: Finish the complete Frontend checklist demo journey](issues/13-verify-complete-frontend-checklist-journey.md) — M7**
   - **Blocked by:** 03, 05, 06, 07, 12
   - **What it delivers:** The eight-task Frontend checklist is a coherent, verifiable onboarding journey with working supported guide/question bindings and reliable local activity.
   - **Progress:** not-started

14. **[14: Filter the knowledge library by job role](issues/14-filter-published-guides-by-role.md) — M8**
   - **Blocked by:** None; completed RAG foundation is available.
   - **What it delivers:** Learners narrow published guides to one role or browse All roles while retaining the existing authenticated reader.
   - **Progress:** resolved

15. **[15: Search published guide titles alongside role filters](issues/15-search-guide-titles-with-role-filter.md) — M8**
   - **Blocked by:** 14
   - **What it delivers:** Learners find published guides with a case-insensitive title query combined with the selected role.
   - **Progress:** resolved

16. **[16: Publish the Backend Developer onboarding journey](issues/16-publish-backend-onboarding.md) — M9**
   - **Blocked by:** 13
   - **What it delivers:** A learner can read a fictional Backend Developer starter guide, follow eight role-specific tasks and ask supported questions using the established checklist/RAG journey.
   - **Progress:** not-started

17. **[17: Publish the Designer onboarding journey](issues/17-publish-designer-onboarding.md) — M9**
   - **Blocked by:** 13
   - **What it delivers:** A learner can read a fictional Designer starter guide, follow eight role-specific tasks and ask supported questions using the established checklist/RAG journey.
   - **Progress:** not-started

18. **[18: Publish the Business Analyst onboarding journey](issues/18-publish-business-analyst-onboarding.md) — M9**
   - **Blocked by:** 13
   - **What it delivers:** A learner can read a fictional Business Analyst starter guide, follow eight role-specific tasks and ask supported questions using the established checklist/RAG journey.
   - **Progress:** not-started

19. **[19: Publish the HR onboarding journey](issues/19-publish-hr-onboarding.md) — M9**
   - **Blocked by:** 13
   - **What it delivers:** A learner can read a fictional HR starter guide, follow eight role-specific tasks and ask supported questions using the established checklist/RAG journey.
   - **Progress:** not-started

20. **[20: Verify and release the complete five-role FirstDay product](issues/20-verify-five-role-product-release.md) — M10**
   - **Blocked by:** 15, 16, 17, 18, 19
   - **What it delivers:** The complete five-role application matches the agreed product and approved native design, with accurate current release documentation and a verified Git-triggered deployment.
   - **Progress:** not-started

## Blocking and release rules

- Blockers are listed explicitly in each ticket. Numbers refer to this graph only, not the earlier RAG tickets.
- 01 unlocks 02, 03 and 04. 04 unlocks 05, 07 and 10; 06 also requires 02. 09 requires 04 and independent draft ticket 08. 11 requires 09 and 10; 12 requires 11.
- Frontend checklist gate 13 requires 03, 05, 06, 07 and 12. Their transitive blockers cover all checklist and draft work; no redundant edges are necessary.
- Independent library filter 14 unlocks combined title search 15.
- Each of 16–19 requires the completed Frontend gate 13, but none requires another role's content or optional library discovery.
- Final product gate 20 requires 15 and all four role releases 16–19. Frontend gate 13 is already their transitive prerequisite.
- A partial checklist increment does not close the whole Frontend milestone. Baseline authorization, privacy, error handling and accessibility ship with each increment, and 13 verifies their full integration.
- A future implementation change that genuinely alters prerequisites must update the graph explicitly; helpful sequencing alone is not a blocker.
- No wide prefactor is currently justified. Standalone draft ticket 08 is an additive, demoable precursor to the task handoff, not a horizontal storage rewrite.

## Coverage and review

The programme covers all approved design areas: administrator checklist editor (01–03, 07, 09), learner checklist/overview (04–06), current guide/task chat bridge and drafts (07–09), browser isolation/tab/reset/fallback (10–13), published title/role discovery (14–15), remaining role content (16–19), and complete-product design/release (20). Existing login, ingestion, citation, limits, privacy and hosting behavior remain regression requirements.

Original recommendations 1–15 remain accepted. Recommendations 16–20 and routine defaults were accepted by the user's latest instruction; no outstanding interview question or ticket-approval gate remains for publishing this package.

CI/hooks, deferred checker fixes and optional expansion features remain excluded. Local Markdown remains the tracker; no GitHub issues were created and no previous issue was closed or changed.

