import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
const controls = new Map();
let day = Math.floor(Date.now() / 86400000) + 3650;
createServer(async (req, res) => {
  res.setHeader('content-type', 'application/json');
  if (req.method === 'POST' && req.url === '/control') {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    const { token, identity, now } = JSON.parse(raw);
    controls.set(token, { identity, now });
    res.end('{}');
    return;
  }
  if (req.url === '/context') {
    if (req.headers.authorization !== 'Bearer controlled-request-context') {
      res.writeHead(401);
      res.end('{}');
      return;
    }
    res.end(
      JSON.stringify(
        controls.get(req.headers['x-firstday-context']) || {
          identity: randomUUID(),
          now: new Date(++day * 86400000).toISOString(),
        },
      ),
    );
    return;
  }
  res.end('{}');
}).listen(19032, '127.0.0.1');
