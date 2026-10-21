# 08: Verify the complete hosted journey

**What to build:** Verify a working FirstDay demo on eligible Vercel/Supabase hosting where an administrator publishes a guide and a visitor logs in, asks, inspects evidence, follows up, and sees safe failure behavior with actual configured providers.

**Blocked by:** 05: Continue and reset a private demo conversation; 06: Replace a guide without interrupting answers; 07: Enforce demo limits and handle provider failures.

**Status:** ready-for-agent

- [ ] Recheck repository state, hosting eligibility/quotas, execution constraints, and required configuration. Do not imply free plans permit commercial use or guarantee availability.
- [ ] Use small separate live checks for actual Groq/Google access and compatible embeddings; missing credentials/access remain explicit prerequisites, not mock success.
- [ ] Prepare and, when deployment is authorized, verify the hosted application with server-side secrets and separate learner/admin access. Keep secrets out of bundles, logs, and source control.
- [ ] Demonstrate real Markdown upload, indexing, learner browsing, setup question, cited answer, matching passage, follow-up, and unsupported-question feedback using fictional content.
- [ ] Verify replacement, denied learner mutations, local history/reset, shared limits, and understandable provider errors without deliberately exhausting live free quotas.
- [ ] Check desktop/mobile and keyboard paths against the approved design, without unsolicited preview exports.
- [ ] Confirm indexing/persistence/retry behavior under actual hosting execution limits and understandable database-unavailability feedback.
- [ ] Record results, deployed location when applicable, limitations, tunable defaults, and minimal environment/run instructions for reproducing the demo.
- [ ] Keep additional role datasets, full checklists, and external autonomous actions outside this milestone.

## Comments

Earlier tickets own their behavior tests; this establishes real integration/hosted evidence. Publishing tickets does not provision accounts or authorize unexpected paid resources. Follow deployment authorization applicable when implemented.
