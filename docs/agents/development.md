# Development environment

Use the On Board RAG local project, rooted at C:\Projects\On Board RAG on this machine. The saved app project was verified with that path on October 23, 2026. This existing chat still reports C:\Projects\RAG as its writable sandbox root. The repository cannot change an active chat's permissions; use the existing On Board RAG project for the next chat and verify its supplied cwd/writable root before edits. OpenAI's [project documentation](https://learn.chatgpt.com/docs/projects) distinguishes saved chats' recorded directories from the current working tree. No app state database or permission policy is edited by repository scripts.

## Local checks

- Run npm run check:repo for CRLF text and permitted ticket Status/Progress fields. Binary design/assets are preserved. This command includes tracked and nonignored untracked files; generated ignored output is excluded.
- Run npm run test:tooling to verify those rules reject invalid fixtures.
- Existing application typecheck, build and browser commands remain in package.json.
- CI workflows, pre-commit hooks and merge requirements were intentionally left unchanged by the retrospective follow-up.

## Isolated database fixture

With Node.js 24, npm and Docker running, run npm run fixture:up once before npm run test:knowledge. The pinned Supabase CLI uses committed tests/fixture/supabase/config.toml for a new fixture, reuses the dedicated temporary directory, checks its identity/ports and preserves existing matching configuration/data. It starts only the required local services and privately refreshes status.json where the current test harness expects it. CLI start/status output is captured rather than printed because it contains local credentials. The bootstrap does not link a cloud project, apply migrations, seed users or reset counters; the existing guarded test setup performs its established test preparation.

First run downloads the pinned CLI and required Docker images. Fresh clones need no copied temporary files. FIRSTDAY_FIXTURE_DIRECTORY can select a different temporary configuration directory; when using it, point FIRSTDAY_TEST_SUPABASE_STATUS_FILE to that directory’s status.json for subsequent tests. The suite owns its fixture exclusively while running; run one knowledge suite at a time. Existing dedicated containers must match the required ports and identity; resolve mismatches explicitly rather than resetting data. See [Supabase local configuration](https://supabase.com/docs/guides/local-development/cli/config).

## Read-only release inspection

Run npm run check:release using the existing authenticated Vercel CLI account. It checks the fixed FirstDay team/project, GitHub main SHA, actual production alias deployment, READY state, login and favicon. Output is limited to nonsecret identity/status/check fields. By default it requires a Git-sourced deployment matching remote main. For an explicitly source-deployed release, use npm run check:release -- --commit <full-SHA>; this checks that exact expected commit and reports any divergence from remote main. It makes no deployment, mutation, sign-in, model call or document upload. scripts/project-config.mjs is the single source for intended hosting/repository IDs. A missing CLI login produces an actionable failure, not an automatic reconnect or new project.

Discover exact connector tools by name instead of dumping an entire provider catalog. Return only fields needed for the decision. For long tool/agent operations, prefer completion notifications or one bounded wait with progress changes instead of repeated short polls.

For the separate navigation benchmark, run npm run measure:navigation. It uses only the intentionally public demo popup, checks Overview/Knowledge/Chat navigation, emits timing summaries and closes the browser without saving auth state or traces. FIRSTDAY_BASE_URL selects the intended application; FIRSTDAY_NAV_BUDGET_MS sets the explicit navigation budget. It does not ask a question or spend model quota.
