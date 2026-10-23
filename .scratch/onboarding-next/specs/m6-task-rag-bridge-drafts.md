# M6 — Checklist-to-RAG journey and question drafts

Status: ready-for-agent

## Problem Statement

Tasks and the existing RAG assistant are disconnected. Navigating to ask for help can lose an unfinished question or select the wrong role, and stale guide links can send learners to outdated instructions.

## Solution

Connect tasks to the latest available same-role guide and to editable, explicitly submitted suggested questions. Preserve one unfinished question per chat scope and protect it before accepting a conflicting task suggestion.

## User Stories

1. As an administrator, I want to attach a published same-role guide to a task, so that I can direct learners to useful evidence.
2. As an administrator, I want to set an optional suggested question, so that I can make it easier to ask for help.
3. As an administrator, I want to receive feedback for unavailable or wrong-role guide selections, so that I can publish valid task references.
4. As a learner, I want to open the latest published guide from a task, so that I can read current instructions.
5. As a learner, I want to see when a linked guide is unavailable, so that I can understand why the action cannot open.
6. As a learner, I want to retain the task and completion when its guide is unavailable, so that I can avoid losing onboarding progress.
7. As a learner, I want to open a suggested question in the task's role, so that I can ask within the relevant knowledge scope.
8. As a learner, I want to edit the suggested question before submission, so that I can ask what I actually need.
9. As a learner, I want to submit explicitly, so that I can control when a provider request is made.
10. As a learner, I want to keep tasks self-completed, so that I can avoid confusing AI help with proof of task completion.
11. As a learner, I want to retain prior completed chat exchanges, so that I can continue a relevant conversation.
12. As a learner, I want to keep one question draft per chat scope while navigating, so that I can avoid losing unfinished work.
13. As a learner, I want to confirm before a suggestion replaces my nonempty draft, so that I can protect what I have typed.
14. As a learner, I want to cancel suggestion replacement, so that I can keep my unfinished question.
15. As a learner, I want to keep All roles available independently in chat, so that I can broaden retrieval intentionally.
16. As a learner, I want to open older answer citations at their original version, so that I can inspect the evidence that actually supported the answer.
17. As a returning learner, I want to keep valid pre-existing chat history after the upgrade, so that I can avoid an unexpected history reset.
18. As a mobile or keyboard user, I want to use task links and draft-replacement controls accessibly, so that I can get help on my device.

## Implementation Decisions

- Resolve task guide links through the maintained knowledge document and its latest published active version. Preserve exact-version source inspection for existing answer citations; task references and citations have different purposes.

- Validate optional guide associations at save time as currently published and belonging to the task's exact job role. Recheck availability for the learner action. If later unavailable, keep the task and completion, disable the guide action with an explanation and never silently pick another document.

- Suggested questions are optional bounded plain text, limited to the existing 1000-character question ceiling. They can exist independently of a guide association, but sample questions must be supported by actual role knowledge.

- Introduce draft persistence as a narrow additive browser activity capability before broad callers migrate. Keep valid existing completed conversations and compatible stored history; do not perform a wide rename or storage reset.

- Keep one question draft per existing chat search scope, including All roles, across page navigation and reload when storage is available. Drafts are not prior assistant evidence and are not submitted until the learner presses Ask.

- Opening a task question explicitly selects the task's role and offers its suggested text. Preserve every other scope's draft and completed history. An empty or identical target draft needs no replacement prompt; a conflicting nonempty target draft requires confirmation.

- On cancellation, leave the destination scope's existing draft and history intact. On acceptance, replace only that draft. Consume the handoff once so back/refresh does not repeatedly replace a draft or reintroduce a cancelled suggestion.

- Treat missing/deleted task handoffs as unavailable without clearing unrelated draft data. Use bounded validated handoff data, not a trusted arbitrary source URL or hidden generation request.

- Use the unchanged authenticated answering pipeline, contextual last-three-exchange policy, active-version retrieval, citation validation, quotas and explicit error handling. No task-to-chat action auto-submits, auto-completes or bypasses limits.

- Clear the successfully submitted draft only if it still represents that submission; a late response must not erase newer typing. Reset and cancellation fencing across tabs is integrated in M7.

- Use current-tab temporary draft behavior with an honest notice when browser storage fails; do not claim central or cross-device persistence.

## Testing Decisions

- Use the existing authenticated chat/knowledge browser and public API seams with real local persistence and controlled Google/Groq responses.

- Exercise admin same-role selection, wrong-role/unpublished rejection, reader opening, safe guide replacement, and unavailable guide feedback while completion remains intact.

- Navigate away and back with unfinished drafts in two roles and All roles; verify history preservation, no scope mixing and no generation request before explicit submission.

- Cover empty, identical and conflicting target drafts, confirm/cancel, repeated handoff/back/refresh, removed tasks, successful submission and a late answer after new typing.

- Verify the submitted public question contains the intended role/history and still produces a supported citation or honest no-evidence. Keep live-provider checks separate and small.

## Out of Scope

- AI-generated checklists, autonomous task completion, provider/model changes, central chat or draft persistence.
- New knowledge ingestion formats, other role sample datasets and a sixth onboarding role.

## Further Notes

Tickets 07–09. Standalone question drafts can begin before checklist work because the current chat already exists. User authorization on October 23, 2026 accepts the recommendations, test seam and publication of local specifications/tickets without further approval. This does not start implementation or authorize GitHub publication or a release.
