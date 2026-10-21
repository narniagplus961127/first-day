import { LoginForm } from './login-form';
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const query = await searchParams;
  return (
    <LoginForm
      demoEmail={process.env.DEMO_EMAIL ?? ''}
      demoPassword={process.env.DEMO_PASSWORD ?? ''}
      initialMessage={
        query.reason === 'session'
          ? 'Your session has expired. Please sign in again.'
          : ''
      }
    />
  );
}
