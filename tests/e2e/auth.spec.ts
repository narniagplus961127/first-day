import { test, expect } from '@playwright/test';

test('demo dialog supports keyboard dismissal and copying credentials', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/login');
  const trigger = page.getByRole('button', { name: 'View demo account' });
  await trigger.focus();
  await trigger.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Copy email' }).click();
  await expect(dialog.getByRole('status')).toContainText('Email copied.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    'demo@firstday.example',
  );
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
test('visitor can inspect demo credentials and fill the login form', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'View demo account' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByText('demo@firstday.example', { exact: true }),
  ).toBeVisible();
  await dialog.getByRole('button', { name: 'Fill login form' }).click();
  await expect(page.getByLabel('Email address')).toHaveValue(
    'demo@firstday.example',
  );
  await expect(page.getByLabel('Password', { exact: true })).toHaveValue(
    'FirstDayDemo!2026',
  );
  await expect(dialog).not.toBeVisible();
});

test('learner signs in to a verified workspace and signs out', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('Email address').fill('demo@firstday.example');
  await page.getByLabel('Password', { exact: true }).fill('FirstDayDemo!2026');
  await page.getByRole('button', { name: 'Log in →' }).click();
  await expect(page).toHaveURL('/workspace');
  await expect(
    page.getByRole('heading', { name: 'Your first day, a little clearer.' }),
  ).toBeVisible();
  await expect(
    page.getByText('Welcome in. Your starting point as a Frontend Developer.'),
  ).toBeVisible();
  if (await page.getByText('Menu', { exact: true }).isVisible())
    await page.getByText('Menu', { exact: true }).click();
  await page.getByRole('button', { name: 'Sign out' }).first().click();
  await expect(page).toHaveURL('/login');
});

test('administrator access follows verified app metadata, not editable profile claims', async ({
  page,
}) => {
  const sign = await page.request.post('/api/auth/login', {
    headers: { origin: 'http://127.0.0.1:3100' },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  expect(sign.status()).toBe(200);
  const denied = await page.request.get('/api/admin');
  expect(denied.status()).toBe(403);
  const session = await page.request.get('/api/auth/session');
  expect((await session.json()).user.role).toBe('learner');
  await page.goto('/admin');
  await expect(page).toHaveURL('/workspace?notice=administrator-required');
  await page.request.post('/api/auth/login', {
    headers: { origin: 'http://127.0.0.1:3100' },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  expect((await page.request.get('/api/admin')).status()).toBe(200);
  await page.goto('/admin');
  await expect(
    page.getByRole('heading', {
      name: 'Good onboarding starts with good knowledge.',
    }),
  ).toBeVisible();
});
test('expired sessions return a clear sign-in explanation', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin: 'http://127.0.0.1:3100' },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  await page.request.post('http://127.0.0.1:54329/_control/revoke');
  expect((await page.request.get('/api/auth/session')).status()).toBe(401);
  await page.goto('/workspace');
  await expect(page).toHaveURL('/login?reason=session');
  await expect(
    page.getByRole('alert').filter({ hasText: 'Your session has expired' }),
  ).toContainText('Your session has expired');
});
test('invalid credentials and cross-origin requests fail safely', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('Email address').fill('demo@firstday.example');
  await page.getByLabel('Password', { exact: true }).fill('incorrect-password');
  await page.getByRole('button', { name: 'Log in →' }).click();
  await expect(
    page
      .getByRole('alert')
      .filter({ hasText: 'Email or password is incorrect' }),
  ).toContainText('Email or password is incorrect');
  for (const origin of ['https://unrelated.example', 'not-a-url']) {
    const r = await page.request.post('/api/auth/login', {
      headers: { origin },
      data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
    });
    expect(r.status()).toBe(403);
  }
});
test('unauthenticated management and session requests are denied', async ({
  request,
}) => {
  expect((await request.get('/api/admin')).status()).toBe(401);
  expect((await request.get('/api/auth/session')).status()).toBe(401);
});
