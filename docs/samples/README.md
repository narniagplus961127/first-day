# Fictional role samples

Each JSON manifest owns one fictional Lumen guide and eight tasks. The Markdown describes an exercise, not the FirstDay repository or real company policy. All five role pairs are available: frontend, backend, designer, business-analyst and hr. Each has eight tasks in the agreed 2/3/3 stage split.

## Prepare a role

After applying the committed migrations to the intended environment, set FIRSTDAY_BASE_URL to that application URL and provide ADMIN_EMAIL and ADMIN_PASSWORD privately in the process environment. Run `npm run prepare:sample -- frontend`. To use the ignored local environment file with Node 24, run `node --env-file=.env.local scripts/prepare-role-sample.mjs frontend`. Never put credentials in command arguments or commit environment files. The command prints only status and document/version/task identities.

Preparation signs in as the administrator, uploads through the normal Markdown endpoint with an explicit sample identity, indexes the exact candidate in bounded batches and saves a revision-checked checklist only after publication. It never writes embeddings or active-version pointers directly. Stop on provider/concurrency errors, respect their retry guidance and rerun explicitly to resume. Existing unrelated documents remain intact.

An unchanged rerun skips indexing/checklist saves and preserves document UUID, active version, task identities and revision. A divergent guide/candidate or customized checklist reports `diverged-guide` or `diverged-checklist`; it is preserved for explicit administrator review. A ready candidate whose publication pointer was changed is also divergence, not permission to republish. The exact original unbound Frontend starter snapshot can receive guide/question bindings while retaining its task IDs and learner completion. An intentionally empty saved checklist is customization.

## Sample contract

Each separate named pair has a manifest containing role, the predefined lumen.*-onboarding.v1 identity, title, filename, supportedQuestion, supportedFact, missingQuestion and eight tasks in the agreed 2/3/3 stages. supportedFact is a short exact passage in the Markdown that answers supportedQuestion. Keep that literal and deliberately absent missingQuestion specific enough to test source provenance. Do not add legacyTasks for new roles; that Frontend-only migration recognizes the original starter.

Call `roleJourney('<name>')` from a role's browser test. The shared journey uses actual local Supabase persistence and public upload/index/read/checklist/chat routes, verifies the exact published source, protects existing drafts, completes the eight tasks, checks browser/role isolation and resets activity. Controlled providers read each manifest's supported fact and distinguish missing facts before generation. They verify observable contracts, not semantic quality of a live model. A separately bounded live-provider smoke remains release evidence.

Run only one knowledge suite at a time against the dedicated local fixture. Guarded cleanup helpers are test setup only and refuse cloud URLs. Production sample preparation never deletes or resets data.

## Current release boundary

These files are versioned sample inputs, not evidence that a hosted database has been populated. All five role journeys have been exercised against isolated local Supabase with controlled providers. Applying cloud migrations, preparing each role against the intended hosted application, bounded actual-provider checks and verifying the exact Git-triggered release remain separate release steps tracked in .scratch/onboarding-next/issues/20-verify-five-role-product-release.md.

Prepare each role separately with `npm run prepare:sample -- <name>` (frontend, backend, designer, business-analyst or hr). Use the intended application URL and private administrator environment variables described above. Inspect every outcome before continuing; a divergence is preserved for review rather than force-replaced. The command uses actual configured providers through the application's normal indexing route, so respect free-tier quotas and do not run the five preparations concurrently.