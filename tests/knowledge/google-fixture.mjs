import { createServer } from 'node:http';
const failures = new Set();
const vector = Array.from({ length: 768 }, (_, i) => (i === 0 ? 1 : 0));
createServer(async (req, res) => {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  if (req.method === 'GET') {
    res.end('ready');
    return;
  }
  const body = JSON.parse(raw);
  const requests = body.requests || [body];
  const invalid = requests.some(
    (r) =>
      r.taskType ||
      r.outputDimensionality !== 768 ||
      !r.content.parts[0].text.startsWith('title: '),
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
        ? { embeddings: requests.map(() => ({ values: vector })) }
        : { embedding: { values: vector } },
    ),
  );
}).listen(19030, '127.0.0.1');
