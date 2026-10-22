import { createServer } from 'node:http';
const failures = new Set();
const pending = new Map();
const released = new Set();
const vector = Array.from({ length: 768 }, (_, i) => (i === 0 ? 1 : 0));
function embedding(text) {
  const marker = text.match(/Evidence[0-9]+/)?.[0];
  if (!marker) return vector;
  let hash = 0;
  for (const char of marker) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  // Use a full normalized vector so unrelated marker strings cannot collide
  // merely because the persistent fixture has more than 767 guides.
  hash ||= 1;
  const values = Array.from({ length: 768 }, () => {
    hash ^= hash << 13;
    hash ^= hash >>> 17;
    hash ^= hash << 5;
    return (hash >>> 0) / 2147483648 - 1;
  });
  const length = Math.hypot(...values);
  return values.map((value) => value / length);
}
createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1:19030');
  const key = url.searchParams.get('key');
  if (url.pathname === '/pending') {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ pending: pending.has(key) }));
    return;
  }
  if (url.pathname === '/release') {
    released.add(key);
    pending.get(key)?.();
    pending.delete(key);
    res.end('released');
    return;
  }
  let raw = '';
  for await (const chunk of req) raw += chunk;
  if (req.method === 'GET') {
    res.end('ready');
    return;
  }
  const body = JSON.parse(raw);
  const requests = body.requests || [body];
  if (requests.some((r) => r.content.parts[0].text.includes('GOOGLE_QUOTA'))) {
    res.writeHead(429, { 'content-type': 'application/json' });
    res.end(
      JSON.stringify({
        error: {
          code: 429,
          message: 'Fixture quota',
          details: [
            {
              '@type': 'type.googleapis.com/google.rpc.RetryInfo',
              retryDelay: '17s',
            },
          ],
        },
      }),
    );
    return;
  }
  const indexQuota = requests.find((r) =>
    r.content.parts[0].text.includes('INDEX_QUOTA'),
  )?.content.parts[0].text;
  if (indexQuota && !failures.has(indexQuota)) {
    failures.add(indexQuota);
    res.writeHead(429, {
      'content-type': 'application/json',
      'retry-after': '9',
    });
    res.end(
      JSON.stringify({
        error: {
          code: 429,
          message: 'Fixture indexing quota',
          details: [
            {
              '@type': 'type.googleapis.com/google.rpc.RetryInfo',
              retryDelay: '17s',
            },
          ],
        },
      }),
    );
    return;
  }
  const network = requests.find((r) =>
    r.content.parts[0].text.includes('GOOGLE_NETWORK'),
  )?.content.parts[0].text;
  if (network && !failures.has(network)) {
    failures.add(network);
    res.destroy();
    return;
  }
  const invalid = requests.some(
    (r) =>
      r.taskType ||
      r.outputDimensionality !== 768 ||
      !['title: ', 'task: question answering | query: '].some((prefix) =>
        r.content.parts[0].text.startsWith(prefix),
      ),
  );
  if (invalid) {
    res.writeHead(400);
    res.end(
      JSON.stringify({
        error: { message: 'Invalid document embedding contract', code: 400 },
      }),
    );
    return;
  }
  const gate = requests
    .map(
      (r) => r.content.parts[0].text.match(/WAIT_EMBEDDING_[A-Za-z0-9]+/)?.[0],
    )
    .find(Boolean);
  if (gate && !released.has(gate))
    await new Promise((resolve) => pending.set(gate, resolve));
  const failing = requests.find((r) =>
    r.content.parts[0].text.includes('FAIL_EMBEDDING'),
  )?.content.parts[0].text;
  if (failing && !failures.has(failing)) {
    failures.add(failing);
    res.writeHead(429);
    res.end(
      JSON.stringify({
        error: { message: 'Fixture quota exhausted', code: 429 },
      }),
    );
    return;
  }
  res.setHeader('content-type', 'application/json');
  res.end(
    JSON.stringify(
      body.requests
        ? {
            embeddings: requests.map((r) => ({
              values: embedding(r.content.parts[0].text),
            })),
          }
        : {
            embedding: { values: embedding(requests[0].content.parts[0].text) },
          },
    ),
  );
}).listen(19030, '127.0.0.1');
