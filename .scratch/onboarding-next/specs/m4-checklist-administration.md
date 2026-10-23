# M4 — Checklist administration

Status: ready-for-agent

## Problem Statement

Administrators can maintain knowledge documents but cannot define the onboarding actions learners should follow. A shared checklist must be editable without partial saves, unauthorized changes or accidental overwrites.

## Solution

Give the private administrator one ordered checklist for each job role, beginning with eight fictional Frontend Developer tasks. Save a complete valid checklist together and let authenticated learners read the published result.

## User Stories

1. As an administrator, I want to choose one of the five job roles, so that I can maintain the correct onboarding checklist.
2. As an administrator, I want to create a checklist for a role without existing tasks, so that I can prepare its onboarding path.
3. As an administrator, I want to add a task with a title and onboarding stage, so that I can state a clear action at the appropriate point.
4. As an administrator, I want to supply optional short instructions, so that I can explain how to approach a task.
5. As an administrator, I want to edit an existing task, so that I can correct or clarify it.
6. As an administrator, I want to reorder tasks within a stage, so that I can present an intentional sequence.
7. As an administrator, I want to move a task between stages, so that I can adjust its suggested timing.
8. As an administrator, I want to remove tasks from the saved checklist, so that I can keep onboarding relevant.
9. As an administrator, I want to save the whole checklist explicitly, so that I can publish a coherent set of changes.
10. As an administrator, I want to retain recoverable edits when saving fails, so that I can retry without re-entering my work.
11. As an administrator, I want to see useful validation errors, so that I can correct invalid task details.
12. As an administrator, I want to receive a conflict when another editor saved first, so that I can avoid overwriting newer changes.
13. As a learner, I want to read the current saved checklist, so that I can follow the administrator's published instructions.
14. As a learner, I want to have checklist changes denied through direct requests, so that I can trust that public demo visitors cannot modify shared tasks.
15. As an administrator, I want to start with eight fictional Frontend Developer tasks, so that I can demonstrate checklist maintenance immediately.
16. As an administrator, I want to rerun sample preparation without duplicates or lost edits, so that I can maintain a usable demo.
17. As a keyboard user, I want to reorder and move tasks with accessible controls, so that I can manage a checklist without dragging.
18. As a mobile administrator, I want to edit and save tasks on a narrow screen, so that I can maintain the demo from my device.

## Implementation Decisions

- Reuse the verified learner/administrator identity boundary and existing protected application shell. A job role does not grant administration privileges; all authenticated learners may read any role's checklist.

- Store shared checklist definitions centrally, with one checklist per exact supported role, a monotonically changing saved revision, and stable checklist task identities. Store no learner completion in the central tables.

- Represent stage and ordered position explicitly. The three stages are fixed: Before you start, Day 1, Week 1. Stage labels describe sequence, not deadlines.

- Expose a role-checklist read operation returning its revision and ordered tasks, and an administrator-only whole-snapshot save operation carrying the expected revision. A newly absent checklist behaves as revision zero; concurrent initial creation must also be conflict-safe.

- Save edits transactionally. Validate the complete snapshot, authorize at the server/data boundary, compare the expected revision under a transaction/lock, and publish all changes or none. Reject stale saves with an actionable conflict response and reload option; do not silently merge or overwrite.

- Maintain task identity across edits and reorder/move operations. Generate fresh identities for new tasks; do not accept another role's task identities or reuse a deleted task's identity to revive completion.

- Required fields are title and stage; instructions are optional. Reserve optional same-role guide and suggested-question data so the knowledge-bridge increment can add working actions without breaking saved definitions.

- Use bounded defaults: at most 40 tasks per role, title 120 characters, instructions 2000 characters, suggested question 1000 characters, and a 256 KiB maximum save body. Validate exact stages, duplicate identities, ordering, role ownership and text at the server boundary. Keep existing Markdown upload limits unchanged.

- Allow saving an empty checklist intentionally. Learners then receive a not-yet-available state, no task percentage and no misleading 100% completion.

- Provide add/edit/remove and keyboard-operable move/reorder controls, explicit Save changes, pending/error/success feedback and protection for unsaved edits when navigating away. No autosave or separate draft/publish workflow is added.

- Prepare the agreed eight Frontend starter tasks as explicit, idempotent sample setup. Initial guide/question fields may remain empty until supported bindings are available. Do not populate the other four role datasets in this milestone or silently overwrite administrator-customized sample records.

- Task content is plain text rendered safely. Any guide/question fields saved before their learner action is implemented must not expose a nonfunctional action.

## Testing Decisions

- Use observable private-admin and learner browser journeys backed by the existing real isolated Supabase fixture and public API seam. Reuse current login, RLS denial, upload-validation and replacement-conflict testing patterns.

- Verify create, edit, empty save, removal, reload persistence, stage movement and keyboard reordering through visible outcomes and subsequent reads.

- Use two authenticated admin browser contexts reading one revision; save one and assert the second receives a conflict while the first saved snapshot remains intact.

- Exercise invalid roles/stages, oversize and malformed input, forged/cross-role IDs, duplicate tasks, anonymous access and direct learner writes. Verify a failed save changes no shared task definition.

- Verify idempotent starter setup and preservation of existing custom definitions. Check relevant desktop/mobile forms without asserting component internals.

## Out of Scope

- Learner completion storage and overview summaries (M5).
- Working guide/question handoff and question drafts (M6).
- Additional role sample datasets, custom stages, deadlines, task attachments, approval workflows, autosave, standalone draft publishing and bulk checklist imports.

## Further Notes

Tickets 01–03. Later milestones extend these saved definitions; they do not replace their authorization or revision contract. User authorization on October 23, 2026 accepts the recommendations, test seam and publication of local specifications/tickets without further approval. This does not start implementation or authorize GitHub publication or a release.
