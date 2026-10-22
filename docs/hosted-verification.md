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
