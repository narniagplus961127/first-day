import { expect, type APIRequestContext } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sampleOrigin as origin } from './role-sample-support';

export function localPublicDataApi() {
  const local = JSON.parse(
    readFileSync(
      process.env.FIRSTDAY_TEST_SUPABASE_STATUS_FILE ||
        join(tmpdir(), 'firstday-supabase-fixture', 'status.json'),
      'utf8',
    ),
  );
  if (local.API_URL !== 'http://127.0.0.1:55421')
    throw new Error('UI regressions require the isolated local fixture.');
  if (typeof local.PUBLISHABLE_KEY !== 'string')
    throw new Error('Fixture publishable key is unavailable.');
  return { url: local.API_URL, key: local.PUBLISHABLE_KEY };
}
export async function uploadUiGuide(api: APIRequestContext, published = true) {
  const title =
    (published ? 'Published' : 'Private') + ' UI guide ' + crypto.randomUUID();
  const response = await api.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title,
      jobRole: 'Frontend Developer',
      file: {
        name: 'ui-guide.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from(
          '# Lumen UI guide\n\nRun npm run dev:firstday to start the frontend.',
        ),
      },
    },
  });
  expect(response.status()).toBe(201);
  const result = await response.json();
  if (published) {
    const indexed = await api.post(
      '/api/admin/documents/' + result.document.id + '/index',
      { headers: { origin } },
    );
    expect(indexed.status()).toBe(200);
    expect((await indexed.json()).status).toBe('ready');
  }
  return { ...result, title };
}
export async function publishUiChecklist(api: APIRequestContext) {
  const guide = await uploadUiGuide(api);
  const current = await (
    await api.get('/api/checklists?role=Frontend%20Developer')
  ).json();
  const saved = await api.put('/api/admin/checklists', {
    headers: { origin },
    data: {
      jobRole: 'Frontend Developer',
      expectedRevision: current.revision,
      tasks: [
        {
          title: 'Explore the onboarding guide',
          stage: 'Day 1',
          instructions: 'Read the guide and ask a question.',
          guideId: guide.document.id,
          suggestedQuestion: 'How do I run the frontend?',
        },
      ],
    },
  });
  expect(saved.status()).toBe(200);
  return { guide, checklist: await saved.json() };
}
