import { test, expect, type Page } from '@playwright/test';
const origin = 'http://127.0.0.1:3200';
async function publish(page: Page, marker: string) {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const response = await page.request.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title: marker,
      jobRole: 'Frontend Developer',
      file: {
        name: 'conversation.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from(
          '# ' +
            marker +
            '\n\n## Run the frontend\n\nRun npm run dev:firstday. Copy .env.example to .env.local before starting.',
        ),
      },
    },
  });
  expect(response.status()).toBe(201);
  const { document } = await response.json();
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
  return document;
}
async function ask(page: Page, question: string) {
  await page.getByLabel('Your question').fill(question);
  await page.getByRole('button', { name: 'Ask FirstDay', exact: true }).click();
  await expect(page.getByLabel('FirstDay answer').last()).toContainText(
    'npm run dev:firstday',
  );
}
test('completed conversations survive reload in this browser', async ({
  page,
}) => {
  const marker = 'Evidence' + Date.now();
  await publish(page, marker);
  await page.goto('/chat');
  await ask(page, 'How do I run the frontend project ' + marker + '?');
  await page.reload();
  await expect(page.getByLabel('FirstDay answer')).toContainText(
    'npm run dev:firstday',
  );
});

test('a contextual follow-up retrieves the current role guide and retains both completed exchanges', async ({
  page,
}) => {
  const marker = 'Evidence' + Date.now();
  await publish(page, marker);
  await page.goto('/chat');
  const initial = 'How do I run the frontend project ' + marker + '?';
  await ask(page, initial);
  const requestPromise = page.waitForRequest(
    (request) =>
      request.url().endsWith('/api/chat') && request.method() === 'POST',
  );
  await page
    .getByLabel('Your question')
    .fill('What about those environment variables?');
  await page.getByRole('button', { name: 'Ask FirstDay', exact: true }).click();
  const submitted = (await requestPromise).postDataJSON();
  expect(submitted.history).toEqual([
    {
      scope: 'Frontend Developer',
      question: initial,
      answer: expect.stringContaining('npm run dev:firstday'),
    },
  ]);
  await expect(page.getByLabel('FirstDay answer')).toHaveCount(2);
  await expect(page.getByLabel('FirstDay answer').last()).toContainText(
    'Copy .env.example to .env.local',
  );
  await page
    .getByRole('link', { name: /View source/ })
    .last()
    .click();
  await expect(
    page.getByRole('heading', { name: marker, level: 1 }),
  ).toBeVisible();
});

test('role conversations and visitors stay separate and reset only clears this browser after confirmation', async ({
  page,
  browser,
}) => {
  const marker = 'Evidence' + Date.now();
  const document = await publish(page, marker);
  await page.goto('/chat');
  await ask(page, 'How do I run the frontend project ' + marker + '?');
  await page.getByLabel('Search scope').selectOption('Designer');
  await expect(page.getByLabel('FirstDay answer')).toHaveCount(0);
  await page
    .getByLabel('Your question')
    .fill('How do I run the frontend project ' + marker + '?');
  await page.getByRole('button', { name: 'Ask FirstDay', exact: true }).click();
  await expect(page.getByLabel('FirstDay answer')).toContainText(
    'could not find enough information',
  );
  await page.getByLabel('Search scope').selectOption('Frontend Developer');
  await expect(page.getByLabel('FirstDay answer')).toHaveCount(1);
  const other = await browser.newContext();
  try {
    await other.request.post(origin + '/api/auth/login', {
      headers: { origin },
      data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
    });
    const visitor = await other.newPage();
    await visitor.goto(origin + '/chat');
    await expect(visitor.getByLabel('FirstDay answer')).toHaveCount(0);
    await ask(visitor, 'How do I run the frontend project ' + marker + '?');
    await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
    await expect(
      page.getByRole('dialog', { name: 'Reset this browser’s demo activity?' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Keep my history' }).click();
    await expect(page.getByLabel('FirstDay answer')).toHaveCount(1);
    await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
    await page
      .getByRole('button', { name: 'Reset this browser', exact: true })
      .click();
    await expect(page.getByLabel('FirstDay answer')).toHaveCount(0);
    await page.getByLabel('Search scope').selectOption('Designer');
    await expect(page.getByLabel('FirstDay answer')).toHaveCount(0);
    await page.reload();
    await expect(page.getByLabel('FirstDay answer')).toHaveCount(0);
    await visitor.reload();
    await expect(visitor.getByLabel('FirstDay answer')).toHaveCount(1);
    expect((await page.request.get('/knowledge/' + document.id)).status()).toBe(
      200,
    );
  } finally {
    await other.close();
  }
});

test('follow-ups submit only the latest three completed exchanges and reject invalid history at the API', async ({
  page,
}) => {
  const marker = 'Evidence' + Date.now();
  await publish(page, marker);
  await page.goto('/chat');
  const first = 'Setup question one ' + marker;
  const second = 'Setup question two ' + marker;
  const third = 'Setup question three ' + marker;
  const fourth = 'Setup question four ' + marker;
  for (const question of [first, second, third, fourth])
    await ask(page, question);
  const requestPromise = page.waitForRequest(
    (request) =>
      request.url().endsWith('/api/chat') && request.method() === 'POST',
  );
  await ask(page, 'What about those environment variables?');
  const submitted = (await requestPromise).postDataJSON();
  expect(
    submitted.history.map((entry: { question: string }) => entry.question),
  ).toEqual([second, third, fourth]);
  const valid = {
    scope: 'Frontend Developer',
    question: first,
    answer: 'Published instructions.',
  };
  for (const history of [
    [valid, valid, valid, valid],
    [{ ...valid, scope: 'Designer' }],
    [{ ...valid, question: 'q'.repeat(1001) }],
    [{ ...valid, answer: 'a'.repeat(2001) }],
    'invalid',
  ]) {
    const rejected = await page.request.post('/api/chat', {
      headers: { origin },
      data: {
        question: 'What about those environment variables?',
        scope: 'Frontend Developer',
        history,
      },
    });
    expect(rejected.status()).toBe(400);
  }
});

test('an incomplete answer is not stored or submitted as follow-up context', async ({
  page,
}) => {
  const marker = 'Evidence' + Date.now();
  await publish(page, marker);
  await page.goto('/chat');
  const initial = 'How do I run the frontend project ' + marker + '?';
  await ask(page, initial);
  await page.getByLabel('Your question').fill('Truncated answer ' + marker);
  await page.getByRole('button', { name: 'Ask FirstDay', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByLabel('FirstDay answer')).toHaveCount(1);
  const requestPromise = page.waitForRequest(
    (request) =>
      request.url().endsWith('/api/chat') && request.method() === 'POST',
  );
  await ask(page, 'What about those environment variables?');
  const submitted = (await requestPromise).postDataJSON();
  expect(
    submitted.history.map((entry: { question: string }) => entry.question),
  ).toEqual([initial]);
  await expect(page.getByLabel('FirstDay answer')).toHaveCount(2);
  await page.reload();
  await expect(page.getByLabel('FirstDay answer')).toHaveCount(2);
});

test('malformed saved claims are discarded and restored citation links use source identities', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  await page.addInitScript(() => {
    const id = '10000000-0000-4000-8000-000000000001';
    const source = {
      id: '10000000-0000-4000-8000-000000000002',
      versionId: '10000000-0000-4000-8000-000000000003',
      documentId: '10000000-0000-4000-8000-000000000004',
      title: 'Local source',
      heading: 'Saved passage',
      startLine: 1,
      endLine: 2,
      href: 'javascript:alert(1)',
    };
    localStorage.setItem(
      'firstday.demo.conversations.v1',
      JSON.stringify({
        version: 1,
        scope: 'Frontend Developer',
        conversations: {
          'Frontend Developer': [
            {
              id,
              question: 'Broken saved question',
              result: { status: 'answered', answer: 'Broken', claims: [null] },
            },
            {
              id: '10000000-0000-4000-8000-000000000005',
              question: 'Recovered saved question',
              result: {
                status: 'answered',
                answer: 'Stored instructions.',
                claims: [{ text: 'Stored instructions.', citations: [source] }],
              },
            },
          ],
        },
      }),
    );
  });
  await page.goto('/chat');
  await expect(page.getByLabel('Your question')).toBeEnabled();
  await expect(page.getByLabel('FirstDay answer')).toHaveCount(1);
  await expect(
    page.getByText('Broken saved question', { exact: false }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('link', {
      name: 'View source: Local source · Saved passage',
    }),
  ).toHaveAttribute(
    'href',
    '/sources/10000000-0000-4000-8000-000000000003/10000000-0000-4000-8000-000000000002',
  );
});
