# FirstDay

FirstDay is a fictional onboarding demo built with Next.js, TypeScript and Supabase. Administrators publish English Markdown guides; learners browse them and ask questions with exact-version supporting passages. The initial dataset is Frontend Developer. The other four job roles remain available for scope filtering; their datasets and full checklists are follow-on work.

## Local setup

Use Node.js 24 and run `npm ci`. Copy `.env.example` to the ignored `.env.local` and fill these values:

| Variable                               | Purpose                                                             |
| -------------------------------------- | ------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Dedicated Supabase project URL                                      |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public browser configuration                                        |
| `SUPABASE_SECRET_KEY`                  | Server-only durable question admission and IP HMAC                  |
| `GOOGLE_GENERATIVE_AI_API_KEY`         | Server-only direct Google embeddings                                |
| `GROQ_API_KEY`                         | Server-only direct Groq answers                                     |
| `GROQ_MODEL`                           | Optional; defaults to `openai/gpt-oss-20b`                          |
| `DEMO_EMAIL`, `DEMO_PASSWORD`          | Intentionally public learner credentials shown in the popup         |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`        | Private provisioning/smoke inputs; keep local and omit from hosting |

Apply all committed `supabase/migrations` in order to the intended dedicated project. Disable public signup. Create learner/admin email-password identities; only the administrator receives server-managed `app_metadata.role=admin`. Never trust editable user metadata. `node --env-file=.env.local scripts/seed-auth.mjs` provisions or updates those exact two configured identities and resets their supplied passwords; use it only deliberately against the intended project.

Run `npm run dev`; production uses `npm run build` then `npm start`. Normal authentication always uses Supabase. No production fake login or model fallback exists. Keep `.env.local`, private fixture status, build output and dependencies out of version control.

## Behavior and bounds

An administrator uploads one UTF-8 English `.md` file, maximum 102400 bytes, with title and job role. Candidates remain private until all passages are embedded. Each resumable indexing request embeds at most four passages using `gemini-embedding-2`, 768 dimensions and a stored configuration identity. Replacement preserves the active guide until atomic publication; three published versions retain exact historical citations. Failed indexing preserves progress for explicit retry. See [indexing](docs/indexing.md) and [replacement](docs/replacement.md).

Questions retrieve at most six active-version passages and 18000 source characters. Direct Groq uses bounded nonstreaming strict JSON; the UI shows progress until claims and citation IDs/quotes are validated. Unsupported facts return `no_evidence`. Questions are limited to 1000 characters, three recent same-scope exchanges (1000/2000 characters per question/answer), a 32768-byte request, and 1800 output tokens. Google and Groq timeouts are 25/30 seconds; chat permits 90 seconds. See [answers](docs/answers.md).

Chats stay in browser localStorage, independently per job role or All roles. Up to three recent completed exchanges go to the server/providers for follow-ups. Reset requires confirmation and clears only this browser's demo activity; authentication, shared guides and other visitors remain. See [conversations](docs/conversations.md).

Durable application limits admit five questions per rolling 60 seconds per IP and 100 across the demo per UTC day (08:00 Malaysia reset). Admitted failures count. Invalid/unauthorized/limited requests do not. Vercel supplies trusted network metadata; other hosts conservatively share a local bucket. Google/Groq quotas are independent. HTTP429 application limits and HTTP503 provider failures include actionable retry guidance where available. No paid fallback or automatic retry loop exists. See [demo limits](docs/demo-limits.md).

## Verification

- `npm run typecheck` and `npm run build` check the deployable application.
- `npm run test:e2e` runs desktop/mobile auth/browser journeys with a controlled upstream Auth HTTP service on ports 3100/19029.
- `npm run test:knowledge` runs real isolated Supabase Auth, PostgREST, PostgreSQL and RLS journeys, with controlled external Google/Groq HTTP responses. It checks upload/indexing, evidence, contextual history, replacement, durable limits and failure/recovery. Ports 3200 and 19030–19032 must be free.
- Install Chromium with `npx playwright install chromium` if needed.

Knowledge tests require a separate local Supabase stack named `firstday-supabase-fixture`, API `127.0.0.1:55421`, DB port 55422, database container `supabase_db_firstday-supabase-fixture`, and REST container `supabase_rest_firstday-supabase-fixture`. Store its private `supabase status --output json` in the OS temporary directory at `firstday-supabase-fixture/status.json`, or set `FIRSTDAY_TEST_SUPABASE_STATUS_FILE`. Setup rejects other hosts/ports, seeds only those fixture identities, applies unapplied migrations and resets only fixture counters. The outage test reversibly stops this REST container while Auth stays healthy and always restarts it; run this suite exclusively against that fixture.

`FIRSTDAY_BASE_URL=https://<intended-host>` plus `node --env-file=.env.local scripts/smoke-hosted.mjs` runs the separate real hosted journey (set the environment variable using your shell). It creates one uniquely named fictional guide, uses real providers, publishes a replacement, and verifies popup/fill/login, persisted bounded indexing/resume, reading, exact setup citation, follow-up, absent fact, browser/scope isolation/reset, learner denials, desktop/mobile and selected public assets. It spends four live answer attempts and fourteen document embeddings; do not loop it to load-test provider quotas. It deliberately keeps its fictional evidence rather than deleting shared knowledge. No traces, screenshots or credential values are emitted. `scripts/smoke-answer.mjs` is the smaller two-question provider smoke.

## Hosting and restoration

Deploy only to the intended free FirstDay Supabase project and eligible Vercel Hobby scope. Hobby is intended for personal noncommercial projects; free eligibility and quotas are not guaranteed. Configure the seven required runtime variables above in Vercel; `GROQ_MODEL` is optional. Omit administrator credentials, provider fixture base URLs and `FIRSTDAY_REQUEST_CONTEXT_*`. The explicit `.vercelignore` includes only app source, configuration and lockfiles; deployment need not connect Git or publish GitHub changes. Recheck owner/project/commit/environment before each release and wait for READY before testing the actual URL. Preserve deployment protection; use authenticated Vercel access for protected previews.

Supabase Free currently includes 500 MB database storage, 5 GB egress and 50000 monthly active users; inactivity may pause a project after seven days. Vercel Hobby execution and provider account quotas can change. The application bounds work instead of assuming an unlimited function lifetime. If Supabase pauses, restore the dedicated project in its dashboard, wait for healthy Auth/Data API, then retry. Knowledge pages display retry guidance during temporary storage outages; saved active guides persist centrally. For a failed deployment, inspect that deployment's build/runtime logs, correct configuration and redeploy the committed state; preserve the prior working deployment when available. Do not reset shared knowledge or counters to make smoke checks pass, enable paid resources, or create a keepalive automation.

Measured hosted results and the exact deployment identity are recorded in [hosted verification](docs/hosted-verification.md). All text uses CRLF; approved native design changes are preserved without preview exports.
