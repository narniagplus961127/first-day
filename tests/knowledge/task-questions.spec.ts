import { test, expect } from '@playwright/test';
const origin = 'http://127.0.0.1:3200';

test('task suggestion opens an editable role draft and submits only when the learner asks', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const marker = 'Evidence' + Date.now();
  const uploaded = await page.request.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title: marker,
      jobRole: 'Frontend Developer',
      file: {
        name: 'task.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from(
          '# ' +
            marker +
            '\n\nRun npm run dev:firstday. Copy .env.example to .env.local before starting.',
        ),
      },
    },
  });
  expect(uploaded.status()).toBe(201);
  const { document } = await uploaded.json();
  expect(
    (
      await (
        await page.request.post(
          '/api/admin/documents/' + document.id + '/index',
          { headers: { origin } },
        )
      ).json()
    ).status,
  ).toBe('ready');
  const current = await (
    await page.request.get('/api/checklists?role=Frontend%20Developer')
  ).json();
  expect(
    (
      await page.request.put('/api/admin/checklists', {
        headers: { origin },
        data: {
          jobRole: 'Frontend Developer',
          expectedRevision: current.revision,
          tasks: [
            {
              title: 'Ask about frontend setup',
              stage: 'Day 1',
              instructions: '',
            },
          ],
        },
      })
    ).status(),
  ).toBe(200);
  await page.goto('/admin/checklists?role=Frontend%20Developer');
  const suggestion = 'How do I run ' + marker + '?';
  await page.getByLabel('Suggested question', { exact: true }).fill(suggestion);
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toContainText('Changes saved');
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  let submissions = 0;
  page.on('request', (request) => {
    if (request.url().endsWith('/api/chat') && request.method() === 'POST')
      submissions++;
  });
  await page.goto('/chat');
  await page.getByLabel('Search scope').selectOption('Designer');
  await page.getByLabel('Your question').fill('Keep design draft');
  await page.goto('/checklist?role=Frontend%20Developer');
  await page.getByRole('link', { name: 'Ask about this task' }).click();
  await expect(page.getByLabel('Search scope')).toHaveValue(
    'Frontend Developer',
  );
  await expect(page.getByLabel('Your question')).toHaveValue(suggestion);
  expect(submissions).toBe(0);
  await page.getByLabel('Your question').fill(suggestion + ' Explain setup.');
  await page.getByRole('button', { name: 'Ask FirstDay', exact: true }).click();
  await expect(page.getByLabel('FirstDay answer')).toContainText(
    'npm run dev:firstday',
  );
  expect(submissions).toBe(1);
  await page
    .getByRole('link', { name: /View source/ })
    .first()
    .click();
  await expect(page.getByLabel('Supporting passage')).toContainText(
    'npm run dev:firstday',
  );
  await page.goto('/chat');
  await expect(page.getByLabel('FirstDay answer')).toHaveCount(1);
  await page.getByLabel('Search scope').selectOption('Designer');
  await expect(page.getByLabel('Your question')).toHaveValue(
    'Keep design draft',
  );
  await page.goto('/checklist?role=Frontend%20Developer');
  await expect(
    page.getByRole('checkbox', { name: 'Ask about frontend setup' }),
  ).not.toBeChecked();
});

test('conflicting task suggestions require a replace decision and cancelled handoffs cannot replay', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const current = await (
    await page.request.get('/api/checklists?role=Designer')
  ).json();
  const suggestion = 'How should I review the design conventions?';
  expect(
    (
      await page.request.put('/api/admin/checklists', {
        headers: { origin },
        data: {
          jobRole: 'Designer',
          expectedRevision: current.revision,
          tasks: [
            {
              title: 'Ask design guidance',
              stage: 'Day 1',
              instructions: '',
              suggestedQuestion: suggestion,
            },
          ],
        },
      })
    ).status(),
  ).toBe(200);
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  await page.goto('/chat');
  await page.getByLabel('Search scope').selectOption('Designer');
  await page.getByLabel('Your question').fill('Unfinished design question');
  await page.getByLabel('Search scope').selectOption('All roles');
  await page.getByLabel('Your question').fill('Keep my broad question');
  let handoff = '';
  let submissions = 0;
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.pathname === '/chat' && url.searchParams.has('taskIntent'))
      handoff =
        origin + '/chat?taskIntent=' + url.searchParams.get('taskIntent');
    if (url.pathname === '/api/chat' && request.method() === 'POST')
      submissions++;
  });
  await page.goto('/checklist?role=Designer');
  await page.getByRole('link', { name: 'Ask about this task' }).click();
  await expect(
    page.getByRole('dialog', { name: 'Replace your unfinished question?' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Keep my draft', exact: true })
    .click();
  await expect(page.getByLabel('Search scope')).toHaveValue('Designer');
  await expect(page.getByLabel('Your question')).toHaveValue(
    'Unfinished design question',
  );
  await page.reload();
  await expect(page.getByLabel('Your question')).toHaveValue(
    'Unfinished design question',
  );
  expect(handoff).not.toBe('');
  const cancelled = handoff;
  await page.goto(cancelled);
  await expect(
    page.getByRole('alert').filter({ hasText: 'task question is unavailable' }),
  ).toContainText('task question is unavailable');
  await expect(page.getByLabel('Your question')).toHaveValue(
    'Unfinished design question',
  );
  await page.goto('/checklist?role=Designer');
  await page.getByRole('link', { name: 'Ask about this task' }).click();
  await page
    .getByRole('button', { name: 'Replace draft', exact: true })
    .click();
  await expect(page.getByLabel('Your question')).toHaveValue(suggestion);
  await page.getByLabel('Search scope').selectOption('All roles');
  await expect(page.getByLabel('Your question')).toHaveValue(
    'Keep my broad question',
  );
  await page.goto('/checklist?role=Designer');
  await page.getByRole('link', { name: 'Ask about this task' }).click();
  await expect(page.getByLabel('Your question')).toHaveValue(suggestion);
  await expect(
    page.getByRole('dialog', { name: 'Replace your unfinished question?' }),
  ).not.toBeVisible();
  await page.getByLabel('Your question').fill('Edited after accepting');
  await page.reload();
  await expect(page.getByLabel('Your question')).toHaveValue(
    'Edited after accepting',
  );
  expect(submissions).toBe(0);
});

test('removed task suggestions are unavailable without changing unrelated drafts', async ({
  page,
  request,
}) => {
  await request.post(origin + '/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const current = await (
    await request.get(origin + '/api/checklists?role=HR')
  ).json();
  const saved = await request.put(origin + '/api/admin/checklists', {
    headers: { origin },
    data: {
      jobRole: 'HR',
      expectedRevision: current.revision,
      tasks: [
        {
          title: 'Ask people guidance',
          stage: 'Day 1',
          instructions: '',
          suggestedQuestion: 'Where is the people guide?',
        },
      ],
    },
  });
  expect(saved.status()).toBe(200);
  const snapshot = await saved.json();
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  await page.goto('/chat');
  await page.getByLabel('Search scope').selectOption('All roles');
  await page.getByLabel('Your question').fill('Preserve unrelated question');
  await page.goto('/checklist?role=HR');
  await expect(
    page.getByRole('link', { name: 'Ask about this task' }),
  ).toBeVisible();
  expect(
    (
      await request.put(origin + '/api/admin/checklists', {
        headers: { origin },
        data: { jobRole: 'HR', expectedRevision: snapshot.revision, tasks: [] },
      })
    ).status(),
  ).toBe(200);
  await page.getByRole('link', { name: 'Ask about this task' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'task question is unavailable' }),
  ).toBeVisible();
  await expect(page.getByLabel('Search scope')).toHaveValue('All roles');
  await expect(page.getByLabel('Your question')).toHaveValue(
    'Preserve unrelated question',
  );
  await page.goto('/chat?taskIntent=not-a-valid-intent&question=untrusted');
  await expect(
    page.getByRole('alert').filter({ hasText: 'task question is unavailable' }),
  ).toBeVisible();
  await expect(page.getByLabel('Your question')).toHaveValue(
    'Preserve unrelated question',
  );
});

test('suggested questions stay bounded at the admin and data boundaries', async ({
  page,
}) => {
  const { createClient } = await import('@supabase/supabase-js');
  const { readFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const status = JSON.parse(
    readFileSync(
      process.env.FIRSTDAY_TEST_SUPABASE_STATUS_FILE ||
        join(tmpdir(), 'firstday-supabase-fixture', 'status.json'),
      'utf8',
    ),
  );
  const data = createClient(status.API_URL, status.PUBLISHABLE_KEY);
  expect(
    (
      await data.auth.signInWithPassword({
        email: 'admin@firstday.example',
        password: 'FirstDayDemo!2026',
      })
    ).error,
  ).toBeNull();
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const current = await (
    await page.request.get('/api/checklists?role=Business%20Analyst')
  ).json();
  const savedResponse = await page.request.put('/api/admin/checklists', {
    headers: { origin },
    data: {
      jobRole: 'Business Analyst',
      expectedRevision: current.revision,
      tasks: [
        {
          title: 'Review requirements',
          stage: 'Day 1',
          instructions: '',
          suggestedQuestion: 'Q'.repeat(1000),
        },
      ],
    },
  });
  expect(savedResponse.status()).toBe(200);
  const saved = await savedResponse.json();
  await page.goto('/admin/checklists?role=Business%20Analyst');
  await expect(
    page.getByLabel('Suggested question', { exact: true }),
  ).toHaveAttribute('maxlength', '1000');
  await expect(
    page.getByLabel('Suggested question', { exact: true }),
  ).toHaveValue('Q'.repeat(1000));
  for (const question of ['Q'.repeat(1001), 123, { text: 'Invalid' }]) {
    const tasks = [{ ...saved.tasks[0], suggestedQuestion: question }];
    expect(
      (
        await page.request.put('/api/admin/checklists', {
          headers: { origin },
          data: {
            jobRole: 'Business Analyst',
            expectedRevision: saved.revision,
            tasks,
          },
        })
      ).status(),
    ).toBe(400);
    expect(
      (
        await data
          .from('onboarding_checklists')
          .update({ revision: saved.revision + 1, tasks })
          .eq('job_role', 'Business Analyst')
      ).error?.code,
    ).toBe('PT400');
    expect(
      await (
        await page.request.get('/api/checklists?role=Business%20Analyst')
      ).json(),
    ).toEqual(saved);
  }
});
