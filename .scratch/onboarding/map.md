# FirstDay progress

## Completed

- Confirmed product name: FirstDay.
- Configured agent.md and local Markdown issue tracking.
- Confirmed the five default triage labels.
- User approved the native FigCraft design.
- Published the complete first RAG journey specification with Status: ready-for-agent using to-spec.
- User confirmed tests at observable browser/API boundaries with simulated provider failures and a separate small live-provider smoke check.
- User approved the eight-ticket breakdown; published individual ready-for-agent tickets under .scratch/rag-journey/issues/.

## Decisions so far

- Build an onboarding RAG application using TypeScript.
- Create and review a Figcraft design file before application development.
- Plan hosting around Vercel and Supabase free tiers for the prototype.
- Include a login-page popup displaying demo account credentials.
- Support onboarding for backend developers, frontend developers, business analysts, designers, and HR.
- Administrators upload Markdown notes; learners read and ask questions.
- Use a light interface with light orange accents, a navigation sidebar, and citations beside answers; include desktop and mobile designs.
- Use five roles only: Frontend Developer, Backend Developer, Designer, Business Analyst, and HR; no departments.
- All demo users can access onboarding documents for every role.
- Learners self-complete administrator-defined checklists without manager approval.
- Figcraft is installed at C:\Program Files\FigCraft with figcraft.exe and figcraft-cli.exe.
- FigCraft CLI supports native .figcraft files, scripted document creation, and preview exports.
- Learners freely switch among five roles, with separate checklist progress per role.
- Shared demo login credentials are public; demo chats and progress stay in each visitor's browser and can be reset.
- A separate private administrator account manages content and checklists; no public registration in the initial demo.
- User approved the consolidated design brief and requested proceeding.
- User requested native FigCraft prototype review without preview exports.
- Confirmed the first implementation journey: admin Markdown upload and indexing, learner question, cited answer, source passage, and unsupported-question handling.
- First journey uses English Markdown and fictional company content; other role content/checklists follow later.
- Confirmed Groq free API with configurable openai/gpt-oss-20b for answers and Google gemini-embedding-2 for document/question embeddings; account access remains unverified.
- Confirmed follow-ups use the last three exchanges within the selected role, with browser-local history and relevant messages sent per request.
- Confirmed one Markdown file per upload, maximum 100 KB, with indexing progress and retry.
- Confirmed safe replacement: the active version remains searchable until replacement indexing succeeds.
- Confirmed server limits of 5 questions/minute/IP and 100 questions/day across the demo, plus provider-quota retry feedback.
- Created design/FirstDay.figcraft: 45 native frames and 454 linked interactions, including desktop/mobile screens and five role paths.

## Open questions

- Actual provider access, quotas, and deployment eligibility/configuration require verification during implementation preparation.
- No application code has been created. Implementation tickets are published; ticket 01 is the dependency frontier.

## Next

- Use spec.md as the current complete first-journey specification.
- Follow ../rag-journey/map.md for dependencies and implementation progress. Implementation has not started.
