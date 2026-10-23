# FirstDay checklist milestone — agreed product brief

All 15 interview decisions were accepted by the user on October 23, 2026. This brief records the product agreement for future implementation; no application implementation, infrastructure changes, deployment or GitHub publication is requested by writing it. Delivery can proceed gradually using docs/roadmap.md.

## Outcome and scope

Complete the Frontend Developer onboarding journey first: a private administrator maintains a shared checklist, a learner follows it at their own pace, and the overview reflects their own progress. Preserve exactly five job roles and unrestricted learner access across roles. There are no departments or manager approvals.

Each role has one administrator-defined checklist. Initial sample content covers Frontend Developer only; the other four roles show an honest Checklist coming soon state, not 100% complete. Onboarding stages are Before you start, Day 1 and Week 1; these guide sequence without enforcing dates.

## Administrator

A checklist task has a required title and stage, optional short instructions, one optional published knowledge guide from the same role, and an optional suggested question. Add, edit, reorder, move and remove tasks, then explicitly Save changes to publish the valid whole checklist together. There is no separate draft/publish workflow. An outdated concurrent save is rejected with reload guidance rather than overwriting a newer save. Failed saves retain the working published checklist and the administrator's recoverable edits.

Ordinary edits and reordering preserve a task's completion. Added tasks start incomplete. Removed tasks stop counting. A genuinely new obligation is a new task rather than a repurposed completed task.

## Learner and overview

Learners mark tasks complete or incomplete themselves. Every task has equal weight; show completed/total and a percentage. The overview shows the selected role's progress and up to three next incomplete tasks in checklist order. Overview and Checklist share a remembered onboarding role, initially Frontend Developer and restored to it by Reset demo.

Guide links resolve the latest published active version. An unavailable guide leaves the task and its completion intact with an unavailable action; no silent substitution. Existing answer citations retain exact-version behavior.

## Chat bridge

Ask FirstDay opens an editable suggested question in the task's job-role scope and never auto-submits or marks completion. Existing completed conversations remain intact. Chat retains its independent search scope, including All roles; All roles is not a sixth checklist role. This explicit behavior supersedes the earlier design brief's general assumption that every onboarding role switch also switches chat scope.

Preserve one unfinished question per chat scope across page navigation. Ask before replacing a nonempty question draft with a task suggestion. Reset demo clears these drafts too.

## Local activity and reliability

Checklist progress remains browser-local, separate per role and isolated from other visitors using the same public demo identity. In the same browser, open tabs synchronize checklist changes: changes to different tasks preserve both; the latest action to the same task wins. Reset clears role progress, chats and question drafts across tabs, without stale tabs restoring cleared activity. Authentication and shared checklist/knowledge definitions remain unchanged.

If browser storage is unavailable, allow temporary in-tab completion with an explicit lost-on-reload warning. Do not claim persistence or tab sharing in this mode.

## Eight fictional starter tasks

- Before you start: Read the onboarding guide; Check required tools.
- Day 1: Configure the environment; Run the frontend locally; Explore the project structure.
- Week 1: Review coding conventions; Trace a UI flow; Prepare a small practice change.

Attach guide links and suggested questions where existing published knowledge supports them. Do not fabricate links or imply absent information is covered.

## Observable acceptance

- Private administrators create/edit/reorder/move/remove tasks, save successfully, and receive useful validation/failure/conflict feedback.
- Learner and anonymous direct mutation requests are denied at the server/data boundary.
- Learners see the correct ordered groups, toggle completion, reload with saved state, and see matching overview counts/next tasks.
- Ordinary edits preserve completion; added/deleted tasks change progress according to the agreement.
- Role switching isolates progress, and unconfigured roles never show misleading completion.
- Guide replacement opens the latest guide while earlier answer citations still resolve their original source.
- Suggested questions select the correct role, protect existing drafts/history and require explicit submission.
- Separate browser contexts remain isolated; same-browser tabs synchronize changes without losing unrelated completions.
- Reset confirmation, cancellation, all-role/tab clearing and prevention of stale activity resurrection work across checklist/chat/drafts.
- Blocked/corrupt storage produces honest fallback behavior.
- Relevant desktop/mobile and keyboard paths match the approved native design.
- Existing authentication, grounded answers, citations, provider limits and no-paid-fallback behavior remain intact.

Reuse the approved native FigCraft checklist/editor frames and preserve manual edits; preview exports remain excluded. Verify the native design coverage before implementation. Do not add new role datasets, deadlines, required/optional tiers, attachments, notifications, analytics or autonomous AI completion to this first checklist journey.

## Delivery mapping

Roadmap M4–M7 together complete this agreed Frontend Developer journey. Those stages are implementation increments; the checklist milestone is not complete until its cross-feature reset/privacy behavior and acceptance journey pass. M8 adds the originally planned library discovery controls. M9 expands content to the other four roles. Baseline authorization, error handling and accessibility accompany each increment rather than being postponed to final review.
