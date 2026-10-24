# Workspace polish and administrator demo

## Scope — October 24, 2026

User reported a scrolling-away sidebar footer, touching overview/task actions and workspace logos routing to login; requested native FigCraft alignment and a public administrator demo. Changes use fix/workspace-layout-admin-demo from main 2e9d450.

## Implemented

- Viewport-height sticky desktop sidebar, independently scrollable navigation/body and fixed footer space; short viewports retain sign-out access. Existing mobile Menu remains.
- Overview reset has 24 px separation from the hero. Task actions use wrapping flex rows with 16 px horizontal and 12 px vertical gaps and 44 px minimum link target height.
- Workspace logos link to learner Overview or administrator Documents. Root redirects according to the verified session instead of unconditionally sending signed-in visitors to login.
- Demo popup offers learner and separate read-only administrator accounts. Server-managed admin_demo can view published documents and checklist management; mutations still require the private admin role. Published inspection uses the existing active-version reader. Database policies and private credentials remain unchanged.
- Guarded seed-admin-demo script provisions only the dedicated FirstDay project or isolated fixture, refuses identity collisions and preserves private administrator/learner identities. Dedicated cloud read-only identity provisioned successfully.
- Read-only native FigCraft overview/admin layer inspection preserved sidebar proportions, light-orange identity and card spacing. Native binary hash remains 182443980b4843aac0912032b8b60c4193c50164. No native design edit or preview export.

## Verification

- Live pre-fix reproduction: hero/reset gap 0 px, task-action gap 0 px, footer below viewport and moving with document scroll, logo href / feeding unconditional login redirect.
- Existing real-fixture desktop/mobile product-navigation and checklist-conflict tests: 10/10 passed.
- Focused real-browser smoke: sidebar visible/stationary at 650 px and usable at 450 px; reset gap 24 px; task-action gaps 16/16/12 px at widths 1280/390/320; no horizontal overflow. Session-aware learner/root/admin logo destinations passed.
- Popup admin login, disabled upload/save, role switching, published guide inspection and mobile admin Menu passed. All five upload/index/replacement/checklist mutation attempts returned 403. Direct authenticated checklist RPC/table and document-creation writes were denied. Private admin upload/save remained enabled. No live-provider calls.
- Production build, TypeScript, repository CRLF and whitespace checks passed. Application browser image inspected locally; no credential-bearing traces or auth-state artifacts.

## Release

Git preview and production verification pending publication. Original M1–M10 release snapshot remains historical evidence in docs/hosted-verification.md; use npm run check:release for current main/alias identity.
