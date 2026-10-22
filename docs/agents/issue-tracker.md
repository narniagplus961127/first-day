# Issue tracker: Local Markdown

Track work under .scratch/<feature>/.

- spec.md: feature specification.
- map.md: progress, decisions, and open questions.
- issues/NN-slug.md: one numbered file per task.
- Each issue records its Status triage label, Progress lifecycle, and any dependencies.
- Append discussion under a Comments heading.
- Update progress when work starts, becomes blocked, or completes.

Status uses one of the five labels in triage-labels.md and describes routing/readiness. Progress is separate: not-started, in-progress, blocked, or resolved. Completion sets Progress to resolved and checks acceptance items; it does not create a sixth triage label or change a ready-for-agent issue into an unresolved task. The map summarizes Progress, and only issues whose Progress is not resolved belong on the active frontier.
