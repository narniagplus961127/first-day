import { test, expect } from '@playwright/test';
const origin = 'http://127.0.0.1:3200';
test('learner asks about setup and opens its exact evidence passage', async ({
  page,
}) => {
  const marker = 'Evidence' + Date.now();
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const upload = await page.request.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title: marker,
      jobRole: 'Frontend Developer',
      file: {
        name: 'setup.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from(
          '# ' +
            marker +
            '\n\n## Run the frontend\n\nRun npm run dev:firstday. Copy .env.example to .env.local before starting.',
        ),
      },
    },
  });
  expect(upload.status()).toBe(201);
  const { document } = await upload.json();
  const index = await page.request.post(
    '/api/admin/documents/' + document.id + '/index',
    { headers: { origin } },
  );
  expect((await index.json()).status).toBe('ready');
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  await page.goto('/chat');
  await page
    .getByLabel('Your question')
    .fill('How do I run the frontend project ' + marker + '?');
  await page.getByRole('button', { name: 'Ask FirstDay', exact: true }).click();
  await expect(page.getByLabel('FirstDay answer').last()).toContainText(
    'npm run dev:firstday',
  );
  await expect(
    page.getByRole('link', { name: /View source/ }).first(),
  ).toBeVisible();
  if (await page.getByRole('button', { name: 'Sources ↗' }).isVisible()) {
    await page.getByRole('button', { name: 'Sources ↗' }).click();
    await page
      .getByRole('dialog', { name: 'Sources', exact: true })
      .getByRole('link', { name: new RegExp(marker) })
      .first()
      .click();
  } else {
    await page
      .getByRole('complementary', { name: 'Answer sources' })
      .getByRole('link', { name: new RegExp(marker) })
      .first()
      .click();
  }
  await expect(
    page.getByRole('heading', { name: marker, level: 1 }),
  ).toBeVisible();
  await expect(page.getByLabel('Supporting passage')).toContainText(
    'npm run dev:firstday',
  );
  await expect(
    page.getByText('Run the frontend', { exact: true }).first(),
  ).toBeVisible();
});

async function publish(
  page: import('@playwright/test').Page,
  marker: string,
  indexed = true,
) {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const upload = await page.request.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title: marker,
      jobRole: 'Frontend Developer',
      file: {
        name: 'setup.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from(
          '# ' +
            marker +
            '\n\n## Run the frontend\n\nRun npm run dev:firstday. Copy .env.example to .env.local before starting.',
        ),
      },
    },
  });
  expect(upload.status()).toBe(201);
  const { document, version } = await upload.json();
  if (indexed)
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
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  return { document, version };
}
test('absent facts and empty role scope return no evidence, while All roles can cite another role', async ({
  page,
}) => {
  const marker = 'Evidence' + Date.now();
  await publish(page, marker);
  const ask = (question: string, scope = 'Frontend Developer') =>
    page.request.post('/api/chat', {
      headers: { origin },
      data: { question: question + ' ' + marker, scope },
    });
  const absent = await ask('What is my salary?');
  expect(absent.status()).toBe(200);
  expect(await absent.json()).toMatchObject({
    status: 'no_evidence',
    claims: [],
  });
  expect(
    await (await ask('How do I run it?', 'Designer')).json(),
  ).toMatchObject({ status: 'no_evidence', claims: [] });
  const all = await (await ask('How do I run it?', 'All roles')).json();
  expect(all.status).toBe('answered');
  expect(all.answer).toContain('npm run dev:firstday');
});

test('incomplete generation never appears as a completed answer', async ({
  page,
}) => {
  const marker = 'Evidence' + Date.now();
  await publish(page, marker);
  const result = await page.request.post('/api/chat', {
    headers: { origin },
    data: {
      question: 'Truncated setup ' + marker,
      scope: 'Frontend Developer',
    },
  });
  expect(result.status()).toBe(503);
  expect(await result.json()).toHaveProperty('error');
});

test('invented citation identities or quotes fail verification and never become source links', async ({
  page,
}) => {
  const marker = 'Evidence' + Date.now();
  await publish(page, marker);
  for (const question of ['Invented source', 'Invented quote']) {
    const result = await page.request.post('/api/chat', {
      headers: { origin },
      data: { question: question + ' ' + marker, scope: 'Frontend Developer' },
    });
    expect(result.status()).toBe(503);
    expect(await result.json()).not.toHaveProperty('claims');
  }
  const fake = '00000000-0000-4000-8000-000000000000';
  expect(
    (await page.request.get('/sources/' + fake + '/' + fake)).status(),
  ).toBe(404);
});
test('partial guides stay outside answers and questions require authentication and valid scope', async ({
  page,
}) => {
  const marker = 'Evidence' + Date.now();
  const { version } = await publish(page, marker, false);
  const partial = await page.request.post('/api/chat', {
    headers: { origin },
    data: {
      question: 'How do I run ' + marker + '?',
      scope: 'Frontend Developer',
    },
  });
  expect(await partial.json()).toMatchObject({
    status: 'no_evidence',
    claims: [],
  });
  expect(
    (
      await page.request.get(
        '/sources/' + version.id + '/00000000-0000-4000-8000-000000000000',
      )
    ).status(),
  ).toBe(404);
  for (const data of [
    { question: 'x', scope: 'Manager' },
    { question: 'x'.repeat(1001), scope: 'Frontend Developer' },
    { question: ' ', scope: 'All roles' },
  ])
    expect(
      (
        await page.request.post('/api/chat', { headers: { origin }, data })
      ).status(),
    ).toBe(400);
  expect(
    (
      await page.request.post('/api/chat', {
        headers: { origin: 'https://outside.example' },
        data: { question: 'x', scope: 'All roles' },
      })
    ).status(),
  ).toBe(403);
  await page.request.post('/api/auth/logout', { headers: { origin } });
  expect(
    (
      await page.request.post('/api/chat', {
        headers: { origin },
        data: { question: 'x', scope: 'All roles' },
      })
    ).status(),
  ).toBe(401);
});
