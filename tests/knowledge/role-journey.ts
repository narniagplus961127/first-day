import { test, expect, type Page } from '@playwright/test';
import {
  cleanSample,
  sampleLogin,
  sampleOrigin as origin,
} from './role-sample-support';

// Later content tickets call this same public journey with their manifest name.
export function roleJourney(name: string) {
  test(`${name} complete role journey connects eight tasks, evidence, private progress and reset`, async ({
    page,
    browser,
  }) => {
    test.setTimeout(90000);
    const { loadRoleSample, prepareRoleSample } =
      await import('../../scripts/prepare-role-sample.mjs');
    await sampleLogin(page.request, true);
    const manifest = await loadRoleSample(name);
    await cleanSample(page.request, manifest.role, manifest.key);
    const prepared = await prepareRoleSample(manifest, page.request, {
      origin,
    });
    expect(prepared.status).toBe('ready');
    const snapshot = await (
      await page.request.get(
        '/api/checklists?role=' + encodeURIComponent(manifest.role),
      )
    ).json();
    expect(snapshot.tasks).toHaveLength(8);
    expect(snapshot.tasks.map((task: { stage: string }) => task.stage)).toEqual(
      [
        'Before you start',
        'Before you start',
        'Day 1',
        'Day 1',
        'Day 1',
        'Week 1',
        'Week 1',
        'Week 1',
      ],
    );
    for (const task of snapshot.tasks) {
      expect(task.guideId).toBe(prepared.documentId);
      expect(task.suggestedQuestion).toBeTruthy();
    }
    const unchanged = await prepareRoleSample(manifest, page.request, {
      origin,
    });
    expect(unchanged).toEqual({ ...prepared, changed: false });
    await sampleLogin(page.request);
    await page.goto('/chat');
    await page.getByLabel('Search scope').selectOption(manifest.role);
    await page
      .getByLabel('Your question')
      .fill('Keep my unfinished role question');
    await page.goto('/checklist?role=' + encodeURIComponent(manifest.role));
    for (const [stage, count] of [
      ['Before you start', 2],
      ['Day 1', 3],
      ['Week 1', 3],
    ] as const)
      await expect(
        page
          .getByRole('region', { name: stage, exact: true })
          .getByRole('checkbox'),
      ).toHaveCount(count);
    let submissions = 0;
    page.on('request', (request) => {
      if (request.url().endsWith('/api/chat') && request.method() === 'POST')
        submissions++;
    });
    const questionTask = page.locator('article').filter({
      has: page.getByRole('heading', {
        name: manifest.tasks[3].title,
        exact: true,
      }),
    });
    await questionTask.getByRole('link', { name: 'Open guide' }).click();
    await expect(page.getByLabel('Published guide')).toContainText(
      manifest.supportedFact,
    );
    await page.goBack();
    await questionTask
      .getByRole('link', { name: 'Ask about this task' })
      .click();
    const decision = page.getByRole('dialog', {
      name: 'Replace your unfinished question?',
    });
    await expect(decision).toBeVisible();
    await page
      .getByRole('button', { name: 'Keep my draft', exact: true })
      .click();
    await expect(page.getByLabel('Your question')).toHaveValue(
      'Keep my unfinished role question',
    );
    expect(submissions).toBe(0);
    await page.goto('/checklist?role=' + encodeURIComponent(manifest.role));
    await questionTask
      .getByRole('link', { name: 'Ask about this task' })
      .click();
    await page
      .getByRole('button', { name: 'Replace draft', exact: true })
      .click();
    await expect(page.getByLabel('Search scope')).toHaveValue(manifest.role);
    await expect(page.getByLabel('Your question')).toHaveValue(
      manifest.tasks[3].suggestedQuestion,
    );
    expect(submissions).toBe(0);
    await page.getByLabel('Your question').fill(manifest.supportedQuestion);
    const answerPromise = page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/chat') &&
        response.request().method() === 'POST',
    );
    await page
      .getByRole('button', { name: 'Ask FirstDay', exact: true })
      .click();
    const answer = await (await answerPromise).json();
    expect(answer.status).toBe('answered');
    expect(answer.claims[0].citations[0].documentId).toBe(prepared.documentId);
    expect(answer.claims[0].citations[0].versionId).toBe(prepared.versionId);
    await expect(page.getByLabel('FirstDay answer')).toContainText(
      manifest.supportedFact,
    );
    await page
      .getByLabel('Your question')
      .fill('Please repeat that documented step.');
    const followupPromise = page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/chat') &&
        response.request().method() === 'POST',
    );
    await page
      .getByRole('button', { name: 'Ask FirstDay', exact: true })
      .click();
    const followup = await (await followupPromise).json();
    expect(followup.status).toBe('answered');
    expect(followup.claims[0].citations[0].versionId).toBe(prepared.versionId);
    await expect(page.getByLabel('FirstDay answer').last()).toContainText(
      manifest.supportedFact,
    );
    await page.getByLabel('Your question').fill('Keep my role-specific draft');
    const otherRole = manifest.role === 'Designer' ? 'HR' : 'Designer';
    await page.getByLabel('Search scope').selectOption(otherRole);
    await expect(page.getByLabel('FirstDay answer')).toHaveCount(0);
    await expect(page.getByLabel('Your question')).toHaveValue('');
    await page.getByLabel('Your question').fill('Keep my other-role draft');
    await page.getByLabel('Search scope').selectOption(manifest.role);
    await expect(page.getByLabel('Your question')).toHaveValue(
      'Keep my role-specific draft',
    );
    await expect(page.getByLabel('FirstDay answer')).toHaveCount(2);
    await page.getByLabel('Search scope').selectOption(otherRole);
    await expect(page.getByLabel('Your question')).toHaveValue(
      'Keep my other-role draft',
    );
    await page.getByLabel('Search scope').selectOption(manifest.role);
    expect(submissions).toBe(2);
    const citation = page.getByRole('link', { name: /View source/ }).first();
    await citation.click();
    await expect(page.getByLabel('Supporting passage')).toContainText(
      manifest.supportedFact,
    );
    await page.goto('/checklist?role=' + encodeURIComponent(manifest.role));
    await expect(
      page.getByText('0 of 8 tasks complete', { exact: true }),
    ).toBeVisible();
    const boxes = page.getByRole('checkbox');
    await boxes.first().focus();
    await page.keyboard.press('Space');
    await expect(boxes.first()).toBeChecked();
    for (let i = 1; i < 8; i++) await boxes.nth(i).check();
    await expect(
      page.getByText('8 of 8 tasks complete', { exact: true }),
    ).toBeVisible();
    await page.goto('/workspace');
    await expect(
      page.getByText('8 of 8 tasks complete', { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText('You have completed this checklist.', { exact: false }),
    ).toBeVisible();
    await page
      .getByLabel('Job role')
      .selectOption('Designer' === manifest.role ? 'HR' : 'Designer');
    await page.getByLabel('Job role').selectOption(manifest.role);
    await expect(
      page.getByText('8 of 8 tasks complete', { exact: true }),
    ).toBeVisible();
    const isolated = await browser.newContext();
    await sampleLogin(isolated.request);
    const other = await isolated.newPage();
    await other.goto(
      origin + '/checklist?role=' + encodeURIComponent(manifest.role),
    );
    await expect(
      other.getByText('0 of 8 tasks complete', { exact: true }),
    ).toBeVisible();
    await isolated.close();
    await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
    await page
      .getByRole('button', { name: 'Keep my history', exact: true })
      .press('Enter');
    await expect(
      page.getByText('8 of 8 tasks complete', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
    await page
      .getByRole('button', { name: 'Reset this browser', exact: true })
      .press('Enter');
    await expect(page.getByLabel('Job role')).toHaveValue('Frontend Developer');
    await page.goto('/chat');
    await page.getByLabel('Search scope').selectOption(manifest.role);
    await expect(page.getByLabel('Your question')).toHaveValue('');
    await expect(page.getByLabel('FirstDay answer')).toHaveCount(0);
    const beforeGoogle = await (
      await page.request.get('http://127.0.0.1:19030/calls')
    ).json();
    const beforeGroq = await (
      await page.request.get('http://127.0.0.1:19031/calls')
    ).json();
    const absent = await page.request.post('/api/chat', {
      headers: { origin },
      data: { question: manifest.missingQuestion, scope: manifest.role },
    });
    expect(absent.status()).toBe(200);
    expect((await absent.json()).status).toBe('no_evidence');
    expect(
      (await (await page.request.get('http://127.0.0.1:19030/calls')).json())
        .calls,
    ).toBe(beforeGoogle.calls + 1);
    expect(
      (await (await page.request.get('http://127.0.0.1:19031/calls')).json())
        .calls,
    ).toBe(beforeGroq.calls);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}
