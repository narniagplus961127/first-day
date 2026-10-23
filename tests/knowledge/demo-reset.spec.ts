import { test, expect } from '@playwright/test';
const origin = 'http://127.0.0.1:3200';
test('reset from checklist clears open tabs and a late answer cannot restore old activity', async ({
  page,
  context,
}) => {
  const token = 'reset-' + Date.now();
  await page.request.post('http://127.0.0.1:19032/control', {
    data: {
      token,
      identity: token,
      now:
        test.info().project.name === 'mobile'
          ? '2038-07-01T12:00:00Z'
          : '2037-07-01T12:00:00Z',
    },
  });
  await context.setExtraHTTPHeaders({ 'x-firstday-context': token });
  expect(
    (
      await page.request.post('/api/auth/login', {
        headers: { origin },
        data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
      })
    ).status(),
  ).toBe(200);
  await page.goto('/checklist?role=Frontend%20Developer');
  const task = page.getByRole('checkbox').first();
  await task.check();
  const chat = await context.newPage();
  await chat.goto('/chat');
  await chat.getByLabel('Search scope').selectOption('Backend Developer');
  await chat
    .getByLabel('Your question')
    .fill('Pre-reset question about backend setup');
  let release!: () => void;
  let received!: () => void;
  const paused = new Promise<void>((resolve) => {
    release = resolve;
  });
  const arrived = new Promise<void>((resolve) => {
    received = resolve;
  });
  await chat.route('**/api/chat', async (route) => {
    const response = await route.fetch();
    received();
    await paused;
    await route.fulfill({ response }).catch(() => {});
  });
  const oldStorage = await chat.evaluate(() => Object.entries(localStorage));
  await chat.getByRole('button', { name: 'Ask FirstDay', exact: true }).click();
  await arrived;
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Keep my history' }),
  ).toBeFocused();
  await page.getByRole('button', { name: 'Keep my history' }).click();
  await expect(task).toBeChecked();
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
  await page
    .getByRole('button', { name: 'Reset this browser', exact: true })
    .click();
  await expect(task).not.toBeChecked();
  await expect(chat.getByLabel('Search scope')).toHaveValue(
    'Frontend Developer',
  );
  await expect(chat.getByLabel('Your question')).toHaveValue('');
  const lateAnswer = chat.waitForResponse((response) =>
    response.url().endsWith('/api/chat'),
  );
  release();
  await (await lateAnswer).finished();
  // An old tab may still write supported legacy records. The reset fence ignores them.
  await chat.evaluate((entries) => {
    for (const [key, value] of entries)
      if (key.startsWith('firstday.demo.')) localStorage.setItem(key, value);
  }, oldStorage);
  await expect(
    chat.getByRole('button', { name: 'Ask FirstDay', exact: true }),
  ).toBeEnabled();
  await chat.getByLabel('Your question').fill('New intentional draft');
  await chat.reload();
  await expect(chat.getByLabel('Your question')).toHaveValue(
    'New intentional draft',
  );
  await expect(chat.getByLabel('FirstDay answer')).toHaveCount(0);
  await chat.getByLabel('Search scope').selectOption('Backend Developer');
  await expect(chat.getByLabel('Your question')).toHaveValue('');
  await expect(chat.getByLabel('FirstDay answer')).toHaveCount(0);
  await page.reload();
  await expect(task).not.toBeChecked();
  expect(
    (
      await page.request.get('/api/checklists?role=Frontend%20Developer')
    ).status(),
  ).toBe(200);
  // The paused response already used one of the real server's five minute slots.
  for (let i = 0; i < 4; i++)
    expect(
      (
        await page.request.post('/api/chat', {
          headers: { origin, 'x-firstday-context': token },
          data: { question: 'Unsupported HR policy question', scope: 'HR' },
        })
      ).status(),
    ).toBe(200);
  const limited = await page.request.post('/api/chat', {
    headers: { origin, 'x-firstday-context': token },
    data: { question: 'One more HR question', scope: 'HR' },
  });
  expect(limited.status()).toBe(429);
  expect(await limited.json()).toMatchObject({ code: 'app_minute' });
});

test('a suspended legacy handoff cannot replay after reset, while a new task action still works', async ({
  page,
  context,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const current = await (
    await page.request.get('/api/checklists?role=Backend%20Developer')
  ).json();
  const saved = await page.request.put('/api/admin/checklists', {
    headers: { origin },
    data: {
      jobRole: 'Backend Developer',
      expectedRevision: current.revision,
      tasks: [
        {
          title: 'Reset handoff task',
          stage: 'Day 1',
          instructions: '',
          suggestedQuestion: 'How do I prepare backend setup?',
        },
      ],
    },
  });
  expect(saved.status()).toBe(200);
  const checklist = await saved.json();
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  await page.goto('/workspace');
  const suspended = await context.newPage();
  await suspended.goto('/checklist?role=Backend%20Developer');
  const nonce = '10000000-0000-4000-8000-000000000001';
  await suspended.evaluate(
    ({ nonce, taskId }) =>
      sessionStorage.setItem(
        'firstday.demo.task-handoff.v1',
        JSON.stringify({
          nonce,
          role: 'Backend Developer',
          taskId,
          createdAt: Date.now(),
        }),
      ),
    { nonce, taskId: checklist.tasks[0].id },
  );
  await suspended.goto('about:blank');
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
  await page
    .getByRole('button', { name: 'Reset this browser', exact: true })
    .click();
  await suspended.goto(origin + '/chat?taskIntent=' + nonce);
  await expect(suspended.getByLabel('Your question')).toHaveValue('');
  await expect(
    suspended
      .getByRole('alert')
      .filter({ hasText: 'task question is unavailable' }),
  ).toBeVisible();
  await suspended.goto('/checklist?role=Backend%20Developer');
  await suspended.getByRole('link', { name: 'Ask about this task' }).click();
  await expect(suspended.getByLabel('Your question')).toHaveValue(
    'How do I prepare backend setup?',
  );
  await suspended.reload();
  await expect(suspended.getByLabel('Your question')).toHaveValue(
    'How do I prepare backend setup?',
  );
});

test('overview reset clears every role and scope, returns Backend tabs to Frontend and leaves another browser untouched', async ({
  page,
  context,
  browser,
}) => {
  test.setTimeout(60000);
  const roles = [
    'Frontend Developer',
    'Backend Developer',
    'Designer',
    'Business Analyst',
    'HR',
  ];
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  for (const role of roles) {
    const current = await (
      await page.request.get('/api/checklists?role=' + encodeURIComponent(role))
    ).json();
    if (!current.tasks.length)
      expect(
        (
          await page.request.put('/api/admin/checklists', {
            headers: { origin },
            data: {
              jobRole: role,
              expectedRevision: current.revision,
              tasks: [
                {
                  title: role + ' reset practice',
                  stage: 'Day 1',
                  instructions: '',
                },
              ],
            },
          })
        ).status(),
      ).toBe(200);
  }
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const definitions = [];
  for (const role of roles) {
    definitions.push(
      await (
        await page.request.get(
          '/api/checklists?role=' + encodeURIComponent(role),
        )
      ).json(),
    );
    await page.goto('/checklist?role=' + encodeURIComponent(role));
    await page.getByRole('checkbox').first().check();
  }
  await page.goto('/chat');
  for (const scope of [...roles, 'All roles']) {
    await page.getByLabel('Search scope').selectOption(scope);
    await page.getByLabel('Your question').fill('Old draft for ' + scope);
  }
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
  await page.getByRole('button', { name: 'Keep my history' }).click();
  await expect(page.getByLabel('Your question')).toHaveValue(
    'Old draft for All roles',
  );
  const other = await browser.newContext();
  try {
    const visitor = await other.newPage();
    await visitor.request.post(origin + '/api/auth/login', {
      headers: { origin },
      data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
    });
    await visitor.goto(origin + '/chat');
    await visitor.getByLabel('Your question').fill('Private visitor draft');
    const backend = await context.newPage();
    await backend.goto('/checklist?role=Backend%20Developer');
    await expect(backend.getByRole('checkbox').first()).toBeChecked();
    const overview = await context.newPage();
    await overview.goto('/workspace');
    await expect(overview.getByLabel('Job role', { exact: true })).toHaveValue(
      'Backend Developer',
    );
    await overview
      .getByRole('button', { name: 'Reset demo', exact: true })
      .click();
    await overview.getByRole('button', { name: 'Keep my history' }).click();
    await expect(backend.getByRole('checkbox').first()).toBeChecked();
    await overview
      .getByRole('button', { name: 'Reset demo', exact: true })
      .click();
    await overview
      .getByRole('button', { name: 'Reset this browser', exact: true })
      .click();
    await expect(overview.getByLabel('Job role', { exact: true })).toHaveValue(
      'Frontend Developer',
    );
    await expect(backend.getByLabel('Job role', { exact: true })).toHaveValue(
      'Frontend Developer',
    );
    await expect(page.getByLabel('Search scope')).toHaveValue(
      'Frontend Developer',
    );
    for (const scope of [...roles, 'All roles']) {
      await page.getByLabel('Search scope').selectOption(scope);
      await expect(page.getByLabel('Your question')).toHaveValue('');
      await expect(page.getByLabel('FirstDay answer')).toHaveCount(0);
    }
    for (const role of roles) {
      await backend.goto('/checklist?role=' + encodeURIComponent(role));
      await expect(backend.locator('input[type=checkbox]:checked')).toHaveCount(
        0,
      );
      expect(
        await (
          await page.request.get(
            '/api/checklists?role=' + encodeURIComponent(role),
          )
        ).json(),
      ).toEqual(definitions[roles.indexOf(role)]);
    }
    await visitor.reload();
    await expect(visitor.getByLabel('Your question')).toHaveValue(
      'Private visitor draft',
    );
    await backend.getByRole('checkbox').first().check();
    await backend.reload();
    await expect(backend.getByRole('checkbox').first()).toBeChecked();
  } finally {
    await other.close();
  }
});

test('an intentional draft written before a delayed reset event arrives stays visible and saved', async ({
  page,
  context,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  await page.addInitScript(() => {
    const pending: StorageEvent[] = [];
    let hold = true;
    window.addEventListener('storage', (event) => {
      if (hold) {
        pending.push(event);
        event.stopImmediatePropagation();
      }
    });
    window.addEventListener('release-storage', () => {
      hold = false;
      for (const event of pending)
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: event.key,
            oldValue: event.oldValue,
            newValue: event.newValue,
            storageArea: event.storageArea,
          }),
        );
    });
  });
  await page.goto('/chat');
  await page.getByLabel('Search scope').selectOption('Backend Developer');
  await page.getByLabel('Your question').fill('Old backend draft');
  const resetter = await context.newPage();
  await resetter.goto('/workspace');
  await resetter
    .getByRole('button', { name: 'Reset demo', exact: true })
    .click();
  await resetter
    .getByRole('button', { name: 'Reset this browser', exact: true })
    .click();
  await page.getByLabel('Your question').fill('Intentional new draft');
  await expect(page.getByLabel('Search scope')).toHaveValue(
    'Frontend Developer',
  );
  await page.evaluate(() => window.dispatchEvent(new Event('release-storage')));
  await expect(page.getByLabel('Your question')).toHaveValue(
    'Intentional new draft',
  );
  await page.reload();
  await expect(page.getByLabel('Your question')).toHaveValue(
    'Intentional new draft',
  );
});

test('reset dismisses replacement confirmation and fences a paused task lookup', async ({
  page,
  context,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
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
            {
              title: 'Reset pending design question',
              stage: 'Day 1',
              instructions: '',
              suggestedQuestion: 'How do I review design guidelines?',
            },
          ],
        },
      })
    ).status(),
  ).toBe(200);
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  await page.goto('/chat');
  await page.getByLabel('Search scope').selectOption('Designer');
  await page.getByLabel('Your question').fill('My unfinished design question');
  await page.goto('/checklist?role=Designer');
  await page.getByRole('link', { name: 'Ask about this task' }).click();
  await expect(
    page.getByRole('dialog', { name: 'Replace your unfinished question?' }),
  ).toBeVisible();
  const resetter = await context.newPage();
  await resetter.goto('/workspace');
  async function reset() {
    await resetter
      .getByRole('button', { name: 'Reset demo', exact: true })
      .click();
    await resetter
      .getByRole('button', { name: 'Reset this browser', exact: true })
      .click();
  }
  await reset();
  await expect(
    page.getByRole('dialog', { name: 'Replace your unfinished question?' }),
  ).not.toBeVisible();
  await expect(page.getByLabel('Your question')).toHaveValue('');
  await expect(page.getByLabel('Search scope')).toHaveValue(
    'Frontend Developer',
  );
  await page.goto('/checklist?role=Designer');
  let release!: () => void;
  let received!: () => void;
  const paused = new Promise<void>((resolve) => {
    release = resolve;
  });
  const arrived = new Promise<void>((resolve) => {
    received = resolve;
  });
  await page.route('**/api/checklists?role=Designer', async (route) => {
    const response = await route.fetch();
    received();
    await paused;
    await route.fulfill({ response }).catch(() => {});
  });
  await page.getByRole('link', { name: 'Ask about this task' }).click();
  await arrived;
  await reset();
  await expect(page.getByLabel('Your question')).toBeEnabled();
  await page
    .getByLabel('Your question')
    .fill('New question after pending lookup reset');
  const lateLookup = page.waitForResponse((response) =>
    response.url().endsWith('/api/checklists?role=Designer'),
  );
  release();
  await (await lateLookup).finished();
  await expect(page.getByLabel('Your question')).toHaveValue(
    'New question after pending lookup reset',
  );
  await page.reload();
  await expect(page.getByLabel('Your question')).toHaveValue(
    'New question after pending lookup reset',
  );
  await expect(page.getByLabel('Search scope')).toHaveValue(
    'Frontend Developer',
  );
  await expect(
    page.getByRole('dialog', { name: 'Replace your unfinished question?' }),
  ).not.toBeVisible();
});

test('partial browser clearing reports uncertainty while the visible tab starts afresh', async ({
  page,
}) => {
  await page.request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'demo@firstday.example', password: 'FirstDayDemo!2026' },
  });
  await page.goto('/chat');
  await page.getByLabel('Your question').fill('Old stored draft');
  await page.evaluate(() => {
    Storage.prototype.removeItem = () => {
      throw new DOMException('Blocked', 'SecurityError');
    };
  });
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
  await page
    .getByRole('button', { name: 'Reset this browser', exact: true })
    .click();
  await expect(page.getByLabel('Your question')).toHaveValue('');
  await expect(
    page
      .getByRole('status')
      .filter({ hasText: 'browser-wide clearing could not be confirmed' }),
  ).toBeVisible();
  await page
    .getByLabel('Your question')
    .fill('Intentional after partial clear');
  await page.reload();
  await expect(page.getByLabel('Your question')).toHaveValue(
    'Intentional after partial clear',
  );
});
