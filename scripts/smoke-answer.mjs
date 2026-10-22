import { chromium } from '@playwright/test';
const base = process.env.FIRSTDAY_BASE_URL || 'http://127.0.0.1:3204';
const origin = new URL(base).origin;
for (const key of [
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'DEMO_EMAIL',
  'DEMO_PASSWORD',
])
  if (!process.env[key]) throw new Error('Missing ' + key);
const browser = await chromium.launch();
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  async function login(prefix) {
    const r = await page.request.post(base + '/api/auth/login', {
      headers: { origin },
      data: {
        email: process.env[prefix + '_EMAIL'],
        password: process.env[prefix + '_PASSWORD'],
      },
    });
    if (r.status() !== 200)
      throw new Error('Application login failed HTTP ' + r.status());
  }
  await login('ADMIN');
  const saved = await page.request.post(base + '/api/admin/documents', {
    headers: { origin },
    multipart: {
      title: 'Citrus Frontend onboarding',
      jobRole: 'Frontend Developer',
      file: {
        name: 'citrus-frontend.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from(
          '# Citrus Frontend onboarding\n\n## Local setup\n\nFor the fictional Citrus Frontend project, copy .env.example to .env.local. Set NEXT_PUBLIC_API_URL to the fictional local API address supplied by the team. Then run:\n\n\x60\x60\x60sh\nnpm run dev -- --port 3101\n\x60\x60\x60\n',
        ),
      },
    },
  });
  if (saved.status() !== 201)
    throw new Error('Upload failed HTTP ' + saved.status());
  const { document } = await saved.json();
  const indexed = await page.request.post(
    base + '/api/admin/documents/' + document.id + '/index',
    { headers: { origin } },
  );
  if (indexed.status() !== 200 || (await indexed.json()).status !== 'ready')
    throw new Error('Live indexing failed HTTP ' + indexed.status());
  await login('DEMO');
  const supported = await page.request.post(base + '/api/chat', {
    headers: { origin },
    data: {
      question:
        'For the Citrus Frontend project, what exact command runs it locally and what environment-file step is required?',
      scope: 'Frontend Developer',
    },
    timeout: 65000,
  });
  if (supported.status() !== 200)
    throw new Error('Live answer failed HTTP ' + supported.status());
  const answer = await supported.json();
  if (
    answer.status !== 'answered' ||
    !answer.answer.includes('npm run dev -- --port 3101') ||
    !answer.answer.includes('.env.local')
  )
    throw new Error('Live answer did not preserve the guide instructions.');
  const citations = answer.claims.flatMap((c) => c.citations);
  if (!citations.length) throw new Error('No verified citations.');
  const source = citations.find((c) => c.documentId === document.id);
  if (!source) throw new Error('No citation to the uploaded guide.');
  await page.goto(base + source.href);
  if (
    !(await page.getByLabel('Supporting passage').innerText()).includes(
      'npm run dev -- --port 3101',
    )
  )
    throw new Error('Live source passage mismatch.');
  const absent = await page.request.post(base + '/api/chat', {
    headers: { origin },
    data: {
      question:
        'How many paid vacation days does the fictional Citrus company give new employees?',
      scope: 'Frontend Developer',
    },
    timeout: 65000,
  });
  if (absent.status() !== 200 || (await absent.json()).status !== 'no_evidence')
    throw new Error('Live missing-fact check did not return no evidence.');
  console.log(
    JSON.stringify({
      liveUpload: true,
      liveIndex: true,
      liveGoogleQuestionEmbedding: true,
      liveGroqCitedAnswer: true,
      exactCommand: true,
      environmentInstruction: true,
      sourceReader: true,
      unsupportedFact: true,
      citations: citations.length,
    }),
  );
} finally {
  await browser.close();
}
