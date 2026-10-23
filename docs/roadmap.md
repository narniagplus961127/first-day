# FirstDay product roadmap

Planning snapshot: October 23, 2026. The user wants gradual future implementation, not immediate development. Completed status reflects the implemented RAG journey and verified PR #4 production release at 1d5efea in Singapore. The user accepted all 20 design/planning recommendations and authorized the milestone specifications and ticket publication. The delivery graph defines real prerequisites; implementation remains future work.

## Completed foundation

| Milestone                                      | Status   | Delivered outcome                                                                                                                                                                                                 |
| ---------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1 — Product design and application foundation | Complete | Approved native FigCraft desktop/mobile design, TypeScript app, warm-orange identity, working learner shell and favicon.                                                                                          |
| M2 — Complete onboarding RAG journey           | Complete | Public demo popup/login, private admin, protected Markdown upload, resumable indexing, learner reading, grounded answers/citations, contextual role-scoped follow-ups, no-evidence feedback and safe replacement. |
| M3 — Public demo hosting and operation         | Complete | Browser-local chat/reset, durable demo limits, provider failure feedback, Supabase/Vercel configuration, Git preview/production deployment, Singapore function region and measured navigation improvement.        |

The original eight RAG implementation tickets belong to M1–M3; they are not eight additional pending product milestones.

## Specified gradual delivery

| Milestone                                         | Depends on        | Outcome and completion boundary                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M4 — Checklist administration                     | M1–M3             | Shared one-checklist-per-role definitions; task title/stage/instructions/optional same-role guide/question; add/edit/reorder/move/remove; valid whole-list Save changes; private authorization, safe failures and stale-save conflict handling. Seed eight fictional Frontend tasks; other role datasets remain empty.              |
| M5 — Frontend learner checklist and overview      | M4                | Grouped checklist, reversible self-completion, equal-weight count/percentage, remembered onboarding role, overview progress and next three incomplete tasks. Preserve progress through ordinary edits/reordering; added tasks unchecked, deleted tasks excluded. Empty roles show coming-soon rather than 100%.                     |
| M6 — Checklist-to-RAG journey and question drafts | M4–M5             | Latest-active guide links, honest unavailable links, role-scoped editable suggested questions, explicit submission, independent All roles chat option, protected unfinished questions per scope and retained completed history. AI never automatically completes a task.                                                            |
| M7 — Integrated local activity and reset          | M5–M6             | Full checklist/chat/draft reset and cancellation; same-browser tab synchronization, unrelated task changes preserved, latest same-task action wins, no stale resurrection; other browsers isolated; honest blocked-storage behavior. Finish the complete Frontend checklist acceptance journey.                                     |
| M8 — Knowledge discovery                          | M2                | Role grouping/filtering and document-title search alongside the existing reader. Filters affect relevance rather than access; handle empty results and retain navigation performance. This was in the approved full-product design but not in the first RAG implementation. Can be scheduled earlier if preferred.                  |
| M9 — Complete the other four role datasets        | M4–M7; M8 helpful | Deliver four small content releases: M9a Backend Developer, M9b Designer, M9c Business Analyst, M9d HR. Each adds fictional published guides, that role's checklist and appropriate guide/question links, and verifies a supported question, matching citation, absent fact and completion journey. Reuse the established features. |
| M10 — Complete-product design review and release  | M7–M9             | Reconcile the full five-role desktop/mobile app against the approved native design; verify keyboard paths, scope labels, empty/error states, draft protection, progress/reset isolation and RAG regression coverage. Update current-state/run documentation and confirm the release through actual Git-triggered deployment.        |

M4–M7 are small implementation increments of the agreed Frontend checklist milestone. Treat them as one release gate for the full checklist journey; maintain a working RAG demo while building. Every increment includes its own relevant authorization, failure and accessibility checks. M10 is integration sign-off, not the first time quality is checked.

The existing free-tier stack and direct Google/Groq approach remain the project constraints. No new provider or paid service is introduced by this roadmap.

## Coverage check against the agreed product

- Login and demo credential popup: M2, complete.
- Administrator knowledge upload/status/retry/replacement: M2, complete.
- Chat, contextual follow-ups, exact-version citations and no-evidence: M2, complete; checklist handoff/drafts extend it in M6.
- Learner overview: basic screen exists; role introduction/selection, actual progress, next tasks and task-derived suggested questions complete in M5–M6.
- Knowledge library: reading exists; role discovery and title search remain M8.
- Learner checklists and administrator editor: M4–M7.
- Five role-specific knowledge/checklist experiences: M9 after the Frontend journey.
- Browser privacy, reset, mobile and keyboard behavior: implemented for existing RAG and extended/verified with each checklist increment and M7/M10.
- Approved native design/prototype: already delivered; reuse existing frames and reconcile implemented states, without preview exports.

The easily missed pieces are the richer learner overview, library title search/role filtering, the remaining four role datasets, question-draft protection, and cross-tab reset consistency. They are explicitly assigned above.

## Outside the agreed roadmap

These are possible future discussions, not missing requirements: PDF/image/OCR uploads; Obsidian or repository synchronization; personal accounts and cross-device progress; departments or multiple organizations; deadlines/reminders; manager approval or reporting dashboards; analytics; AI tool actions or automatic completion; multilingual ingestion; paid-provider fallback.

The remaining retrospective checker fixes were explicitly deferred. CI and pre-commit wiring remain excluded. They are not silently added to any milestone here.

## Planning sources

- [Agreed checklist brief](../.scratch/checklists/brief.md)
- [Checklist interview decisions](../.scratch/checklists/map.md)
- [Approved design brief](../.scratch/onboarding/design-brief.md)
- [Original RAG specification](../.scratch/onboarding/spec.md)
- [RAG progress and verification history](../.scratch/rag-journey/map.md)

The user subsequently authorized planning all M4–M10 with the recommendations and waived further approval. The [published programme specification](../.scratch/onboarding-next/spec.md) links seven detailed milestone specifications; the [delivery map](../.scratch/onboarding-next/map.md) lists 20 individual vertical tickets and blocking edges. All are ready-for-agent with implementation not started. When resuming, choose a ready ticket or a bounded milestone batch rather than treating this publication as authorization to implement the entire roadmap.
