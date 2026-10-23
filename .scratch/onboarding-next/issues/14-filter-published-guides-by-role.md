# 14: Filter the knowledge library by job role

**Milestone:** M8

**What to build:** Learners narrow published guides to one role or browse All roles while retaining the existing authenticated reader.

**Blocked by:** None (can start immediately against the completed RAG baseline).

**Status:** ready-for-agent

**Progress:** resolved

- [x] Offer exactly the five job roles plus All roles as a library filter, not a new onboarding role.
- [x] Show only fully published active guides and preserve unrestricted learner read access across roles.
- [x] Keep library selection independent of onboarding role and chat scope.
- [x] Preserve selected filtering through guide/back navigation and refresh, with safe handling of invalid role state.
- [x] Distinguish empty filtered results from a storage read failure and provide useful clear/retry actions.
- [x] Verify learner authorization, no candidate-title leakage, reader navigation and mobile/keyboard interaction without any model requests.

## Comments

Implemented authenticated library filtering with exactly five roles and All roles, validated URL state, persistent reader return context, clear controls and mobile/keyboard GET forms. No onboarding/chat scope is written and no model requests are made during browsing. Native FigCraft library/reader frames were inspected without preview exports.

Observable verification: the initial role-control test failed before implementation; desktop/mobile role selection, refresh, reader return, clearing and unchanged chat/provider counters then passed. Anonymous/candidate access and invalid/repeated URL values passed in both projects. A real dedicated PostgREST outage exposed a retry bug; retry now reloads the current URL, and both desktop/mobile recovery journeys passed after service restoration. Six effective focused passes across these runs. The current fixture's empty HR role was observed separately; long-term deterministic empty-query coverage belongs to ticket 15, avoiding a fragile assumption about future role datasets. Typecheck, production build and CRLF repository checks passed before integration.