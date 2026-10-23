import { test, expect } from '@playwright/test';
import { cleanSample, sampleLogin } from './role-sample-support';
const origin = 'http://127.0.0.1:3200';
test('sample upload has durable concurrent identity and preserves customized candidates', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  await cleanSample(
    page.request,
    'Frontend Developer',
    'lumen.frontend-onboarding.v1',
  );
  const upload = () =>
    page.request.post('/api/admin/documents', {
      headers: { origin },
      multipart: {
        title: 'Lumen Frontend Developer onboarding',
        jobRole: 'Frontend Developer',
        sampleKey: 'lumen.frontend-onboarding.v1',
        file: {
          name: 'frontend.md',
          mimeType: 'text/markdown',
          buffer: Buffer.from(
            '# Fictional Lumen onboarding\n\nThis is a fictional exercise for the Lumen frontend team. Follow these instructions to start the sample application. Run npm run dev:lumen -- --port 4101.',
          ),
        },
      },
    });
  const responses = await Promise.all([upload(), upload()]);
  for (const response of responses) expect(response.status()).toBe(201);
  const [first, second] = await Promise.all(responses.map((r) => r.json()));
  expect(second.document.id).toBe(first.document.id);
  expect(second.version.id).toBe(first.version.id);
  const replacement = await page.request.post(
    '/api/admin/documents/' + first.document.id + '/replace',
    {
      headers: { origin },
      multipart: {
        file: {
          name: 'custom.md',
          mimeType: 'text/markdown',
          buffer: Buffer.from(
            '# Customized exercise\n\nThese are administrator changes to the fictional exercise. Keep this revised guide content for explicit review before publication.',
          ),
        },
      },
    },
  );
  expect(replacement.status()).toBe(201);
  const custom = await replacement.json();
  const repeated = await (await upload()).json();
  expect(repeated.document.id).toBe(first.document.id);
  expect(repeated.version.id).toBe(custom.version.id);
  expect(repeated.version.content).toContain('administrator changes');
  expect(repeated.document.active_version_id).toBeNull();
  const wrong = await page.request.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title: 'Wrong role',
      jobRole: 'HR',
      sampleKey: 'lumen.frontend-onboarding.v1',
      file: {
        name: 'wrong.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from(
          '# Wrong role\n\nThis is a fictional exercise used to verify matching sample roles. Keep the existing frontend sample unchanged.',
        ),
      },
    },
  });
  expect(wrong.status()).toBe(400);
  await sampleLogin(page.request);
  expect((await upload()).status()).toBe(403);
});

// Preparation is exercised through the same public administrator routes as the
// command; no private publication, embeddings or browser activity helpers.
test('Frontend preparation binds the original eight tasks without changing their identities and skips unchanged data', async ({
  page,
}) => {
  const { prepareRoleSample, loadRoleSample } =
    await import('../../scripts/prepare-role-sample.mjs');
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const manifest = await loadRoleSample('frontend');
  await cleanSample(page.request, manifest.role, manifest.key);
  const seeded = await (
    await page.request.put('/api/admin/checklists', {
      headers: { origin },
      data: {
        jobRole: manifest.role,
        expectedRevision: 0,
        tasks: manifest.legacyTasks,
      },
    })
  ).json();
  await sampleLogin(page.request);
  await page.goto('/checklist?role=Frontend%20Developer');
  await page
    .getByRole('checkbox', { name: 'Read onboarding guide', exact: true })
    .check();
  await sampleLogin(page.request, true);
  const result = await prepareRoleSample(manifest, page.request, { origin });
  expect(result.status).toBe('ready');
  if (!('taskIds' in result))
    throw new Error('Expected prepared task identities.');
  expect(result.taskIds).toEqual(
    seeded.tasks.map((task: { id: string }) => task.id),
  );
  expect(result.taskIds).toHaveLength(8);
  const again = await prepareRoleSample(manifest, page.request, { origin });
  expect(again).toEqual({ ...result, changed: false });
  await sampleLogin(page.request);
  await page.reload();
  await expect(
    page.getByRole('checkbox', { name: 'Read onboarding guide', exact: true }),
  ).toBeChecked();
});

test('preparation preserves customized checklists and guides without extra provider work', async ({
  page,
}) => {
  const { prepareRoleSample, loadRoleSample } =
    await import('../../scripts/prepare-role-sample.mjs');
  await sampleLogin(page.request, true);
  const manifest = await loadRoleSample('frontend');
  await cleanSample(page.request, manifest.role, manifest.key);
  const prepared = await prepareRoleSample(manifest, page.request, { origin });
  const snapshot = await (
    await page.request.get('/api/checklists?role=Frontend%20Developer')
  ).json();
  const customized = await (
    await page.request.put('/api/admin/checklists', {
      headers: { origin },
      data: {
        jobRole: manifest.role,
        expectedRevision: snapshot.revision,
        tasks: snapshot.tasks.map((task: { title: string }, i: number) =>
          i === 0 ? { ...task, title: 'Administrator custom welcome' } : task,
        ),
      },
    })
  ).json();
  const before = await (
    await page.request.get('http://127.0.0.1:19030/calls')
  ).json();
  expect(
    (await prepareRoleSample(manifest, page.request, { origin })).status,
  ).toBe('diverged-checklist');
  expect(
    await (
      await page.request.get('/api/checklists?role=Frontend%20Developer')
    ).json(),
  ).toEqual(customized);
  expect(
    (await (await page.request.get('http://127.0.0.1:19030/calls')).json())
      .calls,
  ).toBe(before.calls);
  const replacement = await page.request.post(
    '/api/admin/documents/' + prepared.documentId + '/replace',
    {
      headers: { origin },
      multipart: {
        file: {
          name: manifest.filename,
          mimeType: 'text/markdown',
          buffer: Buffer.from(
            manifest.content +
              '\n\nThis candidate has administrator changes that require explicit review.',
          ),
        },
      },
    },
  );
  expect(replacement.status()).toBe(201);
  const candidate = await replacement.json();
  expect(
    (await prepareRoleSample(manifest, page.request, { origin })).status,
  ).toBe('diverged-guide');
  const inspected = await (
    await page.request.get('/api/admin/documents/' + prepared.documentId)
  ).json();
  expect(inspected.version.id).toBe(candidate.version.id);
  expect(inspected.version.status).toBe('pending');
  expect(inspected.document.active_version_id).toBe(prepared.versionId);
  expect(
    (await (await page.request.get('http://127.0.0.1:19030/calls')).json())
      .calls,
  ).toBe(before.calls);
});

test('interrupted sample indexing resumes the exact candidate and unpublished content stays private', async ({
  page,
}) => {
  const { prepareRoleSample, loadRoleSample } =
    await import('../../scripts/prepare-role-sample.mjs');
  await sampleLogin(page.request, true);
  const original = await loadRoleSample('frontend');
  const manifest = {
    ...original,
    content:
      original.content +
      '\n\n## Retry exercise\n\nINDEX_QUOTA ' +
      Date.now() +
      ': This final fictional passage makes the controlled provider pause once so preparation can resume its saved progress.',
  };
  await cleanSample(page.request, manifest.role, manifest.key);
  await expect(
    prepareRoleSample(manifest, page.request, { origin }),
  ).rejects.toThrow(/Google|quota|limit/i);
  const listed = await (await page.request.get('/api/admin/documents')).json();
  const sample = listed.documents.find(
    (document: { title: string }) => document.title === manifest.title,
  );
  const paused = await (
    await page.request.get('/api/admin/documents/' + sample.id)
  ).json();
  expect(paused.version.status).toBe('failed');
  expect(paused.document.active_version_id).toBeNull();
  await sampleLogin(page.request);
  expect(
    (await page.request.get('/api/admin/documents/' + sample.id)).status(),
  ).toBe(403);
  const notPublished = await page.request.get('/knowledge/' + sample.id);
  expect(notPublished.status()).toBe(404);
  await sampleLogin(page.request, true);
  const resumed = await prepareRoleSample(manifest, page.request, { origin });
  expect(resumed.status).toBe('ready');
  expect(resumed.documentId).toBe(sample.id);
  expect(resumed.versionId).toBe(paused.version.id);
  expect(
    (await prepareRoleSample(manifest, page.request, { origin })).changed,
  ).toBe(false);
});
