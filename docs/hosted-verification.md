# Hosted verification

Ticket 08 verifies the actual deployed journey separately from deterministic tests. Results are recorded here only after the hosted check finishes.

## Deployment scope

Dedicated Supabase: `ohvojrdwxlsbzwdrhpzr` (free organization, Singapore, public signup disabled). Vercel: `qw-e7b7`, team `team_i8TvR77HdwslGIvNMyzZl1Yx`, project `prj_0yTgxpAv4IlJ53pVjTKWamIT6Dxg` (`firstday`), verified active Hobby. Node 24.x, Next.js framework, default free build resources. No Git connection, GitHub push, paid service, unrelated project change or deployment-protection change.

Runtime configuration contains only the two public Supabase settings, server Supabase secret, Google/Groq provider keys and intentionally public learner credentials. Administrator credentials remain local. Provider fixture/context URLs are omitted. The app-source deployment allowlist excludes environment files, Git/worktree metadata, dependencies, tests/reports, design files and planning/private notes.

## Local storage outage

The focused public browser test stops only `supabase_rest_firstday-supabase-fixture`, with local Auth healthy, and always restarts it. Its RED observed the learner library's generic server error. The new shared knowledge/admin route boundary displays understandable storage-unavailable retry feedback. The test covers learner library/reader and administrator list/inspection, then confirms successful API storage access after restart. No cloud outage is induced.

## Existing integration evidence

Before Ticket 08, the combined 62 desktop/mobile knowledge journeys and 14 authentication journeys passed with typecheck, build and CRLF checks. Knowledge tests use real local Supabase Auth, PostgREST, PostgreSQL and RLS; only external Google/Groq HTTP and the guarded local request-context adapter are controlled. Limits/failure cases use that deterministic seam rather than live quota exhaustion. Earlier small production-build checks established real Google 768-dimensional embeddings, a direct Groq cited exact-command answer and an honest missing-fact result.

See the README and linked contracts for reproducible commands, processing bounds, free-service availability and restoration instructions. The final hosted smoke spends four live question attempts and creates one unique fictional guide plus one replacement; it preserves that evidence rather than resetting shared knowledge or counters.

## Measured production result — October 22, 2026

The production alias [FirstDay](https://firstday-lilac.vercel.app) returned the application login with HTTP200 without a Vercel gate. Deployment `dpl_2sB2zyF77ie7g4Q3PPw1Nwp5V5dv` is READY, with immutable URL `https://firstday-q1bpbrp80-qw-e7b7.vercel.app`. The app-source commit is `ab8a7b0bab942ca7a0d9cc1c94209e26ced55d88`; subsequent ticket evidence changes affect documentation only. Its explicit source manifest contained 53 app/config files and 197600 bytes. Remote Next.js build/typecheck succeeded using the default basic build machine; no error-level runtime records were returned by the scoped log query. Deployment protection settings were preserved. Public production alias access does not imply immutable/preview URLs are public.

The real-provider browser/API smoke completed at `2026-10-22T15:14:11.808Z` (23:14 Malaysia). It created fictional `Lumen-1792681947480 Frontend onboarding`, document `948370a5-2b04-4556-860b-0c84be052d80`.

| Boundary                   | Observed result                                                                                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public demo login          | Keyboard-open popup, fill form, real Supabase login and workspace navigation passed                                                                                         |
| Administrator upload       | Private identity uploaded the fictional Markdown through the actual hosted form                                                                                             |
| Hosting persistence/resume | Initial request persisted 4/7 passages and returned `processing`; reloading exposed Resume indexing, which completed 7/7 and published                                      |
| Learner library/reader     | Published guide appeared and preserved `npm run dev -- --port 3187`                                                                                                         |
| Live setup answer          | Actual Google question embedding and direct Groq answer preserved the exact command; server-validated citation opened the matching passage and version                      |
| Live follow-up             | “What about those environment variables?” returned `.env.local` and `NEXT_PUBLIC_LUMEN_API_URL`, with a citation to the same guide                                          |
| Missing fact               | Vacation allowance absent from the guide returned `no_evidence`                                                                                                             |
| Browser-local state        | Three exchanges survived reload; Designer scope and a second context using the shared credentials had separate empty histories                                              |
| Authorization              | Learner list/upload/index/replace endpoints returned403; an anonymous hosted mutation returned401                                                                           |
| Safe replacement           | Old guide remained readable before indexing; replacement paused 4/7 then completed7/7, switched the command to port3188, and a new live answer cited the new active version |
| Earlier evidence           | The old citation still displayed port3187 and its original version after replacement                                                                                        |
| Reset                      | Cancel retained four exchanges; confirmed reset cleared local exchanges and preserved authentication/shared published guide                                                 |
| Mobile                     | 390×844 login, menu navigation, library, reader, historical source, administrator upload controls/status passed; source had no horizontal overflow                          |
| Client secret boundary     | Selected loaded public client assets contained none of the configured server/provider keys or private administrator password; no private credential values were printed     |

Original version: `f1c74b56-8030-4779-9dac-4e0eb8f9a87a`. Retained source: `/sources/f1c74b56-8030-4779-9dac-4e0eb8f9a87a/1e6f2ec8-11c7-47d3-b6f1-4012c9463959`. New active version: `dd27da85-d276-4c8b-9636-d04395170c76`. These are fictional public-demo evidence identities, not credentials.

This consumed four actual question attempts and fourteen document embeddings, with no live provider quota load test. The production limit counters and shared knowledge were not reset. Provider429/network feedback, shared application minute/day admission, concurrent atomicity and reset timing remain covered by the previously passed real-local-Supabase public-boundary suite using controlled external-provider failures; the hosted smoke does not claim to have exhausted live provider/day quotas or induced a cloud database outage. The added desktop/mobile real REST outage tests passed (2 tests,3.8 minutes), with the dedicated fixture restored and running. Typecheck, production build, script syntax, diff checks and all124 tracked text files' CRLF checks passed.

Cloud project recheck returned `ACTIVE_HEALTHY`. Migration history exactly matched all seven committed files: `20261022033938`, `20261022040150`, `20261022040529`, `20261022042120`, `20261022143627`, `20261022144226`, `20261022144243`. No schema changes were needed for Ticket08.

## Availability and practical limits

This is a personal fictional demo, not guaranteed production availability. Application allowances do not guarantee Google/Groq request/token capacity; provider availability and model access can change independently. Supabase Free can pause after inactivity; use the dashboard restore procedure in the README rather than adding a keepalive. Historical citations expire after the fourth publication prunes the oldest of three retained published versions. Browser clearing or another device loses local conversation history. The selected source-asset scan is a scoped check, not a claim of a comprehensive security audit.

Current platform references: [Supabase billing](https://supabase.com/docs/guides/platform/billing-on-supabase), [Supabase production availability](https://supabase.com/docs/guides/deployment/going-into-prod), [Vercel Hobby](https://vercel.com/docs/plans/hobby), [Vercel Function limits](https://vercel.com/docs/functions/limitations), [Groq rate limits](https://console.groq.com/docs/rate-limits), and [Google embedding documentation](https://ai.google.dev/gemini-api/docs/embeddings). Recheck quotas and eligibility before reuse; do not enable a paid fallback.
