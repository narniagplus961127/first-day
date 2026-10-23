# Lumen Frontend Developer onboarding

This is a fictional Lumen exercise. These instructions describe a practice workspace, not the FirstDay repository or a real employer. Use invented data and keep all practice changes local.

## Before you start

Read this entire onboarding guide before trying the eight tasks. The fictional frontend workspace requires Node.js 22, npm 10, Git and a browser with developer tools. Check the installed versions with node --version, npm --version and git --version. Do not install or change real company tools for this exercise.

## Environment and startup

Copy .env.example to .env.local in the fictional workspace. Set LUMEN_WEB_PORT=4101 in that local file; do not add passwords or actual credentials. Run npm run dev:lumen -- --port 4101. Open http://localhost:4101 and inspect the sample welcome page. The command and environment-file step belong to the fictional exercise only.

## Project structure

In the fictional workspace, src/pages contains pages, src/components contains reusable UI and src/lib contains shared utilities. Locate the Welcome page in src/pages/welcome.tsx, its WelcomeCard in src/components/welcome-card.tsx and its formatWelcome helper in src/lib/welcome.ts.

## Coding conventions

Use descriptive TypeScript names and explicit component props. Reuse the shared Button component and the space.4 spacing token. Give interactive controls descriptive labels and visible keyboard focus. Run npm run test:ui to check the practice change. Record any remaining questions in an unsent exercise note.

## Trace and practice

Trace the welcome button action from WelcomeCard to the Welcome page and then to formatWelcome. For a small practice change, edit the fictional welcome message, add a UI test for the changed text, run npm run test:ui and review the local diff. Do not deploy, contact anyone or change a real system. The guide deliberately provides no salary or production-hosting information.
