# Daily Supabase activity check

Progress: in-progress

2026-10-26: The owner requested a lightweight scheduled query to reduce free-plan inactivity pausing. Use native Vercel daily cron (Hobby allows each job once daily), authenticated by a dedicated server-only CRON_SECRET. Read at most one ID, no writes, no provider calls, no new infrastructure or schema. Supersedes the previous no-keepalive decision for this specific request.

Verify authorization, success/empty data, upstream failure and no-store through the public HTTP route. Verify the real database once, configure the production-only token without disclosing it, and release through the existing Git deployment flow. Free-plan uptime remains best effort.

Verification: TypeScript and production build passed. HTTP checks passed for absent/wrong token (zero database requests), successful/empty reads, upstream failure and absent cron configuration; all responses no-store, no data/error leakage. Query retries explicitly disabled. One bounded read against the intended cloud project succeeded without printing records.

Activation blocked: automatic approval review rejected generating and uploading a new production CRON_SECRET because explicit credential-egress authorization is required. The rejected command did not execute; no new token or hosting variable was created. Request approval for creating this token in the intended FirstDay Vercel project, then publish/release and verify the production endpoint and scheduler.

2026-10-26: The owner explicitly approved token creation/upload and GitHub publication. Configured CRON_SECRET as a production-only Secret on the existing FirstDay Vercel project; value retained only in ignored .env.local. Approval blocker resolved. Preview intentionally has no cron token and must fail closed with 503.
