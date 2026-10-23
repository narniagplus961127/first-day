# 04: Complete and revisit a role checklist privately

**Milestone:** M5

**What to build:** Learners choose a role, follow its grouped checklist, toggle task completion and retain their own progress after navigation and reload.

**Blocked by:** 01: Publish and read an administrator-defined role checklist

**Status:** ready-for-agent

**Progress:** resolved

- [x] Render tasks in the saved three-stage order with accessible complete/incomplete controls.
- [x] Persist bounded validated completion per role/task in the browser, independently of shared demo authentication.
- [x] Show equal-weight completed/total and percentage for nonempty checklists; empty roles show coming soon without 100%.
- [x] Default onboarding to Frontend Developer and remember the selected onboarding role without changing chat scope.
- [x] Retain completion across reload and role changes; undo works and another browser context stays separate.
- [x] Keep storage failure honest and integrate basic Reset demo compatibility rather than deferring privacy until final review.
- [x] Test desktop/mobile public learner journeys with real shared checklist reads and two isolated browser contexts.

## Evidence

- Public authenticated browser/API seam with real isolated Supabase checklist reads: six desktop/mobile journeys passed, covering keyboard completion, saved stage order, 33% progress, undo/reload, remembered role, separate visitor contexts, all-complete feedback, Reset demo and blocked-storage feedback.
- Initial RED: the published checklist rendered no completion count/control. A second RED verified that Reset demo confirmation omitted checklist progress; its copy now includes progress.
- Browser-local versioned progress validates at most 40 UUID task identities per each of five roles, prunes removed tasks against the current published definition and keeps chat scope independent.
- Approved FigCraft frames 08 Checklist and M07 Checklist inspected through native read-only CLI, without preview exports. Existing warm palette/cards and accessible checkbox/progress controls retained.
- npm run typecheck, npm run build and npm run check:repo passed. Cross-tab/reset race assurance remains in tickets 10–12; learner overview remains ticket 05.
