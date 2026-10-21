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

Tests start the real Next.js application and an independent controlled Auth HTTP fixture on loopback ports 3100 and 54329. Supabase clients, cookie handling, routes, browsers, and authorization logic are real. Only the upstream Auth service is simulated, outside the application, and only launched by the test runner. These tests do not establish live hosted-service availability.

Server identity is verified using Supabase `getUser`. Administrator access uses server-managed `app_metadata` only. Protected pages refresh cookies through Next.js proxy; API routes independently verify callers. State-changing auth endpoints require matching Origin and Host.

Text files use CRLF, enforced through Git attributes and the Prettier configuration. Never commit secrets, dependencies, or build output.

## Current slice

Ticket 01 provides real login, demo popup, verified learner/admin routing, session validation, and sign-out. Knowledge management and RAG answers arrive in subsequent slices and are not presented as already functional.
