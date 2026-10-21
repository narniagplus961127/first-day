# FirstDay RAG journey tickets

The user approved eight implementation tickets on October 21, 2026. Implementation is underway on integration branch integrate/firstday-rag.

Canonical specification: [First complete onboarding RAG journey](../onboarding/spec.md).

| Ticket | Blocked by | Progress |
| --- | --- | --- |
| [01: Demo login and protected administrator access](issues/01-demo-login-and-admin-access.md) | None | In progress |
| [02: Upload and inspect a knowledge document](issues/02-upload-and-inspect-knowledge.md) | 01 | Not started |
| [03: Index and publish a readable guide](issues/03-index-and-publish-guide.md) | 02 | Not started |
| [04: Ask a question and inspect its evidence](issues/04-answers-with-evidence.md) | 03 | Not started |
| [05: Continue and reset a private demo conversation](issues/05-private-followup-conversations.md) | 04 | Not started |
| [06: Replace a guide without interrupting answers](issues/06-safe-document-replacement.md) | 04 | Not started |
| [07: Enforce demo limits and handle provider failures](issues/07-demo-limits-and-provider-failures.md) | 04 | Not started |
| [08: Verify the complete hosted journey](issues/08-verify-hosted-journey.md) | 05, 06, 07 | Not started |

## Frontier

Ticket 01 can start once implementation is authorized. Every ticket has ready-for-agent triage status; blocked tickets become executable only after their listed blockers complete. Tickets 05, 06, and 07 may proceed independently after 04.

## Working rules

- Use the canonical specification for shared product/provider decisions and scope boundaries.
- Reuse the approved native design; preserve any manual edits and omit preview exports.
- Each ticket verifies its own observable browser/API behavior; the final ticket checks real integrations and the hosted path.
- Verify actual model access and configuration as integrations are introduced. No credentials or infrastructure have been provisioned by publishing tickets.
- Complete shared demo limits before exposing the public hosted application. Check free-plan eligibility before deployment.
- Full checklists and additional role datasets remain follow-on scope.

## Next

Ticket 01 is in progress in its own worktree using the confirmed browser/API TDD seam. The dedicated FirstDay Supabase project is healthy; live provider secrets remain to be configured.
