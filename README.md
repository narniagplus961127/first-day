# FirstDay

An onboarding knowledge application built with Next.js, TypeScript and Supabase. Preserve manual edits to the approved native design.

## Run locally

Use Node.js 22.13 or newer. Install pinned dependencies with `npm ci`, copy `.env.example` to `.env.local`, and set the project URL/publishable key. Start with `npm run dev`.

The normal application always calls Supabase Auth. There is no fake production login or test bypass. Create two email/password users in a dedicated Supabase project. Give the administrator server-managed `app_metadata.role` equal to `admin` through the supported Admin API, never editable `user_metadata`. Learners use `learner` or no administrator claim. Disable public signup in the Supabase dashboard. Configure `DEMO_EMAIL` and `DEMO_PASSWORD` with the intentionally public learner identity; the popup shows these values. Keep administrator credentials and privileged keys private.

The provisioning script can create/update the two configured identities via `node --env-file=.env.local scripts/seed-auth.mjs`. It resets their passwords to the supplied values; run only against the intended project. Privileged provisioning keys are not required for normal sign-in.

## Verification

- `npm run typecheck`: TypeScript checks.
- `npm run build`: production build.
- `npm run test:e2e`: desktop/mobile Playwright journeys. Install Chromium first with `npx playwright install chromium`.
- `node --env-file=.env.local scripts/smoke-auth.mjs`: a small live learner/admin browser check against the configured Supabase project. It starts its own loopback server on port 3110 and reports pass/fail without displaying credentials. Keep that port free.

Tests start the real Next.js application and an independent controlled Auth HTTP fixture on loopback ports 3100 and 19029. Supabase clients, cookie handling, routes, browsers, and authorization logic are real. Only the upstream Auth service is simulated, outside the application, and only launched by the test runner. These tests do not establish live hosted-service availability.

Server identity is verified using Supabase `getUser`. Administrator access uses server-managed `app_metadata` only. Protected pages refresh cookies through Next.js proxy; API routes independently verify callers. State-changing auth endpoints require matching Origin and Host.

Text files use CRLF, enforced through Git attributes and the Prettier configuration. Never commit secrets, dependencies, or build output.

## Current slice

Tickets 01–07 provide verified login, administrator upload/indexing and safe replacement, a published learner library, grounded answers with exact-version source inspection, browser-local follow-ups/reset, and durable demo limits. Ticket 08 verifies the complete hosted journey.

## Knowledge upload and inspection

Administrators can upload one English UTF-8 `.md` file (up to 100 KiB), assign one of the five job roles, and reopen the persisted candidate. Uploaded candidates are marked **Not indexed** and remain invisible to learners. Administrators can now index and publish completed guides. The application uses the authenticated Supabase client and administrator RLS; it does not use a service key to bypass document policies. Markdown preview skips raw HTML and images, and keeps headings and code blocks.

Apply the committed Supabase migration to the dedicated FirstDay project before using upload in a cloud-configured application. The upload RPC creates the document and candidate version atomically. An identically named file does not overwrite an existing guide.

`npm run test:knowledge` exercises public browser/API journeys against a real isolated local Supabase stack on ports 55421/55422. It uses real Auth, PostgREST, PostgreSQL, and RLS, not an in-memory database substitute. Start a separate Supabase CLI stack named `firstday-supabase-fixture` and save `supabase status --output json` to `firstday-supabase-fixture/status.json` in the OS temporary directory, or point `FIRSTDAY_TEST_SUPABASE_STATUS_FILE` to that private status JSON. The database container must be named `supabase_db_firstday-supabase-fixture`. Do not point this test fixture at production. Test setup checks loopback access, seeds only local test identities, and applies previously unapplied migrations to that isolated container. The existing authentication fixture suite remains `npm run test:e2e`.

The local status file contains local service keys and must remain outside version control. No test setup command alters the dedicated cloud project or another local project's containers.

## Ask FirstDay

Open /chat after signing in to ask a question in a selected role or All roles. Configure server-only GROQ_API_KEY and GOOGLE_GENERATIVE_AI_API_KEY; GROQ_MODEL defaults to openai/gpt-oss-20b. Answers use Google query embeddings, active-version Supabase vector retrieval, and direct Groq generation. Open each source link to inspect its exact version and passage. See [answer contract](docs/answers.md) and [indexing contract](docs/indexing.md) for bounds, configuration, and verification.

## Private demo conversations

Completed chats are saved only in this browser, separately for each role/search scope. Up to three recent completed exchanges are sent with a follow-up; failures remain outside history. Reset demo asks for confirmation before clearing this browser’s demo activity across scopes. It preserves shared guides and other visitors’ chats. See the [conversation contract](docs/conversations.md) for validation, storage bounds, and privacy details.

## Demo limits and provider failures

Questions share a durable five-per-rolling-minute per-IP allowance and 100 per UTC day across the demo. Accepted attempts include provider failures; invalid requests and application denials do not count. Google/Groq quotas remain independent. Configure server-only SUPABASE_SECRET_KEY for admission, and see the [demo limits contract](docs/demo-limits.md) for trusted hosting identity, reset/retry timing, workload bounds, and deterministic tests.
