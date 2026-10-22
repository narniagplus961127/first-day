import { chromium } from '@playwright/test';

// Intentionally no traces, screenshots, response-body dumps, or credential output.
const base = process.env.FIRSTDAY_BASE_URL;
if (!base)
  throw new Error('Set FIRSTDAY_BASE_URL to the intended hosted application.');
const origin = new URL(base).origin;
for (const key of [
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'DEMO_EMAIL',
  'DEMO_PASSWORD',
]) {
  if (!process.env[key]) throw new Error('Missing ' + key);
}
const title = 'Lumen-' + Date.now() + ' Frontend onboarding';
const command = 'npm run dev -- --port 3187';
const revisedCommand = 'npm run dev -- --port 3188';
const markdown = (run) =>
  `# ${title}\n\nFictional onboarding verification guide.\n\n## Local setup\n\nFor ${title}, copy .env.example to .env.local and set NEXT_PUBLIC_LUMEN_API_URL=http://localhost:4187. Start the frontend with:\n\n\x60\x60\x60sh\n${run}\n\x60\x60\x60\n\n## Code style\n\nUse the fictional Lumen formatting preset before committing.\n\n## Review process\n\nAsk a fictional Lumen teammate to review the patch.\n\n## Component catalog\n\nThe fictional Lumen catalog uses the orange button examples.\n\n## Local assets\n\nFictional Lumen sample artwork lives in public/examples.\n\n## Accessibility\n\nNavigate the fictional Lumen forms using the keyboard.\n`;
const check = (condition, message) => {
  if (!condition) throw new Error(message);
};
const browser = await chromium.launch();
let step = 'initialization';
const evidence = {
  origin,
  fictionalGuide: title,
  checks: [],
  indexRequests: [],
};
const mark = (name) => {
  evidence.checks.push(name);
  console.log('Verified: ' + name);
};
try {
  const admin = await browser.newContext();
  const learner = await browser.newContext();
  const second = await browser.newContext();
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await learner.newPage();
  const adminPage = await admin.newPage();
  async function login(context, prefix) {
    const result = await context.request.post(base + '/api/auth/login', {
      headers: { origin },
      data: {
        email: process.env[prefix + '_EMAIL'],
        password: process.env[prefix + '_PASSWORD'],
      },
    });
    check(
      result.status() === 200,
      'Sign-in failed (HTTP ' + result.status() + ')',
    );
  }
  async function demoForm(target) {
    await target.goto(base + '/login');
    const popup = target.getByRole('button', { name: 'View demo account' });
    await popup.focus();
    await target.keyboard.press('Enter');
    await target.getByRole('dialog').waitFor();
    const fill = target.getByRole('button', { name: 'Fill login form' });
    await fill.focus();
    await target.keyboard.press('Enter');
    check(
      (await target.getByLabel('Email address').inputValue()) ===
        process.env.DEMO_EMAIL,
      'Demo fill failed',
    );
    await target.getByRole('button', { name: 'Log in' }).click();
    await target.waitForURL('**/workspace', { timeout: 30000 });
  }
  async function ask(question) {
    await page.getByLabel('Your question').fill(question);
    const pending = page.waitForResponse(
      (r) => r.url() === base + '/api/chat' && r.request().method() === 'POST',
      { timeout: 95000 },
    );
    await page
      .getByRole('button', { name: 'Ask FirstDay', exact: true })
      .click();
    const response = await pending;
    check(
      response.status() === 200,
      'Question failed (HTTP ' + response.status() + ')',
    );
    const data = await response.json();
    await page
      .getByRole('button', { name: 'Ask FirstDay', exact: true })
      .waitFor();
    return data;
  }
  step = 'demo popup, keyboard fill, real sign-in';
  await demoForm(page);
  mark(step);
  step = 'private administrator upload';
  await login(admin, 'ADMIN');
  await adminPage.goto(base + '/admin');
  await adminPage.getByLabel('Document title').fill(title);
  await adminPage
    .getByLabel('Job role', { exact: true })
    .selectOption('Frontend Developer');
  await adminPage
    .getByLabel('Markdown file', { exact: true })
    .setInputFiles({
      name: 'lumen.md',
      mimeType: 'text/markdown',
      buffer: Buffer.from(markdown(command)),
    });
  await adminPage.getByRole('button', { name: 'Upload Markdown' }).click();
  await adminPage.waitForURL('**/admin/documents/*', { timeout: 30000 });
  const id = new URL(adminPage.url()).pathname.split('/').at(-1);
  evidence.documentId = id;
  mark(step);
  step = 'bounded persisted indexing and browser resume';
  const indexed = await admin.request.post(
    base + '/api/admin/documents/' + id + '/index',
    { headers: { origin }, timeout: 65000 },
  );
  check(indexed.status() === 200, 'Initial indexing failed');
  const progress = await indexed.json();
  evidence.indexRequests.push(progress);
  check(
    progress.status === 'processing' &&
      progress.completed === 4 &&
      progress.total > 4,
    'Indexing did not pause after its bounded batch',
  );
  await adminPage.reload();
  await adminPage.getByRole('button', { name: 'Resume indexing' }).click();
  await adminPage
    .getByText('Published and available in the knowledge library.')
    .waitFor({ timeout: 65000 });
  const inspected = await (
    await admin.request.get(base + '/api/admin/documents/' + id)
  ).json();
  const oldVersion = inspected.version.id;
  evidence.originalVersion = oldVersion;
  mark(step);
  step = 'learner library and original guide';
  await page.goto(base + '/knowledge');
  await page.getByRole('link', { name: title, exact: true }).click();
  check(
    (await page.getByLabel('Published guide').innerText()).includes(command),
    'Published instructions missing',
  );
  mark(step);
  step = 'actual Google/Groq setup answer and server-validated citation';
  await page.goto(base + '/chat');
  const question = `For ${title}, what exact command starts the frontend locally?`;
  const answer = await ask(question);
  check(
    answer.status === 'answered' && answer.answer.includes(command),
    'Setup answer did not preserve exact instructions',
  );
  const citation = answer.claims
    .flatMap((c) => c.citations)
    .find((c) => c.documentId === id && c.versionId === oldVersion);
  check(citation, 'No matching version-specific citation');
  evidence.sourceHref = citation.href;
  const source = await learner.newPage();
  await source.goto(base + citation.href);
  check(
    (await source.getByLabel('Supporting passage').innerText()).includes(
      command,
    ),
    'Supporting passage mismatch',
  );
  check(
    (await source
      .getByLabel('Supporting passage')
      .getAttribute('data-source-version')) === oldVersion,
    'Citation version mismatch',
  );
  mark(step);
  step = 'contextual live follow-up';
  const followup = await ask('What about those environment variables?');
  check(
    followup.status === 'answered' &&
      followup.answer.includes('.env.local') &&
      followup.answer.includes('NEXT_PUBLIC_LUMEN_API_URL'),
    'Follow-up lost environment context',
  );
  check(
    followup.claims.some((c) => c.citations.some((s) => s.documentId === id)),
    'Follow-up lacked matching guide evidence',
  );
  mark(step);
  step = 'honest absent-fact response';
  const absent = await ask(
    `How many paid vacation days does ${title} provide?`,
  );
  check(
    absent.status === 'no_evidence',
    'Absent fact did not return no_evidence',
  );
  mark(step);
  step =
    'browser persistence, scope isolation and independent shared-credential visitor';
  await page.reload();
  check(
    (await page.getByRole('article', { name: 'FirstDay answer' }).count()) ===
      3,
    'History did not persist',
  );
  await page.getByLabel('Search scope').selectOption('Designer');
  check(
    (await page.getByRole('article', { name: 'FirstDay answer' }).count()) ===
      0,
    'Role history leaked',
  );
  await page.getByLabel('Search scope').selectOption('Frontend Developer');
  await login(second, 'DEMO');
  const other = await second.newPage();
  await other.goto(base + '/chat');
  check(
    (await other.getByRole('article', { name: 'FirstDay answer' }).count()) ===
      0,
    'Visitor history leaked',
  );
  mark(step);
  step = 'learner management denied at public endpoints';
  for (const [method, path] of [
    ['GET', '/api/admin/documents'],
    ['POST', '/api/admin/documents'],
    ['POST', '/api/admin/documents/' + id + '/index'],
    ['POST', '/api/admin/documents/' + id + '/replace'],
  ]) {
    const result = await learner.request.fetch(base + path, {
      method,
      headers: { origin },
    });
    check(
      result.status() === 403,
      'Learner management operation was not denied',
    );
  }
  mark(step);
  step = 'safe replacement while old guide remains active';
  const replaced = await admin.request.post(
    base + '/api/admin/documents/' + id + '/replace',
    {
      headers: { origin },
      multipart: {
        file: {
          name: 'lumen-v2.md',
          mimeType: 'text/markdown',
          buffer: Buffer.from(markdown(revisedCommand)),
        },
      },
    },
  );
  check(replaced.status() === 201, 'Replacement upload failed');
  await source.goto(base + '/knowledge/' + id);
  check(
    (await source.getByLabel('Published guide').innerText()).includes(command),
    'Pending replacement interrupted active guide',
  );
  for (let batch = 0; batch < 3; batch++) {
    const result = await admin.request.post(
      base + '/api/admin/documents/' + id + '/index',
      { headers: { origin }, timeout: 65000 },
    );
    check(result.status() === 200, 'Replacement indexing failed');
    const state = await result.json();
    evidence.indexRequests.push(state);
    if (state.status === 'ready') break;
    check(batch < 2, 'Replacement failed to finish bounded batches');
  }
  await source.goto(base + '/knowledge/' + id);
  check(
    (await source.getByLabel('Published guide').innerText()).includes(
      revisedCommand,
    ),
    'Replacement did not become active',
  );
  evidence.activeVersion = await source
    .getByLabel('Published guide')
    .getAttribute('data-source-version');
  check(evidence.activeVersion !== oldVersion, 'Active version did not change');
  await source.goto(base + citation.href);
  check(
    (await source.getByLabel('Supporting passage').innerText()).includes(
      command,
    ),
    'Earlier citation changed after replacement',
  );
  const replacementAnswer = await ask(
    `For ${title}, what exact command starts the frontend locally now?`,
  );
  check(
    replacementAnswer.status === 'answered' &&
      replacementAnswer.answer.includes(revisedCommand),
    'New question did not use replacement',
  );
  check(
    replacementAnswer.claims.some((c) =>
      c.citations.some((s) => s.versionId === evidence.activeVersion),
    ),
    'Replacement answer did not cite new version',
  );
  mark(step);
  step = 'confirmed reset preserves authentication and shared guides';
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
  await page.getByRole('button', { name: 'Keep my history' }).click();
  check(
    (await page.getByRole('article', { name: 'FirstDay answer' }).count()) ===
      4,
    'Reset cancellation lost history',
  );
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
  await page
    .getByRole('button', { name: 'Reset this browser', exact: true })
    .click();
  check(
    (await page.getByRole('article', { name: 'FirstDay answer' }).count()) ===
      0,
    'Confirmed reset retained activity',
  );
  await page.goto(base + '/knowledge/' + id);
  check(
    (await page.getByLabel('Published guide').innerText()).includes(
      revisedCommand,
    ),
    'Reset changed shared guide or authentication',
  );
  mark(step);
  step = 'mobile login, navigation, reader, source and upload access';
  const narrow = await mobile.newPage();
  await demoForm(narrow);
  await narrow.locator('.mobile-menu summary').click();
  await narrow
    .getByRole('navigation', { name: 'Mobile workspace' })
    .getByRole('link', { name: 'Knowledge library' })
    .click();
  await narrow.getByRole('link', { name: title, exact: true }).click();
  check(
    (await narrow.getByLabel('Published guide').innerText()).includes(
      revisedCommand,
    ),
    'Mobile reader failed',
  );
  await narrow.goto(base + citation.href);
  check(
    (await narrow.getByLabel('Supporting passage').innerText()).includes(
      command,
    ),
    'Mobile source failed',
  );
  check(
    await narrow.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    'Mobile source overflowed',
  );
  await login(mobile, 'ADMIN');
  await narrow.goto(base + '/admin');
  check(
    await narrow.getByLabel('Markdown file', { exact: true }).isVisible(),
    'Mobile upload unavailable',
  );
  await narrow.goto(base + '/admin/documents/' + id);
  await narrow
    .getByText('Published and available in the knowledge library.')
    .waitFor();
  mark(step);
  step = 'public client assets contain no server/admin secrets';
  const assets = new Set(
    await page
      .locator('script[src]')
      .evaluateAll((nodes) => nodes.map((n) => n.src)),
  );
  const privateValues = [
    'SUPABASE_SECRET_KEY',
    'GROQ_API_KEY',
    'GOOGLE_GENERATIVE_AI_API_KEY',
    'ADMIN_PASSWORD',
  ]
    .map((k) => process.env[k])
    .filter(Boolean);
  for (const asset of assets) {
    check(new URL(asset).origin === origin, 'Unexpected asset origin');
    const body = await (await learner.request.get(asset)).text();
    check(
      !privateValues.some((value) => body.includes(value)),
      'Private credential found in a public client asset',
    );
  }
  mark(step);
  evidence.liveAnswerRequests = 4;
  evidence.finishedAt = new Date().toISOString();
  console.log(JSON.stringify(evidence));
} catch (error) {
  // Deliberately do not print exception stacks or HTTP bodies: these can contain secrets.
  console.error(
    'Hosted verification stopped at: ' +
      step +
      '. ' +
      (error instanceof Error &&
      !error.message.includes(process.env.ADMIN_PASSWORD)
        ? error.message.slice(0, 300)
        : 'Check failed.'),
  );
  process.exitCode = 1;
} finally {
  await browser.close();
}
