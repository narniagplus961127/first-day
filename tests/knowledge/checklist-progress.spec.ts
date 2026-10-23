import { test, expect, type Page } from '@playwright/test';
const origin = 'http://127.0.0.1:3200';
import type { Checklist } from '@/lib/checklists/types';
const originals = new Map<string, Checklist>();
test.afterEach(async ({ page }) => {
  if (!originals.size) return;
  await login(page, true);
  for (const [role, original] of originals) {
    const current = await (
      await page.request.get('/api/checklists?role=' + encodeURIComponent(role))
    ).json();
    const response = await page.request.put('/api/admin/checklists', {
      headers: { origin },
      data: {
        jobRole: role,
        expectedRevision: current.revision,
        tasks: original.tasks.map(({ title, stage, instructions }) => ({
          title,
          stage,
          instructions,
        })),
      },
    });
    expect(response.status()).toBe(200);
  }
  originals.clear();
});
async function login(page: Page, admin = false) {
  await page.request.post(origin + '/api/auth/login', {
    headers: { origin },
    data: {
      email: admin ? 'admin@firstday.example' : 'demo@firstday.example',
      password: 'FirstDayDemo!2026',
    },
  });
}
test('learner completes and undoes ordered tasks privately across reload and remembered roles', async ({
  page,
  browser,
}) => {
  await login(page, true);
  const current = await (
    await page.request.get('/api/checklists?role=Frontend%20Developer')
  ).json();
  originals.set('Frontend Developer', current);
  const backend = await (
    await page.request.get('/api/checklists?role=Backend%20Developer')
  ).json();
  originals.set('Backend Developer', backend);
  expect(
    (
      await page.request.put('/api/admin/checklists', {
        headers: { origin },
        data: {
          jobRole: 'Backend Developer',
          expectedRevision: backend.revision,
          tasks: [],
        },
      })
    ).status(),
  ).toBe(200);
  const saved = await page.request.put('/api/admin/checklists', {
    headers: { origin },
    data: {
      jobRole: 'Frontend Developer',
      expectedRevision: current.revision,
      tasks: [
        {
          title: 'Review tools for Lumen',
          stage: 'Before you start',
          instructions: 'Check the fictional tools.',
        },
        { title: 'Run Lumen frontend', stage: 'Day 1', instructions: '' },
        { title: 'Practice a UI change', stage: 'Week 1', instructions: '' },
      ],
    },
  });
  expect(saved.status()).toBe(200);
  await login(page);
  await page.goto('/checklist');
  await expect(page.getByLabel('Job role', { exact: true })).toHaveValue(
    'Frontend Developer',
  );
  await expect(
    page.getByText('0 of 3 tasks complete', { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText([
    'Before you start',
    'Day 1',
    'Week 1',
  ]);
  const task = page.getByRole('checkbox', {
    name: 'Review tools for Lumen',
    exact: true,
  });
  await task.focus();
  await page.keyboard.press('Space');
  await expect(
    page.getByText('1 of 3 tasks complete', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('33%', { exact: true })).toBeVisible();
  await page.reload();
  await expect(task).toBeChecked();
  await page
    .getByLabel('Job role', { exact: true })
    .selectOption('Backend Developer');
  await expect(page.getByText('Coming soon.', { exact: false })).toBeVisible();
  await expect(page.getByText('100%', { exact: true })).toHaveCount(0);
  await page.goto('/knowledge');
  await page.goto('/checklist');
  await expect(page.getByLabel('Job role', { exact: true })).toHaveValue(
    'Backend Developer',
  );
  await page
    .getByLabel('Job role', { exact: true })
    .selectOption('Frontend Developer');
  await expect(task).toBeChecked();
  const separate = await browser.newContext();
  try {
    const visitor = await separate.newPage();
    await login(visitor);
    await visitor.goto(origin + '/checklist');
    await expect(
      visitor.getByRole('checkbox', {
        name: 'Review tools for Lumen',
        exact: true,
      }),
    ).not.toBeChecked();
    await expect(
      visitor.getByText('0 of 3 tasks complete', { exact: true }),
    ).toBeVisible();
  } finally {
    await separate.close();
  }
  await task.uncheck();
  await page.reload();
  await expect(task).not.toBeChecked();
});

test('completion and Reset demo reflect all current tasks without changing shared definitions', async ({
  page,
}) => {
  await login(page);
  const baseline = await (
    await page.request.get('/api/checklists?role=Frontend%20Developer')
  ).json();
  expect(baseline.tasks.length).toBeGreaterThan(0);
  await page.goto('/checklist');
  for (const task of baseline.tasks)
    await page.getByRole('checkbox', { name: task.title, exact: true }).check();
  await expect(page.getByText('100%', { exact: true })).toBeVisible();
  await expect(
    page.getByText('You have completed this checklist.', { exact: false }),
  ).toBeVisible();
  await page.goto('/chat');
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('checklist progress');
  await page
    .getByRole('button', { name: 'Reset this browser', exact: true })
    .click();
  await page.goto('/checklist');
  await expect(
    page.getByText(`0 of ${baseline.tasks.length} tasks complete`, {
      exact: true,
    }),
  ).toBeVisible();
  for (const task of baseline.tasks)
    await expect(
      page.getByRole('checkbox', { name: task.title, exact: true }),
    ).not.toBeChecked();
  expect(
    await (
      await page.request.get('/api/checklists?role=Frontend%20Developer')
    ).json(),
  ).toEqual(baseline);
});

test('blocked browser storage explains temporary checklist progress and remains usable', async ({
  page,
}) => {
  await login(page);
  const baseline = await (
    await page.request.get('/api/checklists?role=Frontend%20Developer')
  ).json();
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Blocked storage', 'SecurityError');
    };
  });
  await page.goto('/checklist');
  await expect(
    page
      .getByRole('status')
      .filter({ hasText: 'Browser storage is unavailable' }),
  ).toBeVisible();
  const first = page.getByRole('checkbox', {
    name: baseline.tasks[0].title,
    exact: true,
  });
  await first.check();
  await expect(first).toBeChecked();
  await expect(
    page.getByText(`1 of ${baseline.tasks.length} tasks complete`, {
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(first).not.toBeChecked();
  await expect(
    page.getByRole('status').filter({ hasText: 'temporary in this tab' }),
  ).toBeVisible();
});
