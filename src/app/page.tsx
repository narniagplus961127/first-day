import { redirect } from 'next/navigation';
import { getViewer } from '@/lib/auth';
export default async function Home() {
  const user = await getViewer();
  redirect(
    user ? (user.role === 'learner' ? '/workspace' : '/admin') : '/login',
  );
}
