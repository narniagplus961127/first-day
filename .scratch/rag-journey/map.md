# FirstDay RAG journey tickets

The user approved eight implementation tickets on October 21, 2026. Implementation is underway on integration branch integrate/firstday-rag.

Canonical specification: [First complete onboarding RAG journey](../onboarding/spec.md).

| Ticket | Blocked by | Progress |
| --- | --- | --- |
| [01: Demo login and protected administrator access](issues/01-demo-login-and-admin-access.md) | None | Resolved |
| [02: Upload and inspect a knowledge document](issues/02-upload-and-inspect-knowledge.md) | 01 | Resolved |
| [03: Index and publish a readable guide](issues/03-index-and-publish-guide.md) | 02 | Resolved |
| [04: Ask a question and inspect its evidence](issues/04-answers-with-evidence.md) | 03 | Resolved |
| [05: Continue and reset a private demo conversation](issues/05-private-followup-conversations.md) | 04 | Resolved |
| [06: Replace a guide without interrupting answers](issues/06-safe-document-replacement.md) | 04 | Resolved |
| [07: Enforce demo limits and handle provider failures](issues/07-demo-limits-and-provider-failures.md) | 04 | In progress |
| [08: Verify the complete hosted journey](issues/08-verify-hosted-journey.md) | 05, 06, 07 | Blocked by 07 |

## Frontier

Tickets 01 through 06 are resolved and merged. Ticket 07 is in progress and is the remaining dependency frontier. Ticket 08 stays blocked until ticket 07 completes.

## Working rules

- Use the canonical specification for shared product/provider decisions and scope boundaries.
- Reuse the approved native design; preserve any manual edits and omit preview exports.
- Each ticket verifies its own observable browser/API behavior; the final ticket checks real integrations and the hosted path.
- Verify actual model access and configuration as integrations are introduced. No credentials or infrastructure have been provisioned by publishing tickets.
- Complete shared demo limits before exposing the public hosted application. Check free-plan eligibility before deployment.
- Full checklists and additional role datasets remain follow-on scope.

## Next

Ticket 06 is resolved and merged, with 48 real-Supabase desktop/mobile knowledge tests, 14 authentication journeys, typecheck, and production build passed in its worktree. Continue ticket 07, then verify ticket 08 after it completes. The dedicated services and credentials are configured and passed access checks.

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
