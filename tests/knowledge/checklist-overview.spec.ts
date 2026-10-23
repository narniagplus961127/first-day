import { test, expect, type Page } from '@playwright/test';
import type { Checklist } from '@/lib/checklists/types';
const origin = 'http://127.0.0.1:3200';
let originals: Checklist[] = [];
async function login(page: Page, admin = false) {
  expect(
    (
      await page.request.post('/api/auth/login', {
        headers: { origin },
        data: {
          email: admin ? 'admin@firstday.example' : 'demo@firstday.example',
          password: 'FirstDayDemo!2026',
        },
      })
    ).status(),
  ).toBe(200);
}
async function publish(
  page: Page,
  role: string,
  tasks: { title: string; stage: string; instructions: string }[],
) {
  const current = await (
    await page.request.get('/api/checklists?role=' + encodeURIComponent(role))
  ).json();
  const response = await page.request.put('/api/admin/checklists', {
    headers: { origin },
    data: { jobRole: role, expectedRevision: current.revision, tasks },
  });
  expect(response.status()).toBe(200);
  return response.json() as Promise<Checklist>;
}
test.afterEach(async ({ page }) => {
  if (!originals.length) return;
  await login(page, true);
  for (const original of originals)
    await publish(
      page,
      original.job_role,
      original.tasks.map(({ title, stage, instructions }) => ({
        title,
        stage,
        instructions,
      })),
    );
  originals = [];
});
test('overview shares role and completion, links the next three saved tasks and reflects undo', async ({
  page,
}) => {
  await login(page, true);
  originals.push(
    await (
      await page.request.get('/api/checklists?role=Frontend%20Developer')
    ).json(),
  );
  const saved = await publish(page, 'Frontend Developer', [
    {
      title: 'Read Lumen introduction',
      stage: 'Before you start',
      instructions: '',
    },
    { title: 'Prepare frontend tools', stage: 'Day 1', instructions: '' },
    { title: 'Run a local page', stage: 'Day 1', instructions: '' },
    { title: 'Practice a small change', stage: 'Week 1', instructions: '' },
  ]);
  await login(page);
  await page.goto('/workspace');
  await expect(page.getByLabel('Job role', { exact: true })).toHaveValue(
    'Frontend Developer',
  );
  await expect(
    page.getByText('0 of 4 tasks complete', { exact: true }),
  ).toBeVisible();
  const next = page.getByRole('region', { name: 'Next steps' });
  await expect(next.getByRole('link')).toHaveText([
    'Read Lumen introduction',
    'Prepare frontend tools',
    'Run a local page',
  ]);
  await next
    .getByRole('link', { name: 'Prepare frontend tools', exact: true })
    .focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp('#task-' + saved.tasks[1].id + '$'));
  const checkbox = page.getByRole('checkbox', {
    name: 'Prepare frontend tools',
    exact: true,
  });
  await expect(checkbox).not.toBeChecked();
  await checkbox.check();
  await page.goto('/workspace');
  await expect(
    page.getByText('1 of 4 tasks complete', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('25%', { exact: true })).toBeVisible();
  await expect(next.getByRole('link')).toHaveText([
    'Read Lumen introduction',
    'Run a local page',
    'Practice a small change',
  ]);
  await page.reload();
  await expect(
    page.getByText('1 of 4 tasks complete', { exact: true }),
  ).toBeVisible();
  await page.goto('/checklist');
  await checkbox.uncheck();
  await page.goto('/workspace');
  await expect(
    page.getByText('0 of 4 tasks complete', { exact: true }),
  ).toBeVisible();
});

test('overview celebrates completion, remembers an empty role and keeps chat scope independent', async ({
  page,
}) => {
  await login(page, true);
  for (const role of ['Frontend Developer', 'HR']) {
    originals.push(
      await (
        await page.request.get(
          '/api/checklists?role=' + encodeURIComponent(role),
        )
      ).json(),
    );
  }
  await publish(page, 'Frontend Developer', [
    { title: 'Practice after settling in', stage: 'Week 1', instructions: '' },
    {
      title: 'Read before joining',
      stage: 'Before you start',
      instructions: '',
    },
  ]);
  await publish(page, 'HR', []);
  await login(page);
  await page.goto('/workspace');
  await expect(
    page.getByRole('region', { name: 'Next steps' }).getByRole('link'),
  ).toHaveText(['Read before joining', 'Practice after settling in']);
  await page
    .getByRole('link', { name: 'Continue onboarding', exact: false })
    .click();
  await page
    .getByRole('checkbox', { name: 'Read before joining', exact: true })
    .check();
  await page
    .getByRole('checkbox', { name: 'Practice after settling in', exact: true })
    .check();
  await page.goto('/workspace');
  await expect(
    page.getByText('2 of 2 tasks complete', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('100%', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Well done. You have completed this checklist.', {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Explore guides', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Keep asking FirstDay', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Next steps' }),
  ).not.toBeVisible();
  await page.getByLabel('Job role', { exact: true }).selectOption('HR');
  await expect(page.getByText('Coming soon.', { exact: false })).toBeVisible();
  await expect(page.getByRole('progressbar')).toHaveCount(0);
  await page.reload();
  await expect(page.getByLabel('Job role', { exact: true })).toHaveValue('HR');
  await page.goto('/checklist');
  await expect(page.getByLabel('Job role', { exact: true })).toHaveValue('HR');
  await page.goto('/chat');
  await page
    .getByLabel('Search scope', { exact: true })
    .selectOption('All roles');
  await page.goto('/workspace');
  await expect(page.getByLabel('Job role', { exact: true })).toHaveValue('HR');
  await page
    .getByLabel('Job role', { exact: true })
    .selectOption('Frontend Developer');
  await expect(
    page.getByText('2 of 2 tasks complete', { exact: true }),
  ).toBeVisible();
});

test('overview retries a failed checklist read without inventing empty or completed progress', async ({
  page,
}) => {
  await login(page, true);
  originals.push(
    await (
      await page.request.get('/api/checklists?role=Frontend%20Developer')
    ).json(),
  );
  await publish(page, 'Frontend Developer', [
    {
      title: 'Remember my completed preparation',
      stage: 'Before you start',
      instructions: '',
    },
    {
      title: 'Continue after storage recovers',
      stage: 'Day 1',
      instructions: '',
    },
  ]);
  await login(page);
  await page.goto('/checklist?role=Frontend%20Developer');
  await page
    .getByRole('checkbox', {
      name: 'Remember my completed preparation',
      exact: true,
    })
    .check();
  await page.route('**/api/checklists?role=*', (route) =>
    route.fulfill({
      status: 503,
      json: { error: 'Checklist storage is unavailable. Please try again.' },
    }),
  );
  await page.goto('/workspace');
  await expect(page.getByRole('main').getByRole('alert')).toContainText(
    'Checklist could not be loaded. Please try again.',
  );
  await expect(page.getByText('Coming soon.', { exact: false })).toHaveCount(0);
  await expect(page.getByRole('progressbar')).toHaveCount(0);
  await page.unroute('**/api/checklists?role=*');
  await page
    .getByRole('button', { name: 'Retry checklist', exact: true })
    .click();
  await expect(
    page.getByText('1 of 2 tasks complete', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('50%', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Next steps' }).getByRole('link'),
  ).toHaveText(['Continue after storage recovers']);
});
