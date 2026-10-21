import { spawn, execFileSync } from 'node:child_process';
import { chromium } from '@playwright/test';

for (const name of [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'DEMO_EMAIL',
  'DEMO_PASSWORD',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
]) {
  if (!process.env[name]) throw new Error(`Missing ${name}.`);
}

const baseURL = 'http://127.0.0.1:3110';
const server = spawn(
  process.execPath,
  [
    'node_modules/next/dist/bin/next',
    'dev',
    '--hostname',
    '127.0.0.1',
    '--port',
    '3110',
  ],
  { stdio: 'ignore', windowsHide: true },
);
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      ready = (await fetch(`${baseURL}/login`)).ok;
    } catch {
      /* Server is starting. */
    }
    if (ready) break;
    if (server.exitCode !== null)
      throw new Error('Auth smoke server exited before becoming ready.');
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error('Auth smoke server did not become ready.');
  browser = await chromium.launch();
  for (const [prefix, destination] of [
    ['DEMO', '/workspace'],
    ['ADMIN', '/admin'],
  ]) {
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();
    await page.goto('/login');
    await page.getByLabel('Email address').fill(process.env[`${prefix}_EMAIL`]);
    await page
      .getByLabel('Password', { exact: true })
      .fill(process.env[`${prefix}_PASSWORD`]);
    await page.getByRole('button', { name: 'Log in →' }).click();
    await page.waitForURL(`${baseURL}${destination}`, { timeout: 30000 });
    const adminResponse = await context.request.get('/api/admin');
    if (adminResponse.status() !== (prefix === 'ADMIN' ? 200 : 403))
      throw new Error('Unexpected administrator authorization response.');
    await page.getByRole('button', { name: 'Sign out' }).first().click();
    await page.waitForURL(`${baseURL}/login`);
    if ((await context.request.get('/api/auth/session')).status() !== 401)
      throw new Error('Session remained after sign-out.');
    await context.close();
    console.log(
      `${prefix === 'ADMIN' ? 'Administrator' : 'Learner'} live browser sign-in, authorization, and sign-out passed.`,
    );
  }
} finally {
  await browser?.close();
  if (process.platform === 'win32') {
    try {
      execFileSync('taskkill', ['/PID', String(server.pid), '/T', '/F'], {
        stdio: 'ignore',
        windowsHide: true,
      });
    } catch {
      /* Already stopped. */
    }
  } else server.kill();
}
