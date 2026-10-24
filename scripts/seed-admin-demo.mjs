import { createClient } from '@supabase/supabase-js';
import { ADMIN_DEMO } from '../src/lib/demo/admin-account.ts';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (
  ![
    'https://ohvojrdwxlsbzwdrhpzr.supabase.co',
    'http://127.0.0.1:55421',
  ].includes(url)
)
  throw new Error(
    'Use only the dedicated FirstDay project or isolated local fixture.',
  );
if (!process.env.SUPABASE_SECRET_KEY)
  throw new Error('Missing server provisioning key.');
if (
  [process.env.ADMIN_EMAIL, process.env.DEMO_EMAIL].some(
    (email) => email?.toLowerCase() === ADMIN_DEMO.email,
  )
)
  throw new Error('The public admin demo must be a separate identity.');
const client = createClient(url, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
let existing;
for (let page = 1; ; page++) {
  const { data, error } = await client.auth.admin.listUsers({
    page,
    perPage: 100,
  });
  if (error) throw new Error('Unable to inspect the dedicated demo identity.');
  existing = data.users.find(
    (user) => user.email?.toLowerCase() === ADMIN_DEMO.email,
  );
  if (existing || data.users.length < 100) break;
}
if (existing && existing.app_metadata.role !== 'admin_demo')
  throw new Error(
    'Existing identity has a different access role; no account was changed.',
  );
const input = {
  password: ADMIN_DEMO.password,
  email_confirm: true,
  app_metadata: { ...existing?.app_metadata, role: 'admin_demo' },
};
const result = existing
  ? await client.auth.admin.updateUserById(existing.id, input)
  : await client.auth.admin.createUser({ email: ADMIN_DEMO.email, ...input });
if (result.error)
  throw new Error('Unable to provision the read-only admin demo identity.');
console.log(
  'Separate read-only admin demo identity configured. Private administrator unchanged.',
);
