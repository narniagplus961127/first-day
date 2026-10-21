# 01: Demo login and protected administrator access

**What to build:** A visitor views public demo credentials, fills or copies them, and signs into the learner workspace. A private administrator signs into a separate management workspace. Include the initial application setup needed for this real authenticated journey.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Implement the approved desktop/mobile login experience with TypeScript, Next.js, and Supabase authentication; there is no public registration.
- [ ] The popup displays learner credentials and supports copy/fill actions without exposing administrator credentials or secrets.
- [ ] Actual authentication routes learners and administrators appropriately, supports sign-out, and explains invalid credentials or expired sessions.
- [ ] Server authorization distinguishes administrator privileges from the five job roles. Editable profile fields cannot grant administrator access.
- [ ] Direct unauthenticated/learner requests cannot access administrator routes; authorization does not rely on hidden navigation. Apply matching database permissions/policies as tables are introduced.
- [ ] A learner sees the Frontend Developer starting point; retain compatibility with the five agreed job roles and no departments.
- [ ] Keep privileged keys server-side and document environment prerequisites without committing actual keys or private credentials.
- [ ] Browser/API tests verify popup, login routing, invalid/expired sessions, sign-out, denied management access, and keyboard/mobile usability.

## Comments

A fake unprotected login is not completion. If external account configuration is unavailable, record the concrete prerequisite. Knowledge and RAG behavior arrive in later tickets.
