import { test, expect } from '@playwright/test';
const origin = 'http://127.0.0.1:3200';
test('administrator publishes a checklist that learners can read after reload', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const previous = await (
    await page.request.get('/api/checklists?role=Designer')
  ).json();
  await page.request.put('/api/admin/checklists', {
    headers: { origin },
    data: {
      jobRole: 'Designer',
      expectedRevision: previous.revision,
      tasks: [],
    },
  });
  await page.goto('/admin/checklists?role=Designer');
  await page.getByRole('button', { name: 'Add task' }).click();
  const title = 'Explore Lumen design ' + Date.now();
  await page.getByLabel('Task title').last().fill(title);
  await page
    .getByLabel('Instructions')
    .last()
    .fill('Read the shared fictional design conventions.');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toContainText('Changes saved');
  await page.reload();
  await expect(page.getByLabel('Task title').last()).toHaveValue(title);
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const result = await page.request.get('/api/checklists?role=Designer');
  expect(result.status()).toBe(200);
  expect(
    (await result.json()).tasks.some(
      (task: { title: string }) => task.title === title,
    ),
  ).toBe(true);
  await page.goto('/checklist?role=Designer');
  await expect(
    page.getByRole('heading', { name: title, exact: true }),
  ).toBeVisible();
});

test('invalid snapshots leave the published checklist intact and retired identities cannot return', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const current = await (
    await page.request.get('/api/checklists?role=HR')
  ).json();
  const saved = await page.request.put('/api/admin/checklists', {
    headers: { origin },
    data: {
      jobRole: 'HR',
      expectedRevision: current.revision,
      tasks: [
        {
          title: 'Read the Lumen people guide',
          stage: 'Day 1',
          instructions: 'Fictional example.',
        },
      ],
    },
  });
  expect(saved.status()).toBe(200);
  const baseline = await saved.json();
  const task = baseline.tasks[0];
  const invalid = [
    { jobRole: 'Engineering' },
    { expectedRevision: -1 },
    { tasks: [{ ...task, title: ' '.repeat(3) }] },
    { tasks: [{ ...task, title: 'a'.repeat(121) }] },
    { tasks: [{ ...task, instructions: 'a'.repeat(2001) }] },
    { tasks: [{ ...task, stage: 'Tomorrow' }] },
    { tasks: [{ ...task, id: '00000000-0000-4000-8000-000000000000' }] },
    { tasks: [task, task] },
    {
      tasks: Array.from({ length: 41 }, () => ({
        title: 'Task',
        stage: 'Day 1',
        instructions: '',
      })),
    },
    { tasks: [{ ...task, position: 8 }] },
    { tasks: [{ ...task, guideId: 'not-a-guide' }] },
  ];
  for (const change of invalid) {
    const response = await page.request.put('/api/admin/checklists', {
      headers: { origin },
      data: {
        jobRole: 'HR',
        expectedRevision: baseline.revision,
        tasks: baseline.tasks,
        ...change,
      },
    });
    expect(response.status()).toBe(400);
    expect(
      await (await page.request.get('/api/checklists?role=HR')).json(),
    ).toEqual(baseline);
  }
  const tooLarge = await page.request.put('/api/admin/checklists', {
    headers: { origin },
    data: ' '.repeat(262145),
  });
  expect(tooLarge.status()).toBe(413);
  expect(
    (
      await page.request.put('/api/admin/checklists', {
        headers: { origin },
        data: '{broken',
      })
    ).status(),
  ).toBe(400);
  const crossRole = await page.request.get('/api/checklists?role=Designer');
  const designer = await crossRole.json();
  expect(
    (
      await page.request.put('/api/admin/checklists', {
        headers: { origin },
        data: {
          jobRole: 'Designer',
          expectedRevision: designer.revision,
          tasks: [task],
        },
      })
    ).status(),
  ).toBe(400);
  const removed = await page.request.put('/api/admin/checklists', {
    headers: { origin },
    data: { jobRole: 'HR', expectedRevision: baseline.revision, tasks: [] },
  });
  expect(removed.status()).toBe(200);
  const empty = await removed.json();
  expect(empty.tasks).toEqual([]);
  expect(
    (
      await page.request.put('/api/admin/checklists', {
        headers: { origin },
        data: {
          jobRole: 'HR',
          expectedRevision: empty.revision,
          tasks: [task],
        },
      })
    ).status(),
  ).toBe(400);
  const fresh = await page.request.put('/api/admin/checklists', {
    headers: { origin },
    data: {
      jobRole: 'HR',
      expectedRevision: empty.revision,
      tasks: [
        {
          title: task.title,
          stage: task.stage,
          instructions: task.instructions,
        },
      ],
    },
  });
  const replacement = await fresh.json();
  expect(replacement.tasks[0].id).not.toBe(task.id);
  expect(
    (
      await page.request.put('/api/admin/checklists', {
        headers: { origin },
        data: { jobRole: 'HR', expectedRevision: empty.revision, tasks: [] },
      })
    ).status(),
  ).toBe(409);
  expect(
    await (await page.request.get('/api/checklists?role=HR')).json(),
  ).toEqual(replacement);
});

test('anonymous and learner writes are denied by the application and real Data API', async ({
  page,
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
  expect((await page.request.get('/api/checklists?role=HR')).status()).toBe(
    401,
  );
  expect(
    (
      await page.request.put('/api/admin/checklists', {
        headers: { origin },
        data: {},
      })
    ).status(),
  ).toBe(401);
  const anonymous = await page.request.post(
    local.API_URL + '/rest/v1/rpc/save_onboarding_checklist',
    {
      headers: { apikey: local.PUBLISHABLE_KEY },
      data: { p_job_role: 'HR', p_expected_revision: 0, p_tasks: [] },
    },
  );
  expect(anonymous.status()).toBe(401);
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const baseline = await (
    await page.request.get('/api/checklists?role=HR')
  ).json();
  for (const method of ['PUT', 'POST']) {
    expect(
      (
        await page.request.fetch('/api/admin/checklists', {
          method,
          headers: { origin },
          data: {
            jobRole: 'HR',
            expectedRevision: baseline.revision,
            tasks: [],
          },
        })
      ).status(),
    ).toBe(403);
  }
  const signed = await page.request.post(
    local.API_URL + '/auth/v1/token?grant_type=password',
    {
      headers: { apikey: local.PUBLISHABLE_KEY },
      data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
    },
  );
  const learner = await signed.json();
  const headers = {
    apikey: local.PUBLISHABLE_KEY,
    Authorization: 'Bearer ' + learner.access_token,
  };
  await page.request.put(local.API_URL + '/auth/v1/user', {
    headers,
    data: { data: { role: 'admin' } },
  });
  expect(
    (
      await page.request.post(
        local.API_URL + '/rest/v1/rpc/save_onboarding_checklist',
        {
          headers,
          data: {
            p_job_role: 'HR',
            p_expected_revision: baseline.revision,
            p_tasks: [],
          },
        },
      )
    ).status(),
  ).toBe(403);
  expect(
    (
      await page.request.post(
        local.API_URL + '/rest/v1/onboarding_checklists',
        {
          headers,
          data: { job_role: 'Backend Developer', revision: 1, tasks: [] },
        },
      )
    ).status(),
  ).toBe(403);
  await page.request.patch(
    local.API_URL + '/rest/v1/onboarding_checklists?job_role=eq.HR',
    { headers, data: { revision: baseline.revision + 1, tasks: [] } },
  );
  expect(
    (
      await page.request.delete(
        local.API_URL + '/rest/v1/onboarding_checklists?job_role=eq.HR',
        { headers },
      )
    ).status(),
  ).toBe(403);
  expect(
    await (await page.request.get('/api/checklists?role=HR')).json(),
  ).toEqual(baseline);
  await page.goto('/admin/checklists');
  await expect(page).toHaveURL('/workspace?notice=administrator-required');
});

test('Frontend starter preparation is idempotent and preserves custom definitions and other roles', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const other = await (
    await page.request.get('/api/checklists?role=Backend%20Developer')
  ).json();
  const prepared = await page.request.post('/api/admin/checklists', {
    headers: { origin },
  });
  expect(prepared.status()).toBe(200);
  const starter = await prepared.json();
  expect(starter.tasks).toHaveLength(8);
  expect(
    starter.tasks.filter(
      (task: { stage: string }) => task.stage === 'Before you start',
    ),
  ).toHaveLength(2);
  expect(
    starter.tasks.filter((task: { stage: string }) => task.stage === 'Day 1'),
  ).toHaveLength(3);
  expect(
    starter.tasks.filter((task: { stage: string }) => task.stage === 'Week 1'),
  ).toHaveLength(3);
  const edited = await page.request.put('/api/admin/checklists', {
    headers: { origin },
    data: {
      jobRole: 'Frontend Developer',
      expectedRevision: starter.revision,
      tasks: starter.tasks.map((task: object, index: number) =>
        index === 0 ? { ...task, title: 'Customized Lumen welcome' } : task,
      ),
    },
  });
  expect(edited.status()).toBe(200);
  const customized = await edited.json();
  expect(customized.tasks[0].id).toBe(starter.tasks[0].id);
  expect(
    await (
      await page.request.post('/api/admin/checklists', { headers: { origin } })
    ).json(),
  ).toEqual(customized);
  expect(
    await (
      await page.request.get('/api/checklists?role=Backend%20Developer')
    ).json(),
  ).toEqual(other);
});

test('administrator keeps unsaved input after a failed save and can edit, remove and publish an empty checklist', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const current = await (
    await page.request.get('/api/checklists?role=HR')
  ).json();
  const setup = await page.request.put('/api/admin/checklists', {
    headers: { origin },
    data: {
      jobRole: 'HR',
      expectedRevision: current.revision,
      tasks: [{ title: 'Original HR task', stage: 'Day 1', instructions: '' }],
    },
  });
  const original = await setup.json();
  await page.goto('/admin/checklists?role=HR');
  await page.getByLabel('Task title').fill('Updated people guide');
  await page.route('**/api/admin/checklists', (route) => route.abort());
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Your edits have been kept' }),
  ).toBeVisible();
  await expect(page.getByLabel('Task title')).toHaveValue(
    'Updated people guide',
  );
  await expect(
    page.getByRole('button', { name: 'Save changes' }),
  ).toBeEnabled();
  await page.unroute('**/api/admin/checklists');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toContainText('Changes saved');
  const edited = await (
    await page.request.get('/api/checklists?role=HR')
  ).json();
  expect(edited.tasks[0].id).toBe(original.tasks[0].id);
  await page.getByRole('button', { name: 'Remove task 1' }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toContainText('Changes saved');
  await page.reload();
  await expect(page.getByLabel('Task title')).toHaveCount(0);
  expect(
    (await (await page.request.get('/api/checklists?role=HR')).json()).tasks,
  ).toEqual([]);
  await page.goto('/checklist?role=HR');
  await expect(page.getByText('Coming soon.', { exact: false })).toBeVisible();
  await expect(page.getByText('100%', { exact: false })).toHaveCount(0);
});
