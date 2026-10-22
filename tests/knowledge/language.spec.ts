import { test, expect } from '@playwright/test';
const origin = 'http://127.0.0.1:3200';

test('administrator receives English-language guidance before a non-English upload is saved', async ({
  request,
}) => {
  expect(
    (
      await request.post('/api/auth/login', {
        headers: { origin },
        data: {
          email: 'admin@firstday.example',
          password: 'FirstDayDemo!2026',
        },
      })
    ).status(),
  ).toBe(200);
  const before = await (await request.get('/api/admin/documents')).json();
  const result = await request.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title: 'Unsupported language',
      jobRole: 'Frontend Developer',
      file: {
        name: 'setup.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from(
          '# 开发环境\n\n请安装项目依赖，然后启动本地服务。请复制配置文件并填写环境变量。',
        ),
      },
    },
  });
  expect(result.status()).toBe(400);
  expect((await result.json()).error).toContain('English');
  const after = await (await request.get('/api/admin/documents')).json();
  expect(after.documents.length).toBe(before.documents.length);
});

test('replacement rejects unsupported prose while short English code guides and Unicode names persist', async ({
  request,
}) => {
  expect(
    (
      await request.post('/api/auth/login', {
        headers: { origin },
        data: {
          email: 'admin@firstday.example',
          password: 'FirstDayDemo!2026',
        },
      })
    ).status(),
  ).toBe(200);
  const content =
    '# Chloé and José setup\n\nRun the command:\n\n```js\nconst message = "你好，世界";\nconsole.log(message);\n```\n';
  const file = (body: string) => ({
    name: 'setup.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from(body),
  });
  const saved = await request.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title: 'Unicode code guide',
      jobRole: 'Frontend Developer',
      file: file(content),
    },
  });
  expect(saved.status()).toBe(201);
  const { document, version } = await saved.json();
  for (const body of [
    '# 开发环境\n\n请安装项目依赖，然后启动本地服务。请复制配置文件并填写环境变量。',
    '# Entorno local\n\nPor favor ejecute los siguientes comandos para iniciar el servidor local. Después copie los archivos necesarios y compruebe las variables indicadas.',
  ]) {
    const result = await request.post(
      '/api/admin/documents/' + document.id + '/replace',
      { headers: { origin }, multipart: { file: file(body) } },
    );
    expect(result.status()).toBe(400);
    expect((await result.json()).error).toContain('English');
    const preserved = await (
      await request.get('/api/admin/documents/' + document.id)
    ).json();
    expect(preserved.version.id).toBe(version.id);
    expect(preserved.version.content).toBe(content);
  }
  const replacement = '# Artifact584\n\n```sh\nnpm run dev\n```\n';
  const result = await request.post(
    '/api/admin/documents/' + document.id + '/replace',
    { headers: { origin }, multipart: { file: file(replacement) } },
  );
  expect(result.status()).toBe(201);
  const persisted = await (
    await request.get('/api/admin/documents/' + document.id)
  ).json();
  expect(persisted.version.content).toBe(replacement);
});

test('substantive non-English Latin prose is rejected before initial persistence', async ({
  request,
}) => {
  await request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const result = await request.post('/api/admin/documents', {
    headers: { origin },
    multipart: {
      title: 'Unsupported Latin prose',
      jobRole: 'Frontend Developer',
      file: {
        name: 'setup.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from(
          '# Entorno local\n\nPor favor ejecute los siguientes comandos para iniciar el servidor local. Después copie los archivos necesarios y compruebe las variables indicadas.',
        ),
      },
    },
  });
  expect(result.status()).toBe(400);
  expect((await result.json()).error).toContain('English');
});
