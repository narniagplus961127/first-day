import { chromium } from '@playwright/test';
const base = process.env.FIRSTDAY_BASE_URL || 'http://127.0.0.1:3201';
for (const name of [
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'DEMO_EMAIL',
  'DEMO_PASSWORD',
])
  if (!process.env[name]) throw new Error(`Missing ${name}.`);
const browser = await chromium.launch();
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const origin = new URL(base).origin;
  const sign = await page.request.post(base + '/api/auth/login', {
    headers: { origin },
    data: {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    },
  });
  if (sign.status() !== 200)
    throw new Error('Administrator application sign-in failed.');
  const title = 'Frontend setup live smoke ' + new Date().toISOString();
  const saved = await page.request.post(base + '/api/admin/documents', {
    headers: { origin },
    multipart: {
      title,
      jobRole: 'Frontend Developer',
      file: {
        name: 'frontend-smoke.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from(
          '# Fictional frontend guide\n\n## Run locally\n\n```sh\nnpm run dev\n```\n',
        ),
      },
    },
  });
  if (saved.status() !== 201)
    throw new Error('Live upload failed with HTTP ' + saved.status());
  const { document, version } = await saved.json();
  await page.goto(base + '/admin/documents/' + document.id);
  await page.getByRole('heading', { name: title, exact: true }).waitFor();
  await page
    .getByRole('heading', { name: 'Run locally', exact: true })
    .waitFor();
  if (!(await page.locator('pre').innerText()).includes('npm run dev'))
    throw new Error('Saved code was not displayed.');
  await page.waitForLoadState('networkidle');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: title, exact: true }).waitFor();
  const learner = await page.request.post(base + '/api/auth/login', {
    headers: { origin },
    data: {
      email: process.env.DEMO_EMAIL,
      password: process.env.DEMO_PASSWORD,
    },
  });
  if (learner.status() !== 200)
    throw new Error('Learner application sign-in failed.');
  const denied = await page.request.get(
    base + '/api/admin/documents/' + document.id,
  );
  if (denied.status() !== 403)
    throw new Error('Learner candidate access was not denied.');
  console.log(
    JSON.stringify({
      liveSupabaseUpload: true,
      persistedReader: true,
      codePreserved: true,
      candidateStatus: version.status,
      learnerDenied: true,
    }),
  );
} finally {
  await browser.close();
}
