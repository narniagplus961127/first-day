# 01: Demo login and protected administrator access

**What to build:** A visitor views public demo credentials, fills or copies them, and signs into the learner workspace. A private administrator signs into a separate management workspace. Include the initial application setup needed for this real authenticated journey.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Implement the approved desktop/mobile login experience with TypeScript, Next.js, and Supabase authentication; there is no public registration.
- [x] The popup displays learner credentials and supports copy/fill actions without exposing administrator credentials or secrets.
- [x] Actual authentication routes learners and administrators appropriately, supports sign-out, and explains invalid credentials or expired sessions.
- [x] Server authorization distinguishes administrator privileges from the five job roles. Editable profile fields cannot grant administrator access.
- [x] Direct unauthenticated/learner requests cannot access administrator routes; authorization does not rely on hidden navigation. Apply matching database permissions/policies as tables are introduced.
- [x] A learner sees the Frontend Developer starting point; retain compatibility with the five agreed job roles and no departments.
- [x] Keep privileged keys server-side and document environment prerequisites without committing actual keys or private credentials.
- [x] Browser/API tests verify popup, login routing, invalid/expired sessions, sign-out, denied management access, and keyboard/mobile usability.

## Comments

A fake unprotected login is not completion. If external account configuration is unavailable, record the concrete prerequisite. Knowledge and RAG behavior arrive in later tickets.

### Implementation evidence

- Supabase cookie authentication verifies identity through getUser and administrator access through server-managed app_metadata; no production bypass.
- TDD red-to-green evidence: missing demo popup failed before implementation; learner sign-in failed before auth endpoints; expired-session explanation failed before feedback was added. Public-boundary tests now pass.
- Desktop/mobile browser suite: 12 tests passed; separate keyboard/clipboard coverage: 2 tests passed.
- TypeScript check and production build passed.
- Real dedicated Supabase browser smoke passed learner/admin sign-in, learner denied administrator API, administrator permitted, and sign-out returning session 401. No credentials logged.
- Database table policies are applied when knowledge tables arrive in ticket 02; ticket 01 introduces Auth and independently protected routes, not public data tables.
