# FirstDay onboarding checklists — design interview

## State

All 15 interview decisions are accepted as of October 23, 2026. The user requested a full roadmap for gradual future implementation; no application implementation or deployment starts in this planning session. The user explicitly deferred the remaining retrospective checker improvements; CI/hooks remain excluded.

## Existing confirmed decisions

- Five job roles, no departments: Frontend Developer, Backend Developer, Designer, Business Analyst, HR.
- An onboarding checklist is an administrator-defined set of tasks for a job role that learners mark complete themselves. No manager approval.
- Learners can access every role and switch roles freely; checklist progress is separate per role.
- Shared demo authentication does not share learner activity. Checklist completion remains browser-local and is included in the confirmed Reset demo behavior.
- Private administrators manage shared task definitions. Public registration remains disabled.
- Reuse the approved native FigCraft design, preserving manual edits and omitting preview exports.
- Existing RAG journey and Git auto-deployment are working; checklist work is a separate follow-on milestone.

## Sources

- GLOSSARY.md
- .scratch/onboarding/design-brief.md
- .scratch/onboarding/spec.md (follow-on scope)
- docs/agents/issue-tracker.md

## Round 1 — confirmed by the user (all yes)

1. Delivery scope: complete Frontend Developer checklist journey first, supporting the same five-role model; other role task datasets follow.
2. Knowledge bridge: optional guide link and a role-scoped Ask FirstDay action per task; suggested question is editable and requires an explicit question submission.
3. Structure: Before you start, Day 1, Week 1 groups as guidance; no deadlines or scheduling.
4. Progress: equal-weight task completion with completed/total and a percentage; no required/optional tiers in this milestone.

## Round 2 — confirmed by the user (all yes)

5. Task fields: required title/stage, optional short description, one optional same-role published guide and an optional suggested question.
6. Administration: one checklist per role, add/edit/reorder/move/remove tasks, explicit Save changes publishes a valid whole checklist; no separate draft workflow.
7. Completion identity: ordinary edits/reordering keep completion; added tasks begin unchecked; removal drops the task from progress; a genuinely new obligation is created as a new task.
8. Learner overview: show role progress plus up to three next incomplete tasks in checklist order; unconfigured roles show a clear not-yet-available state and no misleading 100%.

## Round 3 — confirmed by the user (all yes)

9. Guide links open the latest published active version; answer citations remain version-specific. If a guide is unavailable, keep the task and completion, show an unavailable guide action, and do not silently substitute another guide.
10. Concurrent administrator edits reject an out-of-date save with reload guidance instead of silently overwriting the newer saved checklist.
11. Within one browser, checklist changes stay in sync across open tabs; different-task changes do not erase each other, and the latest change to the same task wins. Confirmed Reset demo clears all role progress/chats across open tabs and does not allow stale tabs to restore pre-reset activity.
12. If browser storage is unavailable, permit temporary in-tab completion with a clear not-saved warning; do not claim it survives reload or shares with other tabs.

## Round 4 — confirmed by the user (all yes)

13. Preserve one unfinished question per chat scope locally across page navigation; ask before a task question replaces a nonempty draft, keep prior completed conversations, and never auto-submit. Reset demo also clears unfinished questions.
14. Overview/checklist share a remembered onboarding job-role selection, initially Frontend Developer and returning to it after Reset demo. Chat retains its independent search scope, including All roles; opening a task question explicitly selects that task's role. All roles is not a sixth checklist role.
15. Seed eight fictional Frontend Developer tasks across the three approved stages, reusing existing published knowledge where appropriate without inventing guide links or requiring additional role datasets.

## Consolidated planning

No product interview questions remain. The consolidated agreement and observable acceptance journey are in brief.md; the proposed full product delivery sequence and coverage check are in docs/roadmap.md. Confirm the selected milestone scope when the user chooses to start future implementation. Baseline acceptance includes private administrator-only mutation, server input validation, safe whole-list saves and failures, desktop/mobile keyboard access, role/browser isolation, honest storage fallback, reset/tab propagation and preservation of existing RAG behavior. Already confirmed decisions are not reopened. Record resolved terminology in the glossary and consequential trade-offs in ADRs only when warranted. Confirm shared understanding before implementation.

## Full roadmap planning request — October 23, 2026

The user invoked grill-with-docs, then to-spec and to-tickets, asking to use the recommendations and prepare for gradual future implementation. The first 15 checklist decisions remain accepted. The remaining retrospective checker fixes, CI/hooks and optional expansion features stay excluded.

### Round 5 — accepted by explicit instruction to use all recommendations

16. Plan all remaining roadmap work M4–M10, organized by milestone so it can be implemented gradually; do not include optional expansion features or start implementation.
17. Knowledge discovery uses combined case-insensitive document-title search and a job-role filter, including All roles, across published guides only; browsing filters remain independent of onboarding role and chat scope.
18. Each additional role receives one practical fictional English Markdown starter guide and eight role-specific tasks across the three agreed stages, using the same fictional company context and explicit supporting knowledge.
19. A fully completed checklist shows a restrained completion state and continuing guide/chat actions; no certificates, points, forced progression or automatic task completion.
20. Reuse observable desktop/mobile browser and public API testing with real isolated Supabase persistence, multi-tab/browser cases and controlled providers; keep any actual provider/deployment smoke small and separate.

The user subsequently instructed: Use all your suggestion, dont need my approval. This accepts recommendations 16–20, the observable testing seam and routine ticket granularity, and overrides the skill-default approval questions for this planning publication. Seven milestone specifications and 20 individual tickets are published under .scratch/onboarding-next; the programme map contains the full breakdown and genuine blocking edges. No application code, cloud mutations, deployment or GitHub publication is included in this planning request.

## Publication result

The canonical next-milestones specification and delivery map are .scratch/onboarding-next/spec.md and .scratch/onboarding-next/map.md. All planning items use ready-for-agent triage; individual implementation tickets have Progress not-started. Frontend checklist release is ticket 13 and full-product release is ticket 20. Ready frontier: 01 checklist publication, 08 standalone question drafts, 14 library role filtering. Implementation, cloud mutation, release and GitHub publication have not started.
