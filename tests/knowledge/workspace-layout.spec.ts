import { test, expect, type Locator, type Page } from '@playwright/test';
import { ADMIN_DEMO } from '../../src/lib/demo/admin-account';
import { sampleLogin, sampleOrigin as origin } from './role-sample-support';
import { publishUiChecklist } from './ui-fixture';

async function bounds(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  if (!box) throw new Error('Expected a visible action');
  return box;
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}

test('desktop footer stays visible while the workspace and short sidebar scroll', async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== 'desktop',
    'Desktop sidebar is replaced by the mobile Menu.',
  );
  await sampleLogin(page.request, true);
  await publishUiChecklist(page.request);
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/admin/checklists');
  const footer = page.locator('.sidebar-footer');
  const before = await bounds(footer);
  expect(before.y + before.height).toBeLessThanOrEqual(650);
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(100);
  expect(Math.abs((await bounds(footer)).y - before.y)).toBeLessThan(2);
  await page.setViewportSize({ width: 1280, height: 450 });
  const short = await bounds(footer);
  expect(short.y + short.height).toBeLessThanOrEqual(450);
  const movement = await page.locator('.sidebar-scroll').evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    return element.scrollTop;
  });
  expect(movement).toBeGreaterThan(0);
  expect(Math.abs((await bounds(footer)).y - short.y)).toBeLessThan(2);
  await expect(
    footer.getByRole('button', { name: 'Sign out' }),
  ).toBeInViewport();
});

test('overview and task actions keep clearance at desktop and narrow mobile widths', async ({
  page,
}, info) => {
  await sampleLogin(page.request, true);
  await publishUiChecklist(page.request);
  await sampleLogin(page.request);
  const widths = info.project.name === 'desktop' ? [1280] : [390, 320];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/workspace');
    const hero = await bounds(page.locator('.hero'));
    const stats = await bounds(page.locator('.overview-stats'));
    expect(stats.y - hero.y - hero.height).toBeGreaterThanOrEqual(20);
    const cta = page.getByRole('link', {
      name: 'Continue onboarding →',
      exact: true,
    });
    expect(
      await cta.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      ),
    ).toBe('rgb(169, 71, 22)');
    await noOverflow(page);
    await page.goto('/checklist?role=Frontend%20Developer');
    const guide = await bounds(
      page.getByRole('link', { name: 'Open guide', exact: true }),
    );
    const question = await bounds(
      page.getByRole('link', { name: 'Ask about this task', exact: true }),
    );
    const gap =
      question.y < guide.y + guide.height
        ? question.x - guide.x - guide.width
        : question.y - guide.y - guide.height;
    expect(gap).toBeGreaterThanOrEqual(12);
    expect(guide.height).toBeGreaterThanOrEqual(44);
    expect(question.height).toBeGreaterThanOrEqual(44);
    await noOverflow(page);
  }
});

test('logos and root take each authenticated account home and anonymous visitors to login', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page).toHaveURL('/login');
  for (const [email, password, home] of [
    ['demo@firstday.example', 'FirstDayDemo!2026', '/workspace'],
    ['admin@firstday.example', 'FirstDayDemo!2026', '/admin'],
    [ADMIN_DEMO.email, ADMIN_DEMO.password, '/admin'],
  ]) {
    const login = await page.request.post('/api/auth/login', {
      headers: { origin },
      data: { email, password },
    });
    expect(login.status()).toBe(200);
    await page.goto('/knowledge');
    const logo = (await page.locator('.sidebar').isVisible())
      ? page.locator('.sidebar .brand')
      : page.locator('.mobile-menu summary .brand');
    await expect(logo).toHaveAttribute('href', home);
    await logo.click();
    await page.waitForURL(origin + home);
    await expect(page).toHaveURL(home);
    await page.goto('/');
    await expect(page).toHaveURL(home);
    await noOverflow(page);
  }
});
