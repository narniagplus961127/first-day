# FirstDay onboarding programme review

Review date: October 24, 2026. Baseline: deployed main 1d5efea5e9214c2ebf4c006248419af77a838a45. Final application tip reviewed: a648fe7d5155b939df204e17068fc2c397ba0437. Standards and Spec were reviewed independently; subsequent release-record commits contain documentation only.

## Standards

Initial review identified one heuristic, possible Speculative Generality: ChecklistView retained an unused learner mode even though learners use LearnerChecklist. The single final implementer removed the mode and caller flag. Final review found no hard documented-standard breaches and no remaining actionable heuristics.

## Spec

Initial review identified one M4 gap: unsaved editor changes could be discarded through client navigation. The single final implementer added link confirmation and supported cancelable browser Back/Forward protection, preserving drafts and history. Role-change and native unload guards remain; unsupported history protection is explained. Final review found no remaining actionable requirements findings.

Standards: 0 remaining findings. Spec: 0 remaining findings. Neither code review substitutes for actual hosted-release verification.

## Verification

- One full real-fixture, controlled-provider desktop/mobile run: 186/190 passed. Four failures were two stale test issues repeated per viewport; restored-state waiting and canonical storage-copy assertions were corrected and passed subsequently.
- Final focused run: 57/58 passed, including all 12 new editor-navigation cases and all four corrected cases. One setup request ended without an HTTP response (ECONNRESET); its evidence was preserved. The exact navigation test then passed independently on desktop and mobile (2/2). No automatic retry or unproven root-cause claim was added.
- All five role journeys passed both viewports, including the previously intermittent HR guide navigation. Authorization, coherent task saves, progress, sources, drafts, reset races, browser privacy and storage failures have current public-boundary evidence.
- TypeScript, production build, repository CRLF/ticket rules, three tooling tests and whitespace checks passed. Private configured-secret comparison passed for source and public outputs. Approved native FigCraft binary remained unchanged; no previews were exported.

See the complete evidence and hosted-release gates in [.scratch/onboarding-next/issues/20-verify-five-role-product-release.md](../../.scratch/onboarding-next/issues/20-verify-five-role-product-release.md). The programme [delivery map](../../.scratch/onboarding-next/map.md) records current release state.

## Hosted release

PR #5 merged application release f0e7c575e5c512defe197cf6340e082261f23aa6. Git preview and main-production READY/sin1 checks, five-role cloud preparation, exactly two live questions, browser/privacy/reset checks and the production navigation benchmark passed. Exact identities and measured results are preserved in [hosted verification](../hosted-verification.md). The post-release closure changes only documentation; application code remains the independently reviewed tip.
