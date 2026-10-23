import { z } from 'zod';
import { JOB_ROLES } from '@/lib/knowledge/types';
export const STAGES = ['Before you start', 'Day 1', 'Week 1'] as const;
export const checklistTaskInput = z
  .object({
    id: z.uuid().nullable().optional(),
    title: z.string().trim().min(1).max(120),
    stage: z.enum(STAGES),
    instructions: z.string().max(2000),
    position: z.number().int().nonnegative().optional(),
    guideId: z.uuid().nullable().optional(),
    suggestedQuestion: z.null().optional(),
  })
  .strict();
export const checklistSaveInput = z
  .object({
    jobRole: z.enum(JOB_ROLES),
    expectedRevision: z.number().int().nonnegative().max(2147483646),
    tasks: z.array(checklistTaskInput).max(40),
  })
  .strict();
export type ChecklistTaskInput = z.infer<typeof checklistTaskInput>;
export type ChecklistTask = ChecklistTaskInput & {
  id: string;
  position: number;
};
export type Checklist = {
  job_role: (typeof JOB_ROLES)[number];
  revision: number;
  tasks: ChecklistTask[];
};
export const STARTER_TASKS: ChecklistTaskInput[] = [
  [
    'Read onboarding guide',
    'Before you start',
    'Learn how the fictional Lumen team works.',
  ],
  [
    'Check required tools',
    'Before you start',
    'Review the tools used by the Lumen frontend team.',
  ],
  [
    'Configure environment',
    'Day 1',
    'Prepare your local environment using the onboarding guide.',
  ],
  [
    'Run frontend locally',
    'Day 1',
    'Start the application and explore it in your browser.',
  ],
  [
    'Explore project structure',
    'Day 1',
    'Find pages, components and shared utilities.',
  ],
  [
    'Review coding conventions',
    'Week 1',
    'Read the shared frontend coding conventions.',
  ],
  [
    'Trace a UI flow',
    'Week 1',
    'Follow one user action through the application.',
  ],
  [
    'Prepare small practice change',
    'Week 1',
    'Try a small fictional practice change and review it.',
  ],
].map(([title, stage, instructions]) => ({
  title,
  stage: stage as (typeof STAGES)[number],
  instructions,
}));
