import { createClient } from '@supabase/supabase-js';

for (const name of [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SECRET_KEY',
  'DEMO_EMAIL',
  'DEMO_PASSWORD',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
]) {
  if (!process.env[name]) throw new Error(`Missing ${name}.`);
}
if (process.env.DEMO_EMAIL === process.env.ADMIN_EMAIL)
  throw new Error('Use distinct learner and administrator identities.');

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
for (const [prefix, role] of [
  ['DEMO', 'learner'],
  ['ADMIN', 'admin'],
]) {
  const email = process.env[`${prefix}_EMAIL`];
  const password = process.env[`${prefix}_PASSWORD`];
  let existing;
  for (let page = 1; ; page++) {
    const { data, error } = await client.auth.admin.listUsers({
      page,
      perPage: 100,
    });
    if (error)
      throw new Error(
        'Unable to list Auth users; verify server provisioning access.',
      );
    existing = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );
    if (existing || data.users.length < 100) break;
  }
  const result = existing
    ? await client.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
        app_metadata: { ...existing.app_metadata, role },
      })
    : await client.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: { role },
      });
  if (result.error) throw new Error(`Unable to provision ${role} identity.`);
  console.log(`${role} identity configured.`);
}
