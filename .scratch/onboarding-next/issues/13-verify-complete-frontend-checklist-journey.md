# 13: Finish the complete Frontend checklist demo journey

**Milestone:** M7

**What to build:** The eight-task Frontend checklist is a coherent, verifiable onboarding journey with working supported guide/question bindings and reliable local activity.

**Blocked by:** 03: Protect newer checklist saves from stale administrators; 05: Show role progress and next tasks on the learner overview; 06: Preserve accurate progress through checklist changes; 07: Open the current same-role guide from a checklist task; 12: Keep local activity honest when browser storage fails

**Status:** ready-for-agent

**Progress:** resolved

- [x] Curate the eight agreed fictional Frontend tasks in the 2/3/3 stage split and bind only real supporting same-role published knowledge.
- [x] Verify private editing/saving/conflicts, learner completion, overview counts/next tasks and progression to the completed state.
- [x] Verify task edits preserve progress, a replaced guide opens current text, and earlier answer citations still show their original evidence.
- [x] Verify suggested questions protect drafts, require submission, produce supported sources or honest no-evidence, and never complete tasks automatically.
- [x] Verify role/browser isolation, tab interleavings, reset cancellation/confirmation and late-response/storage-failure behavior.
- [x] Check the relevant approved desktop/mobile native design and keyboard journey without preview exports.
- [x] Use deterministic public-boundary tests as the primary seam; any separately authorized live smoke is small, records actual versions and respects limits.
- [x] Record outstanding release prerequisites honestly; do not mark this gate resolved until its complete acceptance journey passes.

## Evidence — October 23, 2026

- Added a coherent fictional Lumen Frontend guide and eight real supported task questions in docs/samples/frontend.md and frontend.json. The exact original starter is upgraded with stable task IDs; customized snapshots/candidates are preserved. No unrelated Frontend document is renamed or replaced.
- npm run prepare:sample -- frontend orchestrates only normal authenticated Markdown upload, exact-candidate indexing and revision-checked checklist saves. A nullable unique predefined sample identity plus serialized first creation prevents concurrent duplicate documents. The ordinary upload remains unchanged; sample reruns return the existing candidate for comparison, never overwrite it. See docs/samples/README.md for private environment setup and divergence/retry behavior.
- TDD: a valid concurrent public upload first returned two different document IDs; the additive identity migration and existing upload integration made the same test pass. The missing preparation command was exercised before implementation, then the original eight-task upgrade and unchanged rerun passed.
- tests/knowledge/role-samples.spec.ts: eight desktop/mobile safety checks passed, covering concurrent first creation, preserved customized candidate, role mismatch/learner rejection, unchanged rerun, original task IDs and completion, customized checklist/guide preservation without provider calls, interrupted indexing with exact-version resumption and unpublished privacy.
- tests/knowledge/frontend-journey.spec.ts uses the shared roleJourney pattern: both desktop/mobile passed eight tasks and 2/3/3 stages, actual guide reading, protected existing draft with keep/replace, explicit submission, exact published document/version citation and source passage, grounded contextual follow-up, separate role histories/drafts, keyboard Space completion, completed overview, browser isolation, keyboard cancellation/confirmation, reset and missing-fact empty retrieval with no Groq generation. Its final two-case rerun after the history/draft/follow-up additions passed.
- Fourteen focused inherited desktop/mobile checks passed on this implementation: stale administrator save/reload; clarification/reordering/replacement reconciliation; current guide replacement with old citation provenance; interleaved task tabs; reset with a late answer; blocked-write temporary activity across client navigation; temporary completed answers across navigation and honest reload loss. Existing richer tests from tickets 03–12 remain the broader acceptance record.
- Native FigCraft read-only info/node.get inspected desktop/mobile overview (6/28), checklist (10/32) and reset (14/38) frames; approved light orange layout and stage/card/guide/reset intent retained. The accepted eight-task count and full storage/reset explanation supersede illustrative prototype counts/copy. Browser checks verify narrow-screen reachability/no horizontal overflow and real keyboard completion/reset. Native binary unchanged; no design previews exported.
- TypeScript and repository CRLF/ticket checks passed. Local Supabase security advisors reported no issues. The optimized production build passed (all routes compiled and static pages generated).

## Release prerequisites

This is the completed local Frontend gate. The new migration and sample have only been applied/published to the isolated fixture. No cloud migration, production content change, live provider request, Git push or hosted deployment was performed for ticket 13. Ticket 20 still owns final combined review and authorized release checks; the existing hosted main deployment does not contain this work. Controlled providers prove public application contracts and exact source provenance, not live model semantic quality.
