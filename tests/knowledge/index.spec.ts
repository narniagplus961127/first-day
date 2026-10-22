import { test, expect } from '@playwright/test';
const origin = 'http://127.0.0.1:3200';
test('indexing publishes a guide atomically and learners read its active version', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const title = 'Published setup ' + Date.now();
  const upload = await page.request.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title,
      jobRole: 'Frontend Developer',
      file: {
        name: 'setup.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from(
          '# Setup\n\n## Run locally\n\n```sh\nnpm run dev\n```',
        ),
      },
    },
  });
  const { document } = await upload.json();
  const indexed = await page.request.post(
    `/api/admin/documents/${document.id}/index`,
    { headers: { origin } },
  );
  expect(indexed.status()).toBe(200);
  expect((await indexed.json()).status).toBe('ready');
  await page.goto('/admin/documents/' + document.id);
  await expect(page.getByText('Ready', { exact: true }).first()).toBeVisible();
  await page.request.post('/api/auth/logout', { headers: { origin } });
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  await page.goto('/knowledge');
  await page.getByRole('link', { name: title, exact: true }).click();
  await expect(
    page.getByRole('heading', { name: title, level: 1 }),
  ).toBeVisible();
  await expect(page.locator('pre')).toContainText('npm run dev');
  await expect(page.locator('[data-source-version]')).toHaveAttribute(
    'data-source-version',
    /[0-9a-f-]{36}/,
  );
  const forbidden = await page.request.post(
    `/api/admin/documents/${document.id}/index`,
    { headers: { origin } },
  );
  expect(forbidden.status()).toBe(403);
});

test('failed partial indexing stays private and retry resumes saved passages without duplicates', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const title = 'Resumable ' + Date.now();
  const content = Array.from(
    { length: 6 },
    (_, i) =>
      `## Passage ${i}\n\n${i === 5 ? 'FAIL_EMBEDDING ' : ''}Fictional onboarding instructions ${title}.`,
  ).join('\n\n');
  const upload = await page.request.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title,
      jobRole: 'Designer',
      file: {
        name: 'resume.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from(content),
      },
    },
  });
  const { document } = await upload.json();
  const first = await page.request.post(
    `/api/admin/documents/${document.id}/index`,
    { headers: { origin } },
  );
  expect(await first.json()).toMatchObject({
    status: 'processing',
    completed: 4,
    total: 6,
  });
  await page.goto('/admin/documents/' + document.id);
  await expect(page.getByRole('status')).toContainText('4 of 6');
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Resume indexing' }),
  ).toBeVisible();
  const failed = await page.request.post(
    `/api/admin/documents/${document.id}/index`,
    { headers: { origin } },
  );
  expect(failed.status()).toBe(503);
  await page.goto('/admin/documents/' + document.id);
  await expect(
    page.getByText('Indexing failed', { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByRole('status')).toContainText('4 of 6');
  const learner = await page.context().browser()!.newContext();
  const request = learner.request;
  await request.post(origin + '/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  expect(
    (await request.get(origin + '/knowledge/' + document.id)).status(),
  ).toBe(404);
  const learnerPage = await learner.newPage();
  await learnerPage.goto(origin + '/knowledge');
  await expect(
    learnerPage.getByRole('link', { name: title, exact: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Retry indexing' }).click();
  await expect(page.getByText('Ready', { exact: true }).first()).toBeVisible();
  const repeated = await page.request.post(
    `/api/admin/documents/${document.id}/index`,
    { headers: { origin } },
  );
  expect(await repeated.json()).toMatchObject({
    status: 'ready',
    completed: 6,
    total: 6,
  });
  await learnerPage.goto(origin + '/knowledge/' + document.id);
  await expect(
    learnerPage.getByRole('heading', { name: title, level: 1 }),
  ).toBeVisible();
  await learner.close();
});
