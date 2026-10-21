# 02: Upload and inspect a knowledge document

**What to build:** An administrator uploads an English Markdown guide, assigns its title and job role, and inspects the saved original content and status. Learners cannot read or retrieve this unindexed document.

**Blocked by:** 01: Demo login and protected administrator access.

**Status:** ready-for-agent

- [ ] Support one UTF-8 English Markdown file per upload, maximum 100 KB, with title and one of the five job roles. Use fictional Frontend Developer content initially.
- [ ] Validate size, format, metadata, and empty/unusable content at the server and show actionable errors.
- [ ] Persist document identity, a candidate version, original text, job role, and initial indexing state. Filename similarity does not silently replace another document.
- [ ] The administrator can reopen the candidate and inspect its title, headings, code blocks, and role in a safe Markdown reader that does not execute embedded content.
- [ ] Show that the document is not ready for learner retrieval; an unindexed draft is not an active version.
- [ ] Learners cannot upload, alter, or inspect candidates through UI, endpoints, or direct data access.
- [ ] Responsive upload/inspection provides recoverable request-failure feedback.
- [ ] Browser/API tests verify persisted inspection, accepted input, invalid/oversized/unsupported/empty uploads, and direct authorization checks against real test persistence.

## Comments

This slice needs no embedding calls. Publication and learner reading wait for indexing in ticket 03.
