import { test, expect, type Page } from '@playwright/test';
const origin = 'http://127.0.0.1:3200';
async function navigate(page: Page, name: string) {
  const menu = page.locator('.mobile-menu');
  if (await menu.isVisible()) {
    if ((await menu.getAttribute('open')) === null)
      await menu.locator('summary').click();
    await menu.getByRole('link', { name, exact: true }).click();
  } else
    await page
      .getByRole('navigation', { name: 'Workspace', exact: true })
      .getByRole('link', { name, exact: true })
      .click();
}
test('blocked writes retain temporary progress and drafts during client navigation', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  await page.goto('/checklist');
  await page.evaluate(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException('Blocked', 'SecurityError');
    };
  });
  await page.getByRole('checkbox').first().check();
  await expect(page.getByText(/lost on reload/i).first()).toBeVisible();
  await navigate(page, 'Overview');
  await expect(page.getByText(/1 of .* tasks complete/)).toBeVisible();
  await navigate(page, 'Ask FirstDay');
  await page.getByLabel('Your question').fill('Temporary onboarding question');
  await navigate(page, 'Overview');
  await navigate(page, 'Ask FirstDay');
  await expect(page.getByLabel('Your question')).toHaveValue(
    'Temporary onboarding question',
  );
});

for (const failure of ['get', 'getter', 'enumeration'] as const) {
  test(
    failure + ' failure keeps temporary checklist activity honest',
    async ({ page }) => {
      await page.request.post('/api/auth/login', {
        headers: { origin },
        data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
      });
      await page.goto('/checklist');
      await page.evaluate((mode) => {
        if (mode === 'getter')
          Object.defineProperty(window, 'localStorage', {
            configurable: true,
            get() {
              throw new DOMException('Blocked', 'SecurityError');
            },
          });
        else if (mode === 'get')
          Storage.prototype.getItem = function () {
            throw new DOMException('Blocked', 'SecurityError');
          };
        else
          Object.keys = new Proxy(Object.keys, {
            apply(target, self, args) {
              if (args[0] === localStorage)
                throw new Error('Enumeration blocked');
              return Reflect.apply(target, self, args);
            },
          });
      }, failure);
      await page.getByRole('checkbox').first().check();
      await expect(page.getByText(/lost on reload/i).first()).toBeVisible();
      await navigate(page, 'Overview');
      await expect(page.getByText(/1 of .* tasks complete/)).toBeVisible();
      await expect(page.getByText(/not synchronized/i).first()).toBeVisible();
    },
  );
}
test('partial reset clears this tab and explains unconfirmed cleanup', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  await page.goto('/checklist');
  await page.getByRole('checkbox').first().check();
  await page.evaluate(() => {
    Storage.prototype.removeItem = function () {
      throw new DOMException('Blocked', 'SecurityError');
    };
  });
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
  await page
    .getByRole('button', { name: 'Reset this browser', exact: true })
    .click();
  await expect(page.getByRole('checkbox').first()).not.toBeChecked();
  await expect(
    page.getByText(/browser-wide clearing could not be confirmed/i).first(),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByRole('checkbox').first()).not.toBeChecked();
});
test('a new deliberate draft write recovers after blocked storage is restored', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  await page.goto('/chat');
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    (window as any).restoreStorage = () => {
      Storage.prototype.setItem = original;
    };
    Storage.prototype.setItem = function () {
      throw new DOMException('Blocked');
    };
  });
  await page.getByLabel('Your question').fill('Temporary question');
  await expect(page.getByText(/lost on reload/i)).toBeVisible();
  await page.evaluate(() => (window as any).restoreStorage());
  await page.getByLabel('Your question').fill('Intentional recovered question');
  await expect(page.getByText(/lost on reload/i)).toHaveCount(0);
  await page.reload();
  await expect(page.getByLabel('Your question')).toHaveValue(
    'Intentional recovered question',
  );
});

test('corrupted saved drafts are ignored and a deliberate new draft recovers safely', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  await page.goto('/chat');
  await page.getByLabel('Your question').fill('Draft before corruption');
  await page.evaluate(() => {
    for (const [key, value] of Object.entries(localStorage)) {
      if (value.includes('Draft before corruption'))
        localStorage.setItem(key, '{"untrusted":"broken');
    }
  });
  await page.reload();
  await expect(page.getByLabel('Your question')).toHaveValue('');
  await expect(page.getByText(/saved activity is invalid/i)).toBeVisible();
  await page.getByLabel('Your question').fill('Fresh valid question');
  await page.reload();
  await expect(page.getByLabel('Your question')).toHaveValue(
    'Fresh valid question',
  );
});

test('temporary completed answers survive client navigation and disappear honestly on reload', async ({
  page,
  context,
}) => {
  const token = 'temporary-answer-' + Date.now();
  await page.request.post('http://127.0.0.1:19032/control', {
    data: { token, identity: token, now: '2042-03-01T12:00:00Z' },
  });
  await context.setExtraHTTPHeaders({ 'x-firstday-context': token });
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  await page.goto('/chat');
  await page.evaluate(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException('Blocked');
    };
  });
  await page
    .getByLabel('Your question')
    .fill('How do I run the frontend project?');
  await page.getByRole('button', { name: 'Ask FirstDay', exact: true }).click();
  await expect(page.getByLabel('FirstDay answer')).toBeVisible();
  await expect(page.getByText(/lost on reload/i)).toBeVisible();
  await navigate(page, 'Overview');
  await navigate(page, 'Ask FirstDay');
  await expect(page.getByLabel('FirstDay answer')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('FirstDay answer')).toHaveCount(0);
});

test('corrupted checklist activity permits fresh temporary progress across navigation', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  await page.goto('/checklist');
  await page.getByRole('checkbox').first().check();
  await page.evaluate(() => {
    for (const [key, value] of Object.entries(localStorage))
      if (value === '1') {
        localStorage.setItem(key, 'invalid-completion');
        localStorage.setItem(key + '.corrupt', 'invalid');
      }
  });
  await page.reload();
  await expect(page.getByText(/saved activity is invalid/i)).toBeVisible();
  await page.getByRole('checkbox').first().check();
  await expect(page.getByRole('checkbox').first()).toBeChecked();
  await navigate(page, 'Overview');
  await expect(page.getByText(/1 of .* tasks complete/)).toBeVisible();
});
