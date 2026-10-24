import { test, expect } from '@playwright/test';
import { sampleLogin, sampleOrigin as origin } from './role-sample-support';
import { publishUiChecklist } from './ui-fixture';

test('native shell, role chooser and mobile Menu preserve the selected role', async ({
  page,
}, info) => {
  await sampleLogin(page.request, true);
  await publishUiChecklist(page.request);
  await sampleLogin(page.request);
  await page.setViewportSize({
    width: info.project.name === 'desktop' ? 1440 : 390,
    height: 1000,
  });
  await page.goto('/workspace');
  await expect(page.locator('.overview-stats')).toBeVisible();
  expect(
    await page.locator('h1').evaluate((e) => getComputedStyle(e).fontFamily),
  ).toContain('Inter');
  if (info.project.name === 'desktop') {
    const hero = await page.locator('.hero').boundingBox();
    expect(hero?.x).toBe(292);
    expect(hero?.width).toBe(1108);
    expect(hero?.height).toBe(200);
    await page
      .locator('.sidebar')
      .getByRole('button', { name: 'Frontend Developer Change role' })
      .click();
  } else {
    const nav = page.getByRole('navigation', {
      name: 'Primary mobile navigation',
    });
    await expect(nav.getByRole('link')).toHaveText([
      'Overview',
      'Ask',
      'Knowledge',
      'Checklist',
    ]);
    const box = await nav.boundingBox();
    expect(box?.y).toBe(924);
    await page.locator('.mobile-menu summary').click();
    const menu = page.getByRole('dialog', {
      name: 'Workspace menu',
      exact: true,
    });
    await expect(menu).toBeVisible();
    expect((await menu.boundingBox())?.height).toBe(1000);
    await menu
      .getByRole('button', { name: 'Frontend Developer Change role' })
      .click();
  }
  const roles = page.getByRole('dialog', { name: 'Choose your role.' });
  await expect(roles.getByRole('button', { pressed: true })).toContainText(
    'Frontend Developer',
  );
  await roles.getByRole('button', { name: /Backend Developer/ }).click();
  await expect(roles).not.toBeVisible();
  await expect(page.getByLabel('Job role', { exact: true })).toHaveValue(
    'Backend Developer',
  );
  await page.reload();
  await expect(page.getByLabel('Job role', { exact: true })).toHaveValue(
    'Backend Developer',
  );
  await page.goto('/chat');
  await expect(page.getByLabel('Search scope', { exact: true })).toHaveValue(
    'Frontend Developer',
  );
  if (info.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Sources ↗' }).click();
    const sources = page.getByRole('dialog', { name: 'Sources', exact: true });
    await expect(sources).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(sources).not.toBeVisible();
  } else
    await expect(
      page.getByRole('complementary', { name: 'Answer sources' }),
    ).toBeVisible();
});

test('reader contents navigate real headings and compact editor expands only the chosen task', async ({
  page,
}) => {
  await sampleLogin(page.request, true);
  const uploaded = await page.request.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title: 'Native reader ' + Date.now(),
      jobRole: 'Designer',
      file: {
        name: 'reader.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from(
          '# Design workspace\n\n## Open the tools\n\nUse the shared tool library.\n\n## Open the tools\n\nRead the design guide.',
        ),
      },
    },
  });
  expect(uploaded.status()).toBe(201);
  const { document } = await uploaded.json();
  const indexed = await page.request.post(
    '/api/admin/documents/' + document.id + '/index',
    { headers: { origin } },
  );
  expect((await indexed.json()).status).toBe('ready');
  await page.goto('/knowledge/' + document.id);
  if (
    await page.getByRole('navigation', { name: 'In this guide' }).isVisible()
  ) {
    const link = page
      .getByRole('navigation', { name: 'In this guide' })
      .getByRole('link', { name: 'Open the tools' })
      .last();
    const href = await link.getAttribute('href');
    await link.click();
    await expect(page.locator(href!)).toBeInViewport();
  }
  const ids = await page
    .locator('.markdown-content h2')
    .evaluateAll((es) => es.map((e) => e.id));
  expect(new Set(ids).size).toBe(ids.length);
  await page.getByRole('link', { name: 'Ask about this guide →' }).click();
  await expect(page).toHaveURL('/chat');
  const current = await (
    await page.request.get('/api/checklists?role=Designer')
  ).json();
  expect(
    (
      await page.request.put('/api/admin/checklists', {
        headers: { origin },
        data: {
          jobRole: 'Designer',
          expectedRevision: current.revision,
          tasks: [
            { title: 'Find tools', stage: 'Day 1', instructions: '' },
            { title: 'Read conventions', stage: 'Week 1', instructions: '' },
          ],
        },
      })
    ).status(),
  ).toBe(200);
  await page.goto('/admin/checklists?role=Designer');
  await expect(page.getByLabel('Task title').first()).not.toBeVisible();
  const taskSummary = page.locator('.admin-task').first().locator('summary');
  await expect(
    page.getByRole('button', { name: 'Add task', exact: true }),
  ).toBeEnabled();
  await taskSummary.focus();
  await expect(taskSummary).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Task title').first()).toBeVisible();
  await expect(page.getByLabel('Task title').last()).not.toBeVisible();
  await page.getByLabel('Task title').first().fill('Find design tools');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Changes saved');
});
