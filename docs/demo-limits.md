# Demo admission and provider failures

Every authenticated, same-origin POST /api/chat validates the full question, scope, and history before admission. Accepted attempts count once, including no-evidence results, Google/Groq failures, and requests interrupted after admission. Invalid, unauthorized, and application-limited requests do not consume allowance. Retrying is a new question attempt. The UI displays completed answers only after server validation; failures are retryable and are not saved as completed conversation exchanges.

## Durable policy

Postgres admits at most five questions in the preceding rolling 60 seconds per request identity and 100 questions across the entire demo per UTC calendar day. Exactly 60-second-old admissions expire. The global day resets at midnight UTC (08:00 Malaysia time). A transaction advisory lock serializes the service-only, security-invoker admit_demo_question RPC across browsers and server instances. Counter updates commit together. The storage tables have RLS enabled and no public, anonymous, or authenticated grants; only the server secret client may use them. Admission fails closed when its storage is unavailable.

On Vercel only, server-controlled VERCEL=1 enables platform-overwritten x-vercel-forwarded-for/x-forwarded-for metadata. Invalid/missing addresses and other hosts use a conservative shared-local bucket; arbitrary forwarded headers, JSON IP fields, or new login sessions cannot choose a different identity. The IP is HMAC-SHA256 hashed with the server Supabase secret before storage. Key rotation changes per-IP hashes but retains the global daily count. Old counter entries are pruned after seven days during admission. No raw IP is stored by this application.

HTTP429 distinguishes app_minute and app_daily and includes error, retryAfterSeconds, retryAt, Retry-After, and no-store. Daily limits take precedence once exhausted. Questions are not a guaranteed token-quota cap: Google and Groq account/model quotas are independent, and administrator ingestion consumes Google capacity separately.

## Bounded work and errors

Question input is at most 1000 characters; the streamed JSON body is at most 32768 bytes. Only three completed, same-scope exchanges are accepted (each question 1000/answer 2000 characters). Retrieval is limited to six passages / 18000 source characters; generation is bounded at 1800 tokens with validated claim/reference limits. Admission and retrieval each have five-second aborts, Google 25 seconds, Groq 30 seconds; the hosting route allows 90 seconds. Existing authenticated ingestion accepts one 100 KB Markdown file and embeds at most four bounded passages per resumable request. Learner credentials cannot upload, replace, index, publish, or mutate counters.

The direct provider adapters disable hidden retries (maxRetries:0). HTTP503 distinguishes google_quota, google_unavailable, groq_quota, and groq_unavailable. Quota means provider429, separate from application429. Valid Retry-After seconds/date is preferred; Google RetryInfo retryDelay is used if the header is absent/invalid. Guidance is bounded to seven days, rounded upward; quota without useful guidance defaults 60 seconds. Provider bodies and credentials are never returned/logged. UI errors show the provider and wait duration, preserve the question, and require explicit retry. No fallback model, Gateway, paid inference, or automatic retry loop is configured. Failed indexing preserves saved chunks and a useful failure message for explicit retry; partial candidates are not published.

## Deterministic verification

The public browser/API suite uses real isolated Supabase Auth/PostgREST/Postgres and controlled external Google/Groq HTTP servers. A separately authenticated, development-only request-context HTTP adapter on 127.0.0.1:19032 supplies clock/identity, restricted to the dedicated loopback Supabase 55421 fixture and refused on Vercel/production. It is not a production header bypass. Hosted deployments must omit FIRSTDAY_REQUEST_CONTEXT_URL/SECRET and provider fixture base URLs.

Tests verify six questions across new sessions/spoofed forwarded values, atomic concurrent admission, staggered rolling expiry at 59.999 / 60 seconds, concurrent global 100/day across identities, UTC reset, independent Google/Groq quota/network recovery, retry guidance and indexing retry, and denied learner table/RPC tampering. Limits tests never load-test live providers. Run npm run test:knowledge for desktop/mobile; separate real-provider/hosted checks belong to Ticket08.

Cloud migration 20261022143627_chat_admission is applied to the dedicated FirstDay project.

Cloud checks verified RLS on both tables, no learner SELECT/INSERT grants, security-invoker RPC with pinned search_path, no anonymous/authenticated execute and service-role execute only. The security advisor reports two informational [RLS enabled without policies](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) notices for these intentionally private counters; no learner policies should be added. The existing leaked-password-protection warning is unchanged.
