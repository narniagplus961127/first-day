import { test, expect } from '@playwright/test';
import { ADMIN_DEMO } from '../../src/lib/demo/admin-account';
import { sampleLogin, sampleOrigin as origin } from './role-sample-support';
import {
  localPublicDataApi,
  publishUiChecklist,
  uploadUiGuide,
} from './ui-fixture';

test('public admin demo browses published content while valid application and database writes stay denied', async ({
  page,
  browser,
}) => {
  const privateAdmin = await browser.newContext({ baseURL: origin });
  try {
    await sampleLogin(privateAdmin.request, true);
    const { guide, checklist } = await publishUiChecklist(privateAdmin.request);
    const hidden = await uploadUiGuide(privateAdmin.request, false);
    const editor = await privateAdmin.newPage();
    await editor.goto('/admin');
    await expect(
      editor.getByRole('button', { name: 'Upload Markdown +', exact: true }),
    ).toBeEnabled();
    await editor.goto('/admin/checklists');
    await expect(
      editor.getByLabel('Task title', { exact: true }),
    ).toBeEnabled();
    await expect(
      editor.getByRole('button', { name: 'Save changes', exact: true }),
    ).toBeEnabled();

    await page.goto('/login');
    await page
      .getByRole('button', { name: 'View demo account', exact: true })
      .click();
    const dialog = page.getByRole('dialog');
    await dialog
      .getByRole('button', { name: 'Admin demo', exact: true })
      .click();
    await expect(dialog).toContainText('Read-only admin demo');
    await dialog.getByRole('button', { name: 'Fill login form' }).click();
    await expect(page.getByLabel('Email address')).toHaveValue(
      ADMIN_DEMO.email,
    );
    await page.getByRole('button', { name: /^Log in/ }).click();
    await page.waitForURL(origin + '/admin');
    await expect(page).toHaveURL('/admin');
    await expect(
      page.getByRole('status').filter({ hasText: 'read-only admin demo' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Upload Markdown +', exact: true }),
    ).toBeDisabled();
    const published = page
      .locator('a.document-card')
      .filter({ hasText: guide.title });
    await expect(published).toBeVisible();
    await expect(
      page.locator('a.document-card').filter({ hasText: hidden.title }),
    ).toHaveCount(0);
    await published.click();
    await expect(page.getByLabel('Document content')).toContainText(
      'npm run dev:firstday',
    );
    await expect(
      page.getByRole('button', { name: /replace|index/i }),
    ).toHaveCount(0);
    await page.goto('/admin/documents/' + hidden.document.id);
    await expect(
      page.getByRole('heading', { name: /could not be found/i }),
    ).toBeVisible();
    await expect(page.getByText(hidden.title, { exact: true })).toHaveCount(0);
    await page.goto('/admin/checklists');
    await expect(page.getByLabel('Task title', { exact: true })).toBeDisabled();
    await expect(
      page.getByRole('button', { name: 'Save changes', exact: true }),
    ).toBeDisabled();
    await page.getByLabel('Job role', { exact: true }).selectOption('HR');
    await page.waitForURL(/role=HR/);
    await expect(page).toHaveURL(/role=HR/);
    await expect(
      page.getByRole('button', { name: 'Save changes', exact: true }),
    ).toBeDisabled();

    const markdown = {
      name: 'denied.md',
      mimeType: 'text/markdown',
      buffer: Buffer.from(
        '# Lumen guide\n\nRun npm run dev:firstday to start the frontend.',
      ),
    };
    const attempts = [
      await page.request.post('/api/admin/documents', {
        headers: { origin },
        multipart: {
          title: 'Denied demo upload',
          jobRole: 'Frontend Developer',
          file: markdown,
        },
      }),
      await page.request.put('/api/admin/checklists', {
        headers: { origin },
        data: {
          jobRole: checklist.job_role,
          expectedRevision: checklist.revision,
          tasks: [],
        },
      }),
      await page.request.post('/api/admin/checklists', { headers: { origin } }),
      await page.request.post(
        '/api/admin/documents/' + guide.document.id + '/index',
        { headers: { origin } },
      ),
      await page.request.post(
        '/api/admin/documents/' + guide.document.id + '/replace',
        { headers: { origin }, multipart: { file: markdown } },
      ),
    ];
    for (const response of attempts) expect(response.status()).toBe(403);

    const local = localPublicDataApi();
    const signed = await page.request.post(
      local.url + '/auth/v1/token?grant_type=password',
      { headers: { apikey: local.key }, data: ADMIN_DEMO },
    );
    expect(signed.status()).toBe(200);
    const headers = {
      apikey: local.key,
      Authorization: 'Bearer ' + (await signed.json()).access_token,
    };
    // User-editable metadata must never upgrade the read-only identity.
    expect(
      (
        await page.request.put(local.url + '/auth/v1/user', {
          headers,
          data: { data: { role: 'admin' } },
        })
      ).status(),
    ).toBe(200);
    expect(
      (await (await page.request.get('/api/auth/session')).json()).user.role,
    ).toBe('admin_demo');
    const deniedRpc = await page.request.post(
      local.url + '/rest/v1/rpc/save_onboarding_checklist',
      {
        headers,
        data: {
          p_job_role: checklist.job_role,
          p_expected_revision: checklist.revision,
          p_tasks: [],
        },
      },
    );
    expect(deniedRpc.status()).toBe(403);
    expect((await deniedRpc.json()).code).toBe('42501');
    const patched = await page.request.patch(
      local.url +
        '/rest/v1/onboarding_checklists?job_role=eq.Frontend%20Developer',
      {
        headers: { ...headers, Prefer: 'return=representation' },
        data: { revision: checklist.revision + 1, tasks: [] },
      },
    );
    expect(patched.status()).toBe(200);
    expect(await patched.json()).toEqual([]);
    const deniedCreate = await page.request.post(
      local.url + '/rest/v1/rpc/create_knowledge_document',
      {
        headers,
        data: {
          p_title: 'Denied direct document',
          p_job_role: 'Frontend Developer',
          p_filename: 'denied.md',
          p_content: '# Lumen\n\nRun npm run dev:firstday to start.',
        },
      },
    );
    expect(deniedCreate.status()).toBe(403);
    const privateRows = await page.request.get(
      local.url +
        '/rest/v1/knowledge_versions?select=id&document_id=eq.' +
        hidden.document.id,
      { headers },
    );
    expect(privateRows.status()).toBe(200);
    expect(await privateRows.json()).toEqual([]);
    expect(
      await (
        await page.request.get('/api/checklists?role=Frontend%20Developer')
      ).json(),
    ).toEqual(checklist);
  } finally {
    await privateAdmin.close();
  }
});
