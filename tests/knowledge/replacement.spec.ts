import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test, expect, type APIRequestContext } from '@playwright/test';
const origin = 'http://127.0.0.1:3200';
async function signIn(request: APIRequestContext, admin = false) {
  expect(
    (
      await request.post('/api/auth/login', {
        headers: { origin },
        data: {
          email: admin ? 'admin@firstday.example' : 'demo@firstday.example',
          password: 'FirstDayDemo!2026',
        },
      })
    ).status(),
  ).toBe(200);
}
function file(marker: string, command: string) {
  return {
    name: 'setup.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from(
      '# ' +
        marker +
        '\n\n## Run the frontend\n\nRun npm run ' +
        command +
        '. Copy .env.example to .env.local before starting.',
    ),
  };
}
test('replacement publishes atomically while earlier citations keep their original passage', async ({
  page,
  browser,
}) => {
  const marker = 'Evidence' + Date.now();
  await signIn(page.request, true);
  const upload = await page.request.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title: marker,
      jobRole: 'Frontend Developer',
      file: file(marker, 'dev:firstday'),
    },
  });
  expect(upload.status()).toBe(201);
  const { document } = await upload.json();
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
  const learner = await browser.newContext();
  await signIn(learner.request);
  const ask = async () => {
    const response = await learner.request.post(origin + '/api/chat', {
      headers: { origin },
      data: {
        question: 'How do I run ' + marker + '?',
        scope: 'Frontend Developer',
      },
    });
    expect(response.status()).toBe(200);
    return response.json();
  };
  const before = await ask();
  expect(before.answer).toContain('npm run dev:firstday');
  const oldSource = before.claims[0].citations[0].href;
  const replace = await page.request.post(
    '/api/admin/documents/' + document.id + '/replace',
    { headers: { origin }, multipart: { file: file(marker, 'dev:second') } },
  );
  expect(replace.status()).toBe(201);
  expect((await ask()).answer).toContain('npm run dev:firstday');
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
  const after = await ask();
  expect(after.answer).toContain('npm run dev:second');
  expect(after.answer).not.toContain('npm run dev:firstday');
  const reader = await learner.newPage();
  await reader.goto(origin + '/knowledge/' + document.id);
  await expect(reader.getByLabel('Published guide')).toContainText(
    'npm run dev:second',
  );
  await reader.goto(origin + oldSource);
  await expect(reader.getByLabel('Supporting passage')).toContainText(
    'npm run dev:firstday',
  );
  await learner.close();
});

test('administrator explicitly uploads and publishes a replacement through the guide page', async ({
  page,
}) => {
  const marker = 'Evidence' + Date.now();
  await signIn(page.request, true);
  const upload = await page.request.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title: marker,
      jobRole: 'Designer',
      file: file(marker, 'dev:firstday'),
    },
  });
  const { document } = await upload.json();
  await page.request.post('/api/admin/documents/' + document.id + '/index', {
    headers: { origin },
  });
  await page.goto('/admin/documents/' + document.id);
  await page.getByText('Replace guide', { exact: true }).click();
  await page
    .getByLabel('Replacement Markdown file')
    .setInputFiles(file(marker, 'dev:design'));
  await page
    .getByRole('button', { name: 'Upload replacement', exact: true })
    .click();
  await expect(page.getByLabel('Document content')).toContainText(
    'npm run dev:design',
  );
  await expect(
    page.getByText(
      'The published guide stays available until this candidate is fully indexed.',
    ),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Index and publish', exact: true })
    .click();
  await expect(
    page.getByText('Published and available in the knowledge library.'),
  ).toBeVisible();
  await page.goto('/knowledge/' + document.id);
  await expect(page.getByLabel('Published guide')).toContainText(
    'npm run dev:design',
  );
});

test('concurrent replacement candidates reject a stale version-pinned indexing request', async ({
  page,
  browser,
}) => {
  const marker = 'Evidence' + Date.now();
  await signIn(page.request, true);
  const upload = await page.request.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title: marker,
      jobRole: 'Frontend Developer',
      file: file(marker, 'dev:firstday'),
    },
  });
  const { document } = await upload.json();
  await page.request.post('/api/admin/documents/' + document.id + '/index', {
    headers: { origin },
  });
  const candidates = await Promise.all(
    ['dev:older', 'dev:newer'].map((command) =>
      page.request.post('/api/admin/documents/' + document.id + '/replace', {
        headers: { origin },
        multipart: { file: file(marker, command) },
      }),
    ),
  );
  const results = await Promise.all(
    candidates.map(async (response) => {
      expect(response.status()).toBe(201);
      return response.json();
    }),
  );
  const [older, newer] = results.sort(
    (a, b) => a.version.revision - b.version.revision,
  );
  expect(older.version.id).not.toBe(newer.version.id);
  const stale = await page.request.post(
    '/api/admin/documents/' +
      document.id +
      '/index?version=' +
      older.version.id,
    { headers: { origin } },
  );
  expect(stale.status()).toBe(409);
  expect((await stale.json()).error).toContain('newer candidate');
  const current = await page.request.post(
    '/api/admin/documents/' +
      document.id +
      '/index?version=' +
      newer.version.id,
    { headers: { origin } },
  );
  expect((await current.json()).status).toBe('ready');
  const learner = await browser.newContext();
  await signIn(learner.request);
  expect(
    (
      await learner.request.post(
        origin + '/api/admin/documents/' + document.id + '/replace',
        {
          headers: { origin },
          multipart: { file: file(marker, 'dev:forbidden') },
        },
      )
    ).status(),
  ).toBe(403);
  expect(
    (
      await learner.request.post(
        origin +
          '/api/admin/documents/' +
          document.id +
          '/index?version=' +
          newer.version.id,
        { headers: { origin } },
      )
    ).status(),
  ).toBe(403);
  await learner.close();
});

test('retained citations keep their version and expired sources show useful unavailable feedback', async ({
  page,
  browser,
}) => {
  test.setTimeout(60000);
  const marker = 'Evidence' + Date.now();
  await signIn(page.request, true);
  const upload = await page.request.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title: marker,
      jobRole: 'Frontend Developer',
      file: file(marker, 'dev:firstday'),
    },
  });
  const { document } = await upload.json();
  await page.request.post('/api/admin/documents/' + document.id + '/index', {
    headers: { origin },
  });
  const learner = await browser.newContext();
  await signIn(learner.request);
  const answer = await (
    await learner.request.post(origin + '/api/chat', {
      headers: { origin },
      data: {
        question: 'How do I run ' + marker + '?',
        scope: 'Frontend Developer',
      },
    })
  ).json();
  const href = answer.claims[0].citations[0].href;
  for (const command of ['dev:second', 'dev:third', 'dev:fourth']) {
    const replacement = await page.request.post(
      '/api/admin/documents/' + document.id + '/replace',
      { headers: { origin }, multipart: { file: file(marker, command) } },
    );
    expect(replacement.status()).toBe(201);
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
    if (command !== 'dev:fourth')
      expect((await learner.request.get(origin + href)).status()).toBe(200);
  }
  const reader = await learner.newPage();
  const unavailable = await reader.goto(origin + href);
  expect(unavailable?.status()).toBe(404);
  await expect(
    reader.getByRole('heading', { name: 'Source unavailable', exact: true }),
  ).toBeVisible();
  await expect(
    reader.getByText(
      'The original version may have expired from the three-version history. Ask a new question to inspect current evidence.',
    ),
  ).toBeVisible();
  await reader.goto(origin + '/knowledge/' + document.id);
  await expect(reader.getByLabel('Published guide')).toContainText(
    'npm run dev:fourth',
  );
  await learner.close();
});

test('draft retention stays bounded while live workers cannot be pruned or publish stale content', async ({
  page,
  browser,
}) => {
  test.setTimeout(60000);
  const marker = 'Evidence' + Date.now();
  await signIn(page.request, true);
  const upload = await page.request.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title: marker,
      jobRole: 'Frontend Developer',
      file: file(marker, 'dev:firstday'),
    },
  });
  const { document } = await upload.json();
  await page.request.post('/api/admin/documents/' + document.id + '/index', {
    headers: { origin },
  });
  for (let i = 0; i < 5; i++)
    expect(
      (
        await page.request.post(
          '/api/admin/documents/' + document.id + '/replace',
          {
            headers: { origin },
            multipart: { file: file(marker, 'dev:draft' + i) },
          },
        )
      ).status(),
    ).toBe(201);
  const status = JSON.parse(
    readFileSync(
      process.env.FIRSTDAY_TEST_SUPABASE_STATUS_FILE ||
        join(tmpdir(), 'firstday-supabase-fixture', 'status.json'),
      'utf8',
    ),
  );
  const client = createClient(status.API_URL, status.PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  expect(
    (
      await client.auth.signInWithPassword({
        email: 'admin@firstday.example',
        password: 'FirstDayDemo!2026',
      })
    ).error,
  ).toBeNull();
  const drafts = await client
    .from('knowledge_versions')
    .select('id')
    .eq('document_id', document.id)
    .is('published_at', null);
  expect(drafts.error).toBeNull();
  expect(drafts.data).toHaveLength(3);
  const learner = await browser.newContext();
  await signIn(learner.request);
  const workers: Promise<{ status: number }>[] = [];
  const gates: string[] = [];
  try {
    for (let i = 0; i < 3; i++) {
      const key = 'WAIT_EMBEDDING_' + Date.now() + i;
      gates.push(key);
      const candidate = await (
        await page.request.post(
          '/api/admin/documents/' + document.id + '/replace',
          {
            headers: { origin },
            multipart: { file: file(marker, 'dev:worker' + i + ' ' + key) },
          },
        )
      ).json();
      workers.push(
        page.request
          .post(
            '/api/admin/documents/' +
              document.id +
              '/index?version=' +
              candidate.version.id,
            { headers: { origin } },
          )
          .then((response) => ({ status: response.status() })),
      );
      await expect
        .poll(
          async () =>
            (
              await (
                await page.request.get(
                  'http://127.0.0.1:19030/pending?key=' + key,
                )
              ).json()
            ).pending,
        )
        .toBe(true);
    }
    const denied = await page.request.post(
      '/api/admin/documents/' + document.id + '/replace',
      {
        headers: { origin },
        multipart: { file: file(marker, 'dev:too-many') },
      },
    );
    expect(denied.status()).toBe(409);
    expect((await denied.json()).error).toContain('indexing attempts');
    const active = await learner.request.get(
      origin + '/knowledge/' + document.id,
    );
    expect(active.status()).toBe(200);
    expect(await active.text()).toContain('dev:firstday');
  } finally {
    await Promise.all(
      gates.map((key) =>
        page.request.post('http://127.0.0.1:19030/release?key=' + key),
      ),
    );
  }
  const results = await Promise.all(workers);
  expect(results.map((result) => result.status)).toEqual([409, 409, 200]);
  const current = await learner.request.get(
    origin + '/knowledge/' + document.id,
  );
  expect(await current.text()).toContain('dev:worker2');
  const next = await page.request.post(
    '/api/admin/documents/' + document.id + '/replace',
    { headers: { origin }, multipart: { file: file(marker, 'dev:next') } },
  );
  expect(next.status()).toBe(201);
  await learner.close();
});

test('failed replacement keeps working knowledge and safely resumes the same candidate', async ({
  page,
  browser,
}) => {
  const marker = 'Evidence' + Date.now();
  await signIn(page.request, true);
  const upload = await page.request.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title: marker,
      jobRole: 'Frontend Developer',
      file: file(marker, 'dev:firstday'),
    },
  });
  const { document } = await upload.json();
  await page.request.post('/api/admin/documents/' + document.id + '/index', {
    headers: { origin },
  });
  const learner = await browser.newContext();
  await signIn(learner.request);
  const replacement = await page.request.post(
    '/api/admin/documents/' + document.id + '/replace',
    {
      headers: { origin },
      multipart: { file: file(marker, 'dev:retry FAIL_EMBEDDING') },
    },
  );
  expect(replacement.status()).toBe(201);
  const { version } = await replacement.json();
  const failure = await page.request.post(
    '/api/admin/documents/' + document.id + '/index?version=' + version.id,
    { headers: { origin } },
  );
  expect(failure.status()).toBe(503);
  expect((await failure.json()).error).toContain('quota');
  const candidate = await (
    await page.request.get('/api/admin/documents/' + document.id)
  ).json();
  expect(candidate.version.id).toBe(version.id);
  expect(candidate.version.status).toBe('failed');
  const active = await learner.request.get(
    origin + '/knowledge/' + document.id,
  );
  expect(await active.text()).toContain('dev:firstday');
  const oldAnswer = await (
    await learner.request.post(origin + '/api/chat', {
      headers: { origin },
      data: {
        question: 'How do I run ' + marker + '?',
        scope: 'Frontend Developer',
      },
    })
  ).json();
  expect(oldAnswer.answer).toContain('dev:firstday');
  const retry = await page.request.post(
    '/api/admin/documents/' + document.id + '/index?version=' + version.id,
    { headers: { origin } },
  );
  expect(retry.status()).toBe(200);
  expect((await retry.json()).status).toBe('ready');
  const repeated = await page.request.post(
    '/api/admin/documents/' + document.id + '/index?version=' + version.id,
    { headers: { origin } },
  );
  expect((await repeated.json()).status).toBe('ready');
  const updated = await learner.request.get(
    origin + '/knowledge/' + document.id,
  );
  expect(await updated.text()).toContain('dev:retry');
  const status = JSON.parse(
    readFileSync(
      process.env.FIRSTDAY_TEST_SUPABASE_STATUS_FILE ||
        join(tmpdir(), 'firstday-supabase-fixture', 'status.json'),
      'utf8',
    ),
  );
  const client = createClient(status.API_URL, status.PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  expect(
    (
      await client.auth.signInWithPassword({
        email: 'demo@firstday.example',
        password: 'FirstDayDemo!2026',
      })
    ).error,
  ).toBeNull();
  for (const [name, args] of [
    [
      'replace_knowledge_document',
      {
        p_document: document.id,
        p_filename: 'forged.md',
        p_content: '# Forged',
      },
    ],
    ['claim_knowledge_index', { p_version: version.id, p_config: 'forged' }],
    [
      'publish_knowledge_version',
      { p_version: version.id, p_token: version.id },
    ],
  ] as const) {
    const denied = await client.rpc(name, args);
    expect(denied.error?.code).toBe('42501');
  }
  await learner.close();
});
