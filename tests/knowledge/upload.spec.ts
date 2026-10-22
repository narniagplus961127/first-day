import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';
const origin = 'http://127.0.0.1:3200';
const markdown =
  '# Frontend setup\n\n## Run locally\n\nUse the following command:\n\n```sh\nnpm run dev\n```\n\n<script>window.unsafeGuide=true</script>\n';
test('administrator uploads a guide and reopens the persisted candidate safely', async ({
  page,
}) => {
  const login = await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  expect(login.status()).toBe(200);
  const title = 'Frontend guide ' + Date.now();
  const response = await page.request.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title,
      jobRole: 'Frontend Developer',
      file: {
        name: 'frontend.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from(markdown),
      },
    },
  });
  expect(response.status()).toBe(201);
  const { document } = await response.json();
  await page.goto('/admin/documents/' + document.id);
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Run locally' }),
  ).toBeVisible();
  await expect(page.locator('pre')).toContainText('npm run dev');
  await expect(
    page.getByText('Not indexed', { exact: true }).first(),
  ).toBeVisible();
  expect(await page.evaluate(() => Object.hasOwn(window, 'unsafeGuide'))).toBe(
    false,
  );
  await page.reload();
  await expect(page.locator('pre')).toContainText('npm run dev');
});

test('administrator uploads through the form and can recover after a connection failure', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  await page.goto('/admin');
  await page.getByLabel('Document title').fill('A recoverable upload');
  await page.getByLabel('Job role').selectOption('Designer');
  await page.getByLabel('Markdown file').setInputFiles({
    name: 'design.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from('# Design guide\n\nUse the shared design system.'),
  });
  await page.route('**/api/admin/documents', (route) => route.abort());
  await page.getByRole('button', { name: 'Upload Markdown +' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Please try again' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Upload Markdown +' }),
  ).toBeEnabled();
  await page.unroute('**/api/admin/documents');
  await page.getByRole('button', { name: 'Upload Markdown +' }).click();
  await expect(page).toHaveURL(/\/admin\/documents\/[0-9a-f-]+$/);
  await expect(
    page.getByRole('heading', { name: 'A recoverable upload', level: 1 }),
  ).toBeVisible();
  await expect(page.getByText('Designer · design.md')).toBeVisible();
});

test('server rejects invalid uploads without creating knowledge documents', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const before = await (await page.request.get('/api/admin/documents')).json();
  const cases = [
    {
      name: 'guide.txt',
      buffer: Buffer.from('# Setup'),
      title: 'Setup',
      jobRole: 'Frontend Developer',
      status: 400,
    },
    {
      name: 'guide.md',
      buffer: Buffer.alloc(102401, 65),
      title: 'Setup',
      jobRole: 'Frontend Developer',
      status: 413,
    },
    {
      name: 'guide.md',
      buffer: Buffer.from(' \n\t '),
      title: 'Setup',
      jobRole: 'Frontend Developer',
      status: 400,
    },
    {
      name: 'guide.md',
      buffer: Buffer.from([0xff, 0xfe, 0xfa]),
      title: 'Setup',
      jobRole: 'Frontend Developer',
      status: 400,
    },
    {
      name: 'guide.md',
      buffer: Buffer.from('hello\u0000world'),
      title: 'Setup',
      jobRole: 'Frontend Developer',
      status: 400,
    },
    {
      name: 'guide.md',
      buffer: Buffer.from('# Setup'),
      title: ' ',
      jobRole: 'Frontend Developer',
      status: 400,
    },
    {
      name: 'guide.md',
      buffer: Buffer.from('# Setup'),
      title: 'Setup',
      jobRole: 'Engineering',
      status: 400,
    },
  ];
  for (const item of cases) {
    const result = await page.request.post('/api/admin/documents', {
      headers: { origin },
      multipart: {
        title: item.title,
        jobRole: item.jobRole,
        file: {
          name: item.name,
          mimeType: 'text/markdown',
          buffer: item.buffer,
        },
      },
    });
    expect(result.status()).toBe(item.status);
    expect((await result.json()).error).toBeTruthy();
  }
  const multiple = await page.request.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title: 'Two files',
      jobRole: 'HR',
      file: {
        name: 'one.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from('# One'),
      },
      extra: {
        name: 'two.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from('# Two'),
      },
    },
  });
  expect(multiple.status()).toBe(400);
  const after = await (await page.request.get('/api/admin/documents')).json();
  expect(after.documents.length).toBe(before.documents.length);
});

test('the same filename creates separate document identities instead of replacing a guide', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const ids: string[] = [];
  for (const title of ['First distinct guide', 'Second distinct guide']) {
    const result = await page.request.post('/api/admin/documents', {
      headers: { origin },
      multipart: {
        title,
        jobRole: 'HR',
        file: {
          name: 'same.md',
          mimeType: 'text/markdown',
          buffer: Buffer.from('# ' + title),
        },
      },
    });
    expect(result.status()).toBe(201);
    const body = await result.json();
    ids.push(body.document.id);
    expect(body.document.active_version_id).toBeNull();
    expect(body.version.status).toBe('pending');
  }
  expect(ids[0]).not.toBe(ids[1]);
  const first = await (
    await page.request.get('/api/admin/documents/' + ids[0])
  ).json();
  expect(first.document.title).toBe('First distinct guide');
});

test('learners cannot inspect or mutate candidates through the app or Supabase Data API', async ({
  page,
}) => {
  const { readFileSync } = await import('node:fs');
  const local = JSON.parse(
    readFileSync(
      process.env.FIRSTDAY_TEST_SUPABASE_STATUS_FILE ||
        join(tmpdir(), 'firstday-supabase-fixture', 'status.json'),
      'utf8',
    ),
  );
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const created = await page.request.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title: 'Administrator draft',
      jobRole: 'HR',
      file: {
        name: 'private.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from('# Private candidate\n\nNot yet published.'),
      },
    },
  });
  const { document, version } = await created.json();
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  expect((await page.request.get('/api/admin/documents')).status()).toBe(403);
  expect(
    (await page.request.get('/api/admin/documents/' + document.id)).status(),
  ).toBe(403);
  expect(
    (
      await page.request.post('/api/admin/documents', {
        headers: { origin },
        multipart: {
          title: 'Unauthorized',
          jobRole: 'HR',
          file: {
            name: 'bad.md',
            mimeType: 'text/markdown',
            buffer: Buffer.from('# Bad'),
          },
        },
      })
    ).status(),
  ).toBe(403);
  await page.goto('/admin/documents/' + document.id);
  await expect(page).toHaveURL('/workspace?notice=administrator-required');
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
  for (const table of ['knowledge_documents', 'knowledge_versions']) {
    const result = await page.request.get(
      local.API_URL + '/rest/v1/' + table + '?select=id',
      { headers },
    );
    expect(result.status()).toBe(200);
    expect(await result.json()).toEqual([]);
  }
  const insert = await page.request.post(
    local.API_URL + '/rest/v1/knowledge_documents',
    {
      headers,
      data: { title: 'Forged', job_role: 'HR', created_by: learner.user.id },
    },
  );
  expect(insert.status()).toBe(403);
  const rpc = await page.request.post(
    local.API_URL + '/rest/v1/rpc/create_knowledge_document',
    {
      headers,
      data: {
        p_title: 'Forged',
        p_job_role: 'HR',
        p_filename: 'forged.md',
        p_content: '# Forged',
      },
    },
  );
  expect(rpc.status()).toBe(403);
  await page.request.patch(
    local.API_URL + '/rest/v1/knowledge_versions?id=eq.' + version.id,
    { headers, data: { content: '# Overwritten', status: 'ready' } },
  );
  await page.request.delete(
    local.API_URL + '/rest/v1/knowledge_documents?id=eq.' + document.id,
    { headers },
  );
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const preserved = await (
    await page.request.get('/api/admin/documents/' + document.id)
  ).json();
  expect(preserved.version.content).toBe(
    '# Private candidate\n\nNot yet published.',
  );
  expect(preserved.version.status).toBe('pending');
});
