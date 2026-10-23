import { test, expect } from '@playwright/test';
const origin = 'http://127.0.0.1:3200';
test('unfinished questions survive scope changes, navigation and reload without submitting', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  let submissions = 0;
  page.on('request', (request) => {
    if (request.url().endsWith('/api/chat') && request.method() === 'POST')
      submissions++;
  });
  await page.goto('/chat');
  await page.getByLabel('Your question').fill('Frontend unfinished question');
  await page.getByLabel('Search scope').selectOption('Designer');
  await expect(page.getByLabel('Your question')).toHaveValue('');
  await page.getByLabel('Your question').fill('Designer unfinished question');
  await page.getByLabel('Search scope').selectOption('All roles');
  await page.getByLabel('Your question').fill('All roles unfinished question');
  await page.goto('/knowledge');
  await page.goto('/chat');
  await expect(page.getByLabel('Search scope')).toHaveValue('All roles');
  await expect(page.getByLabel('Your question')).toHaveValue(
    'All roles unfinished question',
  );
  await page.getByLabel('Search scope').selectOption('Frontend Developer');
  await expect(page.getByLabel('Your question')).toHaveValue(
    'Frontend unfinished question',
  );
  await page.getByLabel('Search scope').selectOption('Designer');
  await page.reload();
  await expect(page.getByLabel('Your question')).toHaveValue(
    'Designer unfinished question',
  );
  expect(submissions).toBe(0);
  await expect(page.getByLabel('Your question')).toHaveAttribute(
    'maxlength',
    '1000',
  );
});

test('a late answer preserves newer typing and success clears only the submitted scope draft', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  await page.goto('/chat');
  await page.getByLabel('Your question').fill('Keep this frontend draft');
  await page.getByLabel('Search scope').selectOption('HR');
  let release!: () => void;
  let received!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const responseReady = new Promise<void>((resolve) => {
    received = resolve;
  });
  await page.route('**/api/chat', async (route) => {
    const response = await route.fetch();
    received();
    await held;
    await route.fulfill({ response });
  });
  await page.getByLabel('Your question').fill('Where is the HR salary policy?');
  await page.getByRole('button', { name: 'Ask FirstDay', exact: true }).click();
  await responseReady;
  try {
    await expect(page.getByLabel('Your question')).toBeEnabled();
    await page
      .getByLabel('Your question')
      .fill('New question typed while waiting');
  } finally {
    release();
  }
  await expect(page.getByLabel('FirstDay answer')).toHaveCount(1);
  await expect(page.getByLabel('Your question')).toHaveValue(
    'New question typed while waiting',
  );
  await page.unroute('**/api/chat');
  await page.reload();
  await expect(page.getByLabel('Your question')).toHaveValue(
    'New question typed while waiting',
  );
  await expect(page.getByLabel('FirstDay answer')).toHaveCount(1);
  await page.getByRole('button', { name: 'Ask FirstDay', exact: true }).click();
  await expect(page.getByLabel('FirstDay answer')).toHaveCount(2);
  await expect(page.getByLabel('Your question')).toHaveValue('');
  await page.getByLabel('Search scope').selectOption('Frontend Developer');
  await expect(page.getByLabel('Your question')).toHaveValue(
    'Keep this frontend draft',
  );
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
  await page.getByRole('button', { name: 'Keep my history' }).click();
  await expect(page.getByLabel('Your question')).toHaveValue(
    'Keep this frontend draft',
  );
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
  await page
    .getByRole('button', { name: 'Reset this browser', exact: true })
    .click();
  await page.reload();
  await expect(page.getByLabel('Your question')).toHaveValue('');
  await page.getByLabel('Search scope').selectOption('HR');
  await expect(page.getByLabel('Your question')).toHaveValue('');
  await expect(page.getByLabel('FirstDay answer')).toHaveCount(0);
});

test('failed answers retain drafts and blocked storage explains temporary activity', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException('Blocked', 'SecurityError');
    };
    Storage.prototype.setItem = () => {
      throw new DOMException('Blocked', 'SecurityError');
    };
  });
  await page.goto('/chat');
  await expect(page.getByRole('status')).toContainText('temporary in this tab');
  await page.getByLabel('Your question').fill('Keep my question after failure');
  await page.route('**/api/chat', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Controlled service outage. Please retry.',
      }),
    }),
  );
  await page.getByRole('button', { name: 'Ask FirstDay', exact: true }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Controlled service outage' }),
  ).toContainText('Please retry');
  await expect(page.getByLabel('Your question')).toHaveValue(
    'Keep my question after failure',
  );
  await page.getByLabel('Search scope').selectOption('Designer');
  await page.getByLabel('Your question').fill('Temporary design draft');
  await page.getByLabel('Search scope').selectOption('Frontend Developer');
  await expect(page.getByLabel('Your question')).toHaveValue(
    'Keep my question after failure',
  );
  await expect(page.getByRole('status')).toContainText('temporary in this tab');
});
