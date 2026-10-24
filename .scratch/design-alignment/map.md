# Native design alignment

## Current state

October 24, 2026: implementation and local verification complete on fix/native-design-alignment, based on main 1588862. The pull request for this branch records hosted preview/release evidence. The user authorized correcting the app to the existing desktop/mobile FigCraft design and prototype. No native file edits or native preview exports are authorized or needed.

## Reference and coverage

Read all 45 native frames and 454 prototype interactions through read-only FigCraft automation. Reference: design/FirstDay.figcraft; tracked Git blob 182443980b4843aac0912032b8b60c4193c50164 (file SHA-1 6d7d0a4589bda64567368d620b71873ea39d21b6). Cached automation results and private app QA screenshots stay outside the repository.

| Native screens | Correction | Functional adaptation |
| --- | --- | --- |
| Foundations, desktop/mobile login and demo popup | Bundled Inter, brand geometry, mobile-specific introduction, responsive demo sheet | Keep both learner and read-only admin choices and existing credential/focus behavior |
| Overview and all role variants | 248px sidebar; pinned help/reset/account footer; 1108x200 desktop hero; three statistics cards; next tasks and suggestions; mobile heading, cards and bottom navigation | Counts and next tasks come from live published data; retain eight-task role content rather than sample six-task numbers |
| Ask, no-evidence and mobile sources | Desktop conversation/source columns; bottom composer; mobile full-screen source panel | Actual grounded claims and immutable-version citations; empty sources before a question; no fabricated example answers |
| Knowledge library and reader | Role chips, guide card grid, mobile list; article and desktop contents column | Preserve title/role filters, safe Markdown and real line-based heading anchors |
| Learner checklist and role variants | Compact rows with left checkbox, readable stages, separated guide/question actions | Keep instructions, eight real tasks, self-completion, per-role progress and independent chat scope |
| Administrator documents and upload | Upload dialog and desktop list/mobile cards | Keep validation, retry, candidate inspection and strict server write authorization |
| Administrator checklists | Compact expandable task rows, role heading and save actions | Preserve keyboard ordering, staged tasks, CAS conflicts and dirty-navigation protection |
| Menu, role selection, reset and task completion | Full-screen mobile Menu, role dialog and fixed current-page navigation; unique dialog identities | Preserve current-browser reset, independent role progress, draft review and public admin read-only limits |

## Verification evidence

- TypeScript and CRLF/repository checks passed during implementation; three tooling regression cases passed.
- Initial browser runs exposed hidden desktop percentages, a hidden mobile empty-role message and Menu cancellation leaving the editor covered. Those regressions were corrected. The combined 108-case run then passed 105 cases with one desktop-only mobile skip; the two new keyboard cases exposed hydration focus loss. The editor now enables controls after hydration and keeps disclosure state native. Final focused verification passed all 24 desktop/mobile cases, including both formerly failing keyboard cases, concurrent edits, task ordering and public admin restrictions. The separate source-panel answer journeys also passed in both viewport modes.
- Final mobile anchors at390x1000: heading y154, hero y326.1/height210.2, progress y558.3/height136 and bottom navigation y924/height76.
- Measured desktop anchors: content x292/y104, hero x292/y214.9, width1108/height200, statistics y440.9; sidebar help/footer y725.6. Mobile bottom navigation y924/height76 at390x1000. The final spacing refinement preserves these anchors.
- New observable journeys cover role selection, mobile Menu/Sources, reader contents and compact editing. Existing upload/navigation/checklist/privacy/admin tests remain regression gates.

## Consent and boundaries

Visual alignment is within the approved scope. Keep fictional demo data and existing provider, authentication, quota and publication rules. No new department model, manager approval, infrastructure, CI or hooks. No secrets, runtime provider calls or native file mutations are needed for local UI verification.

## Review notes

React review checked server/client serialization, hook cleanup, unique native-dialog IDs, keyboard focus, keyed task identity, SSR-safe storage reads and existing authorization boundaries. Editor-only draft keys are removed before API submission; new task IDs are still assigned by the database. Actual source-panel links were opened through the browser to the supporting passage on desktop and mobile. Public admin writes remain guarded in both application and database tests. All runtime source changes are presentation/state-readiness changes; no migration or provider configuration changed.

## Local completion gate

Production build, TypeScript, Prettier for affected layout components, repository CRLF/ticket checks (257 files), three tooling cases and diff checks passed. The native design Git blob still exactly matches the tracked version; only the app and supporting documentation/tests changed. Hosted verification uses public demo accounts, scoped preview protection access and zero model calls/shared-content writes.

## Library filter follow-up — October 24, 2026

User approved removing the duplicate role controls. Desktop now shows role chips and a title search with its Apply filters action; mobile shows the dropdown and title search. The same server form retains the applied role when a desktop title search is submitted. Existing library journeys exercise the visible control for each viewport and assert that the alternate role control is hidden. The four existing desktop/mobile role/title-search journeys passed with the correct control visible per viewport, preserved role/title queries, refresh/reader return and independent chat scope. TypeScript, production build and CRLF/diff checks passed. Hosted results are recorded in this follow-up pull request.
