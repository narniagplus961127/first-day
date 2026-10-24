# Durable regressions and visitor documentation

## Scope — October 24, 2026

User approved the retrospective improvements and requested a README for visitors. Work is on test/visitor-readme-regressions from main 35140bb. CI/hooks and previously deferred tracker-checker work remain outside this slice.

## Delivered

- Permanent real-fixture browser/API tests cover public admin demo login, read-only controls, private-admin controls, published inspection and unpublished-content denial, valid mutation denials, user-metadata impersonation, direct database permission denial at the current revision, and unchanged shared definitions.
- Layout regressions cover a stationary visible sidebar footer while the page and short sidebar scroll, hero/reset clearance, separate 44 px task actions at desktop/390/320 widths, no horizontal overflow, and learner/private-admin/demo-admin/root logo destinations. Client navigation assertions wait for the destination URL.
- README now introduces the live demo, account choices, a short visitor tour, five roles, RAG behavior, browser-local activity and a compact stack overview. Existing setup, provisioning, verification and hosting instructions live in docs/technical-guide.md; local links were verified.
- npm run inspect:design lists native frame names or returns selected dimensions/colours/spacing for one exact frame name, capped at 40 layers. It uses read-only CLI roots and temporary command input, preserves the native binary and creates no design previews. agent.md points to the compact developer instructions.
- The existing development guide records the actual On Board RAG project versus this old chat's RAG writable root. Repository changes cannot alter the active chat permission profile; future chats should use the saved project with the actual repository root. No filesystem move or app configuration bypass was attempted.

## Verification

- New and existing desktop/mobile public-boundary run: 11 passed; one desktop-only sidebar case correctly skipped on mobile. External providers were controlled; the database/Auth/RLS fixture was real and isolated.
- Sensitivity checks deliberately set task-action gap to zero and admitted admin_demo through the private-write application guard, one fault at a time. Each targeted test failed at the expected gap/HTTP assertion. Original application files were restored byte-for-byte in finally blocks; the Git diff contains no runtime source changes.
- A post-mutation run exposed a short login-navigation assertion: Auth returned HTTP 200 while the next page remained pending beyond five seconds. Fixture-only trace evidence was preserved, and the new tests now use explicit bounded navigation-completion waits before URL assertions.
- Final new-test desktop/mobile run after the navigation-wait fix: 7 passed; the desktop-only sidebar case correctly skipped on mobile. Existing four login/navigation cases passed in the initial combined run and were unchanged.
- TypeScript, existing three tooling tests, CRLF/repository validation and whitespace checks passed. Visitor/technical/development Markdown links resolve locally.
- The design helper returned the exact approved 04 Overview action geometry and rejected a numeric frame guess. Native binary hash remains 182443980b4843aac0912032b8b60c4193c50164.

## Release record

Implementation and verification are complete. [PR #8](https://github.com/narniagplus961127/first-day/pull/8) carries the existing Git preview/main-production release gate results. Preview 3eb8e7b6d9ad160d1eff25a94136c39e33ae2adb is READY as dpl_HDgcDXgQsU3EwGUduSs5X2fSnz2F. Exact final main/production identities belong to the PR record; npm run check:release inspects the current main/production alias. No application behavior, database schema/policy, provider configuration, native design or account was changed in this slice.
