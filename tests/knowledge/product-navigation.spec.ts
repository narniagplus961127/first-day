import { test, expect, type Page } from '@playwright/test';
import { sampleLogin, sampleOrigin as origin } from './role-sample-support';

async function currentNavigation(page: Page, name: string) {
  const mobile = page.locator('.mobile-menu');
  if (await mobile.isVisible()) {
    if ((await mobile.getAttribute('open')) === null)
      await mobile.locator('summary').click();
  }
  const nav = page.getByRole('navigation', {
    name: (await mobile.isVisible()) ? 'Mobile workspace' : 'Workspace',
    exact: true,
  });
  await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
  await expect(nav.getByRole('link', { name, exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}

test('one current navigation item identifies administration, nested guides and historical sources', async ({
  page,
}) => {
  await sampleLogin(page.request, true);
  await page.goto('/admin/checklists');
  await currentNavigation(page, 'Manage checklists');
  await page.goto('/admin');
  await currentNavigation(page, 'Documents');
  const title = 'Navigation guide ' + Date.now();
  const upload = await page.request.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title,
      jobRole: 'Frontend Developer',
      file: {
        name: 'navigation.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from(
          '# Navigation\n\nRun npm run dev:firstday to start the frontend.',
        ),
      },
    },
  });
  expect(upload.status()).toBe(201);
  const { document } = await upload.json();
  const indexed = await page.request.post(
    '/api/admin/documents/' + document.id + '/index',
    { headers: { origin } },
  );
  expect((await indexed.json()).status).toBe('ready');
  await page.goto('/knowledge/' + document.id);
  await expect(page.getByLabel('Published guide')).toContainText(
    'dev:firstday',
  );
  await currentNavigation(page, 'Knowledge library');
  const response = await page.request.post('/api/chat', {
    headers: { origin },
    data: {
      question: 'How do I run ' + title + '?',
      scope: 'Frontend Developer',
    },
  });
  const answer = await response.json();
  expect(answer.status).toBe('answered');
  await page.goto(answer.claims[0].citations[0].href);
  await expect(page.getByLabel('Supporting passage')).toBeVisible();
  await currentNavigation(page, 'Ask FirstDay');
});

test('visitor uses the demo popup with keyboard and signs into the five-role workspace', async ({
  page,
}) => {
  await page.goto('/login');
  const trigger = page.getByRole('button', { name: 'View demo account' });
  await trigger.focus();
  await trigger.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.press('Enter');
  await dialog.getByRole('button', { name: 'Fill login form' }).press('Enter');
  await expect(dialog).not.toBeVisible();
  await expect(page.getByLabel('Email address')).toHaveValue(
    'demo@firstday.example',
  );
  await page.getByRole('button', { name: /^Log in/ }).press('Enter');
  await expect(page).toHaveURL('/workspace');
  await expect(page.getByLabel('Job role')).toHaveValue('Frontend Developer');
  for (const role of [
    'Frontend Developer',
    'Backend Developer',
    'Designer',
    'Business Analyst',
    'HR',
  ]) {
    await page.getByLabel('Job role').selectOption(role);
    await expect(page.getByLabel('Job role')).toHaveValue(role);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
