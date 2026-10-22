import { test, expect } from '@playwright/test';
const origin = 'http://127.0.0.1:3200';

test('streamed upload and chat bodies preserve their public 413 errors without a length header', async ({
  request,
}) => {
  await request.post('/api/auth/login', {
    headers: { origin },
    data: { email: 'admin@firstday.example', password: 'FirstDayDemo!2026' },
  });
  const state = await request.storageState();
  const cookie = state.cookies
    .map(({ name, value }) => name + '=' + value)
    .join('; ');
  for (const item of [
    {
      path: '/api/chat',
      type: 'application/json',
      bytes: 32769,
      error: 'The question request is too large.',
    },
    {
      path: '/api/admin/documents',
      type: 'multipart/form-data; boundary=oversized-body',
      bytes: 110593,
      error: 'Upload one Markdown file no larger than 100 KB.',
    },
  ]) {
    const init = {
      method: 'POST',
      headers: { origin, cookie, 'content-type': item.type },
      duplex: 'half',
      body: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new Uint8Array(item.bytes));
          controller.close();
        },
      }),
    };
    const response = await fetch(origin + item.path, init);
    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: item.error });
  }
});
