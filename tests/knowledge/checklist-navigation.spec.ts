import { test, expect, type Page } from '@playwright/test';
import { sampleLogin, sampleOrigin as origin } from './role-sample-support';
async function nav(page: Page, name: string) {
  const menu = page.locator('.mobile-menu');
  const mobile = await menu.isVisible();
  if (mobile && (await menu.getAttribute('open')) === null)
    await menu.locator('summary').click();
  return page
    .getByRole('navigation', {
      name: mobile ? 'Mobile workspace' : 'Workspace',
      exact: true,
    })
    .getByRole('link', { name, exact: true });
}
async function editor(page: Page) {
  await sampleLogin(page.request, true);
  const current = await (
    await page.request.get('/api/checklists?role=Frontend%20Developer')
  ).json();
  expect(
    (
      await page.request.put('/api/admin/checklists', {
        headers: { origin },
        data: {
          jobRole: 'Frontend Developer',
          expectedRevision: current.revision,
          tasks: [
            {
              title: 'Saved onboarding task',
              stage: 'Day 1',
              instructions: '',
            },
          ],
        },
      })
    ).status(),
  ).toBe(200);
  await page.goto('/admin');
  await (await nav(page, 'Manage checklists')).click();
  await expect(page.getByLabel('Task title')).toHaveValue(
    'Saved onboarding task',
  );
}
async function decision(
  page: Page,
  accept: boolean,
  action: () => Promise<unknown>,
) {
  const dialog = page
    .waitForEvent('dialog', { timeout: 5000 })
    .then(async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('Discard unsaved checklist changes?');
      if (accept) await dialog.accept();
      else await dialog.dismiss();
    });
  await action();
  await dialog;
}
test('unsaved checklist link cancellation retains edits and confirmed discard navigates without extra entries', async ({
  page,
}) => {
  await editor(page);
  await page.getByLabel('Task title').fill('Keep my unsaved task');
  const length = await page.evaluate(() => history.length);
  await decision(page, false, async () => {
    await (await nav(page, 'Documents')).click();
  });
  await expect(page).toHaveURL(/\/admin\/checklists/);
  await expect(page.getByLabel('Task title')).toHaveValue(
    'Keep my unsaved task',
  );
  expect(await page.evaluate(() => history.length)).toBe(length);
  await decision(page, true, async () => {
    await (await nav(page, 'Documents')).click();
  });
  await expect(page).toHaveURL('/admin');
  expect(await page.evaluate(() => history.length)).toBe(length + 1);
  await (await nav(page, 'Manage checklists')).click();
  await expect(page.getByLabel('Task title')).toHaveValue(
    'Saved onboarding task',
  );
});

for (const direction of ['back', 'forward'] as const) {
  for (const accept of [false, true]) {
    test(`dirty editor ${direction} ${accept ? 'confirmed discard' : 'cancellation'} preserves browser history`, async ({
      page,
    }) => {
      await editor(page);
      if (direction === 'forward') {
        await (await nav(page, 'Documents')).click();
        await expect(page).toHaveURL('/admin');
        await page.evaluate(() => history.back());
        await expect(page.getByLabel('Task title')).toHaveValue(
          'Saved onboarding task',
        );
      }
      await page.getByLabel('Task title').fill('Keep unsaved history edits');
      await expect(page.getByRole('status')).toContainText('Unsaved changes');
      const length = await page.evaluate(() => history.length);
      await decision(page, accept, () =>
        page.evaluate((direction) => history[direction](), direction),
      );
      if (accept) {
        await expect(page).toHaveURL('/admin');
      } else {
        await expect(page).toHaveURL(/\/admin\/checklists/);
        await expect(page.getByLabel('Task title')).toHaveValue(
          'Keep unsaved history edits',
        );
      }
      expect(await page.evaluate(() => history.length)).toBe(length);
    });
  }
}

test('unsupported history protection is explicit and saving restores clean navigation', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'navigation', {
      value: undefined,
      configurable: true,
    }),
  );
  await editor(page);
  const length = await page.evaluate(() => history.length);
  await page.getByLabel('Task title').fill('Saved after fallback notice');
  await expect(
    page.getByRole('status').filter({
      hasText: 'Save your edits before using browser Back or Forward',
    }),
  ).toBeVisible();
  await decision(page, false, async () => {
    await (await nav(page, 'Documents')).click();
  });
  await expect(page.getByLabel('Task title')).toHaveValue(
    'Saved after fallback notice',
  );
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Changes saved' }),
  ).toBeVisible();
  await expect(
    page.getByRole('status').filter({
      hasText: 'Save your edits before using browser Back or Forward',
    }),
  ).toHaveCount(0);
  expect(await page.evaluate(() => history.length)).toBe(length);
  let unexpectedDialogs = 0;
  page.on('dialog', async (dialog) => {
    unexpectedDialogs++;
    await dialog.dismiss();
  });
  await (await nav(page, 'Documents')).click();
  await expect(page).toHaveURL('/admin');
  expect(unexpectedDialogs).toBe(0);
  expect(await page.evaluate(() => history.length)).toBe(length + 1);
});
