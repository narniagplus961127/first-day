# Browser-local conversation contract

Ticket 05 extends the grounded answer interface with contextual follow-ups and local demo activity. It does not store learner conversations in Supabase or add onboarding checklists.

## Public request and evidence

`POST /api/chat` accepts optional `history: [{scope, question, answer}]`. Omitted history remains compatible with the single-question interface. The server rejects more than three exchanges, a scope different from the current request, empty/non-string text, questions above 1000 characters, or answers above 2000 characters. The total request body is capped at 32768 bytes. History is validated before answering or invoking providers.

The browser submits only the last three successfully completed exchanges in the selected scope, truncating each prior answer to 2000 characters. Successful missing-information responses count as completed exchanges; transport/provider failures and incomplete generation do not. Selected scope is one of the five job roles or the explicit All roles search option. All roles is an independent search conversation, not a sixth job role or authorization identity.

Question embeddings include the bounded recent conversation and the current question so a follow-up such as “What about those environment variables?” can retrieve the same guide without repeating its identifier. Generation receives that history as untrusted context for interpreting the current question. It still receives only active-version passages as evidence and must pass the existing citation/quote checks. Previous assistant text never becomes source evidence.

## Persistence and reset

The versioned key `firstday.demo.conversations.v1` stores the selected scope and up to 20 completed exchanges per scope in this browser's localStorage. Each includes the question and completed answer/citations for source inspection after reload. Original server-side source identity remains version-specific. Storage restoration validates nested claims, citation identities, sizes and line coordinates; source URLs are rebuilt from validated UUIDs rather than trusting stored links. Malformed entries are discarded, and unavailable/invalid storage produces clear feedback while leaving the tab usable.

The UI explains that browser-local persistence still sends up to three recent exchanges to the server and providers. Chats are separate for browser contexts even when both use the same public credentials. No application endpoint synchronizes history across browsers or devices.

Reset demo opens a native accessible dialog. Cancellation keeps history. Confirmation clears conversations across scopes and every key in the reserved `firstday.demo.` local-activity namespace, including future compatible local checklist state. It preserves authentication, shared guides, and other visitors' storage. If browser storage cannot be cleared, the UI says that only the current tab was cleared. Future demo-local features must use this namespace; actual checklist functionality remains out of scope.

Learner workspace chrome uses general onboarding labels. The chat itself labels the active conversation scope rather than presenting every conversation as Frontend Developer.

## Verification

Observable browser/public API tests use real local Supabase and controlled external Google/Groq endpoints. Twelve new desktop/mobile conversation tests passed, including contextual passage retrieval, reload persistence, two visitors, role isolation, reset cancellation/confirmation, history-window bounds, invalid API history, incomplete-answer exclusion, and malformed browser-state restoration. Full regressions passed: 36 knowledge tests and 14 authentication tests. Typecheck and production build passed. No additional live-provider quota is consumed by deterministic conversation tests; the final hosted journey owns the real-provider contextual follow-up check.
