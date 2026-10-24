import { test, expect } from '@playwright/test';
import { filterDesigner } from './library-support';
import { execFileSync } from 'node:child_process';
const origin = 'http://127.0.0.1:3200';

test('library role selection survives refresh and reader return without changing chat scope', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const suffix = Date.now();
  const titles = [`Frontend library ${suffix}`, `Designer library ${suffix}`];
  for (const [i, jobRole] of ['Frontend Developer', 'Designer'].entries()) {
    const uploaded = await page.request.post('/api/admin/documents', {
      headers: { origin },
      multipart: {
        title: titles[i],
        jobRole,
        file: {
          name: 'library.md',
          mimeType: 'text/markdown',
          buffer: Buffer.from('# Fictional library guide\n\nWelcome to Lumen.'),
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
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  await page.goto('/chat');
  await page.getByLabel('Search scope').selectOption('Backend Developer');
  const before = await Promise.all(
    [19030, 19031].map(async (port) =>
      (await page.request.get('http://127.0.0.1:' + port + '/calls')).json(),
    ),
  );
  await page.goto('/knowledge');
  const filter = page.getByLabel('Filter guides by role');
  await expect(filter.locator('option')).toHaveText([
    'All roles',
    'Frontend Developer',
    'Backend Developer',
    'Designer',
    'Business Analyst',
    'HR',
  ]);
  await filterDesigner(page);
  await expect(page).toHaveURL(/role=Designer/);
  await expect(
    page.getByRole('link', { name: titles[0], exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: titles[1], exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(filter).toHaveValue('Designer');
  await page.getByRole('link', { name: titles[1], exact: true }).click();
  await page
    .getByRole('link', { name: '← Knowledge library', exact: true })
    .click();
  await expect(page).toHaveURL(/role=Designer/);
  await expect(filter).toHaveValue('Designer');
  await page.getByRole('link', { name: 'Clear filters', exact: true }).click();
  await expect(filter).toHaveValue('');
  await expect(
    page.getByRole('link', { name: titles[0], exact: true }),
  ).toBeVisible();
  await page.goto('/chat');
  await expect(page.getByLabel('Search scope')).toHaveValue(
    'Backend Developer',
  );
  const after = await Promise.all(
    [19030, 19031].map(async (port) =>
      (await page.request.get('http://127.0.0.1:' + port + '/calls')).json(),
    ),
  );
  expect(after).toEqual(before);
});

test('library rejects anonymous reading and excludes candidates from role and invalid URL results', async ({
  page,
}) => {
  await page.goto('/knowledge?role=HR');
  await expect(page).toHaveURL(/\/login/);
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const title = 'Unpublished HR library ' + Date.now();
  const uploaded = await page.request.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title,
      jobRole: 'HR',
      file: {
        name: 'private-library.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from('# Private candidate\n\nNot published.'),
      },
    },
  });
  expect(uploaded.status()).toBe(201);
  const { document } = await uploaded.json();
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  await page.goto('/knowledge?role=HR');
  await expect(
    page.getByRole('link', { name: title, exact: true }),
  ).toHaveCount(0);
  await expect(
    page
      .getByRole('alert')
      .filter({ hasText: 'Knowledge storage is temporarily unavailable' }),
  ).toHaveCount(0);
  await page.getByRole('link', { name: 'Clear filters', exact: true }).click();
  await expect(
    page
      .getByRole('alert')
      .filter({ hasText: 'Knowledge storage is temporarily unavailable' }),
  ).toHaveCount(0);
  for (const query of ['role=Department', 'role=HR&role=Designer']) {
    await page.goto('/knowledge?' + query);
    await expect(page.getByLabel('Filter guides by role')).toHaveValue('');
    await expect(
      page.getByText('Unknown role filter. Showing all roles.'),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: title, exact: true }),
    ).toHaveCount(0);
  }
  expect((await page.request.get('/knowledge/' + document.id)).status()).toBe(
    404,
  );
  expect(
    (await page.request.get('/api/admin/documents/' + document.id)).status(),
  ).toBe(403);
});

test('filtered library distinguishes a real storage outage and retries with its role intact', async ({
  page,
}) => {
  test.setTimeout(90000);
  const container = 'supabase_rest_firstday-supabase-fixture';
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  try {
    execFileSync('docker', ['stop', container], { stdio: 'pipe' });
    await page.goto('/knowledge?role=Designer');
    await expect(
      page
        .getByRole('alert')
        .filter({ hasText: 'Knowledge storage is temporarily unavailable' }),
    ).toBeVisible();
    await expect(
      page.getByRole('status').filter({ hasText: 'No published guides' }),
    ).toHaveCount(0);
  } finally {
    execFileSync('docker', ['start', container], { stdio: 'pipe' });
  }
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByLabel('Filter guides by role')).toHaveValue(
    'Designer',
    { timeout: 20000 },
  );
  await expect(page).toHaveURL(/role=Designer/);
  await expect(
    page
      .getByRole('alert')
      .filter({ hasText: 'Knowledge storage is temporarily unavailable' }),
  ).toHaveCount(0);
});
