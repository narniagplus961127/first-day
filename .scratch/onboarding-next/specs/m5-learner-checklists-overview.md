# M5 — Frontend checklist and learner overview

Status: ready-for-agent

## Problem Statement

The learner overview is a static starting screen. Learners need to follow concrete tasks, remember their own progress and see what remains without sharing activity through the public demo identity.

## Solution

Show the saved role checklist in its three stages, support reversible self-completion, and reflect the same browser-local state in a role-aware overview with the next three incomplete tasks.

## User Stories

1. As a learner, I want to open the selected role's checklist, so that I can see my onboarding actions.
2. As a learner, I want to see tasks grouped in their saved order, so that I can follow a coherent path.
3. As a learner, I want to mark a task complete, so that I can record what I have finished.
4. As a learner, I want to mark a task incomplete again, so that I can correct a mistake or revisit work.
5. As a learner, I want to see completed and total task counts, so that I can understand my progress.
6. As a learner, I want to see an equal-weight completion percentage, so that I can understand how much remains.
7. As a returning learner, I want to retain completion after reload, so that I can continue where I stopped.
8. As a learner, I want to switch between five roles, so that I can explore each onboarding path.
9. As a learner, I want to retain separate completion per role, so that I can avoid mixing unrelated tasks.
10. As a learner, I want to share a remembered role between overview and checklist, so that I can navigate without repeatedly selecting it.
11. As a first-time visitor, I want to start with Frontend Developer, so that I can reach the initial complete demo journey.
12. As a learner, I want to see the next three incomplete tasks on the overview, so that I can know what to do next.
13. As a learner, I want to keep completion when a task is clarified or reordered, so that I can avoid losing my work.
14. As a learner, I want to see newly added tasks begin incomplete, so that I can notice new obligations.
15. As a learner, I want to stop counting removed tasks, so that I can see accurate current progress.
16. As a learner, I want to see an honest coming-soon state for empty roles, so that I can avoid mistaking missing content for completed onboarding.
17. As a learner, I want to see a restrained completion message when all tasks are done, so that I can recognize completion and keep exploring guides or chat.
18. As a demo visitor, I want to keep progress separate from another visitor using the same login, so that I can maintain privacy.
19. As a mobile or keyboard user, I want to operate completion controls accessibly, so that I can follow onboarding without a mouse or wide screen.

## Implementation Decisions

- Extend the existing overview and add the learner checklist surface using the approved design. Keep the five-role model and shared read authorization; All roles is not a checklist role.

- Store completion in the browser, keyed by role and stable task identity, not task text, array position or whole-checklist revision. Keep the central checklist definition authoritative for which tasks currently count.

- Reconcile saved completion against the current published task set. Rename, instructions edits, move and reorder preserve completion; new identities start incomplete; removed identities neither display nor count. A new task must not inherit a removed task's completion.

- Use the agreed three stages and saved order. Hide empty stage groups rather than showing confusing empty task containers.

- Give each task equal weight. Show completed/total and a consistently rounded percentage for nonempty checklists. No configured tasks means coming soon and no completion percentage, not 100%.

- Use one remembered onboarding role shared by overview and checklist, initially Frontend Developer. Keep it distinct from the existing independent chat search scope; entering All roles in chat never changes the onboarding role.

- Show a short role introduction, actual progress and up to three next incomplete tasks in saved checklist order. Task links lead to their checklist location. When no tasks remain, show congratulations plus guide/chat navigation without certificates, scoring or locked progression.

- Persist only bounded validated local identifiers and flags. Preserve authentication and other unrelated browser state. Basic browser isolation, honest save failures and reset compatibility accompany the first completion increment; cross-tab race/reset assurance completes in M7.

- Keep the existing public demo privacy explanation accurate: other browsers do not share local activity, and clearing browser data loses local progress.

- Use public read data to render tasks, not administrative input state. An unavailable checklist read must show retry feedback rather than overwrite known progress with an empty result.

## Testing Decisions

- Reuse real-fixture authenticated learner browser journeys with two independent contexts, plus public reads that establish which checklist revision is visible.

- Toggle, undo, reload and navigate between overview/checklist; assert visible counts, stage order, next-task links and remembered role rather than private storage key spelling.

- Edit, reorder, add and remove tasks through the real administrator seam while a learner has progress; assert the agreed preservation/denominator rules.

- Cover empty roles, all tasks complete, a failed checklist read, role isolation, separate-browser privacy, desktop/mobile and keyboard completion.

- Basic storage failure and reset behavior must remain honest at this increment; M7 adds adversarial tab/reset interleavings.

## Out of Scope

- Guide linking and suggested question actions beyond existing working chat/reader navigation (M6).
- Cross-device progress, central learner completion, due dates, required/optional tiers, certificates and manager approval.
- The four additional role datasets; this milestone must display their empty states correctly.

## Further Notes

Tickets 04–06. Final integrated checklist release also requires M6 and M7. User authorization on October 23, 2026 accepts the recommendations, test seam and publication of local specifications/tickets without further approval. This does not start implementation or authorize GitHub publication or a release.
