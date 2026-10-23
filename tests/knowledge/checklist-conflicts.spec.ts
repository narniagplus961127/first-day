import { test, expect } from '@playwright/test';
const origin = 'http://127.0.0.1:3200';

test('stale administrators keep their edits until they intentionally reload the accepted checklist', async ({
  page,
  browser,
}) => {
  const secondContext = await browser.newContext();
  const second = await secondContext.newPage();
  try {
    for (const editor of [page, second]) {
      const login = await editor.request.post(origin + '/api/auth/login', {
        headers: { origin },
        data: {
          email: 'admin@firstday.example',
          password: 'FirstDayDemo!2026',
        },
      });
      expect(login.ok()).toBe(true);
    }
    const previous = await (
      await page.request.get('/api/checklists?role=Business%20Analyst')
    ).json();
    const seeded = await page.request.put('/api/admin/checklists', {
      headers: { origin },
      data: {
        jobRole: 'Business Analyst',
        expectedRevision: previous.revision,
        tasks: [
          { title: 'Original analysis task', stage: 'Day 1', instructions: '' },
        ],
      },
    });
    expect(seeded.ok()).toBe(true);
    const baseline = await seeded.json();
    await page.goto('/admin/checklists?role=Business%20Analyst');
    await second.goto(origin + '/admin/checklists?role=Business%20Analyst');
    await page.getByLabel('Task title').fill('Accepted analysis task');
    await second.getByLabel('Task title').fill('Recoverable losing draft');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('status')).toContainText('Changes saved');
    await second.getByRole('button', { name: 'Save changes' }).click();
    await expect(
      second
        .getByRole('alert')
        .filter({ hasText: 'Your edits have been kept' }),
    ).toContainText('Another administrator saved');
    await expect(
      second
        .getByRole('alert')
        .filter({ hasText: 'Your edits have been kept' }),
    ).toContainText('Your edits have been kept');
    await expect(second.getByLabel('Task title')).toHaveValue(
      'Recoverable losing draft',
    );
    await expect(second.getByRole('status')).not.toContainText('Changes saved');
    const accepted = await (
      await page.request.get('/api/checklists?role=Business%20Analyst')
    ).json();
    expect(accepted.revision).toBe(baseline.revision + 1);
    expect(accepted.tasks[0].title).toBe('Accepted analysis task');
    second.once('dialog', (dialog) => dialog.dismiss());
    await second
      .getByRole('button', { name: 'Reload saved checklist' })
      .click();
    await expect(second.getByLabel('Task title')).toHaveValue(
      'Recoverable losing draft',
    );
    second.once('dialog', (dialog) => dialog.accept());
    await second
      .getByRole('button', { name: 'Reload saved checklist' })
      .click();
    await expect(second.getByLabel('Task title')).toHaveValue(
      'Accepted analysis task',
    );
    await expect(second.getByRole('status')).toContainText(
      'Saved checklist reloaded',
    );
    await expect(
      second.getByRole('button', { name: 'Reload saved checklist' }),
    ).toHaveCount(0);
    await second.request.post(origin + '/api/auth/login', {
      headers: { origin },
      data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
    });
    await second.goto(origin + '/checklist?role=Business%20Analyst');
    await expect(
      second.getByRole('heading', {
        name: 'Accepted analysis task',
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      second.getByText('Recoverable losing draft', { exact: true }),
    ).toHaveCount(0);
  } finally {
    await secondContext.close();
  }
});

test('concurrent first saves publish exactly one complete revision and reject missing revisions', async ({
  page,
  browser,
}) => {
  const { readFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const local = JSON.parse(
    readFileSync(
      process.env.FIRSTDAY_TEST_SUPABASE_STATUS_FILE ||
        join(tmpdir(), 'firstday-supabase-fixture', 'status.json'),
      'utf8',
    ),
  );
  expect(local.API_URL).toBe('http://127.0.0.1:55421');
  const removed = await page.request.delete(
    local.API_URL +
      '/rest/v1/onboarding_checklists?job_role=eq.Business%20Analyst',
    {
      headers: {
        apikey: local.SECRET_KEY,
        Authorization: 'Bearer ' + local.SECRET_KEY,
      },
    },
  );
  expect(removed.ok()).toBe(true);
  const otherContext = await browser.newContext();
  try {
    const other = otherContext.request;
    for (const request of [page.request, other]) {
      expect(
        (
          await request.post(origin + '/api/auth/login', {
            headers: { origin },
            data: {
              email: 'admin@firstday.example',
              password: 'FirstDayDemo!2026',
            },
          })
        ).ok(),
      ).toBe(true);
    }
    const initial = await (
      await page.request.get('/api/checklists?role=Business%20Analyst')
    ).json();
    expect(initial).toEqual({
      job_role: 'Business Analyst',
      revision: 0,
      tasks: [],
    });
    const attempts = await Promise.all(
      [page.request, other].map((request, index) =>
        request.put(origin + '/api/admin/checklists', {
          headers: { origin },
          data: {
            jobRole: 'Business Analyst',
            expectedRevision: 0,
            tasks: [
              {
                title: index === 0 ? 'First candidate' : 'Second candidate',
                stage: 'Day 1',
                instructions: 'Complete initial snapshot.',
              },
            ],
          },
        }),
      ),
    );
    expect(attempts.map((result) => result.status()).sort()).toEqual([
      200, 409,
    ]);
    const accepted = await attempts
      .find((result) => result.status() === 200)!
      .json();
    expect(accepted.revision).toBe(1);
    expect(accepted.tasks).toHaveLength(1);
    expect(accepted.tasks[0].id).toBeTruthy();
    const missing = await page.request.put('/api/admin/checklists', {
      headers: { origin },
      data: { jobRole: 'Business Analyst', tasks: [] },
    });
    expect(missing.status()).toBe(400);
    expect(
      (
        await page.request.put('/api/admin/checklists', {
          headers: { origin },
          data: { jobRole: 'Business Analyst', expectedRevision: 0, tasks: [] },
        })
      ).status(),
    ).toBe(409);
    await other.post(origin + '/api/auth/login', {
      headers: { origin },
      data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
    });
    expect(
      await (
        await other.get(origin + '/api/checklists?role=Business%20Analyst')
      ).json(),
    ).toEqual(accepted);
  } finally {
    await otherContext.close();
  }
});

test('validation and network failures retain edits without offering conflict reload', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const prior = await (
    await page.request.get('/api/checklists?role=HR')
  ).json();
  const prepared = await page.request.put('/api/admin/checklists', {
    headers: { origin },
    data: {
      jobRole: 'HR',
      expectedRevision: prior.revision,
      tasks: [
        { title: 'Published people task', stage: 'Day 1', instructions: '' },
      ],
    },
  });
  expect(prepared.ok()).toBe(true);
  const published = await prepared.json();
  await page.goto('/admin/checklists?role=HR');
  await page.getByLabel('Task title').fill('   ');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Check task titles' }),
  ).toBeVisible();
  await expect(page.getByLabel('Task title')).toHaveValue('   ');
  await expect(
    page.getByRole('button', { name: 'Reload saved checklist' }),
  ).toHaveCount(0);
  await page.getByLabel('Task title').fill('Retained network draft');
  await page.route('**/api/admin/checklists', (route) => route.abort());
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Your edits have been kept' }),
  ).toBeVisible();
  await expect(page.getByLabel('Task title')).toHaveValue(
    'Retained network draft',
  );
  await expect(
    page.getByRole('button', { name: 'Reload saved checklist' }),
  ).toHaveCount(0);
  expect(
    await (await page.request.get('/api/checklists?role=HR')).json(),
  ).toEqual(published);
  await page.unroute('**/api/admin/checklists');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toContainText('Changes saved');
});
