# FirstDay design brief

Status: approved

The user approved this brief and instructed proceeding. They subsequently requested the native FigCraft file and prototype only, without preview exports.

## Confirmed product behavior

FirstDay is a TypeScript onboarding RAG demo with five job roles: Frontend Developer, Backend Developer, Designer, Business Analyst, and HR. Every learner can access every role's documents and switch roles freely. Each role has a self-completed checklist with separate progress. Administrators upload Markdown documents and manage checklists.

The login page exposes public learner demo credentials in a popup with copy and fill-form actions. A separate private administrator account manages the sample content. There is no public registration. Demo chats and checklist progress persist in the visitor's browser rather than being shared with other visitors. A Reset demo action clears that browser's demo activity.

## Confirmed visual direction

Light surfaces, light orange accents, a navigation sidebar, source citations beside chat answers, and desktop and mobile layouts.

## Proposed design scope for review

1. Login: email/password form, View demo account trigger, loading and invalid-login states.
2. Demo credentials popup: copy credentials, fill login form, and browser-local demo activity explanation.
3. Learner overview: role selector, role introduction, progress summary, next tasks, and suggested questions.
4. Ask FirstDay: chat with streaming, source citations, and states for empty chat, missing evidence, and request failure.
5. Knowledge library: documents grouped or filtered by job role, with title search and a document reader.
6. Onboarding checklist: task groups, completion controls, and completion state.
7. Administrator knowledge management: Markdown upload, job-role assignment, indexed/pending/failed status, and error feedback.
8. Administrator checklist editor: choose role, add/edit/reorder tasks, and save feedback.

Desktop frames target 1440px width and mobile frames target 390px width. Mobile uses a collapsible navigation drawer and source details rather than a permanent citation column.

## Proposed interaction details for review

- The selected role sets the default chat retrieval scope; an explicit All roles option broadens retrieval. Job-role filtering is a relevance control, not an access restriction.
- Switching roles selects that role's checklist and chat context; the interface labels the active scope.
- Reset demo asks for confirmation before clearing this browser's demo chats and all role progress.
- Admin screens and admin credentials are unavailable through the public demo account.
- Demo source documents use fictional company content.

## Deliverables after approval

- Native editable design: design/FirstDay.figcraft.
- Review the native file and its linked prototype directly in FigCraft; preview exports are omitted at the user's request.
- A documented palette, typography, spacing, and reusable controls within the design file.
- Application development begins after review of the design.
