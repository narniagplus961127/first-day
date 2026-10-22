# Final integration review and resolutions

Original read-only reports are retained in full below. Fixes apply to integration baseline d88ad38; their verification and deployed release are recorded after completion.

## Standards — original report

# Standards review

Reviewed the complete application change from 7f596f63fd6db1d704f868397c890faebfe50185 through application commit 3e06bc5, including the full ticket 01-08 commit list, pages, components, APIs, domain/service code, migrations, configuration, and supporting documentation. Final documentation HEAD observed: e03819d10ce6c2ed953195a0e14471ca4c974ab5. Tooling-enforced formatting/type rules are excluded.

## Documented breaches

1. All eight `.scratch/rag-journey/issues/01-...md` through `08-...md`, line 7: the changed hunk replaces `**Status:** ready-for-agent` with `**Status:** resolved`. `docs/agents/triage-labels.md:3-9` permits five default triage labels and says, "Record the applicable label in each issue's Status field." `resolved` is not one of those labels. Keep lifecycle completion separately and preserve the documented triage field, or explicitly revise the tracker convention while retaining the approved labels.

2. Missing `docs/adr/` records for consequential implementation choices: `docs/indexing.md:19-23` selects resumable request batches with leases; `docs/answers.md` selects bounded nonstreaming generation. `docs/agents/domain.md:3,12` requires the root glossary/ADR layout and says, "Record ADRs for consequential decisions involving real trade-offs." Existing feature contracts describe behavior but supply no ADR explaining the selected alternative and its trade-offs. Record these choices in the required location.

## Baseline judgement calls

3. Possible Duplicated Code: `src/lib/knowledge/upload.ts:15-30` and `src/app/api/chat/route.ts:17-30` repeat `while (true)`, `reader.read()`, byte accumulation, maximum comparison, `reader.cancel()`, and chunk collection. A shared bounded-body reader could keep cancellation/limit handling consistent while callers retain their own parsing and messages.

4. Possible Mysterious Name: `src/lib/auth.ts:10` introduces `export class AuthError extends Error`, but `src/lib/ai/provider-failure.ts:54` uses it for provider quota/outage errors and `src/lib/knowledge/upload.ts:58` uses it for oversized Markdown. The name implies authentication despite representing general public HTTP failures. A purpose-revealing application/request-error name would clarify the shared contract.

No further non-tooling documented violations or well-supported baseline smells identified. No repository edits, servers, or external mutations performed.

## Standards — resolutions

1. Preserve all five triage labels: the eight tickets use Status ready-for-agent and separate Progress resolved. Tracker/triage instructions explicitly distinguish completion from routing, and the map continues to mark all eight resolved.
2. ADR0001 records persisted bounded indexing/lease/publication trade-offs; ADR0002 records complete validated nonstreaming output versus incremental display. Existing contracts remain the detailed behavioral references.
3. The upload/chat byte-reading loop is extracted into one bounded request-body reader; each caller retains its content-type/JSON/multipart parsing, exact errors and byte ceilings.
4. General HTTP failures use HttpError and httpErrorResponse in a shared module, with authentication continuing to verify Supabase identities and preserve existing redirects/status/retry contracts.

## Spec — original report

# FirstDay final Spec review

Reviewed baseline 7f596f63fd6db1d704f868397c890faebfe50185 through HEAD 6049c63 (final app 3e06bc5), tickets 01–08, glossary, application/public-boundary implementation, test coverage, README, hosted verification and hosting research. Read-only review; no tests, servers, provider calls or cloud mutations were repeated.

## Missing or partial requirements

- **[P3] English upload restriction is guidance only.** Spec `.scratch/onboarding/spec.md:87`: “Validate one UTF-8 English Markdown file per upload, maximum 100 KB, at the server.” `src/lib/knowledge/upload.ts:70–80` accepts any Unicode letter/number and checks control characters, with no language validation. For example, a wholly Chinese-language `.md` passes this shared validator for both initial upload and replacement. The UI asks for English, but the server does not enforce that part of the stated contract. Add an explicit, documented language-admission policy and public API coverage if English-only acceptance is intended; alternatively record an approved relaxation. This does not invalidate the verified English upload-to-answer milestone.

## Unrequested scope creep

None found. Five-role compatibility and All roles filtering are required; only Frontend Developer content is required. Full checklists and other role datasets remain outside scope. The favicon and Git connection are covered by the latest explicit authorization.

## Implemented but wrong requirements

None beyond the partial validation above. Bounded nonstreaming output is explained by the selected strict JSON integration, satisfying conditional streaming and visible-progress requirements. Three-version citation retention is permitted by the explicit bounded-retention decision.

The recorded 62 knowledge/14 authentication journeys, focused real REST outages and small actual Google/Groq/Supabase hosted journey substantiate the agreed verification seam. Live quota exhaustion and a cloud outage are not required. Current READY production evidence points to https://qw-firstday.vercel.app; Git settings evidence explicitly distinguishes future push behavior from an unperformed push/webhook test. No spec blocker found for the core journey.

## Spec — resolution

The common initial/replacement Markdown validator applies an explicit dependency-free English-admission heuristic to prose rather than source code. Public API tests cover unsupported language before persistence and code-heavy English with Unicode names. Exact policy limitations and retry guidance are documented in docs/uploads.md; this is a practical admission rule, not a claim of perfect language classification. No provider request is used for language validation.

## Fix verification

The unsupported-language initial upload first failed the new public API test with HTTP 201 instead of 400. The validator then passed it with HTTP 400 and English guidance before persistence. Four focused pre-refactor public tests passed for language/replacement/Unicode-code behavior and streamed body limits; after the shared body/error refactors, all 42 selected desktop/mobile tests passed in 2.8 minutes:

`npm run test:knowledge -- language.spec.ts body.spec.ts upload.spec.ts answers.spec.ts limits.spec.ts`

These cases cover real local Supabase authentication, persistence/RLS and public upload/chat boundaries, with only external providers controlled. They include initial/replacement rejection for clearly non-English prose, preserved original candidates, Unicode names/code and short marker/code acceptance; absent-length streamed upload/chat 413 errors retain exact messages. Existing supported/no-evidence/citation validation, provider quota/network retry feedback, durable admission, login/logout and learner/anonymous denials also passed. Type checking passed; production build and final hosted policy/asset health are recorded in the release evidence after completion. No dependency, schema or provider configuration change was needed.
