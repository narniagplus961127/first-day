# FirstDay RAG journey tickets

The user approved eight implementation tickets on October 21, 2026. All eight tickets are resolved on integration branch integrate/firstday-rag; final integration review is complete.

Canonical specification: [First complete onboarding RAG journey](../onboarding/spec.md).

| Ticket | Blocked by | Progress |
| --- | --- | --- |
| [01: Demo login and protected administrator access](issues/01-demo-login-and-admin-access.md) | None | Resolved |
| [02: Upload and inspect a knowledge document](issues/02-upload-and-inspect-knowledge.md) | 01 | Resolved |
| [03: Index and publish a readable guide](issues/03-index-and-publish-guide.md) | 02 | Resolved |
| [04: Ask a question and inspect its evidence](issues/04-answers-with-evidence.md) | 03 | Resolved |
| [05: Continue and reset a private demo conversation](issues/05-private-followup-conversations.md) | 04 | Resolved |
| [06: Replace a guide without interrupting answers](issues/06-safe-document-replacement.md) | 04 | Resolved |
| [07: Enforce demo limits and handle provider failures](issues/07-demo-limits-and-provider-failures.md) | 04 | Resolved |
| [08: Verify the complete hosted journey](issues/08-verify-hosted-journey.md) | 05, 06, 07 | Resolved |

## Frontier

Tickets 01 through 08 are resolved. The hosted journey passed on the actual production alias. Final Standards and Spec reviews are complete; all four Standards findings and one Spec finding are fixed and verified.

## Working rules

- Use the canonical specification for shared product/provider decisions and scope boundaries.
- Reuse the approved native design; preserve any manual edits and omit preview exports.
- Each ticket verifies its own observable browser/API behavior; the final ticket checks real integrations and the hosted path.
- Verify actual model access and configuration as integrations are introduced. No credentials or infrastructure have been provisioned by publishing tickets.
- Complete shared demo limits before exposing the public hosted application. Check free-plan eligibility before deployment.
- Full checklists and additional role datasets remain follow-on scope.

## Next

Ticket 08 is resolved with actual hosted verification. The final two-axis review from baseline 7f596f6 is complete, with all five findings resolved and integrated. No GitHub push or pull request is authorized.

## Service verification baseline

- Dedicated FirstDay Supabase project ohvojrdwxlsbzwdrhpzr, free organization, Singapore; unrelated projects are untouched.
- Live checks returned HTTP 200 for Supabase public Auth and administrator API, Groq openai/gpt-oss-20b, and Google gemini-embedding-2 with 768 output dimensions.
- These are access/shape smoke checks, not yet evidence that the complete application journey works.
- Secrets are stored only in the ignored root .env.local. All text files must use CRLF.
- An isolated local Supabase fixture runs at loopback API port 55421 and database port 55422, separate from the existing HR test stack.
## Recovered session checks (October 22, 2026)

- Vercel connector access is restored: an explicit team-scoped project request succeeded. No FirstDay deployment exists yet.
- Cloud migration knowledge_documents, version 20261022033938, is applied; both knowledge tables have RLS enabled.
- Public signup is now disabled, verified through the live Auth settings API after the user saved the change. Existing demo/admin identities remain provisioned.

## Ticket 03 integration evidence

- Initial indexing/publication and learner library/active reader merged from implement/ticket03.
- Cloud migrations 20261022040150_knowledge_indexing and 20261022040529_knowledge_read_policies are applied and local filenames match cloud history.
- Real Google smoke published a fictional guide with two 768-dimensional vectors; learner reading returned 200 and learner indexing returned 403.
- Full postmerge typecheck/build, 14 knowledge tests, and 14 auth tests passed in the implementer worktree.

## Ticket 04 integration evidence

- Grounded answers, role-scoped active-version retrieval, and exact-version source inspection merged from implement/ticket04.
- Cloud migration 20261022042120_knowledge_retrieval is applied and its local filename matches cloud history.
- A separate production-build smoke used real Google/Groq to preserve the fictional setup command and environment-file instruction, opened the supporting source, and returned no_evidence for an absent vacation-policy fact.
- Implementer checks passed: typecheck/build, 24 knowledge tests, and 14 auth tests. Root dependency installation and typecheck are checked after merge.

## Ticket 05 integration evidence

- Browser-local scope-specific conversations, bounded contextual follow-ups, and confirmed local reset merged from implement/ticket05.
- No central conversation store or schema change was introduced; source identities remain version-specific.
- Implementer checks passed: 36 real-Supabase knowledge tests, 14 auth tests, typecheck, production build, CRLF and diff checks.
- Dependencies are unchanged from the verified ticket 04 baseline; root typecheck and merge checks are recorded after integration.

## Ticket 06 integration evidence

- Safe candidate replacement, atomic publication, revision conflicts, bounded retention, and exact-version citation feedback merged from implement/ticket06.
- Cloud migrations 20261022144226_knowledge_replacement and 20261022144243_knowledge_candidate_retention are applied; local filenames and fixture ledger match cloud history.
- Implementer checks passed: 48 real-Supabase knowledge tests, 14 authentication journeys, typecheck, production build, CRLF and diff checks. Dependencies are unchanged; root typecheck and merge checks passed after integration.

## Authorization decision (October 22, 2026)

The user explicitly preapproved routine schema/function migrations and bounded revision cleanup for the dedicated FirstDay Supabase project ohvojrdwxlsbzwdrhpzr. This is project-scoped standing authorization. Plugin permission settings remain unchanged because the available controls apply Supabase-wide.

## Ticket 07 integration evidence

- Durable per-IP and shared daily admission, bounded provider calls, actionable quota/network feedback, and explicit retry behavior merged from implement/ticket07 at ddba72a.
- Cloud migration 20261022143627_chat_admission is applied; local migration filename and fixture ledger match cloud history. No cloud changes were made during integration.
- Combined implementer verification passed: 62 real-Supabase desktop/mobile knowledge journeys, including fourteen limits cases, 14 authentication journeys, typecheck, production build, and CRLF/diff checks.
- Dependencies are unchanged; root typecheck and changed-text CRLF/diff checks passed after integration. Approved native design, ignored .env.local, and devIndicators: false remain preserved.

## Ticket 08 hosted evidence

- Production https://firstday-lilac.vercel.app; deployment dpl_2sB2zyF77ie7g4Q3PPw1Nwp5V5dv READY, app commit ab8a7b0.
- Exact authorized Hobby target qw-e7b7/firstday, project prj_0yTgxpAv4IlJ53pVjTKWamIT6Dxg; default resources, no Git connection or protection changes.
- Real hosted fictional upload, 4/7 persisted indexing/resume, learner read, exact-command citation, contextual follow-up, absent-fact response, safe replacement/old source, isolated browser/scope history/reset, learner/anonymous denials and desktop/mobile keyboard paths passed. Four actual questions and fourteen document embeddings; no live quota load test.
- Friendly storage fallback added after public browser RED from a reversible local REST outage. Both desktop/mobile GREEN; dedicated fixture restored. Typecheck/build, script syntax, all tracked text CRLF and diff checks passed. Earlier combined62 knowledge+14auth coverage remains applicable.
- README and docs/hosted-verification.md record reproduction, exact evidence IDs, processing/default bounds, free availability/restore limits and secret-safe smoke. Cloud remained healthy with seven matching migrations. No paid service, unrelated project change, cloud outage or shared counter reset.

## Final user-requested hosting additions

- Existing FirstDay project connected to narniagplus961127/first-day; production branch main, other branches enabled for protected previews, affected-project skip disabled and no ignored-build command. Fork/SSO protections preserved; Production+Preview runtime configuration verified. No Git push/main merge or webhook-trigger test occurred.
- Brand vector favicon and explicit all-branch Git configuration committed as 3e06bc5; source-deployed READY as dpl_4w1NtoWJU2v3eSwEWYidbQVdKgeG. Current canonical URL is https://qw-firstday.vercel.app; old firstday-lilac alias now 404. Ticket08 did not change domains.
- Favicon metadata, HTTP 200/image/svg+xml, login, real demo auth, persisted new active guide and historical citation passed on the final deployment with no additional model calls. Exact final IDs/readback and remote-main distinction recorded in docs/hosted-verification.md.

## Ticket 08 integration evidence

- Verified ticket tip e03819d merged with a no-fast-forward merge at 041cf723. All eight tickets are resolved; final Standards and Spec review from baseline 7f596f6 is complete (see final review fixes below).
- Root typecheck passed after merge. Dependencies and approved native design are unchanged; ignored .env.local and devIndicators: false are preserved.
- Changed-text CRLF and diff checks passed after integration. Existing hosted/provider/build and real REST-outage evidence is retained without duplicate live calls or full test runs.

## Final review fixes

All four Standards findings and the Spec P3 language-admission finding are addressed in a single implementer branch. Eight tickets preserve valid triage Status plus separate resolved Progress; two consequential decisions now have ADRs. Upload/chat share a bounded body reader and general public HTTP failures use HttpError. A documented provider-free prose heuristic rejects clearly unsupported language while retaining short technical/Unicode/code guides. Complete original reports, resolutions and focused 42 desktop/mobile public-boundary results are in docs/reviews/final-review.md. Final release identity follows in docs/hosted-verification.md.

Review fixes verified/released: app 9a8886e, READY dpl_AS3DxkkkeSHA5FYPczu24j5Adgfp at https://qw-firstday.vercel.app. All 42 focused desktop/mobile cases, typecheck/build/CRLF passed; actual production favicon/login/active reader/historical source and new language policy persistence passed with zero provider calls. Full reports and resolutions retained in docs/reviews/final-review.md. No Git push/main merge was performed by the implementer.

## Final review integration evidence

- Verified review-fix tip 3664fd1 merged without conflicts at 4fb3d19. Final review is complete: four Standards findings and one Spec finding are fixed.
- Current deployed application is 9a8886e293694f37731d5f88a2835fcd24dabb10, READY deployment dpl_AS3DxkkkeSHA5FYPczu24j5Adgfp at https://qw-firstday.vercel.app. Focused implementer and hosted evidence is retained in docs/reviews/final-review.md and docs/hosted-verification.md.
- Root postmerge typecheck, changed-text CRLF and baseline diff checks passed. Dependencies, native design, ignored runtime environment and devIndicators: false are preserved. No duplicate provider calls/full test runs, push, main merge or deployment occurred during integration.
