# 07: Open the current same-role guide from a checklist task

**Milestone:** M6

**What to build:** Administrators attach published same-role guides, and learners open current instructions from tasks without changing completion or historical answer citations.

**Blocked by:** 04: Complete and revisit a role checklist privately

**Status:** ready-for-agent

**Progress:** resolved

- [x] Offer an optional same-role published guide selector in the administrator task editor.
- [x] Validate wrong-role, missing and unpublished associations at the server save boundary.
- [x] Resolve the maintained knowledge document to its latest active published version when the learner opens it.
- [x] If unavailable later, keep the task and its completion and show an unavailable action instead of silently substituting another guide.
- [x] Preserve exact-version links for pre-existing answer citations after guide replacement.
- [x] Prove the private association → learner action → active reader path and replacement/unavailability behavior on desktop/mobile.

## Evidence

- True RED: the authenticated administrator journey failed at the missing Guide selector before implementation. The first minimal implementation passed the guide-selection, learner-open and replacement/citation journey on desktop and mobile.
- Final real-fixture browser/API checks: two journeys on desktop and mobile, four passing checks. Published same-role guide selection opens current instructions; replacement keeps completion and old answer citations at their exact original version. Missing, wrong-role and unpublished references are rejected atomically through the application API, authenticated RPC and direct Data API. A later unavailable guide keeps the completed task, explains unavailable instructions and safely handles a previously rendered link.
- New migration updates the existing SECURITY INVOKER snapshot trigger, with empty search_path and revoked direct function execution; existing RLS, authentication and revision/identity bounds remain. The maintained document identity is stored, with a canonical UUID; suggestedQuestion remains reserved as null for Ticket 09. Final trigger DDL was verified only on the dedicated isolated local fixture.
- TypeScript check, production build and repository CRLF check passed. React guidance reviewed: parallel independent server reads, labelled native selector, explicit save, text-only unavailable feedback, no browser activity mutation on guide navigation, and no link prefetch of a potentially stale guide resolution.
- Approved native FigCraft desktop/mobile checklist and administrator frames inspected without exports. No cloud migration, provider/model change, push or deployment.
