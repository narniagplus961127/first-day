# 05: Show role progress and next tasks on the learner overview

**Milestone:** M5

**What to build:** The overview reflects the same role and progress as the checklist, highlights up to three next incomplete tasks, and offers meaningful empty/completed states.

**Blocked by:** 04: Complete and revisit a role checklist privately

**Status:** ready-for-agent

**Progress:** resolved

- [x] Share remembered onboarding role between overview and checklist and show an appropriate role introduction.
- [x] Display consistent completed/total, percentage and up to three next incomplete tasks in saved order.
- [x] Task navigation opens the relevant checklist position and does not imply automatic task completion.
- [x] Unconfigured roles show coming soon; a failed read shows retry guidance rather than a fabricated empty checklist.
- [x] All tasks complete produces restrained congratulations and continuing guide/chat actions without points, certificates or forced progression.
- [x] Verify toggle/undo/navigation/reload updates and keyboard/mobile interaction through visible outcomes.

## Evidence

- Public authenticated browser/API journeys using the real isolated Supabase fixture passed on desktop and mobile: completion/undo/navigation/reload, keyboard task links, next three incomplete tasks, saved stage order, remembered empty role and independent All roles chat scope, all-complete guide/chat actions, and failed-read retry without losing progress. Three journeys, six desktop/mobile checks passed (four plus two focused retry checks).
- True RED before implementation: overview lacked the role/progress surface. A second true RED exposed the missing completed-checklist message before that state was implemented. The retry coverage verified the initial error path without requiring additional application changes.
- Production build and TypeScript check passed. React checklist reviewed: browser-only storage stays in effects/events, stale role reads are aborted, counts are derived from current published task identities, labelled native controls and real links remain keyboard accessible.
- Approved native FigCraft desktop/mobile overview frames and manifest inspected without exports. No schema, authentication, cloud deployment, or model-provider changes.