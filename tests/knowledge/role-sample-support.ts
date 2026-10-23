import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { expect, type APIRequestContext } from '@playwright/test';
export const sampleOrigin = 'http://127.0.0.1:3200';
export async function sampleLogin(api: APIRequestContext, admin = false) {
  expect(
    (
      await api.post('/api/auth/login', {
        headers: { origin: sampleOrigin },
        data: {
          email: admin ? 'admin@firstday.example' : 'demo@firstday.example',
          password: 'FirstDayDemo!2026',
        },
      })
    ).status(),
  ).toBe(200);
}
// Privileged setup is restricted to the dedicated loopback fixture. Assertions
// use the real public HTTP/browser contracts; never inspect database internals.
export async function cleanSample(
  api: APIRequestContext,
  role: string,
  key: string,
) {
  const local = JSON.parse(
    readFileSync(
      process.env.FIRSTDAY_TEST_SUPABASE_STATUS_FILE ||
        join(tmpdir(), 'firstday-supabase-fixture', 'status.json'),
      'utf8',
    ),
  );
  if (local.API_URL !== 'http://127.0.0.1:55421')
    throw new Error('Sample setup requires the dedicated local fixture.');
  const previous = await (
    await api.get('/api/checklists?role=' + encodeURIComponent(role))
  ).json();
  expect(
    (
      await api.put('/api/admin/checklists', {
        headers: { origin: sampleOrigin },
        data: { jobRole: role, expectedRevision: previous.revision, tasks: [] },
      })
    ).status(),
  ).toBe(200);
  const db = createClient(local.API_URL, local.SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await db
    .from('knowledge_documents')
    .delete()
    .eq('sample_key', key);
  if (error) throw error;
  const cleared = await db
    .from('onboarding_checklists')
    .delete()
    .eq('job_role', role);
  if (cleared.error) throw cleared.error;
}
