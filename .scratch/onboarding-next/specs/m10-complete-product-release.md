# M10 — Complete-product design review and release

Status: ready-for-agent

## Problem Statement

Individually implemented features do not establish that the complete five-role onboarding demo matches the approved design or remains reliable when navigation, task edits, knowledge updates and local activity interact.

## Solution

Verify and finish the integrated five-role desktop/mobile product, reconcile any remaining approved-design gaps, document the current release and prove the actual Git-triggered production deployment.

## User Stories

1. As a learner, I want to use one coherent five-role onboarding experience, so that I can understand where to go and what remains.
2. As a learner, I want to see consistent role and search-scope labels, so that I can avoid confusing relevance with authorization.
3. As a mobile learner, I want to navigate checklist, overview, library, chat and sources, so that I can complete the whole journey on my device.
4. As a keyboard user, I want to reach controls, dialogs and task actions predictably, so that I can use the full product accessibly.
5. As an administrator, I want to maintain guides and checklists together, so that I can keep onboarding content current.
6. As a learner, I want to retain progress through supported task and guide updates, so that I can continue without stale or lost activity.
7. As a demo visitor, I want to reset my local activity without affecting others, so that I can restart safely.
8. As a learner, I want to receive useful empty and failure states, so that I can know what to do when content or storage is unavailable.
9. As a maintainer, I want to compare implementation with approved native frames, so that I can close actual design gaps.
10. As a maintainer, I want to reuse valid prior evidence, so that I can avoid unnecessary repeated live-provider calls.
11. As a project owner, I want to release the exact reviewed commit through Git, so that I can trust the deployed version.
12. As a project owner, I want to verify Singapore region and core production health, so that I can preserve the demonstrated navigation improvement.
13. As a future contributor, I want to find current run and milestone documentation, so that I can resume work without stale assumptions.
14. As a demo owner, I want to retain secret boundaries and the agreed free-provider behavior, so that I can operate the public demo predictably.
15. As a project owner, I want to see which milestones remain incomplete, so that I can avoid declaring success before their release gates pass.

## Implementation Decisions

- Treat this as cross-feature integration and release sign-off, not the first authorization, mobile, error-handling or accessibility test. Each earlier ticket owns its relevant quality checks.

- Reconcile the actual five-role application with the approved native FigCraft overview, checklist, editor, library, chat and source interactions. Preserve manual design edits and do not export preview images. Fix only gaps within the agreed product.

- Check the full path: demo popup/login, role overview, checklist completion, title/role discovery, latest-guide action, suggested question/draft protection, supported answer/citation, no-evidence and confirmed reset, plus private admin changes and conflict feedback.

- Verify shared task/document changes and local browser progress together, including cross-tab reset fencing and independently selected onboarding/library/chat scopes.

- Keep the existing TypeScript application, Supabase authority boundary, Google embedding configuration, direct Groq generation, request limits, no paid fallback and Singapore function region. Do not add infrastructure, CI or hooks as a release shortcut.

- Inspect public client assets and selected release outputs for configured server/provider/admin secrets using private comparisons; do not print secret values or retain credential-bearing traces.

- Record the intended team/project, exact Git SHA, deployment identity, region, READY state, production alias and measured checks. Keep current-state documentation distinct from historical evidence.

- Verify normal branch-preview and main-production behavior against the actual Git-triggered release, within the user's release authorization. Planning/ticket publication alone does not authorize pushing, merging or deploying.

- Run the existing appropriate local checks and the reusable read-only release/navigation tools. Reuse still-applicable current-version provider evidence; keep any additional live-provider smoke small and separate.

- If a required release step is awaiting external access, authorization or a user-performed merge, record it as outstanding rather than marking the milestone resolved. Do not induce cloud outages, reset shared usage or fabricate hosted success.

## Testing Decisions

- Run the combined observable browser/public API acceptance journeys against real isolated persistence with controlled providers, exercising the five-role interactions rather than internal component shapes.

- Cover desktop/mobile and keyboard navigation, forms, dialogs, empty/completed/error states, guide/citation behavior, draft protection, role/browser isolation and tab/reset races.

- Verify scope labels, denied learner/anonymous mutation, and compatibility of pre-existing saved chats.

- Run a small actual-host smoke only when release is authorized; use the existing secret-safe release/latency checks and record exact commit/deployment matching.

- Review the final change set for documented standards and spec coverage, fix any in-scope findings, and preserve the existing test seam. Do not turn the release into a live load test.

## Out of Scope

- Optional expansion features, redesign, preview exports, analytics, new monitoring automation, infrastructure migration, CI/hooks and ignored retrospective repairs.
- GitHub mutations or production deployment as a side effect of writing this planning package.

## Further Notes

Ticket 20 is the full-product release gate and depends on the Frontend integration, discovery and all four role releases. User authorization on October 23, 2026 accepts the recommendations, test seam and publication of local specifications/tickets without further approval. This does not start implementation or authorize GitHub publication or a release.
