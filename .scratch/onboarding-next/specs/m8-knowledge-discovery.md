# M8 — Knowledge discovery

Status: ready-for-agent

## Problem Statement

The knowledge library lists published guides but lacks the role discovery and title search described in the approved full-product design. As role datasets grow, learners need a quick way to find the right guide without asking a model.

## Solution

Add a job-role filter and case-insensitive title search that work together across published guides while preserving ordinary reading, authentication and navigation performance.

## User Stories

1. As a learner, I want to browse all published guides, so that I can explore knowledge across roles.
2. As a learner, I want to filter guides to one job role, so that I can find relevant onboarding material.
3. As a learner, I want to choose All roles in the library, so that I can broaden browsing intentionally.
4. As a learner, I want to search document titles without case sensitivity, so that I can find a guide using remembered words.
5. As a learner, I want to combine a role filter and title query, so that I can narrow the result set.
6. As a learner, I want to clear a search or role filter, so that I can return to broader results.
7. As a learner, I want to see an honest no-results state, so that I can adjust my search.
8. As a learner, I want to distinguish an empty result from a storage failure, so that I can know whether to retry or change filters.
9. As a learner, I want to keep filter context when returning from a guide, so that I can continue browsing where I left off.
10. As a learner, I want to open the current published reader from a result, so that I can inspect the selected guide.
11. As a learner, I want to keep library filters independent of onboarding and chat roles, so that I can avoid unexpected scope changes.
12. As a learner, I want to avoid seeing unfinished candidate documents, so that I can trust that results are ready.
13. As a keyboard or mobile user, I want to operate search and filters accessibly, so that I can find guides on my device.
14. As a demo owner, I want to search titles without model calls, so that I can preserve inference allowance.

## Implementation Decisions

- Extend the existing authenticated knowledge library and reader. Use exactly the five job roles plus a library-only All roles filter; the filter is relevance, not access control.

- Return only maintained documents with fully indexed active published versions. Preserve current authorization and RLS; do not expose candidate titles or infer hidden documents from result counts.

- Title search is a case-insensitive literal substring search over document titles, not semantic search, passage search or a model request. Trim surrounding whitespace, bound query length to 200 characters, and treat wildcard/punctuation characters literally rather than as an unintended query language.

- Combine the selected role and title query with AND semantics. An empty query retains role filtering, and All roles removes the role constraint without discarding the title query.

- Keep library filter state separate from onboarding role and chat search scope. Preserve it through guide/back navigation and refresh; validated URL state is a suitable implementation default.

- Handle missing/invalid role state safely without inventing new roles. Provide a clear query validation response for excessive input rather than silently running an unbounded query.

- Retain current reader routing and current active-version semantics, result metadata, safe text rendering and stable existing ordering unless evidence requires a change.

- Show specific empty/no-match guidance with clear-filter actions; show a distinct retryable storage error when data cannot be read.

- Preserve the current Singapore deployment region and benchmark navigation through the combined UI. Routine title browsing must make no embedding/generation requests.

- Do not add tags, ranking controls, full-body indexing, pagination infrastructure or administration workflows merely to implement the accepted title filter.

## Testing Decisions

- Reuse real local persistence and learner browser/public read seams. Prepare published guides across roles, a private candidate and titles with mixed case/punctuation.

- Verify role filtering, All roles, title case-insensitivity, combined AND behavior, empty query, clear controls and literal percent/underscore handling.

- Assert no unpublished result leakage, invalid input handling, guide opening and filter restoration after back/refresh.

- Verify changing library filters leaves onboarding role and chat scope unchanged, and that no provider call is made.

- Check empty/no-result versus storage failure, desktop/mobile keyboard interaction and an appropriate navigation measurement without making timing assertions a new CI gate.

## Out of Scope

- Full-text/semantic library search, tags, custom role models and ingestion changes.
- The other role content itself, CI wiring and a redesign of the approved library.

## Further Notes

Tickets 14–15. This milestone depends on the existing RAG reader, not on unfinished checklist tickets, and may be implemented earlier. User authorization on October 23, 2026 accepts the recommendations, test seam and publication of local specifications/tickets without further approval. This does not start implementation or authorize GitHub publication or a release.
