import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  renameSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { run, cli } from './lib/command.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workdir = resolve(
  process.env.FIRSTDAY_FIXTURE_DIRECTORY ||
    join(tmpdir(), 'firstday-supabase-fixture'),
);
const configPath = join(workdir, 'supabase', 'config.toml');
const statusPath = join(workdir, 'status.json');
const config = readFileSync(
  join(root, 'tests', 'fixture', 'supabase', 'config.toml'),
  'utf8',
);
try {
  run('docker', ['info', '--format', '{{.ServerVersion}}']);
  mkdirSync(dirname(configPath), { recursive: true });
  if (existsSync(configPath)) {
    const old = readFileSync(configPath, 'utf8');
    if (
      !/^project_id\s*=\s*"firstday-supabase-fixture"/m.test(old) ||
      !/\[api\][\s\S]*?\bport\s*=\s*55421\b/.test(old) ||
      !/\[db\][\s\S]*?\bport\s*=\s*55422\b/.test(old)
    ) {
      throw new Error(
        'Existing temporary configuration is not the dedicated FirstDay fixture. It was left unchanged.',
      );
    }
  } else writeFileSync(configPath, config, { mode: 0o600 });
  console.log(
    'Starting only the dedicated FirstDay fixture (first run may download images)...',
  );
  const excluded =
    'realtime,storage-api,imgproxy,mailpit,postgres-meta,studio,edge-runtime,logflare,vector,supavisor';
  cli(
    'supabase@2.121.0',
    'supabase',
    ['start', '--workdir', workdir, '--exclude', excluded],
    { timeout: 300000 },
  );
  let result;
  try {
    result = JSON.parse(
      cli('supabase@2.121.0', 'supabase', [
        'status',
        '--workdir',
        workdir,
        '--output',
        'json',
      ]),
    );
  } catch {
    throw new Error(
      'Unable to read private local fixture status. Run this through npm and check the local Supabase CLI.',
    );
  }
  if (
    result.API_URL !== 'http://127.0.0.1:55421' ||
    !result.PUBLISHABLE_KEY ||
    !result.SECRET_KEY
  )
    throw new Error(
      'Fixture status did not match the required local endpoint and key names.',
    );
  for (const name of ['db', 'auth', 'rest', 'kong']) {
    const running = run('docker', [
      'inspect',
      '--format',
      '{{.State.Running}}',
      'supabase_' + name + '_firstday-supabase-fixture',
    ]).trim();
    if (running !== 'true')
      throw new Error('The dedicated fixture is not ready.');
  }
  const health = await fetch(result.API_URL + '/auth/v1/health', {
    headers: { apikey: result.PUBLISHABLE_KEY },
    signal: AbortSignal.timeout(10000),
  });
  const rest = await fetch(result.API_URL + '/rest/v1/', {
    headers: { apikey: result.PUBLISHABLE_KEY },
    signal: AbortSignal.timeout(10000),
  });
  if (!health.ok || !rest.ok)
    throw new Error('Fixture Auth or Data API is not healthy.');
  writeFileSync(statusPath + '.tmp', JSON.stringify(result), { mode: 0o600 });
  renameSync(statusPath + '.tmp', statusPath);
  console.log(
    'Fixture ready at 127.0.0.1:55421; private status refreshed. Run npm run test:knowledge. No cloud project or existing data was reset.',
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
