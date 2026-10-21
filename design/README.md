# FirstDay design prototype

Open `FirstDay.figcraft` in FigCraft. All screens are editable native frames and layers.

## Prototype starting points

- Select **01 Login** and click Present for the desktop learner journey.
- Select **M01 Login** and click Present for the mobile learner journey.
- Select **09 Admin documents** or **M08 Admin documents** for the separate administrator journey.
- **00 Foundations** contains the palette, typography, control specimens, and links to the starting points.

Prototype hotspots are enabled. Use View demo account, Fill login form, Log in, the sidebar/bottom navigation, role selection, task guides, source citations, and Reset demo to explore the sample journeys.

## Scope

- 45 frames, including desktop and mobile screens, five role paths, and supporting states.
- 454 native prototype interactions.
- Warm light surfaces, apricot highlights, terracotta primary actions, and sage completion states.
- Real AI, authentication, indexing, local persistence, editable inputs, clipboard copying, file upload, and administrator mutations belong to the application implementation. This design uses fixed sample content and linked screen states; it does not execute those operations.
- The credentials shown are fictional design content, not provisioned accounts.
- The full no-evidence and upload-dialog examples are on desktop. The mobile frames illustrate corresponding responsive layouts and navigation, with representative paths rather than every interaction state.

## Rebuild

Run `node design/build-design.cjs` from the project root to regenerate the native file using the installed FigCraft CLI. This replaces the generated file; preserve any manual design edits first.

The JSON command scripts and command-result logs retain the editable layer and interaction definitions. No preview exports are produced.
