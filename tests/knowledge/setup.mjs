import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';
export default async function setup() {
  const status = JSON.parse(
    readFileSync(
      process.env.FIRSTDAY_TEST_SUPABASE_STATUS_FILE ||
        join(tmpdir(), 'firstday-supabase-fixture', 'status.json'),
      'utf8',
    ),
  );
  const endpoint = new URL(status.API_URL);
  if (endpoint.hostname !== '127.0.0.1' || endpoint.port !== '55421')
    throw new Error(
      'Knowledge tests require the dedicated FirstDay loopback fixture on port 55421.',
    );
  const client = createClient(status.API_URL, status.SECRET_KEY, {
    auth: { persistSession: false },
  });
  const { data, error } = await client.auth.admin.listUsers();
  if (error) throw new Error('Local Supabase Auth is unavailable.');
  for (const [email, role] of [
    ['admin@firstday.example', 'admin'],
    ['demo@firstday.example', 'learner'],
  ]) {
    const existing = data.users.find((user) => user.email === email);
    const input = {
      password: 'FirstDayDemo!2026',
      email_confirm: true,
      app_metadata: { role },
    };
    const result = existing
      ? await client.auth.admin.updateUserById(existing.id, input)
      : await client.auth.admin.createUser({ email, ...input });
    if (result.error)
      throw new Error('Unable to provision isolated test identity.');
  }
  const ledger = `create schema if not exists firstday_test; create table if not exists firstday_test.migrations(name text primary key);`;
  const sql = (input) =>
    execFileSync(
      'docker',
      [
        'exec',
        '-i',
        'supabase_db_firstday-supabase-fixture',
        'psql',
        '-U',
        'postgres',
        '-d',
        'postgres',
        '-v',
        'ON_ERROR_STOP=1',
      ],
      { input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
    );
  sql(ledger);
  for (const name of readdirSync('supabase/migrations')
    .filter((name) => name.endsWith('.sql'))
    .sort()) {
    const found = sql(
      `select name from firstday_test.migrations where name='${name}';`,
    );
    if (found.includes(name)) continue;
    const migration = readFileSync('supabase/migrations/' + name, 'utf8');
    if (!migration.trim()) continue;
    sql(
      'begin;\n' +
        migration +
        `\ninsert into firstday_test.migrations(name) values ('${name}');\ncommit;\nnotify pgrst, 'reload schema';`,
    );
  }
  // Only the named, guarded local fixture is reset between suite runs.
  sql('truncate table public.demo_chat_days, public.demo_chat_ips;');
}
