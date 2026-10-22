# FirstDay RAG journey tickets

The user approved eight implementation tickets on October 21, 2026. Implementation is underway on integration branch integrate/firstday-rag.

Canonical specification: [First complete onboarding RAG journey](../onboarding/spec.md).

| Ticket | Blocked by | Progress |
| --- | --- | --- |
| [01: Demo login and protected administrator access](issues/01-demo-login-and-admin-access.md) | None | Resolved |
| [02: Upload and inspect a knowledge document](issues/02-upload-and-inspect-knowledge.md) | 01 | Resolved |
| [03: Index and publish a readable guide](issues/03-index-and-publish-guide.md) | 02 | In progress |
| [04: Ask a question and inspect its evidence](issues/04-answers-with-evidence.md) | 03 | Not started |
| [05: Continue and reset a private demo conversation](issues/05-private-followup-conversations.md) | 04 | Not started |
| [06: Replace a guide without interrupting answers](issues/06-safe-document-replacement.md) | 04 | Not started |
| [07: Enforce demo limits and handle provider failures](issues/07-demo-limits-and-provider-failures.md) | 04 | Not started |
| [08: Verify the complete hosted journey](issues/08-verify-hosted-journey.md) | 05, 06, 07 | Not started |

## Frontier

Tickets 01 and 02 are resolved and merged. Ticket 03 is the current dependency frontier. Every ticket has ready-for-agent triage status; blocked tickets become executable only after their listed blockers complete. Tickets 05, 06, and 07 may proceed independently after 04.

## Working rules

- Use the canonical specification for shared product/provider decisions and scope boundaries.
- Reuse the approved native design; preserve any manual edits and omit preview exports.
- Each ticket verifies its own observable browser/API behavior; the final ticket checks real integrations and the hosted path.
- Verify actual model access and configuration as integrations are introduced. No credentials or infrastructure have been provisioned by publishing tickets.
- Complete shared demo limits before exposing the public hosted application. Check free-plan eligibility before deployment.
- Full checklists and additional role datasets remain follow-on scope.

## Next

Ticket 02 is resolved and merged, with 10 real-Supabase desktop/mobile knowledge tests, 14 authentication regression tests, typecheck, production build, and a live cloud upload/inspection smoke check passed. Begin ticket 03 in its own branch/worktree. The dedicated services and credentials are configured and passed access checks.

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
