import { test, expect, type APIRequestContext } from '@playwright/test';
const origin = 'http://127.0.0.1:3200';
async function login(request: APIRequestContext, admin = false) {
  expect(
    (
      await request.post(origin + '/api/auth/login', {
        headers: { origin },
        data: {
          email: admin ? 'admin@firstday.example' : 'demo@firstday.example',
          password: 'FirstDayDemo!2026',
        },
      })
    ).status(),
  ).toBe(200);
}
function file(command: string, marker: string) {
  return {
    name: 'guide.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from(
      '# Lumen frontend ' +
        marker +
        '\n\nRun npm run ' +
        command +
        '. Copy .env.example to .env.local before starting.',
    ),
  };
}
test('task guide opens the current published instructions while completion and older citations survive replacement', async ({
  page,
  browser,
}) => {
  await login(page.request, true);
  const title = 'Evidence' + Date.now();
  const uploaded = await page.request.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title,
      jobRole: 'Frontend Developer',
      file: file('dev:firstday', title),
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
              title: 'Read current frontend instructions',
              stage: 'Day 1',
              instructions: '',
            },
          ],
        },
      })
    ).status(),
  ).toBe(200);
  await page.goto('/admin/checklists?role=Frontend%20Developer');
  await page.getByLabel('Guide', { exact: true }).selectOption(document.id);
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toContainText('Changes saved');
  const learner = await browser.newContext();
  await login(learner.request);
  const reader = await learner.newPage();
  await reader.goto(origin + '/checklist?role=Frontend%20Developer');
  await reader
    .getByRole('checkbox', { name: 'Read current frontend instructions' })
    .check();
  await reader.getByRole('link', { name: 'Open guide' }).click();
  await expect(reader.getByLabel('Published guide')).toContainText(
    'dev:firstday',
  );
  const answerResponse = await learner.request.post(origin + '/api/chat', {
    headers: { origin },
    data: {
      question: 'How do I run ' + title + '?',
      scope: 'Frontend Developer',
    },
  });
  expect(answerResponse.status()).toBe(200);
  const answer = await answerResponse.json();
  const source = answer.claims[0].citations[0].href;
  expect(
    (
      await page.request.post(
        '/api/admin/documents/' + document.id + '/replace',
        { headers: { origin }, multipart: { file: file('dev:second', title) } },
      )
    ).status(),
  ).toBe(201);
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
  await reader.goto(origin + '/checklist?role=Frontend%20Developer');
  await expect(
    reader.getByRole('checkbox', {
      name: 'Read current frontend instructions',
    }),
  ).toBeChecked();
  await reader.getByRole('link', { name: 'Open guide' }).click();
  await expect(reader.getByLabel('Published guide')).toContainText(
    'dev:second',
  );
  await reader.goto(origin + source);
  await expect(reader.getByLabel('Supporting passage')).toContainText(
    'dev:firstday',
  );
  await learner.close();
});

test('guide validation rejects unavailable associations and a later unavailable guide preserves completed tasks', async ({
  page,
  browser,
}) => {
  const { readFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { createClient } = await import('@supabase/supabase-js');
  const local = JSON.parse(
    readFileSync(
      process.env.FIRSTDAY_TEST_SUPABASE_STATUS_FILE ||
        join(tmpdir(), 'firstday-supabase-fixture', 'status.json'),
      'utf8',
    ),
  );
  const data = createClient(local.API_URL, local.PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  expect(
    (
      await data.auth.signInWithPassword({
        email: 'admin@firstday.example',
        password: 'FirstDayDemo!2026',
      })
    ).error,
  ).toBeNull();
  await login(page.request, true);
  const marker = 'Evidence' + Date.now();
  async function upload(role: string, publish: boolean, suffix: string) {
    const response = await page.request.post('/api/admin/documents', {
      headers: { origin },
      multipart: {
        title: marker + suffix,
        jobRole: role,
        file: file('dev:firstday', marker),
      },
    });
    expect(response.status()).toBe(201);
    const { document } = await response.json();
    if (publish)
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
    return document.id as string;
  }
  const valid = await upload('Frontend Developer', true, ' current');
  const wrongRole = await upload('Designer', true, ' wrong role');
  const unpublished = await upload('Frontend Developer', false, ' draft');
  const current = await (
    await page.request.get('/api/checklists?role=Frontend%20Developer')
  ).json();
  const savedResponse = await page.request.put('/api/admin/checklists', {
    headers: { origin },
    data: {
      jobRole: 'Frontend Developer',
      expectedRevision: current.revision,
      tasks: [
        {
          title: 'Keep completed guide task',
          stage: 'Day 1',
          instructions: '',
          guideId: valid,
        },
      ],
    },
  });
  expect(savedResponse.status()).toBe(200);
  const saved = await savedResponse.json();
  await page.goto('/admin/checklists?role=Frontend%20Developer');
  await expect(
    page
      .getByLabel('Guide', { exact: true })
      .getByRole('option', { name: marker + ' current', exact: true }),
  ).toHaveCount(1);
  for (const suffix of [' wrong role', ' draft'])
    await expect(
      page
        .getByLabel('Guide', { exact: true })
        .getByRole('option', { name: marker + suffix, exact: true }),
    ).toHaveCount(0);
  for (const guideId of [
    wrongRole,
    unpublished,
    '00000000-0000-4000-8000-000000000000',
  ]) {
    const tasks = [{ ...saved.tasks[0], guideId }];
    const response = await page.request.put('/api/admin/checklists', {
      headers: { origin },
      data: {
        jobRole: 'Frontend Developer',
        expectedRevision: saved.revision,
        tasks,
      },
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).error).toContain('published guide');
    expect(
      (
        await data.rpc('save_onboarding_checklist', {
          p_job_role: 'Frontend Developer',
          p_expected_revision: saved.revision,
          p_tasks: tasks,
          p_seed: false,
        })
      ).error?.code,
    ).toBe('PT400');
    expect(
      (
        await data
          .from('onboarding_checklists')
          .update({ revision: saved.revision + 1, tasks })
          .eq('job_role', 'Frontend Developer')
      ).error?.code,
    ).toBe('PT400');
    expect(
      await (
        await page.request.get('/api/checklists?role=Frontend%20Developer')
      ).json(),
    ).toEqual(saved);
  }
  const learner = await browser.newContext();
  await login(learner.request);
  const reader = await learner.newPage();
  await reader.goto(origin + '/checklist?role=Frontend%20Developer');
  await reader
    .getByRole('checkbox', { name: 'Keep completed guide task' })
    .check();
  const guideHref = await reader
    .getByRole('link', { name: 'Open guide' })
    .getAttribute('href');
  expect(
    (
      await data
        .from('knowledge_documents')
        .update({ active_version_id: null })
        .eq('id', valid)
    ).error,
  ).toBeNull();
  await reader.getByRole('link', { name: 'Open guide' }).click();
  await expect(
    reader.getByRole('heading', { name: 'Guide unavailable', exact: true }),
  ).toBeVisible();
  await reader.getByRole('link', { name: 'Back to checklist' }).click();
  await expect(
    reader.getByText('Guide unavailable. You can still complete this task.', {
      exact: true,
    }),
  ).toBeVisible();
  await expect(reader.getByRole('link', { name: 'Open guide' })).toHaveCount(0);
  await expect(
    reader.getByRole('checkbox', { name: 'Keep completed guide task' }),
  ).toBeChecked();
  await expect(
    reader.getByText('1 of 1 tasks complete', { exact: true }),
  ).toBeVisible();
  await reader.goto(origin + guideHref);
  await expect(
    reader.getByRole('heading', { name: 'Guide unavailable', exact: true }),
  ).toBeVisible();
  await learner.close();
});
