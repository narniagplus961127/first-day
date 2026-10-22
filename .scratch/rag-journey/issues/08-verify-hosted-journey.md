# 08: Verify the complete hosted journey

**What to build:** Verify a working FirstDay demo on eligible Vercel/Supabase hosting where an administrator publishes a guide and a visitor logs in, asks, inspects evidence, follows up, and sees safe failure behavior with actual configured providers.

**Blocked by:** 05: Continue and reset a private demo conversation; 06: Replace a guide without interrupting answers; 07: Enforce demo limits and handle provider failures.

**Status:** resolved

- [x] Recheck repository state, hosting eligibility/quotas, execution constraints, and required configuration. Do not imply free plans permit commercial use or guarantee availability.
- [x] Use small separate live checks for actual Groq/Google access and compatible embeddings; missing credentials/access remain explicit prerequisites, not mock success.
- [x] Prepare and, when deployment is authorized, verify the hosted application with server-side secrets and separate learner/admin access. Keep secrets out of bundles, logs, and source control.
- [x] Demonstrate real Markdown upload, indexing, learner browsing, setup question, cited answer, matching passage, follow-up, and unsupported-question feedback using fictional content.
- [x] Verify replacement, denied learner mutations, local history/reset, shared limits, and understandable provider errors without deliberately exhausting live free quotas.
- [x] Check desktop/mobile and keyboard paths against the approved design, without unsolicited preview exports.
- [x] Confirm indexing/persistence/retry behavior under actual hosting execution limits and understandable database-unavailability feedback.
- [x] Record results, deployed location when applicable, limitations, tunable defaults, and minimal environment/run instructions for reproducing the demo.
- [x] Keep additional role datasets, full checklists, and external autonomous actions outside this milestone.

## Comments

Earlier tickets own their behavior tests; this establishes real integration/hosted evidence. Publishing tickets does not provision accounts or authorize unexpected paid resources. Follow deployment authorization applicable when implemented.

Resolved October 22, 2026. Actual production journey passed at https://firstday-lilac.vercel.app using real Supabase/Google/Groq; deployment dpl_2sB2zyF77ie7g4Q3PPw1Nwp5V5dv serves app commit ab8a7b0. See docs/hosted-verification.md for measured upload/index/resume, citations/follow-up/no-evidence, safe replacement, local history/reset, denials, mobile/keyboard, secret boundaries, limits/failure coverage and remaining availability constraints. Added real local REST outage RED/green coverage on desktop/mobile; Auth remained healthy and REST was restored in finally. No cloud outage, counter reset, paid resources or GitHub publishing.

User-requested Git auto-deployment connection and brand favicon also completed. Final app 3e06bc5 is READY at https://qw-firstday.vercel.app, deployment dpl_4w1NtoWJU2v3eSwEWYidbQVdKgeG. Verified icon metadata/HTTP200/image/svg+xml and real login/persisted guide/source health; no extra model calls. Git settings readback establishes main-production and other-branch-preview intent; no push/webhook test or main merge was performed. See the final hosting section for preserved protections and the stale remote-main distinction.
