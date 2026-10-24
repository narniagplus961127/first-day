import { test, expect } from '@playwright/test';
import { filterDesigner } from './library-support';
import { execFileSync } from 'node:child_process';
const origin = 'http://127.0.0.1:3200';

test('title search combines literal mixed-case matches with role and preserves reader context', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const suffix = Date.now();
  const titles = [
    `Lumen %_ Design! ${suffix}`,
    `Lumen %_ Frontend! ${suffix}`,
    `Lumen plain Design! ${suffix}`,
  ];
  for (const [i, jobRole] of [
    'Designer',
    'Frontend Developer',
    'Designer',
  ].entries()) {
    const uploaded = await page.request.post('/api/admin/documents', {
      headers: { origin },
      multipart: {
        title: titles[i],
        jobRole,
        file: {
          name: 'search.md',
          mimeType: 'text/markdown',
          buffer: Buffer.from('# Fictional guide\n\nWelcome to Lumen.'),
        },
      },
    });
    expect(uploaded.status()).toBe(201);
    const { document } = await uploaded.json();
    expect(
      (
        await page.request.post(`/api/admin/documents/${document.id}/index`, {
          headers: { origin },
        })
      ).status(),
    ).toBe(200);
  }
  test.setTimeout(90000);
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const before = await Promise.all(
    [19030, 19031].map(async (port) =>
      (await page.request.get(`http://127.0.0.1:${port}/calls`)).json(),
    ),
  );
  await page.goto('/knowledge');
  await page.getByLabel('Search guide titles').fill('  lUmEn %_  ');
  await filterDesigner(page);
  await expect(
    page.getByRole('link', { name: titles[0], exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: titles[1], exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: titles[2], exact: true }),
  ).toHaveCount(0);
  await page.reload();
  await expect(page.getByLabel('Search guide titles')).toHaveValue('lUmEn %_');
  await page.getByRole('link', { name: titles[0], exact: true }).click();
  await page
    .getByRole('link', { name: '← Knowledge library', exact: true })
    .click();
  await expect(page.getByLabel('Search guide titles')).toHaveValue('lUmEn %_');
  await expect(page.getByLabel('Filter guides by role')).toHaveValue(
    'Designer',
  );
  await page.getByRole('link', { name: 'Clear role', exact: true }).click();
  await expect(page.getByLabel('Search guide titles')).toHaveValue('lUmEn %_');
  await expect(
    page.getByRole('link', { name: titles[1], exact: true }),
  ).toBeVisible();
  await filterDesigner(page);
  await page.getByRole('link', { name: 'Clear search', exact: true }).click();
  await expect(page.getByLabel('Filter guides by role')).toHaveValue(
    'Designer',
  );
  await expect(
    page.getByRole('link', { name: titles[2], exact: true }),
  ).toBeVisible();
  const after = await Promise.all(
    [19030, 19031].map(async (port) =>
      (await page.request.get(`http://127.0.0.1:${port}/calls`)).json(),
    ),
  );
  expect(after).toEqual(before);
});

test('title search validates URL bounds and repeated input without revealing private candidates', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const title = 'Private-search-' + Date.now();
  const uploaded = await page.request.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title,
      jobRole: 'HR',
      file: {
        name: 'candidate.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from('# Unpublished guide\n\nPrivate candidate.'),
      },
    },
  });
  expect(uploaded.status()).toBe(201);
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  await page.goto(
    '/knowledge?' + new URLSearchParams({ role: 'HR', q: title }),
  );
  await expect(page.getByRole('status')).toContainText(
    'No published guides match these filters.',
  );
  await expect(
    page.getByRole('link', { name: title, exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole('alert').filter({ hasText: /\S/ })).toHaveCount(
    0,
  );
  for (const [query, message] of [
    ['q=' + 'x'.repeat(201), 'Title search must be 200 characters or fewer.'],
    ['q=one&q=two', 'Use a single title search.'],
  ]) {
    await page.goto('/knowledge?role=HR&' + query);
    await expect(page.getByRole('alert').filter({ hasText: /\S/ })).toHaveText(
      message,
    );
    await expect(page.getByLabel('Search guide titles')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    await expect(page.getByRole('status')).toHaveCount(0);
    await expect(page.getByLabel('Filter guides by role')).toHaveValue('HR');
  }
  await page.goto(
    '/knowledge?' + new URLSearchParams({ role: 'HR', q: 'x'.repeat(200) }),
  );
  await expect(page.getByRole('alert').filter({ hasText: /\S/ })).toHaveCount(
    0,
  );
  await expect(page.getByRole('status')).toContainText(
    'No published guides match',
  );
  await page.goto(
    '/knowledge?' + new URLSearchParams({ role: 'Designer', q: '   ' }),
  );
  await expect(page.getByLabel('Search guide titles')).toHaveValue('');
  await expect(page.getByLabel('Filter guides by role')).toHaveValue(
    'Designer',
  );
});

test('title search keeps retryable storage failure distinct from no matches and retains both filters', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const container = 'supabase_rest_firstday-supabase-fixture';
  const query = 'no-match-outage-' + Date.now();
  try {
    execFileSync('docker', ['stop', container], { stdio: 'pipe' });
    await page.goto(
      '/knowledge?' + new URLSearchParams({ role: 'Designer', q: query }),
    );
    await expect(
      page
        .getByRole('alert')
        .filter({ hasText: 'Knowledge storage is temporarily unavailable' }),
    ).toBeVisible();
    await expect(
      page.getByRole('status').filter({ hasText: 'No published guides match' }),
    ).toHaveCount(0);
  } finally {
    execFileSync('docker', ['start', container], { stdio: 'pipe' });
  }
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByLabel('Search guide titles')).toHaveValue(query, {
    timeout: 20000,
  });
  await expect(page.getByLabel('Filter guides by role')).toHaveValue(
    'Designer',
  );
  await expect(page.getByRole('status')).toContainText(
    'No published guides match',
  );
});
