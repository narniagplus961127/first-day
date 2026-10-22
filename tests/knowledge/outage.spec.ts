import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
const origin = 'http://127.0.0.1:3200';

test('knowledge pages explain a real storage outage and recover after service returns', async ({
  browser,
}) => {
  test.setTimeout(120000);
  const admin = await browser.newContext();
  const learner = await browser.newContext();
  const container = 'supabase_rest_firstday-supabase-fixture';
  try {
    for (const [context, email] of [
      [admin, 'admin@firstday.example'],
      [learner, 'demo@firstday.example'],
    ] as const) {
      const signed = await context.request.post(origin + '/api/auth/login', {
        headers: { origin },
        data: { email, password: 'FirstDayDemo!2026' },
      });
      expect(signed.status()).toBe(200);
    }
    const created = await admin.request.post(origin + '/api/admin/documents', {
      headers: { origin },
      multipart: {
        title: 'Storage recovery guide',
        jobRole: 'Frontend Developer',
        file: {
          name: 'recovery.md',
          mimeType: 'text/markdown',
          buffer: Buffer.from(
            '# Storage recovery\n\nRun npm run dev for the fictional project.',
          ),
        },
      },
    });
    expect(created.status()).toBe(201);
    const { document } = await created.json();
    const indexed = await admin.request.post(
      origin + '/api/admin/documents/' + document.id + '/index',
      { headers: { origin } },
    );
    expect(indexed.status()).toBe(200);
    execFileSync('docker', ['stop', container], { stdio: 'pipe' });
    for (const [context, path] of [
      [learner, '/knowledge'],
      [learner, '/knowledge/' + document.id],
      [admin, '/admin'],
      [admin, '/admin/documents/' + document.id],
    ] as const) {
      const page = await context.newPage();
      await page.goto(origin + path);
      await expect(
        page
          .getByRole('alert')
          .filter({ hasText: 'Knowledge storage is temporarily unavailable' }),
      ).toContainText('Knowledge storage is temporarily unavailable', {
        timeout: 15000,
      });
      await page.close();
    }
  } finally {
    execFileSync('docker', ['start', container], { stdio: 'pipe' });
    await expect
      .poll(
        async () =>
          (await admin.request.get(origin + '/api/admin/documents')).status(),
        { timeout: 15000 },
      )
      .toBe(200);
    await admin.close();
    await learner.close();
  }
});
