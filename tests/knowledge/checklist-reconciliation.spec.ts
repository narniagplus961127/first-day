import { test, expect, type Page } from '@playwright/test';
import type { Checklist, ChecklistTaskInput } from '@/lib/checklists/types';

const origin = 'http://127.0.0.1:3200';
async function login(page: Page, administrator = false) {
  const response = await page.request.post(origin + '/api/auth/login', {
    headers: { origin },
    data: {
      email: administrator ? 'admin@firstday.example' : 'demo@firstday.example',
      password: 'FirstDayDemo!2026',
    },
  });
  expect(response.status()).toBe(200);
}
async function read(page: Page, role: Checklist['job_role']) {
  const response = await page.request.get(
    origin + '/api/checklists?role=' + encodeURIComponent(role),
  );
  expect(response.status()).toBe(200);
  return (await response.json()) as Checklist;
}
async function save(
  page: Page,
  current: Checklist,
  tasks: ChecklistTaskInput[],
) {
  const response = await page.request.put(origin + '/api/admin/checklists', {
    headers: { origin },
    data: {
      jobRole: current.job_role,
      expectedRevision: current.revision,
      tasks,
    },
  });
  expect(response.status()).toBe(200);
  return (await response.json()) as Checklist;
}

test('administrator clarification, reordering and replacement preserve only current task completion', async ({
  page,
  browser,
}) => {
  const adminContext = await browser.newContext();
  const visitorContext = await browser.newContext();
  const admin = await adminContext.newPage();
  const originals: Checklist[] = [];
  try {
    await login(admin, true);
    const frontend = await read(admin, 'Frontend Developer');
    const backend = await read(admin, 'Backend Developer');
    originals.push(frontend, backend);
    const initial = await save(admin, frontend, [
      {
        title: 'Read Lumen conventions',
        stage: 'Before you start',
        instructions: 'Original instructions.',
      },
      { title: 'Run Lumen frontend', stage: 'Day 1', instructions: '' },
      { title: 'Trace a Lumen screen', stage: 'Day 1', instructions: '' },
      { title: 'Practice a Lumen change', stage: 'Week 1', instructions: '' },
    ]);
    await save(admin, backend, [
      {
        title: 'Read Lumen conventions',
        stage: 'Before you start',
        instructions: '',
      },
    ]);
    await login(page);
    await page.goto('/checklist?role=Frontend%20Developer');
    for (const title of [
      'Read Lumen conventions',
      'Run Lumen frontend',
      'Practice a Lumen change',
    ]) {
      await page.getByRole('checkbox', { name: title, exact: true }).check();
    }
    await expect(
      page.getByText('3 of 4 tasks complete', { exact: true }),
    ).toBeVisible();
    const { position: _tracePosition, ...trace } = initial.tasks[2];
    const { position: _runPosition, ...run } = initial.tasks[1];
    const { position: _readPosition, ...conventions } = initial.tasks[0];
    const edited = await save(admin, initial, [
      trace,
      { ...run, title: 'Start Lumen frontend' },
      {
        ...conventions,
        title: 'Review Lumen conventions',
        stage: 'Week 1',
        instructions: 'Clarified instructions for the same obligation.',
      },
    ]);
    await page.reload();
    await expect(
      page.getByText('2 of 3 tasks complete', { exact: true }),
    ).toBeVisible();
    await expect(page.getByText('67%', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 })).toHaveText([
      'Day 1',
      'Week 1',
    ]);
    await expect(page.getByRole('heading', { level: 3 })).toHaveText([
      'Trace a Lumen screen',
      'Start Lumen frontend',
      'Review Lumen conventions',
    ]);
    await expect(
      page.getByRole('checkbox', { name: 'Start Lumen frontend', exact: true }),
    ).toBeChecked();
    await expect(
      page.getByRole('checkbox', {
        name: 'Review Lumen conventions',
        exact: true,
      }),
    ).toBeChecked();
    await expect(
      page.getByText('Clarified instructions for the same obligation.', {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('checkbox', {
        name: 'Practice a Lumen change',
        exact: true,
      }),
    ).toHaveCount(0);
    await page.goto('/workspace');
    await expect(
      page.getByText('2 of 3 tasks complete', { exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole('region', { name: 'Next steps', exact: true })
        .getByRole('link'),
    ).toHaveText(['Trace a Lumen screen']);
    await page.goto('/checklist?role=Frontend%20Developer');
    const replacement = await save(admin, edited, [
      ...edited.tasks,
      {
        title: 'Practice a Lumen change',
        stage: 'Week 1',
        instructions: 'A genuinely new obligation.',
      },
    ]);
    expect(replacement.tasks[3].id).not.toBe(initial.tasks[3].id);
    const recycledIdentity = await admin.request.put(
      origin + '/api/admin/checklists',
      {
        headers: { origin },
        data: {
          jobRole: replacement.job_role,
          expectedRevision: replacement.revision,
          tasks: [...replacement.tasks, { ...initial.tasks[3], position: 4 }],
        },
      },
    );
    expect(recycledIdentity.status()).toBe(400);
    expect(await read(admin, 'Frontend Developer')).toEqual(replacement);
    await page.goto('/workspace');
    await expect(
      page.getByText('2 of 4 tasks complete', { exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole('region', { name: 'Next steps', exact: true })
        .getByRole('link'),
    ).toHaveText(['Trace a Lumen screen', 'Practice a Lumen change']);
    await page.goto('/checklist?role=Frontend%20Developer');
    await page.reload();
    await expect(
      page.getByText('2 of 4 tasks complete', { exact: true }),
    ).toBeVisible();
    await expect(page.getByText('50%', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('checkbox', {
        name: 'Practice a Lumen change',
        exact: true,
      }),
    ).not.toBeChecked();
    await page
      .getByLabel('Job role', { exact: true })
      .selectOption('Backend Developer');
    await expect(
      page.getByText('0 of 1 tasks complete', { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('checkbox', {
        name: 'Read Lumen conventions',
        exact: true,
      }),
    ).not.toBeChecked();
    await page
      .getByLabel('Job role', { exact: true })
      .selectOption('Frontend Developer');
    await expect(
      page.getByText('2 of 4 tasks complete', { exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByText('2 of 4 tasks complete', { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('checkbox', {
        name: 'Review Lumen conventions',
        exact: true,
      }),
    ).toBeChecked();
    const visitor = await visitorContext.newPage();
    await login(visitor);
    await visitor.goto(origin + '/checklist?role=Frontend%20Developer');
    await expect(
      visitor.getByText('0 of 4 tasks complete', { exact: true }),
    ).toBeVisible();
    for (const title of [
      'Trace a Lumen screen',
      'Start Lumen frontend',
      'Review Lumen conventions',
      'Practice a Lumen change',
    ]) {
      await expect(
        visitor.getByRole('checkbox', { name: title, exact: true }),
      ).not.toBeChecked();
    }
  } finally {
    for (const original of originals) {
      const current = await read(admin, original.job_role);
      await save(
        admin,
        current,
        original.tasks.map(({ title, stage, instructions }) => ({
          title,
          stage,
          instructions,
        })),
      );
    }
    await adminContext.close();
    await visitorContext.close();
  }
});
