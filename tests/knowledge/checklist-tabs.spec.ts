import { test, expect, type Page } from '@playwright/test';
import type { ChecklistTask } from '@/lib/checklists/types';
const origin = 'http://127.0.0.1:3200';
async function login(page: Page, admin = false) {
  const response = await page.request.post(origin + '/api/auth/login', {
    headers: { origin },
    data: {
      email: admin ? 'admin@firstday.example' : 'demo@firstday.example',
      password: 'FirstDayDemo!2026',
    },
  });
  expect(response.status()).toBe(200);
}
let originalTasks: ChecklistTask[] | null = null;
test.afterEach(async ({ page }) => {
  if (!originalTasks) return;
  await login(page, true);
  const current = await (
    await page.request.get('/api/checklists?role=Frontend%20Developer')
  ).json();
  const response = await page.request.put('/api/admin/checklists', {
    headers: { origin },
    data: {
      jobRole: 'Frontend Developer',
      expectedRevision: current.revision,
      tasks: originalTasks.map(({ id, position, ...task }) => task),
    },
  });
  expect(response.status()).toBe(200);
  originalTasks = null;
});
test('task changes survive interleaved tabs and the latest same-task action while other browsers stay private', async ({
  page,
  context,
  browser,
}) => {
  await login(page, true);
  const original = await (
    await page.request.get('/api/checklists?role=Frontend%20Developer')
  ).json();
  const saved = await page.request.put('/api/admin/checklists', {
    headers: { origin },
    data: {
      jobRole: 'Frontend Developer',
      expectedRevision: original.revision,
      tasks: [
        {
          title: 'Tab tools review',
          stage: 'Before you start',
          instructions: '',
        },
        { title: 'Tab environment setup', stage: 'Day 1', instructions: '' },
      ],
    },
  });
  expect(saved.status()).toBe(200);
  originalTasks = original.tasks;
  await login(page);
  const checklist = await (
    await page.request.get('/api/checklists?role=Frontend%20Developer')
  ).json();
  expect(checklist.tasks.length).toBeGreaterThanOrEqual(2);
  await page.goto('/checklist?role=Frontend%20Developer');
  const other = await context.newPage();
  // Delay incoming browser events so each tab acts on its own stale visible snapshot.
  await other.addInitScript(() =>
    window.addEventListener('storage', (event) =>
      event.stopImmediatePropagation(),
    ),
  );
  await other.goto('/checklist?role=Frontend%20Developer');
  const first = checklist.tasks[0].title;
  const second = checklist.tasks[1].title;
  await expect(
    other.getByRole('checkbox', { name: first, exact: true }),
  ).not.toBeChecked();
  await page.getByRole('checkbox', { name: first, exact: true }).check();
  await other.getByRole('checkbox', { name: second, exact: true }).check();
  await expect(
    page.getByRole('checkbox', { name: first, exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole('checkbox', { name: second, exact: true }),
  ).toBeChecked();
  await other.reload();
  await expect(
    other.getByRole('checkbox', { name: first, exact: true }),
  ).toBeChecked();
  await expect(
    other.getByRole('checkbox', { name: second, exact: true }),
  ).toBeChecked();
  await other.getByRole('checkbox', { name: first, exact: true }).uncheck();
  await expect(
    page.getByRole('checkbox', { name: first, exact: true }),
  ).not.toBeChecked();
  await page.getByRole('checkbox', { name: first, exact: true }).check();
  await other.reload();
  await expect(
    other.getByRole('checkbox', { name: first, exact: true }),
  ).toBeChecked();
  await page.reload();
  await expect(
    page.getByRole('checkbox', { name: first, exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole('checkbox', { name: second, exact: true }),
  ).toBeChecked();
  const separate = await browser.newContext();
  try {
    const visitor = await separate.newPage();
    await login(visitor);
    await visitor.goto(origin + '/checklist?role=Frontend%20Developer');
    await expect(
      visitor.getByRole('checkbox', { name: first, exact: true }),
    ).not.toBeChecked();
    await expect(
      visitor.getByRole('checkbox', { name: second, exact: true }),
    ).not.toBeChecked();
  } finally {
    await separate.close();
  }
});
test('open overview follows completion without mixing job role progress', async ({
  page,
  context,
}) => {
  await login(page, true);
  const original = await (
    await page.request.get('/api/checklists?role=Frontend%20Developer')
  ).json();
  const saved = await page.request.put('/api/admin/checklists', {
    headers: { origin },
    data: {
      jobRole: 'Frontend Developer',
      expectedRevision: original.revision,
      tasks: [
        {
          title: 'Shared tab onboarding task',
          stage: 'Day 1',
          instructions: '',
        },
      ],
    },
  });
  expect(saved.status()).toBe(200);
  originalTasks = original.tasks;
  await login(page);
  await page.goto('/workspace');
  await expect(
    page.getByText('0 of 1 tasks complete', { exact: true }),
  ).toBeVisible();
  const checklist = await context.newPage();
  await checklist.goto('/checklist?role=Frontend%20Developer');
  await checklist
    .getByRole('checkbox', { name: 'Shared tab onboarding task', exact: true })
    .check();
  await expect(
    page.getByText('1 of 1 tasks complete', { exact: true }),
  ).toBeVisible();
  await checklist
    .getByLabel('Job role', { exact: true })
    .selectOption('Backend Developer');
  await expect(page.getByLabel('Job role', { exact: true })).toHaveValue(
    'Backend Developer',
  );
  await expect(checklist.locator('input[type=checkbox]:checked')).toHaveCount(
    0,
  );
  await checklist
    .getByLabel('Job role', { exact: true })
    .selectOption('Frontend Developer');
  await expect(
    checklist.getByRole('checkbox', {
      name: 'Shared tab onboarding task',
      exact: true,
    }),
  ).toBeChecked();
  await expect(
    page.getByText('1 of 1 tasks complete', { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText('1 of 1 tasks complete', { exact: true }),
  ).toBeVisible();
});
