import http from 'node:http';
const sessions = new Map();
const user = (email) => ({
  id: email.startsWith('admin')
    ? '00000000-0000-0000-0000-000000000002'
    : '00000000-0000-0000-0000-000000000001',
  email,
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: { role: email.startsWith('admin') ? 'admin' : 'learner' },
  user_metadata: { role: 'admin' },
  created_at: '2026-01-01T00:00:00Z',
});
function token(u) {
  const b = (v) => Buffer.from(JSON.stringify(v)).toString('base64url');
  return (
    b({ alg: 'HS256', typ: 'JWT' }) +
    '.' +
    b({
      sub: u.id,
      exp: Math.floor(Date.now() / 1000) + 3600,
      role: 'authenticated',
      app_metadata: u.app_metadata,
    }) +
    '.fixture-signature'
  );
}
const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  if (req.url === '/health') {
    res.end('{}');
    return;
  }
  let data = '';
  for await (const c of req) data += c;
  const body = data ? JSON.parse(data) : {};
  if (req.url === '/auth/v1/token?grant_type=password') {
    if (body.password !== 'FirstDayDemo!2026') {
      res.writeHead(400);
      res.end(
        JSON.stringify({
          msg: 'Invalid login credentials',
          error_code: 'invalid_credentials',
        }),
      );
      return;
    }
    const u = user(body.email),
      access = token(u);
    sessions.set(access, u);
    res.end(
      JSON.stringify({
        access_token: access,
        refresh_token: 'fixture-refresh',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: u,
      }),
    );
    return;
  }
  if (req.url === '/auth/v1/user') {
    const access = req.headers.authorization?.replace('Bearer ', '');
    const u = sessions.get(access);
    if (!u) {
      res.writeHead(401);
      res.end(
        JSON.stringify({ msg: 'Session expired', error_code: 'bad_jwt' }),
      );
      return;
    }
    res.end(JSON.stringify(u));
    return;
  }
  if (req.url?.startsWith('/auth/v1/logout')) {
    sessions.delete(req.headers.authorization?.replace('Bearer ', ''));
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.url === '/_control/revoke') {
    sessions.clear();
    res.end('{}');
    return;
  }
  res.writeHead(404);
  res.end(JSON.stringify({ msg: 'Unknown auth fixture endpoint' }));
});
server.listen(19029, '127.0.0.1');
