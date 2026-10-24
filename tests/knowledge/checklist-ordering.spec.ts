import { test, expect } from '@playwright/test';
const origin = 'http://127.0.0.1:3200';

test('administrator keyboard reorders and moves tasks atomically for learners', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const current = await (
    await page.request.get('/api/checklists?role=Business%20Analyst')
  ).json();
  const setup = await page.request.put('/api/admin/checklists', {
    headers: { origin },
    data: {
      jobRole: 'Business Analyst',
      expectedRevision: current.revision,
      tasks: [
        {
          title: 'Read requirements',
          stage: 'Day 1',
          instructions: 'Keep this instruction.',
        },
        { title: 'Trace a workflow', stage: 'Day 1', instructions: '' },
        { title: 'Review terminology', stage: 'Week 1', instructions: '' },
      ],
    },
  });
  expect(setup.ok()).toBe(true);
  const baseline = await setup.json();
  await page.goto('/admin/checklists?role=Business%20Analyst');
  for (const task of await page.locator('.admin-task').all())
    await task.locator('summary').click();
  await page
    .getByRole('button', { name: 'Move task 2 up', exact: true })
    .focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Task title').first()).toHaveValue(
    'Trace a workflow',
  );
  await expect(
    page.getByRole('button', { name: 'Move task 1 up', exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'Move task 2 down', exact: true }),
  ).toBeDisabled();
  await page
    .getByRole('button', { name: 'Move task 1 down', exact: true })
    .focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Task title').first()).toHaveValue(
    'Read requirements',
  );
  await page
    .getByRole('button', { name: 'Move task 2 up', exact: true })
    .click();
  await page.getByLabel('Stage', { exact: true }).nth(1).selectOption('Week 1');
  await expect(page.getByLabel('Task title').nth(1)).toHaveValue(
    'Review terminology',
  );
  await expect(page.getByLabel('Task title').nth(2)).toHaveValue(
    'Read requirements',
  );
  await page.route('**/api/admin/checklists', (route) => route.abort());
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Your edits have been kept' }),
  ).toBeVisible();
  expect(
    await (
      await page.request.get('/api/checklists?role=Business%20Analyst')
    ).json(),
  ).toEqual(baseline);
  await expect(page.getByLabel('Task title').nth(2)).toHaveValue(
    'Read requirements',
  );
  await expect(page.getByLabel('Instructions').nth(2)).toHaveValue(
    'Keep this instruction.',
  );
  await page.unroute('**/api/admin/checklists');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Changes saved');
  const published = await (
    await page.request.get('/api/checklists?role=Business%20Analyst')
  ).json();
  expect(published.tasks.map((task: { id: string }) => task.id)).toEqual([
    baseline.tasks[1].id,
    baseline.tasks[2].id,
    baseline.tasks[0].id,
  ]);
  expect(
    published.tasks.map((task: { position: number }) => task.position),
  ).toEqual([0, 1, 2]);
  await page.reload();
  await expect(page.getByLabel('Task title').first()).toHaveValue(
    'Trace a workflow',
  );
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  await page.goto('/checklist?role=Business%20Analyst');
  await expect(page.locator('.checklist-task h3')).toHaveText([
    'Trace a workflow',
    'Review terminology',
    'Read requirements',
  ]);
  await expect(
    page.getByRole('heading', { name: 'Before you start', exact: true }),
  ).toHaveCount(0);
  expect(
    (
      await page.request.put('/api/admin/checklists', {
        headers: { origin },
        data: {
          jobRole: 'Business Analyst',
          expectedRevision: published.revision,
          tasks: [],
        },
      })
    ).status(),
  ).toBe(403);
  expect(
    await (
      await page.request.get('/api/checklists?role=Business%20Analyst')
    ).json(),
  ).toEqual(published);
});
