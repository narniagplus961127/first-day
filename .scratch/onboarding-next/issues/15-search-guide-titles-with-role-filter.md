# 15: Search published guide titles alongside role filters

**Milestone:** M8

**What to build:** Learners find published guides with a case-insensitive title query combined with the selected role.

**Blocked by:** 14: Filter the knowledge library by job role

**Status:** ready-for-agent

**Progress:** not-started

- [ ] Apply literal case-insensitive title substring matching and role filtering together with AND semantics.
- [ ] Trim surrounding query whitespace, bound query length, and treat percent/underscore/punctuation as literal search content.
- [ ] An empty query preserves the role selection; clearing either control retains the other's intended effect.
- [ ] Preserve search/filter context through reader/back navigation and refresh.
- [ ] Show clear no-match guidance and keep storage failures distinct from legitimate empty results.
- [ ] Do not search private candidates, call embeddings/generation, or modify chat/onboarding scopes.
- [ ] Verify combined filtering, mixed-case/punctuation titles, invalid/excessive input and desktop/mobile keyboard behavior using real persistence.
