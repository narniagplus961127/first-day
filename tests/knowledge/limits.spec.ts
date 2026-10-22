import { test, expect } from '@playwright/test';
const origin = 'http://127.0.0.1:3200';
const fixture = 'http://127.0.0.1:19032';
const fixtureTime = (now: string) =>
  test.info().project.name === 'mobile' ? now.replace(/^2035/, '2036') : now;
async function context(
  page: import('@playwright/test').Page,
  token: string,
  identity: string,
  now: string,
) {
  await page.request.post(fixture + '/control', {
    data: { token, identity, now: fixtureTime(now) },
  });
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
}
test('the sixth question is limited across sessions and spoofed client IP values', async ({
  page,
  browser,
}) => {
  const token = 'minute-' + Date.now();
  await context(page, token, token, '2035-01-01T12:00:00.000Z');
  const ask = (request: import('@playwright/test').APIRequestContext) =>
    request.post(origin + '/api/chat', {
      headers: {
        origin,
        'x-firstday-context': token,
        'x-forwarded-for': '198.51.100.' + Math.floor(Math.random() * 200),
      },
      data: {
        question: 'What is the salary? Evidence' + Date.now(),
        scope: 'HR',
        ip: crypto.randomUUID(),
      },
    });
  for (let i = 0; i < 5; i++)
    expect((await ask(page.request)).status()).toBe(200);
  const other = await browser.newContext();
  const otherPage = await other.newPage();
  await context(otherPage, token, token, '2035-01-01T12:00:00.000Z');
  const limited = await ask(other.request);
  expect(limited.status()).toBe(429);
  expect(await limited.json()).toMatchObject({
    code: 'app_minute',
    retryAfterSeconds: 60,
  });
  expect(limited.headers()['retry-after']).toBe('60');
  await other.close();
});

test('Google quota gives provider-specific retry guidance without a completed answer', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const result = await page.request.post('/api/chat', {
    headers: { origin },
    data: {
      question: 'GOOGLE_QUOTA What is my setup?',
      scope: 'Frontend Developer',
    },
  });
  expect(result.status()).toBe(503);
  expect(await result.json()).toMatchObject({
    code: 'google_quota',
    retryAfterSeconds: 17,
  });
  expect(result.headers()['retry-after']).toBe('17');
  await page.goto('/chat');
  await page.getByLabel('Your question').fill('GOOGLE_QUOTA What is my setup?');
  await page.getByRole('button', { name: 'Ask FirstDay', exact: true }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Google' }),
  ).toContainText('Google');
  await expect(
    page.getByRole('alert').filter({ hasText: 'Google' }),
  ).toContainText('17 seconds');
  await expect(
    page.getByRole('article', { name: 'FirstDay answer' }),
  ).toHaveCount(0);
});

async function publishGuide(
  page: import('@playwright/test').Page,
  marker: string,
  body?: string,
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
        name: 'quota.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from(
          body ||
            '# ' +
              marker +
              '\n\nRun npm run dev:firstday. Copy .env.example to .env.local before starting.',
        ),
      },
    },
  });
  expect(upload.status()).toBe(201);
  const { document } = await upload.json();
  return document;
}

test('Groq quota is distinct from Google and its retry header is visible', async ({
  page,
}) => {
  const marker = 'Evidence' + Date.now();
  const document = await publishGuide(page, marker);
  const indexed = await page.request.post(
    '/api/admin/documents/' + document.id + '/index',
    { headers: { origin } },
  );
  expect((await indexed.json()).status).toBe('ready');
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const response = await page.request.post('/api/chat', {
    headers: { origin },
    data: {
      question: 'GROQ_QUOTA How do I start ' + marker + '?',
      scope: 'Frontend Developer',
    },
  });
  expect(response.status()).toBe(503);
  expect(await response.json()).toMatchObject({
    code: 'groq_quota',
    retryAfterSeconds: 31,
  });
  expect(response.headers()['retry-after']).toBe('31');
  await page.goto('/chat');
  await page
    .getByLabel('Your question')
    .fill('GROQ_QUOTA How do I start ' + marker + '?');
  await page.getByRole('button', { name: 'Ask FirstDay', exact: true }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Groq' }),
  ).toContainText('31 seconds');
  await expect(page.getByLabel('FirstDay answer')).toHaveCount(0);
});

test('indexing quota and independent provider outages recover without publishing a failed answer', async ({
  page,
}) => {
  test.setTimeout(45000);
  const marker = 'Evidence' + Date.now();
  const document = await publishGuide(
    page,
    marker,
    '# ' +
      marker +
      '\n\nINDEX_QUOTA\n\nRun npm run dev:firstday. Copy .env.example to .env.local before starting.',
  );
  await page.goto('/admin/documents/' + document.id);
  const pending = page.waitForResponse(
    (r) =>
      new URL(r.url()).pathname.endsWith(
        '/documents/' + document.id + '/index',
      ) && r.request().method() === 'POST',
  );
  await page
    .getByRole('button', { name: 'Index and publish', exact: true })
    .click();
  const failed = await pending;
  expect(failed.status()).toBe(503);
  expect(await failed.json()).toMatchObject({
    code: 'google_quota',
    retryAfterSeconds: 9,
  });
  await expect(
    page.getByRole('alert').filter({ hasText: 'Google' }),
  ).toContainText('9 seconds');
  await page
    .getByRole('button', { name: 'Retry indexing', exact: true })
    .click();
  await expect(page.getByText('Ready', { exact: true }).first()).toBeVisible();
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  for (const [markerPrefix, code] of [
    ['GOOGLE_NETWORK', 'google_unavailable'],
    ['GROQ_NETWORK', 'groq_unavailable'],
  ]) {
    const question = markerPrefix + ' How do I start ' + marker + '?';
    const ask = () =>
      page.request.post('/api/chat', {
        headers: { origin },
        data: { question, scope: 'Frontend Developer' },
      });
    const unavailable = await ask();
    expect(unavailable.status()).toBe(503);
    const failure = await unavailable.json();
    expect(failure).toMatchObject({ code });
    expect(failure).not.toHaveProperty('claims');
    const retried = await ask();
    expect(retried.status()).toBe(200);
    expect(await retried.json()).toMatchObject({
      status: 'answered',
      answer: expect.stringContaining('npm run dev:firstday'),
    });
  }
});

test('atomic rolling admission counts provider failures and expires only elapsed requests', async ({
  page,
}) => {
  test.setTimeout(45000);
  const token = 'atomic-' + Date.now();
  await context(page, token, token, '2035-01-03T12:00:00.000Z');
  const ask = (question = 'GOOGLE_QUOTA salary') =>
    page.request.post('/api/chat', {
      headers: { origin, 'x-firstday-context': token },
      data: { question, scope: 'HR' },
    });
  for (let i = 0; i < 6; i++) {
    const invalid = await page.request.post('/api/chat', {
      headers: { origin, 'x-firstday-context': token },
      data: {
        question: 'salary',
        scope: 'HR',
        history: [{ scope: 'Designer', question: 'x', answer: 'x' }],
      },
    });
    expect(invalid.status()).toBe(400);
  }
  const results = await Promise.all(Array.from({ length: 10 }, () => ask()));
  expect(results.filter((r) => r.status() === 503)).toHaveLength(5);
  expect(results.filter((r) => r.status() === 429)).toHaveLength(5);
  for (const r of results)
    expect((await r.json()).code).toBe(
      r.status() === 429 ? 'app_minute' : 'google_quota',
    );
  const clock = (now: string, identity = token + '-rolling') =>
    page.request.post(fixture + '/control', {
      data: { token, identity, now: fixtureTime(now) },
    });
  for (let second = 0; second < 5; second++) {
    await clock('2035-01-04T12:00:0' + second + '.000Z');
    expect((await ask('salary Evidence' + Date.now())).status()).toBe(200);
  }
  await clock('2035-01-04T12:00:59.999Z');
  const before = await ask();
  expect(before.status()).toBe(429);
  expect((await before.json()).retryAfterSeconds).toBe(1);
  await clock('2035-01-04T12:01:00.000Z');
  expect((await ask('salary')).status()).toBe(200);
  expect((await ask('salary')).status()).toBe(429);
  await clock('2035-01-04T12:01:01.000Z');
  expect((await ask('salary')).status()).toBe(200);
});

test('global admission is atomic across identities and new sessions and resets at midnight UTC', async ({
  page,
  browser,
}) => {
  test.setTimeout(120000);
  const prefix = 'daily-' + Date.now();
  const make = async (i: number, now = '2035-02-01T23:59:30.000Z') => {
    const token = prefix + i;
    await page.request.post(fixture + '/control', {
      data: { token, identity: token, now: fixtureTime(now) },
    });
    return token;
  };
  await context(page, prefix, prefix, '2035-02-01T23:59:30.000Z');
  const ask = async (i: number, request = page.request, now?: string) =>
    request.post(origin + '/api/chat', {
      headers: { origin, 'x-firstday-context': await make(i, now) },
      data: { question: 'GOOGLE_QUOTA salary', scope: 'HR' },
    });
  for (let start = 0; start < 90; start += 10) {
    const batch = await Promise.all(
      Array.from({ length: 10 }, (_, i) => ask(start + i)),
    );
    for (const r of batch) expect(r.status()).toBe(503);
  }
  const final = await Promise.all(
    Array.from({ length: 20 }, (_, i) => ask(90 + i)),
  );
  expect(final.filter((r) => r.status() === 503)).toHaveLength(10);
  expect(final.filter((r) => r.status() === 429)).toHaveLength(10);
  const fresh = await browser.newContext();
  const freshPage = await fresh.newPage();
  await freshPage.request.post(origin + '/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const limited = await ask(200, fresh.request);
  expect(limited.status()).toBe(429);
  expect(await limited.json()).toMatchObject({
    code: 'app_daily',
    retryAfterSeconds: 30,
  });
  const reset = await ask(201, fresh.request, '2035-02-02T00:00:00.000Z');
  expect(reset.status()).toBe(503);
  expect((await reset.json()).code).toBe('google_quota');
  await fresh.close();
});
test('learner cannot read or tamper with durable counters or forge admission', async ({
  page,
}) => {
  const { readFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const local = JSON.parse(
    readFileSync(
      join(tmpdir(), 'firstday-supabase-fixture', 'status.json'),
      'utf8',
    ),
  );
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
  for (const table of ['demo_chat_days', 'demo_chat_ips']) {
    expect(
      (
        await page.request.get(local.API_URL + '/rest/v1/' + table, { headers })
      ).status(),
    ).toBe(403);
    expect(
      (
        await page.request.delete(
          local.API_URL +
            '/rest/v1/' +
            table +
            (table === 'demo_chat_days'
              ? '?day=eq.2035-02-01'
              : '?identity=eq.' + 'a'.repeat(64)),
          { headers },
        )
      ).status(),
    ).toBe(403);
  }
  expect(
    (
      await page.request.post(
        local.API_URL + '/rest/v1/rpc/admit_demo_question',
        {
          headers,
          data: { p_identity: 'a'.repeat(64), p_now: '2035-01-01T00:00:00Z' },
        },
      )
    ).status(),
  ).toBe(403);
});
