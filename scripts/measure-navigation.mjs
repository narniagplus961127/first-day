import { chromium } from 'playwright';

const base = process.env.FIRSTDAY_BASE_URL || 'https://qw-firstday.vercel.app';
const origin = new URL(base).origin;
const budget = Number(process.env.FIRSTDAY_NAV_BUDGET_MS || 1000);
const browser = await chromium.launch();
const samples = [];
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);
  await page.goto(origin + '/login');
  await page.getByRole('button', { name: /view demo account/i }).click();
  await page.getByRole('button', { name: 'Fill login form' }).click();
  await page.getByRole('button', { name: /^Log in/ }).click();
  await page.waitForURL('**/workspace');
  await page
    .getByRole('heading', { name: 'Your first day, a little clearer.' })
    .waitFor();
  const routes = [
    ['/knowledge', 'Knowledge library', 'Find your next step.'],
    ['/chat', 'Ask FirstDay', 'A little guidance goes a long way.'],
    ['/workspace', 'Overview', 'Your first day, a little clearer.'],
  ];
  for (let cycle = 0; cycle < 2; cycle++) {
    for (const [path, label, heading] of routes) {
      const start = performance.now();
      await page
        .getByRole('navigation', { name: 'Workspace', exact: true })
        .getByRole('link', { name: label, exact: true })
        .click();
      await page.waitForURL(origin + path);
      await page.getByRole('heading', { name: heading, exact: true }).waitFor();
      samples.push({
        path,
        cycle,
        milliseconds: Math.round(performance.now() - start),
      });
    }
  }
  const sorted = samples.map((s) => s.milliseconds).sort((a, b) => a - b);
  const median = Math.round((sorted[2] + sorted[3]) / 2);
  const slowestRoute = Math.max(
    ...routes.map(([path]) => {
      const values = samples
        .filter((s) => s.path === path)
        .map((s) => s.milliseconds);
      return (values[0] + values[1]) / 2;
    }),
  );
  console.log(
    JSON.stringify(
      {
        origin,
        budget,
        median,
        slowestRoute,
        samples,
        passed: slowestRoute <= budget,
      },
      null,
      2,
    ),
  );
  if (slowestRoute > budget) process.exitCode = 1;
} finally {
  await browser.close();
}
